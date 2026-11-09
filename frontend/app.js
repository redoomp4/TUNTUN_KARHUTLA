/**
 * Digital Guardian — Interactive Learning & Real-World Protection Engine
 * Implements:
 * 1. Real-Time Heuristic Scam, Link & File Analyzer (#scanner)
 * 2. Deterministic Branching Scam Simulator (#simulator)
 * 3. Multi-Case Forensic Scam Detective with Decoy Clues & Input Validation (#detective)
 * 4. Unified Session State & Guardian Profile Evaluator with sessionStorage (#guardian-profile-card)
 * 5. Interactive Incident Response Checklist, Report Generator & Official Call Center Directory (#guide & #emergency-tools)
 */

document.addEventListener('DOMContentLoaded', () => {
  const SESSION_STORAGE_KEY = 'dg_learning_session_v2';

  // Default Session State (Ephemeral per browser tab via sessionStorage)
  const defaultSessionState = {
    sessionId: 'SES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    activeView: 'scanner',
    showAllViews: false,
    scanHistory: [], // [{ snippet, rawText, score, timestamp }]
    simulator: {
      activeScenario: 'courier',
      completedScenarios: {}, // { courier: 100, bank: 80 }
      safeDecisions: 0,
      riskyDecisions: 0
    },
    detective: {
      activeCase: 'prize',
      caseResults: {} // { prize: { score, hits, missed, falsePositives, missedTitles, hitCategories } }
    },
    checklist: {} // { 's1-1': true, ... }
  };

  function loadSessionState() {
    try {
      const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return structuredClone(defaultSessionState);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultSessionState),
        ...parsed,
        scanHistory: Array.isArray(parsed.scanHistory) ? parsed.scanHistory : [],
        simulator: { ...defaultSessionState.simulator, ...(parsed.simulator || {}) },
        detective: { ...defaultSessionState.detective, ...(parsed.detective || {}) },
        checklist: { ...(parsed.checklist || {}) }
      };
    } catch {
      return structuredClone(defaultSessionState);
    }
  }

  function saveSessionState() {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }

  let sessionState = loadSessionState();

  // Utility to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  // =========================================================================
  // 1. REAL-TIME HEURISTIC SCAM, LINK & FILE SCANNER (#scanner)
  // =========================================================================
  const scannerPresets = {
    apk: 'Halo Kak, selamat siang. Saya Budi dari ekspedisi J&T Express (+62 821-9901-4421). Paket Kakak tertahan karena alamat luntur. Mohon cek foto resi di lampiran Lihat_Foto_Paket.pdf.apk dan klik "Izinkan Semua" akses SMS ya Kak.',
    phish: 'PEMBERITAHUAN RESMI BANK BCA: Tarif transaksi transfer Anda akan diubah menjadi Rp 150.000/bulan otomatis malam ini. Jika tidak setuju, segera batalkan dalam 15 menit melalui formulir: http://bca-tarif-layanan2026.vip/batal dan masukkan PIN serta kode OTP Anda.',
    job: 'Halo Kak! Kami dari HRD Rekrutmen Mitra Shopee menawarkan pekerjaan paruh waktu Like & Subscribe YouTube. Komisi Rp 50.000 langsung cair! Untuk membuka Misi VIP komisi Rp 2.500.000, silakan transfer deposit modal awal Rp 500.000 ke rekening bendahara kami.',
    safe: 'Info Resmi Bank: Jangan pernah bagikan kode OTP, PIN, atau CVV kepada siapa pun termasuk petugas bank. Untuk informasi produk resmi, kunjungi situs https://www.bca.co.id atau hubungi Halo BCA di 1500888.'
  };

  const scannerTextarea = document.getElementById('scanner-textarea');
  const scannerRunBtn = document.getElementById('scanner-run-btn');
  const scannerClearBtn = document.getElementById('scanner-clear-btn');
  const scannerValidationMsg = document.getElementById('scanner-validation-msg');
  const scannerScoreVal = document.getElementById('scanner-score-val');
  const scannerVerdictBadge = document.getElementById('scanner-verdict-badge');
  const scannerVerdictTitle = document.getElementById('scanner-verdict-title');
  const scannerVerdictDesc = document.getElementById('scanner-verdict-desc');
  const scannerAnatomyBox = document.getElementById('scanner-anatomy-box');
  const scannerAnatomyContent = document.getElementById('scanner-anatomy-content');
  const scannerFindingsHeading = document.getElementById('scanner-findings-heading');
  const scannerFindingsList = document.getElementById('scanner-findings-list');
  const scannerActionFooter = document.getElementById('scanner-action-footer');
  const scannerGuideLink = document.getElementById('scanner-guide-link');
  const presetBtns = document.querySelectorAll('[data-scan-preset]');

  const OFFICIAL_DOMAINS = [
    'bca.co.id', 'klikbca.com', 'bri.co.id', 'bankmandiri.co.id', 'bni.co.id',
    'bankbsi.co.id', 'ojk.go.id', 'pajak.go.id', 'beacukai.go.id', 'kominfo.go.id',
    'cekrekening.id', 'patrolisiber.id', 'jet.co.id', 'jne.co.id', 'posindonesia.co.id',
    'shopee.co.id', 'tokopedia.com', 'bpjs-kesehatan.go.id', 'bpjsketenagakerjaan.go.id'
  ];

  const SUSPICIOUS_TLDS = ['.vip', '.xyz', '.top', '.click', '.buzz', '.cc', '.icu', '.cfd', '.live', '.monster', '.loan', '.win', '.site', '.online', '.my.id'];
  const SHORTENER_DOMAINS = ['bit.ly', 'tinyurl.com', 's.id', 'cutt.ly', 'rb.gy', 'is.gd', 't.co', 'rebrand.ly'];

  function analyzeMessageAndLinks(rawInput) {
    const text = rawInput.trim();
    const lower = text.toLowerCase();
    const findings = [];
    const anatomyItems = [];
    let riskScore = 0;
    let recommendedGuideId = 'guide-sit-1';

    // 1. Check Malicious File Extensions (.apk, .exe, .scr, .bat, double extension)
    const apkMatch = text.match(/([a-zA-Z0-9_\-\.]+\.(?:pdf\.apk|jpg\.apk|png\.apk|doc\.apk|apk|exe|scr|bat|vbs))\b/i);
    if (apkMatch) {
      riskScore += 55;
      recommendedGuideId = 'guide-sit-2';
      anatomyItems.push({
        label: 'Lampiran File Berbahaya',
        code: apkMatch[1],
        note: 'Ekstensi .APK / Executable (Bukan Dokumen Gambar/PDF)'
      });
      findings.push({
        id: 'R-01',
        severity: 'high',
        title: 'Deteksi File Aplikasi Berbahaya (.APK / Sniffing)',
        snippet: apkMatch[1],
        desc: 'Pelaku menyamarkan aplikasi pencuri SMS/OTP sebagai dokumen resi, undangan, atau foto. Dokumen asli tidak pernah berformat .apk.'
      });
    }

    // 2. Extract and Inspect URLs
    const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s)]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/(?:[^\s)]*)/gi;
    const rawUrls = text.match(urlRegex) || [];
    rawUrls.forEach(rawUrl => {
      let cleanUrl = rawUrl.replace(/[.,;!?]+$/, '');
      let normalized = cleanUrl.startsWith('http') ? cleanUrl : 'http://' + cleanUrl;
      try {
        const parsed = new URL(normalized);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        const isOfficial = OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
        const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => host.endsWith(tld));
        const isShortener = SHORTENER_DOMAINS.some(sh => host === sh);
        const isHttpOnly = cleanUrl.toLowerCase().startsWith('http://');

        anatomyItems.push({
          label: 'Domain tujuan URL',
          code: host,
          note: isOfficial
            ? 'Domain korporasi atau instansi resmi'
            : hasSuspiciousTld
              ? 'Domain ekstensi berisiko tinggi (phishing)'
              : isShortener
                ? 'Pemendek tautan (tujuan asli tersembunyi)'
                : 'Domain tidak dikenal, perlu verifikasi'
        });

        if (hasSuspiciousTld && !isOfficial) {
          riskScore += 45;
          recommendedGuideId = 'guide-sit-2';
          findings.push({
            id: 'R-04',
            severity: 'high',
            title: 'Tautan Menggunakan Domain Phishing Berisiko Tinggi',
            snippet: cleanUrl,
            desc: `Domain "${host}" menggunakan ekstensi non-standar yang sangat sering dipakai sindikat phishing untuk meniru instansi resmi.`
          });
        } else if (isShortener) {
          riskScore += 25;
          findings.push({
            id: 'R-04',
            severity: 'medium',
            title: 'Penggunaan Pemendek URL (Link Shortener)',
            snippet: cleanUrl,
            desc: `Tautan "${host}" menyembunyikan alamat web tujuan sebenarnya. Jangan mengeklik sebelum memeriksa tujuan aslinya.`
          });
        } else if (!isOfficial && /(bca|bri|mandiri|bni|bsi|ojk|pajak|beacukai|bpjs|jnt|jne|shopee|dana|ovo)/i.test(host)) {
          riskScore += 45;
          recommendedGuideId = 'guide-sit-2';
          findings.push({
            id: 'R-04',
            severity: 'high',
            title: 'Indikasi Domain Tiruan (Brand Impersonation)',
            snippet: host,
            desc: 'Nama domain mencatut merek bank/ekspedisi populer namun bukan merupakan domain resmi (.co.id / .go.id) milik instansi tersebut.'
          });
        }

        if (isHttpOnly && !isOfficial) {
          riskScore += 15;
          findings.push({
            id: 'R-07',
            severity: 'medium',
            title: 'Protokol HTTP Tidak Terenkripsi',
            snippet: cleanUrl,
            desc: 'Tautan menggunakan protokol http:// tanpa enkripsi keamanan standar perbankan.'
          });
        }
      } catch {
        // Ignore malformed URL fragment
      }
    });

    // 3. Check Credential / OTP / SMS Permission Requests
    const credMatch = text.match(/\b(kode\s*otp|otp|pin\s*atm|pin\s*m-?banking|cvv|cvc|password|kata\s*sandi|izinkan\s*semua|akses\s*sms)\b/i);
    const isEducationalWarning = /\b(jangan\s+pernah\s+bagikan|jangan\s+berikan|rahasia\s+mutlak|waspada)\b/i.test(lower);
    if (credMatch && !isEducationalWarning) {
      riskScore += 40;
      recommendedGuideId = 'guide-sit-3';
      findings.push({
        id: 'R-02',
        severity: 'high',
        title: 'Permintaan Kredensial Rahasia / Izin Akses SMS',
        snippet: credMatch[0],
        desc: 'Instansi perbankan, ekspedisi, atau pemerintah TIDAK PERNAH meminta kode OTP, PIN, CVV, kata sandi, atau izin baca SMS.'
      });
    }

    // 4. Check Urgency / Fear Mongering Manipulation
    const urgencyMatch = text.match(/(dalam\s*\d+\s*(?:menit|jam)|otomatis\s*malam\s*ini|diblokir\s*otomatis|hangus|150\.000\s*\/\s*bulan|tindakan\s*pidana|sanksi\s*denda|segera\s*batalkan)/i);
    if (urgencyMatch && !isEducationalWarning) {
      riskScore += 25;
      findings.push({
        id: 'R-05',
        severity: 'medium',
        title: 'Taktik Manipulasi Psikologis & Tekanan Waktu (Urgency)',
        snippet: urgencyMatch[0],
        desc: 'Penipu sengaja menciptakan kepanikan dan batas waktu sempit agar Anda bertindak tergesa-gesa tanpa melakukan verifikasi.'
      });
    }

    // 5. Check Advance-Fee / Job Deposit / Unrealistic Prize
    const moneyBaitMatch = text.match(/(deposit\s*modal|tugas\s*vip|like\s*&\s*subscribe|komisi\s*rp|bebas\s*biaya\s*admin|rp\s*250\.000\.000|biaya\s*aktivasi|biaya\s*administrasi\s*pelatihan)/i);
    if (moneyBaitMatch && !isEducationalWarning) {
      riskScore += 35;
      recommendedGuideId = 'guide-sit-4';
      findings.push({
        id: 'R-03',
        severity: 'high',
        title: 'Indikasi Umpan Finansial / Setoran Deposit di Muka',
        snippet: moneyBaitMatch[0],
        desc: 'Lowongan kerja atau klaim hadiah yang meminta Anda menyetorkan uang deposit/administrasi terlebih dahulu adalah pola pasti penipuan.'
      });
    }

    // 6. Check Personal Phone Number Claiming Official Identity
    const phoneMatch = text.match(/(\+62\s*8\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{3,5}|\b08\d{8,11}\b)/);
    if (phoneMatch && /(resmi|ekspedisi|bank|hrd|panitia|bea\s*cukai|pajak)/i.test(lower)) {
      riskScore += 20;
      findings.push({
        id: 'R-06',
        severity: 'medium',
        title: 'Penggunaan Nomor Seluler Pribadi untuk Klaim Instansi',
        snippet: phoneMatch[0],
        desc: 'Pengumuman resmi korporasi atau instansi negara tidak dikirim melalui nomor WhatsApp/seluler pribadi biasa.'
      });
    }

    // Cap score 0 - 100
    const finalScore = Math.min(100, Math.max(0, riskScore));

    if (findings.length === 0) {
      findings.push({
        severity: 'safe',
        title: 'Tidak Ditemukan Indikator Scam Eksplisit',
        snippet: 'Teks Bersih dari Pola Umum',
        desc: 'Mesin heuristik tidak menemukan ekstensi berbahaya, domain mencurigakan, atau permintaan OTP. Tetap lakukan verifikasi mandiri melalui kanal resmi.'
      });
    }

    return {
      score: finalScore,
      findings,
      anatomyItems,
      recommendedGuideId
    };
  }

  function renderScannerResult(result) {
    scannerScoreVal.textContent = result.score;
    scannerVerdictBadge.className = 'verdict-tag';

    if (result.score >= 60) {
      scannerVerdictBadge.classList.add('verdict-danger');
      scannerVerdictBadge.textContent = 'Risiko tinggi';
      scannerVerdictTitle.textContent = 'Indikasi kuat penipuan digital';
      scannerVerdictDesc.textContent = 'Jangan mengeklik tautan, jangan mengunduh lampiran file, dan jangan membalas pesan ini. Segera blokir kontak pengirim.';
    } else if (result.score >= 25) {
      scannerVerdictBadge.classList.add('verdict-warn');
      scannerVerdictBadge.textContent = 'Perlu verifikasi';
      scannerVerdictTitle.textContent = 'Ditemukan pola pesan mencurigakan';
      scannerVerdictDesc.textContent = 'Terdapat indikasi manipulasi atau tautan tidak standar. Konfirmasi kebenarannya hanya melalui aplikasi atau Call Center resmi.';
    } else {
      scannerVerdictBadge.classList.add('verdict-safe');
      scannerVerdictBadge.textContent = 'Risiko rendah';
      scannerVerdictTitle.textContent = 'Tidak ditemukan pola serangan langsung';
      scannerVerdictDesc.textContent = 'Pesan tampak menggunakan format wajar atau domain resmi. Tetap jaga kerahasiaan kode OTP dan PIN Anda.';
    }

    // Render URL / File Anatomy
    if (result.anatomyItems.length > 0) {
      scannerAnatomyBox.hidden = false;
      scannerAnatomyContent.innerHTML = '';
      result.anatomyItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'anatomy-item';
        row.innerHTML = `
          <span class="anatomy-item-label">${escapeHtml(item.label)}: <span class="anatomy-item-code">${escapeHtml(item.code)}</span></span>
          <span>${escapeHtml(item.note)}</span>
        `;
        scannerAnatomyContent.appendChild(row);
      });
    } else {
      scannerAnatomyBox.hidden = true;
      scannerAnatomyContent.innerHTML = '';
    }

    // Render Findings
    const realRedFlagsCount = result.findings.filter(f => f.severity !== 'safe').length;
    scannerFindingsHeading.textContent = `Temuan indikator (${realRedFlagsCount})`;
    scannerFindingsList.innerHTML = '';

    result.findings.forEach(f => {
      const card = document.createElement('div');
      card.className = `finding-card finding-${f.severity}`;
      card.innerHTML = `
        <strong>${escapeHtml(f.title)}</strong>
        <span class="finding-snippet">${escapeHtml(f.snippet)}</span>
        <p>${escapeHtml(f.desc)}</p>
      `;
      scannerFindingsList.appendChild(card);
    });

    // Show link to matching Action Guide situation
    scannerActionFooter.hidden = false;
    scannerGuideLink.href = `#${result.recommendedGuideId}`;
    scannerGuideLink.onclick = (e) => {
      e.preventDefault();
      const targetDetails = document.getElementById(result.recommendedGuideId);
      if (targetDetails && targetDetails.tagName === 'DETAILS') {
        targetDetails.open = true;
        targetDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }

  const scanHistoryBoxEl = document.getElementById('scan-history-box');
  const scanHistoryListEl = document.getElementById('scan-history-list');
  const scanHistoryClearBtn = document.getElementById('scan-history-clear-btn');

  function recordScanToHistory(rawText, score) {
    const snippet = rawText.replace(/\s+/g, ' ').slice(0, 65) + (rawText.length > 65 ? '...' : '');
    const entry = {
      snippet,
      rawText,
      score,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    sessionState.scanHistory = [entry, ...(sessionState.scanHistory || []).filter(i => i.rawText !== rawText)].slice(0, 5);
    saveSessionState();
    renderScanHistory();
    updateUnifiedGuardianProfileUI();
  }

  function renderScanHistory() {
    if (!scanHistoryListEl) return;
    const history = sessionState.scanHistory || [];
    if (scanHistoryBoxEl) {
      scanHistoryBoxEl.hidden = history.length === 0;
    }
    if (history.length === 0) {
      scanHistoryListEl.innerHTML = '';
      return;
    }

    scanHistoryListEl.innerHTML = '';
    history.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'history-row';
      const badgeClass = item.score >= 60 ? 'verdict-danger' : item.score >= 25 ? 'verdict-warn' : 'verdict-safe';
      btn.innerHTML = `
        <span class="history-snippet">${escapeHtml(item.snippet)}</span>
        <span class="verdict-tag ${badgeClass}">Skor ${item.score}</span>
      `;
      btn.addEventListener('click', () => {
        scannerTextarea.value = item.rawText;
        scannerValidationMsg.hidden = true;
        renderScannerResult(analyzeMessageAndLinks(item.rawText));
      });
      scanHistoryListEl.appendChild(btn);
    });
  }

  if (scanHistoryClearBtn) {
    scanHistoryClearBtn.addEventListener('click', () => {
      sessionState.scanHistory = [];
      saveSessionState();
      renderScanHistory();
      updateUnifiedGuardianProfileUI();
    });
  }

  if (scannerRunBtn && scannerTextarea) {
    scannerRunBtn.addEventListener('click', () => {
      const val = scannerTextarea.value.trim();
      if (!val) {
        scannerValidationMsg.hidden = false;
        scannerTextarea.focus();
        return;
      }
      scannerValidationMsg.hidden = true;
      const res = analyzeMessageAndLinks(val);
      renderScannerResult(res);
      recordScanToHistory(val, res.score);
    });

    scannerClearBtn.addEventListener('click', () => {
      scannerTextarea.value = '';
      scannerValidationMsg.hidden = true;
      scannerScoreVal.textContent = '0';
      scannerVerdictBadge.className = 'verdict-tag verdict-neutral';
      scannerVerdictBadge.textContent = 'Menunggu input';
      scannerVerdictTitle.textContent = 'Siap memeriksa konten';
      scannerVerdictDesc.textContent = 'Tempelkan isi pesan atau pilih salah satu contoh di samping untuk membedah domain tujuan, ekstensi file tersembunyi, dan pola rekayasa sosial.';
      scannerAnatomyBox.hidden = true;
      scannerFindingsHeading.textContent = 'Temuan indikator (0)';
      scannerFindingsList.innerHTML = `
        <p class="empty-finding-state">
          Pemeriksaan mencakup deteksi file aplikasi .APK, tautan tiruan, permintaan kode OTP atau PIN, desakan waktu, permintaan transfer di muka, dan nomor pengirim pribadi.
        </p>
      `;
      scannerActionFooter.hidden = true;
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-scan-preset');
        if (scannerPresets[key]) {
          scannerTextarea.value = scannerPresets[key];
          scannerValidationMsg.hidden = true;
          const res = analyzeMessageAndLinks(scannerPresets[key]);
          renderScannerResult(res);
          recordScanToHistory(scannerPresets[key], res.score);
        }
      });
    });
  }

  // =========================================================================
  // 2. SCAM SIMULATOR MODULE (#simulator)
  // =========================================================================
  const scenarios = {
    courier: {
      title: 'Kurir Paket Fiktif (.APK Tersembunyi)',
      desc: 'Penipu mengaku kurir ekspedisi dan mendesak korban membuka file surat bukti pengiriman berformat APK untuk mencuri SMS/OTP.',
      contactName: 'Budi - Ekspedisi Kilat Express',
      contactAvatar: 'EK',
      contactStatus: '+62 821-9901-4421 • Online',
      initialRisk: 'Normal',
      steps: [
        {
          stepNum: 1,
          botMessages: [
            'Halo Kak, selamat siang. Saya Budi dari ekspedisi Kilat Express.',
            'Ada kiriman paket penting atas nama Anda dengan no resi KL-99201. Mohon maaf alamat tertutup sedikit lakban, mohon cek foto paket di lampiran Surat_Foto_Paket.apk ini ya Kak.'
          ],
          choices: [
            {
              text: 'Langsung unduh dan pasang aplikasi Surat_Foto_Paket.apk agar paket segera dikirim.',
              nextStep: 2,
              consequence: 'DANGEROUS',
              riskLevel: 'Bahaya Tinggi',
              scoreDelta: -40,
              feedbackTitle: 'Tindakan Sangat Berisiko (Sniffing APK)!',
              feedbackText: 'File berekstensi .apk di Android adalah paket aplikasi, bukan foto dokumen. Memasangnya akan memberikan izin akses SMS kepada penipu sehingga seluruh kode OTP perbankan Anda disadap.'
            },
            {
              text: 'Minta kurir mengirimkan foto langsung dalam format gambar biasa (JPG/PNG), bukan file aplikasi.',
              nextStep: 3,
              consequence: 'SAFE',
              riskLevel: 'Waspada',
              scoreDelta: 0,
              feedbackTitle: 'Keputusan Tepat & Kritis!',
              feedbackText: 'Kurir resmi tidak pernah mengirimkan file aplikasi untuk mengecek paket. Meminta foto langsung mempersempit ruang gerak pelaku.'
            },
            {
              text: 'Abaikan file, cek nomor resi KL-99201 langsung di situs resmi atau aplikasi ekspedisi.',
              nextStep: 4,
              consequence: 'BEST',
              riskLevel: 'Aman Terverifikasi',
              scoreDelta: 0,
              feedbackTitle: 'Respons Pertahanan Terbaik (Golden Rule)!',
              feedbackText: 'Memverifikasi mandiri melalui portal atau aplikasi resmi adalah cara paling ampuh memutus rantai manipulasi rekayasa sosial.'
            }
          ]
        },
        {
          stepNum: 2,
          botMessages: [
            'Kak, aplikasinya sudah dibuka kan? Nanti ada izin akses notifikasi dan SMS, klik "Izinkan Semua" ya Kak biar sistem ekspedisi bisa sinkronisasi.'
          ],
          choices: [
            {
              text: 'Klik Izinkan Semua izin akses aplikasi agar proses selesai.',
              nextStep: null,
              consequence: 'GAME_OVER',
              riskLevel: 'Kompromi Data Total',
              scoreDelta: -60,
              feedbackTitle: 'Akun Anda Berhasil Dibobol!',
              feedbackText: 'Dengan memberi izin SMS, malware berhasil membaca SMS token perbankan dan kartu kredit Anda tanpa Anda sadari. Segera ganti nomor m-banking dan hubungi bank!'
            },
            {
              text: 'Sadar ada yang janggal, batalkan instalasi dan segera hapus file APK dari folder Download.',
              nextStep: null,
              consequence: 'RECOVERY',
              riskLevel: 'Terselamatkan',
              scoreDelta: 20,
              feedbackTitle: 'Refleks Pemulihan Cepat!',
              feedbackText: 'Menghentikan proses sebelum izin berbahaya diberikan berhasil mencegah malware aktif. Lakukan pemindaian antivirus dan jangan pernah buka file tersebut lagi.'
            }
          ]
        },
        {
          stepNum: 3,
          botMessages: [
            'Waduh Kak sistem kami hanya bisa kirim lewat file sistem itu. Kalau tidak dibuka sekarang, paket akan kami hanguskan atau kembalikan ke gudang pusat!'
          ],
          choices: [
            {
              text: 'Panik paket hangus, akhirnya menyerah dan mengunduh file APK.',
              nextStep: null,
              consequence: 'DANGEROUS',
              riskLevel: 'Bahaya Tinggi',
              scoreDelta: -50,
              feedbackTitle: 'Terjebak Manipulasi Urgensi!',
              feedbackText: 'Pelaku sengaja menciptakan rasa panik agar korban tidak berpikir jernih. Ekspedisi asli tidak pernah menghanguskan paket hanya karena tidak membuka link.'
            },
            {
              text: 'Tetap tenang, tolak ancaman tersebut dan laporkan nomor ini sebagai spam/penipu.',
              nextStep: null,
              consequence: 'BEST',
              riskLevel: 'Aman Total',
              scoreDelta: 0,
              feedbackTitle: 'Investigasi Berhasil!',
              feedbackText: 'Anda berhasil melewati trik manipulasi emosi (fear mongering). Anda telah menjadi Digital Guardian yang tangguh!'
            }
          ]
        },
        {
          stepNum: 4,
          botMessages: [
            'Saat Anda cek di situs resmi ekspedisi, resi KL-99201 ternyata TIDAK TERDAFTAR. Kontak pelaku kini mengirim pesan: "Halo Kak kenapa belum dipasang filenya?"'
          ],
          choices: [
            {
              text: 'Blokir nomor pengirim dan laporkan nomor ke kanal CekRekening.id / Aduan Konten.',
              nextStep: null,
              consequence: 'BEST',
              riskLevel: 'Aman Sempurna',
              scoreDelta: 0,
              feedbackTitle: 'Selamat! Skenario Selesai dengan Skor Sempurna',
              feedbackText: 'Langkah Anda 100% tepat: Validasi data mandiri, tolak file tak dikenal, lalu ambil tindakan mitigasi pelaporan demi melindungi pengguna lain.'
            }
          ]
        }
      ]
    },

    bank: {
      title: 'Perubahan Tarif Bank (Pencurian OTP & Kredensial)',
      desc: 'Pesan mengaku dari bank ternama, memberitahukan kenaikan tarif transfer bulanan menjadi Rp 150.000 kecuali jika menolak lewat tautan formulir.',
      contactName: 'Layanan Pengumuman Tarif Resmi',
      contactAvatar: 'BK',
      contactStatus: '+62 813-7744-1100 • Akun Bisnis Tidak Terverifikasi',
      initialRisk: 'Normal',
      steps: [
        {
          stepNum: 1,
          botMessages: [
            'Pemberitahuan Resmi: Tarif transaksi transfer antarbank Anda akan diperbarui menjadi Rp 150.000/bulan terhitung malam ini.',
            'Jika Anda tidak menyetujui perubahan skema ini dan ingin tetap di tarif normal Rp 6.500, silakan batalkan perubahan tarif sekarang melalui form resmi: http://bca-tarif-layanan2026.vip/batal'
          ],
          choices: [
            {
              text: 'Segera klik tautan untuk membatalkan agar saldo tidak terpotong tiap bulan.',
              nextStep: 2,
              consequence: 'DANGEROUS',
              riskLevel: 'Bahaya Tinggi',
              scoreDelta: -40,
              feedbackTitle: 'Waspada Phising Domain Tiruan!',
              feedbackText: 'Domain website tiruan menggunakan kata kunci bank di depan domain .vip. Bank resmi selalu menggunakan domain tingkat atas korporat (.co.id atau .com terverifikasi).'
            },
            {
              text: 'Buka aplikasi m-Banking resmi dan periksa menu inbox / pengumuman resmi.',
              nextStep: 3,
              consequence: 'BEST',
              riskLevel: 'Aman Terverifikasi',
              scoreDelta: 0,
              feedbackTitle: 'Langkah Verifikasi Otentik!',
              feedbackText: 'Semua perubahan tarif resmi selalu diumumkan melalui kanal resmi dan aplikasi perbankan, bukan lewat blast nomor seluler pribadi.'
            }
          ]
        },
        {
          stepNum: 2,
          botMessages: [
            'Halaman formulir terbuka. Ada formulir meminta: Nomor Kartu Debit, CVV (3 angka di belakang), dan Kode OTP SMS yang baru saja masuk ke HP Anda.'
          ],
          choices: [
            {
              text: 'Masukkan nomor kartu, CVV, dan kode OTP untuk konfirmasi pembatalan.',
              nextStep: null,
              consequence: 'GAME_OVER',
              riskLevel: 'Kerugian Finansial Kritis',
              scoreDelta: -60,
              feedbackTitle: 'Saldo Tabungan Dikuras!',
              feedbackText: 'Kombinasi Nomor Kartu + CVV + OTP adalah kunci brankas digital Anda. Bank tidak pernah meminta kode OTP atau CVV dengan alasan pembatalan tarif!'
            },
            {
              text: 'Tutup browser seketika, kode OTP adalah rahasia mutlak yang tidak boleh diisi di web formulir.',
              nextStep: null,
              consequence: 'RECOVERY',
              riskLevel: 'Terselamatkan',
              scoreDelta: 20,
              feedbackTitle: 'Keputusan Menyelamatkan Rekening!',
              feedbackText: 'Menahan diri tidak membagikan OTP melindungi Anda dari pencurian dana sekejap mata. Jangan pernah berikan OTP kepada siapa pun!'
            }
          ]
        },
        {
          stepNum: 3,
          botMessages: [
            'Di aplikasi resmi bank, Anda melihat banner peringatan: "Waspada modus kenaikan tarif palsu. Bank tidak pernah memungut biaya bulanan Rp 150rb".'
          ],
          choices: [
            {
              text: 'Abaikan dan blokir pesan pelaku, serta bagikan peringatan ke grup keluarga.',
              nextStep: null,
              consequence: 'BEST',
              riskLevel: 'Aman Sempurna',
              scoreDelta: 0,
              feedbackTitle: 'Sempurna! Anda Mematahkan Rekayasa Sosial Bank',
              feedbackText: 'Edukasi dan kesadaran kritis adalah tameng paling efektif dalam melindungi ekosistem digital Indonesia.'
            }
          ]
        }
      ]
    },

    job: {
      title: 'Loker Freelance Like & Subscribe YouTube',
      desc: 'Penawaran kerja paruh waktu mudah dari rumah dengan komisi harian Rp 500.000, namun mengharuskan deposit modal awal pada misi berikutnya.',
      contactName: 'Jessica HRD Mitra Digital',
      contactAvatar: 'HR',
      contactStatus: '+62 895-3211-9877 • Online',
      initialRisk: 'Normal',
      steps: [
        {
          stepNum: 1,
          botMessages: [
            'Halo Kak! Kami dari Mitra Rekrutmen Digital menawarkan pekerjaan santai paruh waktu. Cukup like & subscribe 3 video YouTube, Kakak langsung kami bayar Rp 30.000.',
            'Mau dicoba untuk tugas pertama Kak? Hanya butuh 2 menit.'
          ],
          choices: [
            {
              text: 'Ikuti tugas pertama like video untuk membuktikan apakah benar ditransfer.',
              nextStep: 2,
              consequence: 'ELEVATED',
              riskLevel: 'Umpan Menarik',
              scoreDelta: -10,
              feedbackTitle: 'Trik "Umpan Kecil" Penipu Dimulai',
              feedbackText: 'Penipu memang biasanya mentransfer Rp 30.000 di awal untuk membangun rasa percaya semu korban sebelum meminta setoran jutaan rupiah.'
            },
            {
              text: 'Tolak tawaran tersebut dan tanyakan legalitas perusahaan serta kontrak kerja resmi.',
              nextStep: 3,
              consequence: 'BEST',
              riskLevel: 'Kritis & Aman',
              scoreDelta: 0,
              feedbackTitle: 'Sikap Kritis yang Sangat Tepat!',
              feedbackText: 'Pekerjaan profesional tidak merekrut melalui pesan personal singkat tanpa seleksi atau kejelasan entitas legal terdaftar.'
            }
          ]
        },
        {
          stepNum: 2,
          botMessages: [
            'Selamat! Bonus tugas awal Rp 30.000 sudah masuk rekening Kakak.',
            'Sekarang untuk masuk ke "Tugas VIP" dengan komisi Rp 2.500.000, Kakak harus deposit modal kerja awal Rp 500.000 ke rekening bendahara kami. Modal akan dikembalikan 100% ditambah komisi.'
          ],
          choices: [
            {
              text: 'Transfer Rp 500.000 karena tugas pertama terbukti berhasil dibayar.',
              nextStep: null,
              consequence: 'GAME_OVER',
              riskLevel: 'Penipuan Ponzi Berhasil',
              scoreDelta: -90,
              feedbackTitle: 'Uang Deposit Anda Hilang!',
              feedbackText: 'Setelah Anda transfer Rp 500rb, mereka akan meminta tambahan Rp 2jt dengan alasan "tugas belum tuntas", hingga korban kehabisan seluruh tabungannya.'
            },
            {
              text: 'Berhenti seketika! Pekerjaan asli tidak pernah mewajibkan calon pekerja membayar deposit uang.',
              nextStep: null,
              consequence: 'BEST',
              riskLevel: 'Aman Terlindungi',
              scoreDelta: 10,
              feedbackTitle: 'Refleks Emas Anti-Scam!',
              feedbackText: 'Prinsip mutlak: "Jika sebuah pekerjaan mewajibkan Anda mentransfer uang terlebih dahulu, itu 100% PENIPUAN".'
            }
          ]
        },
        {
          stepNum: 3,
          botMessages: [
            'Pelaku mulai berbelit-belit: "Kakak jangan kebanyakan tanya kalau mau kaya! Ini peluang terbatas untuk orang yang mau berusaha saja!"'
          ],
          choices: [
            {
              text: 'Blokir kontak penipu dan laporkan nomor ke Patroli Siber Polri.',
              nextStep: null,
              consequence: 'BEST',
              riskLevel: 'Aman Sempurna',
              scoreDelta: 0,
              feedbackTitle: 'Selesai! Investigasi Sukses',
              feedbackText: 'Bahasa kasar atau defensif ketika ditanya legalitas adalah ciri khas pelaku penipuan rekayasa sosial.'
            }
          ]
        }
      ]
    }
  };

  let currentScenarioKey = sessionState.simulator.activeScenario || 'courier';
  let currentStepIndex = 0;
  let currentScore = 100;
  let selectedNextStep = null;

  const tabButtons = document.querySelectorAll('.scenario-nav .tab-btn');
  const scenarioTitleEl = document.getElementById('sim-scenario-title');
  const scenarioDescEl = document.getElementById('sim-scenario-desc');
  const contactNameEl = document.getElementById('sim-contact-name');
  const contactAvatarEl = document.getElementById('sim-contact-avatar');
  const contactStatusEl = document.getElementById('sim-contact-status');
  const riskBadgeEl = document.getElementById('sim-risk-badge');
  const stepIndicatorEl = document.getElementById('sim-step-indicator');
  const scoreIndicatorEl = document.getElementById('sim-score-indicator');
  const messagesContainer = document.getElementById('sim-messages');
  const choicesContainer = document.getElementById('sim-choices-container');
  const actionsPanel = document.getElementById('sim-actions-panel');
  const feedbackPanel = document.getElementById('sim-feedback-panel');
  const feedbackTypeEl = document.getElementById('sim-feedback-type');
  const feedbackTitleEl = document.getElementById('sim-feedback-title');
  const feedbackExplanationEl = document.getElementById('sim-feedback-explanation');
  const nextBtn = document.getElementById('sim-next-btn');
  const restartBtn = document.getElementById('sim-restart-btn');

  function initSimulator(scenarioKey) {
    if (!scenarios[scenarioKey]) scenarioKey = 'courier';
    currentScenarioKey = scenarioKey;
    sessionState.simulator.activeScenario = scenarioKey;
    saveSessionState();

    const scen = scenarios[scenarioKey];
    currentStepIndex = 0;
    currentScore = 100;
    selectedNextStep = null;

    tabButtons.forEach(b => {
      const isMatch = b.getAttribute('data-scenario') === scenarioKey;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-selected', isMatch.toString());
    });

    scenarioTitleEl.textContent = scen.title;
    scenarioDescEl.textContent = scen.desc;
    contactNameEl.textContent = scen.contactName;
    contactAvatarEl.textContent = scen.contactAvatar;
    contactStatusEl.textContent = scen.contactStatus;

    updateStatusUI('Normal', currentScore, 1, scen.steps.length);
    renderStep(0);
  }

  function updateStatusUI(risk, score, stepNum, totalSteps) {
    riskBadgeEl.textContent = risk;
    riskBadgeEl.className = 'risk-badge';
    if (risk.toLowerCase().includes('bahaya') || risk.toLowerCase().includes('kritis') || risk.toLowerCase().includes('kompromi') || risk.toLowerCase().includes('ponzi')) {
      riskBadgeEl.classList.add('risk-danger');
    } else if (risk.toLowerCase().includes('waspada') || risk.toLowerCase().includes('elevated') || risk.toLowerCase().includes('umpan')) {
      riskBadgeEl.classList.add('risk-elevated');
    } else {
      riskBadgeEl.classList.add('risk-normal');
    }

    scoreIndicatorEl.textContent = `${Math.max(0, Math.min(100, score))} / 100`;
    stepIndicatorEl.textContent = `Langkah ${stepNum} dari ${totalSteps}`;
  }

  function renderStep(stepIndex) {
    const scen = scenarios[currentScenarioKey];
    const step = scen.steps[stepIndex];
    if (!step) return;

    feedbackPanel.hidden = true;
    actionsPanel.hidden = false;

    messagesContainer.innerHTML = '';
    step.botMessages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble bubble-incoming';
      bubble.innerHTML = `
        <span class="bubble-text">${escapeHtml(msg)}</span>
        <span class="bubble-meta">Diterima</span>
      `;
      messagesContainer.appendChild(bubble);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    choicesContainer.innerHTML = '';
    step.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <span class="choice-index">${String.fromCharCode(65 + idx)}.</span>
        <span class="choice-label">${escapeHtml(choice.text)}</span>
      `;
      btn.addEventListener('click', () => handleChoice(choice, stepIndex));
      choicesContainer.appendChild(btn);
    });
  }

  function handleChoice(choice, stepIndex) {
    const scen = scenarios[currentScenarioKey];

    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-outgoing';
    userBubble.innerHTML = `
      <span class="bubble-text">${escapeHtml(choice.text)}</span>
      <span class="bubble-meta">Dikirim</span>
    `;
    messagesContainer.appendChild(userBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    currentScore = Math.max(0, Math.min(100, currentScore + choice.scoreDelta));
    updateStatusUI(choice.riskLevel, currentScore, stepIndex + 1, scen.steps.length);

    // Track in sessionState
    if (choice.consequence === 'DANGEROUS' || choice.consequence === 'GAME_OVER' || choice.consequence === 'ELEVATED') {
      sessionState.simulator.riskyDecisions = (sessionState.simulator.riskyDecisions || 0) + 1;
    } else {
      sessionState.simulator.safeDecisions = (sessionState.simulator.safeDecisions || 0) + 1;
    }

    actionsPanel.hidden = true;
    feedbackPanel.hidden = false;
    feedbackTypeEl.textContent = `Evaluasi: ${choice.riskLevel}`;
    feedbackTitleEl.textContent = choice.feedbackTitle;
    feedbackExplanationEl.textContent = choice.feedbackText;

    selectedNextStep = choice.nextStep;

    if (choice.nextStep === null) {
      sessionState.simulator.completedScenarios[currentScenarioKey] = currentScore;
      saveSessionState();
      updateUnifiedGuardianProfileUI();
      nextBtn.textContent = 'Ulangi Skenario Ini';
    } else {
      saveSessionState();
      updateUnifiedGuardianProfileUI();
      nextBtn.textContent = 'Lanjutkan Percakapan';
    }
  }

  nextBtn.addEventListener('click', () => {
    const scen = scenarios[currentScenarioKey];
    if (selectedNextStep === null) {
      initSimulator(currentScenarioKey);
    } else {
      const targetIdx = scen.steps.findIndex(s => s.stepNum === selectedNextStep);
      if (targetIdx !== -1) {
        currentStepIndex = targetIdx;
        updateStatusUI(riskBadgeEl.textContent, currentScore, currentStepIndex + 1, scen.steps.length);
        renderStep(currentStepIndex);
      } else {
        initSimulator(currentScenarioKey);
      }
    }
  });

  restartBtn.addEventListener('click', () => {
    initSimulator(currentScenarioKey);
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenKey = btn.getAttribute('data-scenario');
      initSimulator(scenKey);
    });
  });

  // =========================================================================
  // 3. MULTI-CASE SCAM DETECTIVE & UNIFIED GUARDIAN PROFILE (#detective)
  // =========================================================================
  const detectiveCases = {
    prize: {
      tag: 'Bukti Kasus #01-PHISH',
      title: 'Pemberitahuan Undian Festival Belanja',
      icon: '🎁',
      timestamp: 'Diterima via WhatsApp • Hari ini, 10:14 WIB',
      senderClue: {
        id: 'unverified-number',
        label: '+62 858-1294-0982 (Akun Pribadi)',
        isRisk: true,
        title: 'Nomor Seluler Pribadi Tak Terverifikasi',
        desc: 'Pemberitahuan hadiah resmi bernilai ratusan juta tidak pernah dikirim melalui nomor seluler pribadi tanpa identitas bisnis resmi.',
        category: 'Verifikasi Identitas Pengirim'
      },
      bodyBlocks: [
        {
          type: 'text',
          content: 'Selamat! Nomor handphone Anda terpilih sebagai pemenang Grand Prize Toyota Raize dari Panitia Festival Akhir Tahun.'
        },
        {
          type: 'clue',
          id: 'unrealistic-offer',
          label: 'Hadiah bebas biaya administrasi dan dapat langsung dicairkan dalam bentuk uang tunai Rp 250.000.000,- tanpa undian!',
          isRisk: true,
          title: 'Klaim Hadiah Fantastis Tanpa Partisipasi',
          desc: 'Janji pencairan uang ratusan juta rupiah tanpa pernah mendaftar program undian adalah pola klasik rekayasa sosial (greed baiting).',
          category: 'Analisis Realitas Penawaran'
        },
        {
          type: 'clue',
          id: 'safe-greeting',
          label: 'Pemenang berhak memilih warna kendaraan sesuai ketersediaan stok di diler kota masing-masing.',
          isRisk: false,
          title: 'Kalimat Deskriptif Normal (Pengecoh)',
          desc: 'Kalimat ini hanyalah detail tambahan untuk meyakinkan korban, bukan indikator teknis penipuan utama.',
          category: 'Pengecoh'
        },
        {
          type: 'text',
          content: 'Untuk verifikasi klaim hadiah dan pencairan dana, silakan aktivasi token m-banking pada portal berikut:'
        },
        {
          type: 'clue',
          id: 'fake-domain',
          label: 'https://pesta-hadiah-resmi-verifikasi.vip/klaim',
          isRisk: true,
          title: 'Tautan Domain Phishing (.vip)',
          desc: 'Domain berekstensi .vip dengan kata kunci berulang adalah situs tiruan untuk mencuri kredensial dan kode OTP korban.',
          category: 'Forensik Domain Tautan'
        },
        {
          type: 'clue',
          id: 'urgency',
          label: 'Peringatan: Hadiah akan dibatalkan otomatis dan dialihkan dalam 15 menit ke depan jika formulir tidak diisi!',
          isRisk: true,
          title: 'Tekanan Batas Waktu Sempit (15 Menit)',
          desc: 'Menciptakan kepanikan waktu agar korban segera mengeklik tautan tanpa sempat mengecek kebenaran informasi.',
          category: 'Deteksi Manipulasi Psikologis'
        }
      ]
    },

    hrd: {
      tag: 'Bukti Kasus #02-JOBSCAM',
      title: 'Surat Panggilan Interview & Pelatihan Calon Karyawan',
      icon: '💼',
      timestamp: 'Diterima via Email / Telegram • Kemarin, 16:40 WIB',
      senderClue: {
        id: 'hrd-free-email',
        label: 'rekrutmen.bumn.pusat2026@gmail.com',
        isRisk: true,
        title: 'Penggunaan Email Gratis (@gmail.com) untuk Instansi Besar',
        desc: 'Perusahaan BUMN atau korporasi nasional selalu menggunakan domain email resmi perusahaan, bukan layanan email publik gratis.',
        category: 'Verifikasi Identitas Pengirim'
      },
      bodyBlocks: [
        {
          type: 'clue',
          id: 'safe-interview-intro',
          label: 'Berdasarkan evaluasi CV yang Anda kirimkan, Anda dinyatakan lolos seleksi administrasi tahap pertama.',
          isRisk: false,
          title: 'Pernyataan Standar Rekrutmen (Pengecoh)',
          desc: 'Kalimat pembuka tentang kelolosan seleksi administrasi adalah hal normal dalam surat panggilan kerja.',
          category: 'Pengecoh'
        },
        {
          type: 'clue',
          id: 'upfront-training-fee',
          label: 'Seluruh peserta wajib mentransfer biaya reservasi tiket, hotel, dan sertifikasi pelatihan sebesar Rp 1.250.000 ke rekening bendahara panitia.',
          isRisk: true,
          title: 'Permintaan Pembayaran / Biaya di Muka',
          desc: 'Rekrutmen kerja yang sah TIDAK PERNAH memungut biaya tiket, pelatihan, atau administrasi dari pelamar kerja.',
          category: 'Deteksi Permintaan Finansial'
        },
        {
          type: 'clue',
          id: 'reimburse-promise',
          label: 'Dana yang ditransfer dijamin akan diganti (reimburse) 100% begitu peserta tiba di lokasi pelatihan.',
          isRisk: true,
          title: 'Janji Reimburse Palsu sebagai Pengaman Semu',
          desc: 'Modus penipuan travel/rekrutmen fiktif selalu menjanjikan penggantian biaya 100% agar korban merasa aman saat mentransfer uang.',
          category: 'Analisis Realitas Penawaran'
        },
        {
          type: 'clue',
          id: 'hrd-urgency',
          label: 'Bukti transfer wajib dikirimkan maksimal 1 jam setelah pesan ini diterima atau kuota kelulusan Anda gugur.',
          isRisk: true,
          title: 'Desakan Pembayaran Cepat (1 Jam)',
          desc: 'Memaksa pelamar membayar dalam 1 jam bertujuan mencegah pelamar mengonfirmasi ke situs karier resmi perusahaan.',
          category: 'Deteksi Manipulasi Psikologis'
        }
      ]
    },

    customs: {
      tag: 'Bukti Kasus #03-IMPERSONATION',
      title: 'Peringatan Penahanan Barang Kiriman Luar Negeri',
      icon: '📦',
      timestamp: 'Diterima via WhatsApp • Hari ini, 08:05 WIB',
      senderClue: {
        id: 'customs-personal-wa',
        label: '+62 812-6650-3319 (Petugas Pemeriksa Lapangan)',
        isRisk: true,
        title: 'Tagihan Resmi Dikirim via Nomor Pribadi',
        desc: 'Bea Cukai hanya menyampaikan informasi tagihan resmi melalui sistem tracking resmi dan kode billing negara (MPN G3), bukan WhatsApp pribadi.',
        category: 'Verifikasi Identitas Pengirim'
      },
      bodyBlocks: [
        {
          type: 'text',
          content: 'Yth. Penerima Paket Internasional, barang kiriman Anda tertahan di gudang pemeriksaan karena belum melunasi pajak masuk.'
        },
        {
          type: 'clue',
          id: 'personal-bank-account',
          label: 'Pembayaran denda pajak Rp 3.500.000 wajib ditransfer langsung ke Rekening Pribadi a.n. Hendra Wijaya (Petugas).',
          isRisk: true,
          title: 'Transfer Pajak ke Rekening Pribadi',
          desc: 'Penerimaan negara/pajak selalu menggunakan Kode Billing resmi ke Kas Negara, tidak pernah ditransfer ke rekening atas nama perorangan.',
          category: 'Deteksi Permintaan Finansial'
        },
        {
          type: 'clue',
          id: 'legal-threat',
          label: 'Apabila tidak dilunasi dalam 30 menit, surat panggilan kepolisian atas tuduhan penyelundupan akan langsung diterbitkan!',
          isRisk: true,
          title: 'Intimidasi & Ancaman Pidana Palsu',
          desc: 'Menggunakan ancaman polisi/hukum secara mendadak adalah taktik intimidasi psikologis agar korban takut dan langsung mentransfer uang.',
          category: 'Deteksi Manipulasi Psikologis'
        },
        {
          type: 'clue',
          id: 'safe-customs-info',
          label: 'Setiap barang kiriman dari luar negeri memang dikenakan bea masuk dan pajak impor sesuai regulasi kepabeanan yang berlaku.',
          isRisk: false,
          title: 'Fakta Regulasi Umum (Pengecoh)',
          desc: 'Informasi bahwa barang impor dikenakan pajak adalah aturan yang benar; yang menjadikannya penipuan adalah cara penagihan ke rekening pribadi.',
          category: 'Pengecoh'
        }
      ]
    }
  };

  let activeCaseKey = sessionState.detective.activeCase || 'prize';

  const caseTabBtns = document.querySelectorAll('.case-tab-btn');
  const detectiveCaseTag = document.getElementById('detective-case-tag');
  const detectiveCaseTitle = document.getElementById('detective-case-title');
  const detectiveSenderIcon = document.getElementById('detective-sender-icon');
  const detectiveSenderSlot = document.getElementById('detective-sender-slot');
  const detectiveTimestamp = document.getElementById('detective-timestamp');
  const detectiveBodySlot = document.getElementById('detective-body-slot');
  const detectiveValidationMsg = document.getElementById('detective-validation-msg');
  const selectedCluesCountEl = document.getElementById('selected-clues-count');
  const submitReportBtn = document.getElementById('submit-report-btn');
  const resetDetectiveBtn = document.getElementById('reset-detective-btn');

  const profileScoreNum = document.getElementById('profile-score-num');
  const profileStatusTitle = document.getElementById('profile-status-title');
  const profileStatusDesc = document.getElementById('profile-status-desc');
  const profileHits = document.getElementById('profile-hits');
  const profileFalsePositives = document.getElementById('profile-false-positives');
  const profileSimRisks = document.getElementById('profile-sim-risks');
  const profileStrength = document.getElementById('profile-strength');
  const profileWeakness = document.getElementById('profile-weakness');
  const detectiveFeedbackList = document.getElementById('detective-feedback-list');
  const profileCopyBtn = document.getElementById('profile-copy-btn');
  const profileFullResetBtn = document.getElementById('profile-full-reset-btn');

  function updateSelectedCluesCount() {
    if (!selectedCluesCountEl) return;
    const count = document.querySelectorAll('#evidence-view .evidence-clue-btn[aria-pressed="true"]').length;
    selectedCluesCountEl.textContent = String(count);
  }

  function renderDetectiveCase(caseKey) {
    if (!detectiveCases[caseKey]) caseKey = 'prize';
    activeCaseKey = caseKey;
    sessionState.detective.activeCase = caseKey;
    saveSessionState();

    const cData = detectiveCases[caseKey];
    detectiveValidationMsg.hidden = true;

    caseTabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-case') === caseKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch.toString());
    });

    detectiveCaseTag.textContent = cData.tag;
    detectiveCaseTitle.textContent = cData.title;
    detectiveSenderIcon.textContent = cData.icon;
    detectiveTimestamp.textContent = cData.timestamp;

    // Render Sender Clue Button
    detectiveSenderSlot.innerHTML = '';
    const senderBtn = document.createElement('button');
    senderBtn.type = 'button';
    senderBtn.className = 'evidence-clue-btn';
    senderBtn.setAttribute('data-clue', cData.senderClue.id);
    senderBtn.setAttribute('aria-pressed', 'false');
    senderBtn.textContent = cData.senderClue.label;
    senderBtn.addEventListener('click', () => toggleClueSelection(senderBtn));
    detectiveSenderSlot.appendChild(senderBtn);

    // Render Body Blocks
    detectiveBodySlot.innerHTML = '';
    cData.bodyBlocks.forEach(block => {
      const p = document.createElement('p');
      if (block.type === 'text') {
        p.textContent = block.content;
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'evidence-clue-btn';
        btn.setAttribute('data-clue', block.id);
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = block.label;
        btn.addEventListener('click', () => toggleClueSelection(btn));
        p.appendChild(btn);
      }
      detectiveBodySlot.appendChild(p);
    });

    // If case was already evaluated in this session, show its breakdown
    const prevResult = sessionState.detective.caseResults[caseKey];
    if (prevResult) {
      renderCaseFeedbackList(caseKey, prevResult.selectedIds);
    } else {
      detectiveFeedbackList.hidden = true;
      detectiveFeedbackList.innerHTML = '';
    }

    updateSelectedCluesCount();
    updateUnifiedGuardianProfileUI();
  }

  function toggleClueSelection(btn) {
    detectiveValidationMsg.hidden = true;
    const isPressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', (!isPressed).toString());
    updateSelectedCluesCount();
  }

  function getAllCluesForCase(caseKey) {
    const cData = detectiveCases[caseKey];
    const list = [cData.senderClue];
    cData.bodyBlocks.forEach(b => {
      if (b.type === 'clue') list.push(b);
    });
    return list;
  }

  function renderCaseFeedbackList(caseKey, selectedIds) {
    const allClues = getAllCluesForCase(caseKey);
    detectiveFeedbackList.hidden = false;
    detectiveFeedbackList.innerHTML = '';

    allClues.forEach(clue => {
      const isSelected = selectedIds.includes(clue.id);
      if (!clue.isRisk && !isSelected) return; // Don't clutter with untouched safe decoys

      const card = document.createElement('div');
      if (clue.isRisk && isSelected) {
        card.className = 'clue-result-item clue-result-hit';
        card.innerHTML = `
          <strong>Tepat dikenali: ${escapeHtml(clue.title)}</strong>
          <p style="margin-top: 2px;">${escapeHtml(clue.desc)}</p>
        `;
      } else if (clue.isRisk && !isSelected) {
        card.className = 'clue-result-item clue-result-missed';
        card.innerHTML = `
          <strong>Indikator terlewat: ${escapeHtml(clue.title)}</strong>
          <p style="margin-top: 2px;">${escapeHtml(clue.desc)}</p>
        `;
      } else if (!clue.isRisk && isSelected) {
        card.className = 'clue-result-item clue-result-fp';
        card.innerHTML = `
          <strong>Elemen normal (pengecoh): ${escapeHtml(clue.title)}</strong>
          <p style="margin-top: 2px;">${escapeHtml(clue.desc)}</p>
        `;
      }
      detectiveFeedbackList.appendChild(card);
    });
  }

  submitReportBtn.addEventListener('click', () => {
    const activeClueBtns = document.querySelectorAll('#evidence-view .evidence-clue-btn');
    const selectedIds = [];
    activeClueBtns.forEach(btn => {
      if (btn.getAttribute('aria-pressed') === 'true') {
        selectedIds.push(btn.getAttribute('data-clue'));
      }
    });

    // FR-14 Input Validation: prevent empty submission
    if (selectedIds.length === 0) {
      detectiveValidationMsg.hidden = false;
      return;
    }
    detectiveValidationMsg.hidden = true;

    const allClues = getAllCluesForCase(activeCaseKey);
    const targetRiskClues = allClues.filter(c => c.isRisk);
    const totalTargets = targetRiskClues.length;

    let hits = 0;
    let falsePositives = 0;
    const missedTitles = [];
    const hitCategories = [];

    allClues.forEach(clue => {
      const isSelected = selectedIds.includes(clue.id);
      if (clue.isRisk && isSelected) {
        hits++;
        hitCategories.push(clue.category);
      } else if (clue.isRisk && !isSelected) {
        missedTitles.push(clue.title);
      } else if (!clue.isRisk && isSelected) {
        falsePositives++;
      }
    });

    // Deterministic score calculation with penalty for false positives
    const rawRatio = (hits / totalTargets) * 100;
    const penalty = falsePositives * 15;
    const caseScore = Math.max(0, Math.round(rawRatio - penalty));

    sessionState.detective.caseResults[activeCaseKey] = {
      score: caseScore,
      hits,
      totalTargets,
      falsePositives,
      missedTitles,
      hitCategories,
      selectedIds
    };
    saveSessionState();

    renderCaseFeedbackList(activeCaseKey, selectedIds);
    updateUnifiedGuardianProfileUI();
  });

  resetDetectiveBtn.addEventListener('click', () => {
    delete sessionState.detective.caseResults[activeCaseKey];
    saveSessionState();
    renderDetectiveCase(activeCaseKey);
  });

  caseTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCase = btn.getAttribute('data-case');
      renderDetectiveCase(targetCase);
    });
  });

  // Additional Web Application Telemetry & Profile DOM Elements
  const headerSessionId = document.getElementById('header-session-id');
  const headerSessionScore = document.getElementById('header-session-score');
  const profileSessionBadge = document.getElementById('profile-session-badge');
  const statScanCount = document.getElementById('stat-scan-count');
  const statSimDone = document.getElementById('stat-sim-done');
  const statDetDone = document.getElementById('stat-det-done');
  const detectiveTpCount = document.getElementById('detective-tp-count');
  const detectiveFpCount = document.getElementById('detective-fp-count');
  const detectiveCaseScore = document.getElementById('detective-case-score');
  const profileSimSafe = document.getElementById('profile-sim-safe');

  // Update Unified Guardian Profile UI & Live Workspace Telemetry (FR-11, FR-12, FR-13)
  function updateUnifiedGuardianProfileUI() {
    const simScores = Object.values(sessionState.simulator.completedScenarios || {});
    const detResults = Object.values(sessionState.detective.caseResults || {});
    const currentCaseRes = sessionState.detective.caseResults[activeCaseKey];
    const scanCount = Array.isArray(sessionState.scanHistory) ? sessionState.scanHistory.length : 0;

    if (headerSessionId) headerSessionId.textContent = sessionState.sessionId;
    if (profileSessionBadge) profileSessionBadge.textContent = sessionState.sessionId;
    if (statScanCount) statScanCount.textContent = String(scanCount);
    if (statSimDone) statSimDone.textContent = `${simScores.length} / 3`;
    if (statDetDone) statDetDone.textContent = `${detResults.length} / 3`;

    const allScores = [
      ...simScores,
      ...detResults.map(r => r.score)
    ];

    if (profileSimSafe) {
      profileSimSafe.textContent = `${sessionState.simulator.safeDecisions || 0} Keputusan`;
    }
    if (profileSimRisks) {
      profileSimRisks.textContent = `${sessionState.simulator.riskyDecisions || 0} Keputusan`;
    }

    if (currentCaseRes) {
      if (profileHits) profileHits.textContent = `${currentCaseRes.hits} / ${currentCaseRes.totalTargets}`;
      if (profileFalsePositives) profileFalsePositives.textContent = `${currentCaseRes.falsePositives} Pengecoh`;
      if (detectiveTpCount) detectiveTpCount.textContent = `${currentCaseRes.hits} / ${currentCaseRes.totalTargets}`;
      if (detectiveFpCount) detectiveFpCount.textContent = `${currentCaseRes.falsePositives} Pengecoh`;
      if (detectiveCaseScore) detectiveCaseScore.textContent = `${currentCaseRes.score} / 100`;
    } else {
      const targetCount = getAllCluesForCase(activeCaseKey).filter(c => c.isRisk).length;
      if (profileHits) profileHits.textContent = `0 / ${targetCount}`;
      if (profileFalsePositives) profileFalsePositives.textContent = '0';
      if (detectiveTpCount) detectiveTpCount.textContent = `0 / ${targetCount}`;
      if (detectiveFpCount) detectiveFpCount.textContent = '0';
      if (detectiveCaseScore) detectiveCaseScore.textContent = '-- / 100';
    }

    if (allScores.length === 0) {
      if (profileScoreNum) profileScoreNum.textContent = '--';
      if (headerSessionScore) headerSessionScore.textContent = 'Skor: --';
      if (profileStatusTitle) profileStatusTitle.textContent = 'Belum Dianalisis';
      if (profileStatusDesc) profileStatusDesc.textContent = 'Selesaikan skenario Simulator atau kirim laporan investigasi bukti di Scam Detective untuk melihat evaluasi sesi Anda.';
      if (profileStrength) profileStrength.textContent = '-';
      if (profileWeakness) profileWeakness.textContent = '-';
      return;
    }

    const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    if (profileScoreNum) profileScoreNum.textContent = avgScore;
    if (headerSessionScore) headerSessionScore.textContent = `Skor: ${avgScore}/100`;

    // Collect all missed indicators & strengths across session
    const allMissed = [];
    const allStrengths = new Set();
    detResults.forEach(r => {
      (r.missedTitles || []).forEach(m => allMissed.push(m));
      (r.hitCategories || []).forEach(c => allStrengths.add(c));
    });

    if (simScores.some(s => s >= 80)) {
      allStrengths.add('Refleks Tolak APK & Verifikasi Resmi');
    }

    if (profileStrength) {
      profileStrength.textContent = allStrengths.size > 0
        ? Array.from(allStrengths).slice(0, 2).join(', ')
        : 'Perlu Latihan Dasar';
    }

    if (profileWeakness) {
      if (allMissed.length > 0) {
        profileWeakness.textContent = `Pelajari: ${allMissed[0]}`;
      } else if ((sessionState.simulator.riskyDecisions || 0) > 0) {
        profileWeakness.textContent = 'Waspadai Taktik Urgensi & APK di Simulator';
      } else {
        profileWeakness.textContent = 'Pertahankan Kewaspadaan Kanal Resmi';
      }
    }

    if (avgScore >= 85) {
      if (profileStatusTitle) profileStatusTitle.textContent = 'Digital Guardian Tangguh (Sangat Baik)';
      if (profileStatusDesc) profileStatusDesc.textContent = `Sesi ${sessionState.sessionId}: Anda mampu membedakan bukti berbahaya dan mengambil keputusan aman secara konsisten.`;
    } else if (avgScore >= 55) {
      if (profileStatusTitle) profileStatusTitle.textContent = 'Tingkat Kewaspadaan Cukup Baik';
      if (profileStatusDesc) profileStatusDesc.textContent = `Sesi ${sessionState.sessionId}: Sebagian besar ancaman dikenali, namun perhatikan kembali indikator yang terlewat di bawah.`;
    } else {
      if (profileStatusTitle) profileStatusTitle.textContent = 'Rentan Terhadap Rekayasa Sosial';
      if (profileStatusDesc) profileStatusDesc.textContent = `Sesi ${sessionState.sessionId}: Banyak indikator kunci terlewat atau keputusan berisiko diambil. Pelajari Action Guide di bawah.`;
    }
  }

  if (profileCopyBtn) {
    profileCopyBtn.addEventListener('click', () => {
      const scoreText = profileScoreNum ? profileScoreNum.textContent : '--';
      const statusText = profileStatusTitle ? profileStatusTitle.textContent : '-';
      const strengthText = profileStrength ? profileStrength.textContent : '-';
      const recText = profileWeakness ? profileWeakness.textContent : '-';
      const summary = [
        `=== RINGKASAN EVALUASI DIGITAL GUARDIAN (${sessionState.sessionId}) ===`,
        `Skor Kesiapsiagaan Sesi : ${scoreText} / 100 (${statusText})`,
        `Keputusan Aman Simulator: ${sessionState.simulator.safeDecisions || 0} | Keputusan Berisiko: ${sessionState.simulator.riskyDecisions || 0}`,
        `Kategori Kemampuan Kuat : ${strengthText}`,
        `Rekomendasi Pembelajaran: ${recText}`,
        `*Catatan: Evaluasi ini bersifat edukatif untuk latihan deteksi scam digital.`
      ].join('\n');

      navigator.clipboard.writeText(summary).then(() => {
        const orig = profileCopyBtn.textContent;
        profileCopyBtn.textContent = 'Ringkasan disalin';
        setTimeout(() => { profileCopyBtn.textContent = orig; }, 2000);
      });
    });
  }

  if (profileFullResetBtn) {
    profileFullResetBtn.addEventListener('click', () => {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionState = structuredClone(defaultSessionState);
      sessionState.sessionId = 'SES-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      saveSessionState();
      renderScanHistory();
      initSimulator('courier');
      renderDetectiveCase('prize');
      syncChecklistUI();
      updateUnifiedGuardianProfileUI();
    });
  }

  // =========================================================================
  // 4. INTERACTIVE ACTION GUIDE CHECKLIST (#guide)
  // =========================================================================
  const stepCheckboxes = document.querySelectorAll('.guide-step-check');
  const checklistProgressText = document.getElementById('checklist-progress-text');
  const checklistProgressPct = document.getElementById('checklist-progress-pct');
  const checklistBarFill = document.getElementById('checklist-bar-fill');
  const checklistResetBtn = document.getElementById('checklist-reset-btn');

  function syncChecklistUI() {
    const total = stepCheckboxes.length;
    let checkedCount = 0;

    stepCheckboxes.forEach(cb => {
      const id = cb.getAttribute('data-step-id');
      const isChecked = Boolean(sessionState.checklist[id]);
      cb.checked = isChecked;
      if (isChecked) checkedCount++;
    });

    const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    if (checklistProgressText) {
      checklistProgressText.textContent = `${checkedCount} dari ${total} langkah selesai`;
    }
    if (checklistProgressPct) {
      checklistProgressPct.textContent = `${pct}%`;
    }
    if (checklistBarFill) {
      checklistBarFill.style.width = `${pct}%`;
    }
  }

  stepCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.getAttribute('data-step-id');
      sessionState.checklist[id] = cb.checked;
      saveSessionState();
      syncChecklistUI();
    });
  });

  if (checklistResetBtn) {
    checklistResetBtn.addEventListener('click', () => {
      sessionState.checklist = {};
      saveSessionState();
      syncChecklistUI();
    });
  }

  // =========================================================================
  // 5. EMERGENCY TOOLKIT: REPORT GENERATOR & OFFICIAL DIRECTORY (#emergency-tools)
  // =========================================================================
  const repType = document.getElementById('rep-type');
  const repPlatform = document.getElementById('rep-platform');
  const repEntity = document.getElementById('rep-entity');
  const repSuspect = document.getElementById('rep-suspect');
  const repLoss = document.getElementById('rep-loss');
  const repGenerateBtn = document.getElementById('rep-generate-btn');
  const repCopyOfficialBtn = document.getElementById('rep-copy-official-btn');
  const repCopyFamilyBtn = document.getElementById('rep-copy-family-btn');
  const repOutputText = document.getElementById('rep-output-text');

  function buildOfficialReportDraft() {
    const type = repType ? repType.value : 'Penipuan Digital';
    const platform = repPlatform ? repPlatform.value : 'WhatsApp';
    const entity = (repEntity && repEntity.value.trim()) ? repEntity.value.trim() : '[Nama Instansi / Modus yang Dicatut]';
    const suspect = (repSuspect && repSuspect.value.trim()) ? repSuspect.value.trim() : '[Nomor HP / Rekening / URL Pelaku]';
    const loss = (repLoss && repLoss.value.trim()) ? repLoss.value.trim() : '[Rincian Waktu & Nominal / Tindakan yang Terjadi]';
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

    return [
      `LAPORAN KRONOLOGI INSIDEN PENIPUAN DIGITAL`,
      `Waktu Penyusunan : ${nowStr}`,
      `Kategori Insiden : ${type}`,
      `Kanal Komunikasi : ${platform}`,
      `Modus / Catutan  : Mengatasnamakan ${entity}`,
      `Identitas Pelaku : ${suspect}`,
      `Detail Kejadian  : ${loss}`,
      ``,
      `PERMOHONAN TINDAK LANJUT:`,
      `Melalui laporan ini, saya memohon bantuan pihak Bank / Otoritas terkait untuk melakukan pemeriksaan dan pemblokiran darurat terhadap nomor rekening / akses pelaku tersebut, serta menerbitkan nomor tiket pelaporan resmi untuk proses tindak lanjut ke Indonesia Anti-Scam Centre (OJK) / Kepolisian.`
    ].join('\n');
  }

  function buildFamilyWarningDraft() {
    const platform = repPlatform ? repPlatform.value : 'WhatsApp';
    const entity = (repEntity && repEntity.value.trim()) ? repEntity.value.trim() : 'Instansi/Undian/Kurir';
    const suspect = (repSuspect && repSuspect.value.trim()) ? repSuspect.value.trim() : '(Nomor/Link tidak dikenal)';

    return [
      `PERINGATAN PENIPUAN DIGITAL`,
      `Harap waspada jika menerima pesan melalui ${platform} yang mengatasnamakan ${entity}.`,
      ``,
      `Kontak atau tautan pelaku: ${suspect}`,
      `Jangan mengeklik tautan tidak resmi, jangan mengunduh file .APK, jangan membagikan kode OTP/PIN, dan jangan mentransfer uang deposit apa pun.`,
      `Selalu periksa kebenaran informasi hanya melalui aplikasi resmi atau Call Center resmi.`
    ].join('\n');
  }

  if (repGenerateBtn && repOutputText) {
    repOutputText.value = buildOfficialReportDraft();

    repGenerateBtn.addEventListener('click', () => {
      repOutputText.value = buildOfficialReportDraft();
    });

    repCopyOfficialBtn.addEventListener('click', () => {
      const draft = buildOfficialReportDraft();
      repOutputText.value = draft;
      navigator.clipboard.writeText(draft).then(() => {
        const orig = repCopyOfficialBtn.textContent;
        repCopyOfficialBtn.textContent = 'Laporan resmi disalin';
        setTimeout(() => { repCopyOfficialBtn.textContent = orig; }, 2000);
      });
    });

    repCopyFamilyBtn.addEventListener('click', () => {
      const warning = buildFamilyWarningDraft();
      repOutputText.value = warning;
      navigator.clipboard.writeText(warning).then(() => {
        const orig = repCopyFamilyBtn.textContent;
        repCopyFamilyBtn.textContent = 'Peringatan keluarga disalin';
        setTimeout(() => { repCopyFamilyBtn.textContent = orig; }, 2000);
      });
    });
  }

  // Verified Emergency Call Center Directory
  const emergencyDirectoryData = [
    { name: 'Halo BCA (Bank Central Asia)', category: 'Bank Nasional, 24 Jam', contact: '1500888', href: 'tel:1500888' },
    { name: 'Contact BRI (Bank Rakyat Indonesia)', category: 'Bank Nasional, 24 Jam', contact: '14017', href: 'tel:14017' },
    { name: 'Mandiri Call (Bank Mandiri)', category: 'Bank Nasional, 24 Jam', contact: '14000', href: 'tel:14000' },
    { name: 'BNI Call (Bank Negara Indonesia)', category: 'Bank Nasional, 24 Jam', contact: '1500046', href: 'tel:1500046' },
    { name: 'Bank Syariah Indonesia (BSI Call)', category: 'Bank Syariah, 24 Jam', contact: '14040', href: 'tel:14040' },
    { name: 'BTN Contact Center', category: 'Bank Nasional, 24 Jam', contact: '1500286', href: 'tel:1500286' },
    { name: 'BTPN / Jenius Help', category: 'Bank Digital, 24 Jam', contact: '1500365', href: 'tel:1500365' },
    { name: 'DANA Customer Care', category: 'Dompet Digital (E-Wallet)', contact: '1500445', href: 'tel:1500445' },
    { name: 'OVO Pusat Bantuan Resmi', category: 'Dompet Digital (E-Wallet)', contact: '1500696', href: 'tel:1500696' },
    { name: 'GoPay Customer Service', category: 'Dompet Digital (E-Wallet)', contact: '1500729', href: 'tel:1500729' },
    { name: 'Kontak OJK 157 & Anti-Scam Centre', category: 'Otoritas Jasa Keuangan', contact: '157', href: 'tel:157' },
    { name: 'CekRekening.id (Kemenkominfo)', category: 'Pelaporan Rekening Penipu', contact: 'cekrekening.id', href: 'https://cekrekening.id' },
    { name: 'Patroli Siber Bareskrim Polri', category: 'Pelaporan Kejahatan Siber', contact: 'patrolisiber.id', href: 'https://patrolisiber.id' }
  ];

  const dirSearchInput = document.getElementById('dir-search-input');
  const directoryListEl = document.getElementById('directory-list');

  function renderDirectoryList(filterQuery = '') {
    if (!directoryListEl) return;
    const q = filterQuery.trim().toLowerCase();
    const filtered = emergencyDirectoryData.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.contact.toLowerCase().includes(q)
    );

    directoryListEl.innerHTML = '';
    if (filtered.length === 0) {
      directoryListEl.innerHTML = `<div class="empty-finding-state">Tidak ditemukan instansi dengan kata kunci "${escapeHtml(filterQuery)}".</div>`;
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('div');
      row.className = 'dir-item';
      row.setAttribute('role', 'listitem');
      const isExternalWeb = item.href.startsWith('http');
      row.innerHTML = `
        <div class="dir-info">
          <strong class="dir-name">${escapeHtml(item.name)}</strong>
          <span class="dir-meta">${escapeHtml(item.category)}</span>
        </div>
        <a href="${escapeHtml(item.href)}" class="dir-call-badge" ${isExternalWeb ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          ${escapeHtml(item.contact)}
        </a>
      `;
      directoryListEl.appendChild(row);
    });
  }

  if (dirSearchInput) {
    dirSearchInput.addEventListener('input', () => {
      renderDirectoryList(dirSearchInput.value);
    });
  }

  // =========================================================================
  // 6. MINIMALIST NAVBAR & SECTION NAVIGATION ROUTER
  // =========================================================================
  const navLinks = document.querySelectorAll('.nav-link[data-app-view]');
  const appViewPanels = document.querySelectorAll('.app-view-panel[data-view-name]');
  const VALID_VIEWS = ['scanner', 'simulator', 'detective', 'guide', 'profile'];

  function setActiveNavIndicator(viewName) {
    const normalized = viewName === 'profile-view' ? 'profile' : viewName;
    if (!VALID_VIEWS.includes(normalized)) return;
    sessionState.activeView = normalized;
    saveSessionState();

    navLinks.forEach(link => {
      const key = link.getAttribute('data-app-view');
      link.classList.toggle('active', key === normalized);
    });
  }

  function navigateToSection(viewName) {
    const normalized = viewName === 'profile-view' ? 'profile' : viewName;
    if (!VALID_VIEWS.includes(normalized)) return;
    setActiveNavIndicator(normalized);
    const sectionId = normalized === 'profile' ? 'profile-view' : normalized;
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-app-view');
      navigateToSection(targetView);
    });
  });

  document.querySelectorAll('[data-goto-view], [data-nav-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-goto-view') || el.getAttribute('data-nav-view');
      navigateToSection(targetView);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const viewKey = entry.target.getAttribute('data-view-name');
          if (viewKey) setActiveNavIndicator(viewKey);
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });

    appViewPanels.forEach(panel => observer.observe(panel));
  }

  // Initialize all modules on load
  renderScanHistory();
  initSimulator(currentScenarioKey);
  renderDetectiveCase(activeCaseKey);
  syncChecklistUI();
  renderDirectoryList('');
  updateUnifiedGuardianProfileUI();
});
