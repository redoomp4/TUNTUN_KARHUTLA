/**
 * @fileoverview Deterministic Heuristic Scam, Link & File Analyzer Engine
 * @module engines/heuristicEngine
 *
 * Implements weighted rule-based detection (R-01 through R-07) and automatic
 * entity extraction for the 1-Click Incident Report Pipeline.
 */

import { OFFICIAL_DOMAINS, SUSPICIOUS_TLDS, SHORTENER_DOMAINS } from '../data/officialDomains.js';

/**
 * Evaluates raw message text, URLs, and filenames deterministically.
 * @param {string} rawInput
 * @returns {{
 *   score: number,
 *   verdictLevel: 'SAFE'|'WARN'|'DANGER',
 *   verdictBadgeText: string,
 *   verdictTitle: string,
 *   verdictDesc: string,
 *   findings: Array<{id: string, severity: string, title: string, snippet: string, desc: string}>,
 *   anatomyItems: Array<{label: string, code: string, note: string}>,
 *   recommendedGuideId: string,
 *   extractedIncident: {
 *     type: string,
 *     platform: string,
 *     entity: string,
 *     suspect: string,
 *     loss: string
 *   }
 * }}
 */
export function evaluateMessageHeuristics(rawInput) {
  const text = (rawInput || '').trim();
  const lower = text.toLowerCase();
  const findings = [];
  const anatomyItems = [];
  let riskScore = 0;
  let recommendedGuideId = 'guide-sit-1';

  // Extracted metadata for 1-click Official Report Pipeline
  let detectedType = 'Tautan Phishing Perbankan / OTP';
  let detectedEntity = '';
  const detectedSuspects = [];

  const isEducationalWarning =
    /\b(jangan\s+pernah\s+bagikan|jangan\s+berikan|rahasia\s+mutlak|himbauan\s+keamanan)\b/i.test(lower) &&
    !/(\.apk|batalkan\s+melalui|transfer\s+deposit)/i.test(lower);

  // R-01: Malicious File Extensions (.apk, .exe, .scr, .bat, double extension)
  const apkMatch = text.match(/([a-zA-Z0-9_\-.]+\.(?:pdf\.apk|jpg\.apk|png\.apk|doc\.apk|apk|exe|scr|bat|vbs))\b/i);
  if (apkMatch) {
    riskScore += 55;
    recommendedGuideId = 'guide-sit-2';
    detectedType = 'File APK Berbahaya (Kurir / Undangan)';
    detectedSuspects.push(apkMatch[1]);
    anatomyItems.push({
      label: 'Lampiran berkas berbahaya',
      code: apkMatch[1],
      note: 'Ekstensi .APK / program eksekusi (bukan dokumen PDF atau foto)'
    });
    findings.push({
      id: 'R-01',
      severity: 'high',
      title: 'Deteksi berkas aplikasi berbahaya (.APK / penyadap SMS)',
      snippet: apkMatch[1],
      desc: 'Pelaku menyamarkan aplikasi pencuri SMS OTP sebagai dokumen resi, undangan, atau foto. Dokumen asli tidak pernah berformat .apk.'
    });
  }

  // R-04 & R-07: Extract and Inspect URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s)]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/(?:[^\s)]*)/gi;
  const rawUrls = text.match(urlRegex) || [];
  rawUrls.forEach(rawUrl => {
    const cleanUrl = rawUrl.replace(/[.,;!?]+$/, '');
    const normalized = cleanUrl.startsWith('http') ? cleanUrl : `http://${cleanUrl}`;
    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const isOfficial = OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
      const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => host.endsWith(tld));
      const isShortener = SHORTENER_DOMAINS.some(sh => host === sh);
      const isHttpOnly = cleanUrl.toLowerCase().startsWith('http://');

      if (!isOfficial) {
        detectedSuspects.push(cleanUrl);
      }

      anatomyItems.push({
        label: 'Domain tujuan URL',
        code: host,
        note: isOfficial
          ? 'Domain korporasi atau instansi resmi'
          : hasSuspiciousTld
            ? 'Domain ekstensi berisiko tinggi (indikasi phishing)'
            : isShortener
              ? 'Pemendek tautan (tujuan asli disembunyikan)'
              : 'Domain tidak dikenal, wajib verifikasi kanal resmi'
      });

      if (hasSuspiciousTld && !isOfficial) {
        riskScore += 45;
        recommendedGuideId = 'guide-sit-2';
        findings.push({
          id: 'R-04',
          severity: 'high',
          title: 'Tautan menggunakan domain berisiko tinggi',
          snippet: cleanUrl,
          desc: `Domain "${host}" menggunakan ekstensi non-standar yang umum dipakai sindikat phishing untuk meniru instansi resmi.`
        });
      } else if (isShortener) {
        riskScore += 25;
        findings.push({
          id: 'R-04',
          severity: 'medium',
          title: 'Penggunaan pemendek tautan (URL shortener)',
          snippet: cleanUrl,
          desc: `Tautan "${host}" menyembunyikan alamat situs tujuan sebenarnya. Jangan mengeklik sebelum memeriksa tujuan aslinya.`
        });
      } else if (!isOfficial && /(bca|bri|mandiri|bni|bsi|ojk|pajak|beacukai|bpjs|jnt|jne|shopee|dana|ovo)/i.test(host)) {
        riskScore += 45;
        recommendedGuideId = 'guide-sit-2';
        findings.push({
          id: 'R-04',
          severity: 'high',
          title: 'Indikasi domain tiruan (pencatutan nama instansi)',
          snippet: host,
          desc: 'Nama domain mencatut merek bank atau ekspedisi populer namun bukan merupakan domain resmi (.co.id atau .go.id) milik instansi tersebut.'
        });
      }

      if (isHttpOnly && !isOfficial) {
        riskScore += 15;
        findings.push({
          id: 'R-07',
          severity: 'medium',
          title: 'Protokol HTTP tidak terenkripsi',
          snippet: cleanUrl,
          desc: 'Tautan menggunakan protokol http:// biasa tanpa enkripsi keamanan standar perbankan.'
        });
      }
    } catch {
      // Ignore malformed URL fragment
    }
  });

  // R-02: Credential / OTP / SMS Permission Requests
  const credMatch = text.match(/\b(kode\s*otp|otp|pin\s*atm|pin\s*m-?banking|pin|cvv|cvc|password|kata\s*sandi|izinkan\s*semua|akses\s*sms)\b/i);
  if (credMatch && !isEducationalWarning) {
    riskScore += 40;
    recommendedGuideId = 'guide-sit-3';
    findings.push({
      id: 'R-02',
      severity: 'high',
      title: 'Permintaan kredensial rahasia atau izin akses SMS',
      snippet: credMatch[0],
      desc: 'Instansi perbankan, ekspedisi, atau pemerintah tidak pernah meminta kode OTP, PIN, CVV, kata sandi, atau izin baca SMS.'
    });
  }

  // R-05: Urgency / Fear Mongering Manipulation
  const urgencyMatch = text.match(/(dalam\s*\d+\s*(?:menit|jam)|otomatis\s*malam\s*ini|diblokir\s*otomatis|hangus|150\.000\s*\/\s*bulan|tindakan\s*pidana|sanksi\s*denda|segera\s*batalkan)/i);
  if (urgencyMatch && !isEducationalWarning) {
    riskScore += 25;
    findings.push({
      id: 'R-05',
      severity: 'medium',
      title: 'Taktik manipulasi psikologis dan tekanan waktu',
      snippet: urgencyMatch[0],
      desc: 'Penipu sengaja menciptakan kepanikan dan batas waktu sempit agar Anda bertindak tergesa-gesa tanpa melakukan verifikasi.'
    });
  }

  // R-03: Advance-Fee / Job Deposit / Unrealistic Prize
  const moneyBaitMatch = text.match(/(deposit\s*modal|misi\s*vip|tugas\s*vip|like\s*&\s*subscribe|komisi\s*rp|bebas\s*biaya\s*admin|rp\s*250\.000\.000|biaya\s*aktivasi|biaya\s*administrasi\s*pelatihan|rekening\s*bendahara)/i);
  if (moneyBaitMatch && !isEducationalWarning) {
    riskScore += 35;
    recommendedGuideId = 'guide-sit-4';
    detectedType = 'Penipuan Tugas Paruh Waktu / Deposit';
    findings.push({
      id: 'R-03',
      severity: 'high',
      title: 'Indikasi umpan finansial atau setoran deposit di muka',
      snippet: moneyBaitMatch[0],
      desc: 'Lowongan kerja atau klaim hadiah yang meminta Anda menyetorkan uang deposit atau biaya administrasi terlebih dahulu adalah pola penipuan.'
    });
  }

  // R-06: Personal Phone Number Claiming Official Identity
  const phoneMatch = text.match(/(\+62\s*8\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{3,5}|\b08\d{8,11}\b)/);
  if (phoneMatch) {
    detectedSuspects.unshift(phoneMatch[0]);
    if (/(resmi|ekspedisi|bank|hrd|panitia|bea\s*cukai|pajak|j&t|jne|bca|bri|mandiri)/i.test(lower)) {
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

  // Detect claimed entity name for automated report pre-fill
  const entityMatch = text.match(/\b(Bank\s+(?:BCA|BRI|Mandiri|BNI|BSI)|J&T\s*Express|JNE|SiCepat|Pos\s*Indonesia|Shopee|Tokopedia|Bea\s*Cukai|Pajak|OJK|BUMN)\b/i);
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

  if (finalScore >= 60) {
    verdictLevel = 'DANGER';
    verdictBadgeText = 'Risiko tinggi';
    verdictTitle = 'Indikasi kuat penipuan digital';
    verdictDesc = 'Jangan mengeklik tautan, jangan mengunduh lampiran berkas, dan jangan membalas pesan ini. Segera blokir kontak pengirim.';
  } else if (finalScore >= 25) {
    verdictLevel = 'WARN';
    verdictBadgeText = 'Perlu verifikasi';
    verdictTitle = 'Ditemukan pola pesan mencurigakan';
    verdictDesc = 'Terdapat indikasi manipulasi atau tautan tidak standar. Konfirmasi kebenarannya hanya melalui aplikasi atau Call Center resmi.';
  }

  return {
    score: finalScore,
    verdictLevel,
    verdictBadgeText,
    verdictTitle,
    verdictDesc,
    findings,
    anatomyItems,
    recommendedGuideId,
    extractedIncident: {
      type: detectedType,
      platform: 'WhatsApp',
      entity: detectedEntity || 'Instansi yang dicatut pada pesan',
      suspect: detectedSuspects.join(' / ') || 'Nomor atau tautan pada pesan',
      loss: `Menerima pesan mencurigakan dengan skor risiko ${finalScore}/100 (${findings.filter(f => f.severity !== 'safe').map(f => f.title).join('; ')})`
    }
  };
}
