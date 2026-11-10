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
 * Normalizes obfuscated scam text (e.g. "'With-draw'" -> "withdraw", "milyarann" -> "milyaran", "k0de 0tp" -> "kode otp", "d e p o s i t" -> "deposit").
 * @param {string} raw
 * @returns {string}
 */
export function normalizeObfuscatedText(raw = '') {
  let s = (raw || '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/['"`‘’“”]/g, '');

  // Strip spaces around dots and slashes: e.g. 'pdf . apk' -> 'pdf.apk'
  s = s.replace(/\s*([./_-])\s*/g, '$1');

  // Decode common leetspeak substitutions
  s = s.replace(/(?<=[a-z])0(?=[a-z])/g, 'o')
       .replace(/\b0(?=[a-z])/g, 'o')
       .replace(/(?<=[a-z])0\b/g, 'o')
       .replace(/(?<=[a-z])3(?=[a-z])/g, 'e')
       .replace(/\b3(?=[a-z])/g, 'e')
       .replace(/(?<=[a-z])1(?=[a-z])/g, 'i')
       .replace(/\b1(?=[a-z])/g, 'i')
       .replace(/@/g, 'a')
       .replace(/(?<=[a-z])4(?=[a-z])/g, 'a')
       .replace(/(?<=[a-z])5(?=[a-z])/g, 's');

  // Collapse single letters separated by single space: 'd e p o s i t' -> 'deposit', 'o t p' -> 'otp'
  s = s.replace(/\b([a-z0-9])(?:\s([a-z0-9]))+\b/g, (match) => match.replace(/\s+/g, ''));

  // Join single letters separated by dots: 'b.r.i' -> 'bri', 'o.t.p' -> 'otp'
  s = s.replace(/\b([a-z])\.([a-z])(?:\.([a-z]))*\b/g, (m) => m.replace(/\./g, ''));

  // Join letters separated by hyphens/underscores: 'with-draw' -> 'withdraw'
  s = s.replace(/([a-z0-9])[-_]+([a-z0-9])/g, '$1$2');

  // Collapse 3+ repeated characters: 'milyarannnn' -> 'milyaran'
  s = s.replace(/([a-z])\1{2,}/g, '$1');

  return s;
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
  const apkFileMatch =
    text.match(/([a-zA-Z0-9_\-.]+\.(?:pdf\.apk|jpg\.apk|png\.apk|doc\.apk|apk|exe|scr|bat|vbs))\b/i) ||
    normalized.match(/([a-zA-Z0-9_\-.]+\.(?:pdf\.apk|jpg\.apk|png\.apk|doc\.apk|apk|exe|scr|bat|vbs))\b/i);
  const apkLinkOrMentionMatch =
    text.match(/\b(?:apk\s*[:=]\s*\S+|(?:unduh|download|instal|pasang|link)\s+apk\b|\S+\/apk[-_0-9a-z]*)/i) ||
    normalized.match(/\b(?:apk\s*[:=]\s*\S+|(?:unduh|download|instal|pasang|link)\s+apk\b|\S+\/apk[-_0-9a-z]*)/i);

  if (apkFileMatch || apkLinkOrMentionMatch) {
    const snippetStr = apkFileMatch ? apkFileMatch[1] : apkLinkOrMentionMatch[0];
    riskScore += 55;
    recommendedGuideId = 'guide-sit-2';
    detectedType = 'File APK Berbahaya (Kurir / Undangan)';
    detectedSuspects.push(snippetStr);
    anatomyItems.push({
      label: 'Distribusi Paket Aplikasi (.APK)',
      code: snippetStr,
      note: 'Tautan atau berkas instalasi aplikasi di luar Play Store resmi'
    });
    findings.push({
      id: 'R-01',
      severity: 'high',
      title: 'Tautan / File Aplikasi (.APK) Berbahaya',
      snippet: snippetStr,
      desc: 'Pesan meminta memasang file .APK di luar Play Store resmi. Berisiko tinggi menyadap SMS OTP dan PIN.'
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
      title: 'SMS Promosi Judi Online / Penarikan Instan',
      snippet: snippetStr,
      desc: 'Menyamarkan kata "with-draw" dan iming-iming dana instan untuk menghindari filter spam.'
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
        // Telco LBA broadcast domain: official operator promotion
        findings.push({
          id: 'R-09',
          severity: 'safe',
          title: 'Tautan Iklan Operator (MyAds)',
          snippet: cleanUrl,
          desc: `Tautan ${host} adalah platform periklanan resmi operator seluler (bukan phishing pencuri OTP).`
        });
      } else if ((hasSuspiciousTld || isShortener) && !isOfficial) {
        const hasRiskySlug = /(vip|apk|batal|tarif|bonus|slot|win|claim|login)/i.test(pathSlug);
        riskScore += hasRiskySlug ? 45 : 35;
        recommendedGuideId = 'guide-sit-2';
        findings.push({
          id: 'R-04',
          severity: 'high',
          title: isShortener
            ? 'Tautan Pendek Pengalih (Shortlink)'
            : 'Alamat Domain Tidak Resmi / Berisiko',
          snippet: cleanUrl,
          desc: `Tautan pada "${host}" menyembunyikan alamat tujuan asli${hasRiskySlug ? ` dengan indikasi berisiko (${pathSlug})` : ''}.`
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
            title: 'Domain Meniru Nama Instansi Resmi',
            snippet: cleanUrl,
            desc: `Alamat "${host}" meniru identitas "${spoofedBrand.toUpperCase()}" secara tidak sah.`
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
  const credMatch =
    text.match(/\b(kode\s*otp|otp|pin\s*atm|pin\s*m-?banking|cvv|password|kata\s*sandi|akses\s*sms|izinkan\s*semua)\b/i) ||
    normalized.match(/\b(kode\s*otp|otp|pin\s*atm|pin\s*m-?banking|cvv|password|kata\s*sandi|akses\s*sms|izinkan\s*semua)\b/i);
  if (credMatch && !isEducationalWarning) {
    riskScore += 35;
    if (recommendedGuideId === 'guide-sit-1') {
      recommendedGuideId = 'guide-sit-3';
    }
    findings.push({
      id: 'R-02',
      severity: 'high',
      title: 'Permintaan Kode OTP / PIN Rahasia',
      snippet: credMatch[0],
      desc: 'Pihak resmi tidak pernah meminta kode rahasia OTP atau PIN melalui pesan chat.'
    });
  }

  // R-05: Psychological Urgency & Threat Manipulation
  const urgencyMatch =
    text.match(
      /\b(dalam\s+\d+\s*(?:menit|jam)|hitungan\s+menit|malam\s+ini|segera\s+batalkan|otomatis\s+terpotong|akun\s+diblokir|paket\s+tertahan|hangus)\b/i
    ) ||
    normalized.match(
      /\b(dalam\s+\d+\s*(?:menit|jam)|hitungan\s+menit|malam\s+ini|segera\s+batalkan|otomatis\s+terpotong|akun\s+diblokir|paket\s+tertahan|hangus)\b/i
    );
  if (urgencyMatch && !isTelcoPromoBroadcast) {
    riskScore += 20;
    findings.push({
      id: 'R-05',
      severity: 'medium',
      title: 'Batas Waktu Mendesak (Manipulasi Panik)',
      snippet: urgencyMatch[0],
      desc: 'Penipu mendesak waktu agar korban panik dan bertindak ceroboh tanpa verifikasi.'
    });
  }

  // R-03: Advance-Fee / Task Scam Deposit / Tariff Threat
  const moneyBaitMatch =
    text.match(
      /\b(deposit\s+modal|misi\s+vip|komisi\s+rp|tarif\s+transaksi|rp\s*150\.000\s*\/\s*bulan|pajak\s+pemenang|biaya\s+admin|tebusan\s+bea)\b/i
    ) ||
    normalized.match(
      /\b(deposit\s+modal|misi\s+vip|komisi\s+rp|tarif\s+transaksi|pajak\s+pemenang|biaya\s+admin|tebusan\s+bea|deposit|komisi|top-?up\s+deposit)\b/i
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
      title: 'Tawaran Komisi / Ancaman Potong Saldo',
      snippet: moneyBaitMatch[0],
      desc: 'Modus meminta uang muka/deposit atau ancaman perubahan tarif bank fiktif.'
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
        title: 'Nomor WhatsApp Pribadi Mengaku Instansi',
        snippet: phoneMatch[0],
        desc: 'Instansi resmi tidak menghubungi nasabah dengan nomor seluler pribadi biasa.'
      });
    }
  }

  // R-10: Telco Promotional Opt-Out Recognition ("Kirim STOP ... ke 8000")
  if (telcoOptOutMatch) {
    anatomyItems.push({
      label: 'Fitur Berhenti Promosi (Opt-Out)',
      code: telcoOptOutMatch[0],
      note: 'Format resmi SMS operator untuk opsi berhenti menerima pesan iklan (shortcode 8000)'
    });
    findings.push({
      id: 'R-10',
      severity: 'safe',
      title: 'Fitur Berhenti Promosi (STOP 8000)',
      snippet: telcoOptOutMatch[0],
      desc: 'Pesan menyediakan kode STOP 8000 standar operator seluler. Tidak ada permintaan OTP atau PIN.'
    });
  }

  // Detect claimed entity name for automated report pre-fill
  const entityMatch = text.match(
    /\b(Bank\s+(?:BCA|BRI|Mandiri|BNI|BSI|Mega|CIMB|Danamon|BTN|Permata)|J&T\s*Express|JNE|SiCepat|Pos\s*Indonesia|Shopee|Tokopedia|Bea\s*Cukai|Pajak|OJK|BUMN|NOSVIP\d*)\b/i
  );
  if (entityMatch) {
    detectedEntity = entityMatch[0];
  }

  // Pure official telco promo broadcast without APK/OTP threats has zero scam risk
  let calculatedScore = riskScore;
  if (isTelcoPromoBroadcast && !apkFileMatch && !apkLinkOrMentionMatch && !gamblingMatch && !credMatch && !moneyBaitMatch) {
    calculatedScore = 0;
  }
  const finalScore = Math.min(100, Math.max(0, calculatedScore));

  if (findings.length === 0) {
    findings.push({
      id: 'SAFE',
      severity: 'safe',
      title: 'Pesan Bersih dari Indikator Penipuan',
      snippet: 'Pola normal terverifikasi',
      desc: 'Tidak ditemukan berkas mencurigakan (.APK), domain palsu, atau permintaan PIN/OTP.'
    });
  }

  let verdictLevel = 'SAFE';
  let verdictBadgeText = 'Risiko rendah';
  let verdictTitle = 'Pesan Normal / Tidak Berbahaya';
  let verdictDesc = 'Format pesan wajar dan tidak meminta data rahasia. Tetap jangan pernah bagikan kode OTP atau PIN.';

  if (isTelcoPromoBroadcast && finalScore < 35) {
    verdictLevel = 'SAFE';
    verdictBadgeText = 'Iklan promosi operator';
    verdictTitle = 'SMS Promosi Resmi Operator (Bukan Penipuan)';
    verdictDesc =
      'Pesan penawaran legal dari saluran promosi operator seluler (MyAds & STOP 8000). Tidak meminta OTP, PIN, atau berkas .APK.';
  } else if (finalScore >= 60) {
    verdictLevel = 'DANGER';
    verdictBadgeText = 'Risiko tinggi';
    verdictTitle = 'Indikasi Kuat Konten Berbahaya';
    verdictDesc =
      'Jangan klik tautan, jangan unduh berkas .APK, dan jangan berikan kode OTP. Segera blokir nomor pengirim.';
  } else if (finalScore >= 25) {
    verdictLevel = 'WARN';
    verdictBadgeText = 'Perlu verifikasi';
    verdictTitle = 'Ditemukan Pola Mencurigakan';
    verdictDesc =
      'Terdapat tautan eksternal atau kalimat mencurigakan. Konfirmasi kebenarannya hanya melalui aplikasi resmi.';
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
