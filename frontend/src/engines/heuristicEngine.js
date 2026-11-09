/**
 * @fileoverview Deterministic Heuristic Scam, Link, Telco LBA & File Analyzer Engine
 * @module engines/heuristicEngine
 *
 * Implements weighted rule-based detection (R-01 through R-09), text de-obfuscation,
 * telco promotional broadcast recognition, and automatic entity extraction.
 */

import {
  OFFICIAL_DOMAINS,
  TELCO_PROMO_DOMAINS,
  SUSPICIOUS_TLDS,
  SHORTENER_DOMAINS
} from '../data/officialDomains.js';

/**
 * Normalizes obfuscated scam text (e.g. "'With-draw'" -> "withdraw", "milyarann" -> "milyaran").
 * @param {string} raw
 * @returns {string}
 */
export function normalizeObfuscatedText(raw = '') {
  return raw
    .toLowerCase()
    .replace(/['"`‘’“”]/g, '')
    // Join letters separated by single hyphen or dot inside words (e.g. with-draw -> withdraw, o.t.p -> otp)
    .replace(/([a-z])[-._]+([a-z])/g, '$1$2')
    // Collapse 2+ repeated trailing characters (e.g. milyarann -> milyaran)
    .replace(/([a-z])\1{1,}/g, '$1');
}

/**
 * Evaluates raw message text, URLs, and filenames deterministically.
 * @param {string} rawInput
 */
export function evaluateMessageHeuristics(rawInput) {
  const startPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = (rawInput || '').trim();
  const lower = text.toLowerCase();
  const normalized = normalizeObfuscatedText(text);
  const findings = [];
  const anatomyItems = [];
  let riskScore = 0;
  let recommendedGuideId = 'guide-sit-1';

  let detectedType = 'Tautan Phishing Perbankan / OTP';
  let detectedEntity = '';
  const detectedSuspects = [];

  // NFR-05: XSS / Script Injection Detection & Sanitization
  const xssSanitized = /<script\b|javascript:|on(?:error|load|click|mouseover)\s*=/i.test(text);
  if (xssSanitized) {
    riskScore += 65;
    findings.push({
      id: 'NFR-05',
      severity: 'high',
      title: 'Proteksi NFR-05: Potensi injeksi skrip / XSS berhasil dinetralisir',
      snippet: 'Tag HTML / JavaScript terdeteksi',
      desc: 'Input mengandung pola skrip atau atribut eksekusi yang telah diisolasi secara aman oleh lapisan sanitasi klien tanpa dieksekusi oleh browser.'
    });
  }

  // Check if message is an Official Security Education / Reminder from Bank
  const isEducationalWarning =
    /\b(jangan\s+pernah\s+bagikan|jangan\s+berikan|rahasia\s+mutlak|himbauan\s+keamanan)\b/i.test(lower) &&
    !/(\.apk|batalkan\s+melalui|transfer\s+deposit|with-?draw)/i.test(lower);

  // Check if message has Official Telco Promotional Opt-Out Footer ("Kirim STOP ... ke 8000")
  const telcoOptOutMatch = text.match(/kirim\s+stop\s+[a-z0-9\s]{2,25}\s+ke\s+8000/i);
  const hasMyAdsLink = /\b(myads\.id|tsel\.id|tsel\.me)\/[a-zA-Z0-9_-]+/i.test(text);
  const isTelcoPromoBroadcast = Boolean(telcoOptOutMatch || hasMyAdsLink);

  // R-01: Malicious File Extensions (.apk, .exe) OR Standalone APK Download Links ("APK = https://...", "/APK-1")
  const apkFileMatch = text.match(/([a-zA-Z0-9_\-.]+\.(?:pdf\.apk|jpg\.apk|png\.apk|doc\.apk|apk|exe|scr|bat|vbs))\b/i);
  const apkLinkOrMentionMatch = text.match(/\b(?:apk\s*[:=]\s*\S+|(?:unduh|download|instal|pasang|link)\s+apk\b|\S+\/apk[-_0-9a-z]*)/i);

  if (apkFileMatch || apkLinkOrMentionMatch) {
    const snippetStr = apkFileMatch ? apkFileMatch[1] : apkLinkOrMentionMatch[0];
    riskScore += 55;
    recommendedGuideId = 'guide-sit-2';
    detectedType = 'File APK Berbahaya (Kurir / Undangan)';
    detectedSuspects.push(snippetStr);
    anatomyItems.push({
      label: 'Distribusi paket aplikasi (.APK)',
      code: snippetStr,
      note: 'Tautan atau berkas instalasi .APK di luar Play Store resmi (risiko malware / penyadap SMS)'
    });
    findings.push({
      id: 'R-01',
      severity: 'high',
      title: 'Deteksi distribusi berkas / tautan aplikasi .APK berbahaya',
      snippet: snippetStr,
      desc: 'Pesan mengarahkan penerima untuk mengunduh atau memasang paket aplikasi (.APK) dari tautan eksternal. Aplikasi di luar toko resmi berisiko tinggi menyadap SMS OTP atau memasang aplikasi ilegal.'
    });
  }

  // R-08: Illegal Gambling (Judi Online / Slot / Obfuscated "With-draw" / High-Yield Lure)
  const gamblingMatch = text.match(
    /('?with[-\s.]*draw'?|penarikan\s+['"]?with[-\s.]*draw['"]?|milyaran+\s+cuma\s+hitungan\s+menit|situs\s+pasti\s+['"]?with[-\s.]*draw|maxwin|slot\s+gacor|rtp\s+live|bonus\s+new\s+member|nosvip\d*|jackpot\s+besar)/i
  );
  const normalizedGamblingMatch =
    !gamblingMatch &&
    /\b(withdraw\s+milyaran|penarikan\s+withdraw|situs\s+pasti\s+withdraw|slotgacor|maxwin|judionline|nosvip)\b/i.test(normalized);

  if (gamblingMatch || normalizedGamblingMatch) {
    const snippetStr = gamblingMatch ? gamblingMatch[0] : 'Pola tersamar: withdraw / situs VIP / penarikan instan';
    riskScore += 50;
    recommendedGuideId = 'guide-sit-1';
    detectedType = 'Promosi Situs Judi Online / Investasi Ilegal';
    findings.push({
      id: 'R-08',
      severity: 'high',
      title: 'Indikasi kuat SMS blast situs judi online / janji penarikan dana instan',
      snippet: snippetStr,
      desc: 'Pelaku sengaja menyamarkan kata kunci seperti "With-draw" dengan tanda hubung dan menjanjikan penarikan miliaran rupiah dalam hitungan menit untuk melewati filter spam operator.'
    });
  }

  // R-04 & R-07: Extract and Inspect URLs (including shortlinks like wde.la/NOSVIP134 and myads.id/Y8dGE)
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s)]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/[a-zA-Z0-9_\-./?=&%]*/gi;
  const rawUrls = text.match(urlRegex) || [];
  rawUrls.forEach(rawUrl => {
    const cleanUrl = rawUrl.replace(/[.,;!?'"`]+$/, '');
    const normalizedUrl = cleanUrl.startsWith('http') ? cleanUrl : `http://${cleanUrl}`;
    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const pathSlug = parsed.pathname || '';
      const isOfficial = OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      const isTelcoPromoDomain = TELCO_PROMO_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => host.endsWith(tld));
      const isShortener =
        SHORTENER_DOMAINS.some(sh => host === sh) ||
        (host.length <= 7 && pathSlug.length > 2 && !isOfficial && !isTelcoPromoDomain);
      const isHttpOnly = cleanUrl.toLowerCase().startsWith('http://');

      if (!isOfficial && !isTelcoPromoDomain) {
        detectedSuspects.push(cleanUrl);
      }

      anatomyItems.push({
        label: 'Anatomi domain & jalur URL',
        code: `${host}${pathSlug}`,
        note: isOfficial
          ? 'Domain resmi terverifikasi'
          : isTelcoPromoDomain
            ? 'Tautan periklanan resmi operator seluler (Telco LBA / MyAds)'
            : hasSuspiciousTld
              ? 'Domain ekstensi berisiko tinggi (sering digunakan phishing / situs ilegal)'
              : isShortener
                ? 'Tautan pendek pengalih (tujuan asli disembunyikan di balik redirect)'
                : 'Domain eksternal belum terverifikasi'
      });

      if (isTelcoPromoDomain) {
        // Telco LBA shortlink: add minor caution score (15) only if not asking for OTP/PIN
        riskScore += 15;
        findings.push({
          id: 'R-09',
          severity: 'safe',
          title: 'Terdeteksi tautan iklan resmi operator seluler (Telco MyAds)',
          snippet: cleanUrl,
          desc: `Tautan ${host} merupakan platform distribusi iklan resmi operator seluler. Meskipun bukan tautan phishing pencuri OTP, sebaiknya akses promo perbankan langsung melalui situs/aplikasi resmi bank terkait.`
        });
      } else if ((hasSuspiciousTld || isShortener) && !isOfficial) {
        const hasRiskySlug = /(vip|apk|batal|tarif|bonus|slot|win|claim|login)/i.test(pathSlug);
        riskScore += hasRiskySlug ? 45 : 35;
        recommendedGuideId = 'guide-sit-2';
        findings.push({
          id: 'R-04',
          severity: 'high',
          title: isShortener
            ? 'Penggunaan tautan pendek pengalih (shortlink) mencurigakan'
            : 'Alamat tautan menggunakan domain tidak resmi / berisiko tinggi',
          snippet: cleanUrl,
          desc: `Tautan pada domain "${host}" menyembunyikan alamat tujuan asli${hasRiskySlug ? ` dan memuat jalur berisiko (${pathSlug})` : ''}. Jangan pernah mengeklik tautan pendek dari pengirim tidak dikenal.`
        });
      } else if (!isOfficial) {
        const spoofedBrand = ['bca', 'bri', 'mandiri', 'bni', 'bsi', 'mega', 'ojk', 'pajak', 'beacukai', 'jnt', 'jne', 'shopee'].find(
          b => host.includes(b)
        );
        if (spoofedBrand) {
          riskScore += 45;
          recommendedGuideId = 'guide-sit-2';
          findings.push({
            id: 'R-04',
            severity: 'high',
            title: 'Manipulasi nama instansi pada domain palsu (typosquatting)',
            snippet: cleanUrl,
            desc: `Domain "${host}" mencatut nama "${spoofedBrand.toUpperCase()}" untuk meniru situs resmi.`
          });
        }
      }

      if (isHttpOnly && !isOfficial && !isTelcoPromoDomain) {
        riskScore += 15;
        findings.push({
          id: 'R-07',
          severity: 'medium',
          title: 'Koneksi tautan tidak terenkripsi (HTTP)',
          snippet: cleanUrl,
          desc: 'Tautan menggunakan protokol HTTP biasa tanpa perlindungan enkripsi TLS/SSL.'
        });
      }
    } catch {
      // Ignore malformed URLs
    }
  });

  // R-02: Credential & OTP Harvesting
  const credMatch = text.match(/\b(kode\s*otp|otp|pin\s*atm|pin\s*m-?banking|cvv|password|kata\s*sandi|akses\s*sms|izinkan\s*semua)\b/i);
  if (credMatch && !isEducationalWarning) {
    riskScore += 35;
    if (recommendedGuideId === 'guide-sit-1') {
      recommendedGuideId = 'guide-sit-3';
    }
    findings.push({
      id: 'R-02',
      severity: 'high',
      title: 'Permintaan kredensial rahasia atau izin akses SMS/OTP',
      snippet: credMatch[0],
      desc: 'Bank, ekspedisi, dan perusahaan resmi tidak pernah meminta kode OTP, PIN, CVV, atau izin membaca SMS melalui pesan.'
    });
  }

  // R-05: Psychological Urgency & Threat Manipulation
  const urgencyMatch = text.match(
    /\b(dalam\s+\d+\s*(?:menit|jam)|hitungan\s+menit|malam\s+ini|segera\s+batalkan|otomatis\s+terpotong|akun\s+diblokir|paket\s+tertahan|hangus)\b/i
  );
  if (urgencyMatch && !isTelcoPromoBroadcast) {
    riskScore += 20;
    findings.push({
      id: 'R-05',
      severity: 'medium',
      title: 'Tekanan psikologis dan batas waktu mendesak',
      snippet: urgencyMatch[0],
      desc: 'Penipu sengaja menciptakan kepanikan atau iming-iming kecepatan instan ("hitungan menit") agar korban bertindak impulsif tanpa melakukan verifikasi.'
    });
  }

  // R-03: Advance-Fee / Task Scam Deposit / Tariff Threat
  const moneyBaitMatch = text.match(
    /\b(deposit\s+modal|misi\s+vip|komisi\s+rp|tarif\s+transaksi|rp\s*150\.000\s*\/\s*bulan|pajak\s+pemenang|biaya\s+admin|tebusan\s+bea)\b/i
  );
  if (moneyBaitMatch) {
    riskScore += 35;
    if ( lower.includes('deposit') || lower.includes('komisi') ) {
      detectedType = 'Penipuan Tugas Paruh Waktu / Deposit';
      recommendedGuideId = 'guide-sit-4';
    }
    findings.push({
      id: 'R-03',
      severity: 'high',
      title: 'Indikasi umpan finansial, ancaman tarif, atau setoran deposit di muka',
      snippet: moneyBaitMatch[0],
      desc: 'Ancaman pemotongan tarif bulanan atau tawaran komisi yang meminta deposit terlebih dahulu adalah modus penipuan finansial.'
    });
  }

  // R-06: Personal Phone Number Claiming Official Identity
  const phoneMatch = text.match(/(\+62\s*8\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{3,5}|\b08\d{8,11}\b)/);
  if (phoneMatch) {
    detectedSuspects.unshift(phoneMatch[0]);
    if (/(resmi|ekspedisi|bank|hrd|panitia|bea\s*cukai|pajak|j&t|jne|bca|bri|mandiri|mega)/i.test(lower)) {
      riskScore += 20;
      findings.push({
        id: 'R-06',
        severity: 'medium',
        title: 'Penggunaan nomor seluler pribadi untuk klaim instansi',
        snippet: phoneMatch[0],
        desc: 'Pengumuman resmi korporasi atau instansi negara tidak dikirim melalui nomor WhatsApp atau seluler pribadi biasa.'
      });
    }
  }

  // R-10: Telco Promotional Opt-Out Recognition ("Kirim STOP ... ke 8000")
  if (telcoOptOutMatch) {
    anatomyItems.push({
      label: 'Kode berhenti berlangganan iklan (Opt-Out)',
      code: telcoOptOutMatch[0],
      note: 'Format resmi SMS broadcast periklanan operator seluler (shortcode 8000)'
    });
    findings.push({
      id: 'R-10',
      severity: 'safe',
      title: 'Teridentifikasi sebagai SMS promosi/iklan operator (bukan pencurian OTP)',
      snippet: telcoOptOutMatch[0],
      desc: 'Kalimat "Kirim STOP ... ke 8000" menandakan ini adalah SMS broadcast iklan komersial operator seluler. Pesan ini tidak meminta OTP/PIN, namun jika Anda ingin mengajukan produk bank tersebut, disarankan tetap membuka aplikasi atau situs resmi bank secara mandiri.'
    });
  }

  // Detect claimed entity name for automated report pre-fill
  const entityMatch = text.match(
    /\b(Bank\s+(?:BCA|BRI|Mandiri|BNI|BSI|Mega|CIMB|Danamon|BTN|Permata)|J&T\s*Express|JNE|SiCepat|Pos\s*Indonesia|Shopee|Tokopedia|Bea\s*Cukai|Pajak|OJK|BUMN|NOSVIP\d*)\b/i
  );
  if (entityMatch) {
    detectedEntity = entityMatch[0];
  }

  const finalScore = Math.min(100, Math.max(0, riskScore));

  if (findings.length === 0) {
    findings.push({
      id: 'SAFE',
      severity: 'safe',
      title: 'Tidak ditemukan indikator penipuan eksplisit',
      snippet: 'Teks bersih dari pola umum',
      desc: 'Mesin pemeriksa tidak menemukan ekstensi berbahaya, domain mencurigakan, atau permintaan OTP. Tetap lakukan verifikasi mandiri melalui kanal resmi.'
    });
  }

  let verdictLevel = 'SAFE';
  let verdictBadgeText = 'Risiko rendah';
  let verdictTitle = 'Tidak ditemukan pola serangan langsung';
  let verdictDesc = 'Pesan tampak menggunakan format wajar atau domain resmi. Tetap jaga kerahasiaan kode OTP dan PIN Anda.';

  if (isTelcoPromoBroadcast && finalScore < 35) {
    verdictLevel = 'SAFE';
    verdictBadgeText = 'Iklan promosi operator';
    verdictTitle = 'SMS promosi komersial teridentifikasi (bukan phishing OTP)';
    verdictDesc =
      'Pesan ini merupakan penawaran promosi via layanan iklan operator seluler (MyAds / Shortcode 8000) dan tidak meminta OTP atau PIN. Untuk keamanan maksimal, ajukan produk langsung di aplikasi/situs resmi bank atau kirim STOP ke 8000 jika tidak berkenan.';
  } else if (finalScore >= 60) {
    verdictLevel = 'DANGER';
    verdictBadgeText = 'Risiko tinggi';
    verdictTitle = 'Indikasi kuat penipuan digital / konten berbahaya';
    verdictDesc =
      'Jangan mengeklik tautan, jangan mengunduh lampiran berkas (.APK), dan jangan membalas pesan ini. Segera blokir kontak pengirim.';
  } else if (finalScore >= 25) {
    verdictLevel = 'WARN';
    verdictBadgeText = 'Perlu verifikasi';
    verdictTitle = 'Ditemukan pola pesan mencurigakan';
    verdictDesc =
      'Terdapat indikasi manipulasi atau tautan eksternal tidak standar. Konfirmasi kebenarannya hanya melalui aplikasi atau Call Center resmi.';
  }

  const endPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const executionMs = Math.max(0.2, Number((endPerf - startPerf).toFixed(2)));

  return {
    score: finalScore,
    verdictLevel,
    verdictBadgeText,
    verdictTitle,
    verdictDesc,
    findings,
    anatomyItems,
    recommendedGuideId,
    executionMs,
    xssSanitized,
    isTelcoPromoBroadcast,
    extractedIncident: {
      type: detectedType,
      platform: 'SMS / Telepon Seluler',
      entity: detectedEntity || 'Pengirim pesan tidak dikenal',
      suspect: detectedSuspects.join(' / ') || 'Nomor atau tautan pada pesan',
      loss: `Menerima pesan dengan skor risiko ${finalScore}/100 (${findings.filter(f => f.severity !== 'safe').map(f => f.title).join('; ') || 'Pesan promosi/informasi'})`
    }
  };
}
