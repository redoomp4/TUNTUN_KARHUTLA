/**
 * Digital Guardian — Interactive Learning Engine
 * Implements deterministic Scam Simulator and Scam Detective according to specifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // SCAM SIMULATOR MODULE
  // ---------------------------------------------------------
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

  let currentScenarioKey = 'courier';
  let currentStepIndex = 0;
  let currentScore = 100;
  let selectedNextStep = null;

  // DOM Elements
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
    currentScenarioKey = scenarioKey;
    const scen = scenarios[scenarioKey];
    currentStepIndex = 0;
    currentScore = 100;
    selectedNextStep = null;

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
    if (risk.toLowerCase().includes('bahaya') || risk.toLowerCase().includes('kritis') || risk.toLowerCase().includes('kompromi')) {
      riskBadgeEl.classList.add('risk-danger');
    } else if (risk.toLowerCase().includes('waspada') || risk.toLowerCase().includes('elevated') || risk.toLowerCase().includes('umpan')) {
      riskBadgeEl.classList.add('risk-elevated');
    } else {
      riskBadgeEl.classList.add('risk-normal');
    }

    scoreIndicatorEl.textContent = `${Math.max(0, score)} / 100`;
    stepIndicatorEl.textContent = `Langkah ${stepNum} dari ${totalSteps}`;
  }

  function renderStep(stepIndex) {
    const scen = scenarios[currentScenarioKey];
    const step = scen.steps[stepIndex];
    if (!step) return;

    // Reset feedback panel
    feedbackPanel.hidden = true;
    actionsPanel.hidden = false;

    // Append bot messages
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

    // Render choices
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
    
    // Append player's choice to chat
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-outgoing';
    userBubble.innerHTML = `
      <span class="bubble-text">${escapeHtml(choice.text)}</span>
      <span class="bubble-meta">Dikirim</span>
    `;
    messagesContainer.appendChild(userBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Update score & risk
    currentScore = Math.max(0, currentScore + choice.scoreDelta);
    updateStatusUI(choice.riskLevel, currentScore, stepIndex + 1, scen.steps.length);

    // Show feedback
    actionsPanel.hidden = true;
    feedbackPanel.hidden = false;
    feedbackTypeEl.textContent = `Evaluasi: ${choice.riskLevel}`;
    feedbackTitleEl.textContent = choice.feedbackTitle;
    feedbackExplanationEl.textContent = choice.feedbackText;

    selectedNextStep = choice.nextStep;

    if (choice.nextStep === null) {
      nextBtn.textContent = 'Mulai Skenario Lain';
    } else {
      nextBtn.textContent = 'Lanjutkan Percakapan';
    }
  }

  nextBtn.addEventListener('click', () => {
    const scen = scenarios[currentScenarioKey];
    if (selectedNextStep === null) {
      // Loop or restart
      initSimulator(currentScenarioKey);
    } else {
      // Find step index matching nextStep
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

  // Tab navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const scenKey = btn.getAttribute('data-scenario');
      initSimulator(scenKey);
    });
  });

  // Init initial scenario
  initSimulator('courier');


  // ---------------------------------------------------------
  // SCAM DETECTIVE MODULE (FORENSIC CLUE MARKER)
  // ---------------------------------------------------------
  const clueButtons = document.querySelectorAll('.evidence-clue-btn');
  const submitReportBtn = document.getElementById('detective-submit-btn');
  const resetDetectiveBtn = document.getElementById('detective-reset-btn');

  const profileScoreNum = document.getElementById('profile-score-num');
  const profileStatusTitle = document.getElementById('profile-status-title');
  const profileStatusDesc = document.getElementById('profile-status-desc');
  const profileHits = document.getElementById('profile-hits');
  const profileStrength = document.getElementById('profile-strength');
  const profileWeakness = document.getElementById('profile-weakness');
  const detectiveFeedbackList = document.getElementById('detective-feedback-details');

  // Total targets to find
  const cluesData = {
    'unverified-number': {
      title: 'Nomor Ponsel Pribadi Tak Dikenal',
      desc: 'Hadiah bernilai ratusan juta tidak dikirimkan melalui blast nomor seluler pribadi tanpa verifikasi identitas pengirim.',
      category: 'Verifikasi Identitas Pengirim'
    },
    'unrealistic-offer': {
      title: 'Klaim Hadiah Fantastis Tanpa Partisipasi',
      desc: 'Janji hadiah ratusan juta rupiah tanpa pernah mendaftar lomba adalah pola klasik rekayasa sosial "greed baiting".',
      category: 'Analisis Realitas Penawaran'
    },
    'fake-domain': {
      title: 'Tautan Domain Phising (.vip)',
      desc: 'Domain berekstensi asing dengan nama subdomain panjang adalah portal peniru untuk merekam kredensial atau OTP formulir.',
      category: 'Forensik Domain Tautan'
    },
    'urgency': {
      title: 'Urgensi Waktu Palsu (15 Menit)',
      desc: 'Menanamkan rasa terdesak mencegah korban berpikir jernih atau berkonsultasi dengan orang lain.',
      category: 'Deteksi Manipulasi Psikologis'
    }
  };

  clueButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', (!isPressed).toString());
    });
  });

  submitReportBtn.addEventListener('click', () => {
    let hits = 0;
    const total = Object.keys(cluesData).length;
    let selectedClues = [];

    clueButtons.forEach(btn => {
      if (btn.getAttribute('aria-pressed') === 'true') {
        const clueKey = btn.getAttribute('data-clue');
        selectedClues.push(clueKey);
        if (cluesData[clueKey]) {
          hits++;
        }
      }
    });

    const score = Math.round((hits / total) * 100);
    profileScoreNum.textContent = score;
    profileHits.textContent = `${hits} / ${total}`;

    // Render Clues breakdown
    detectiveFeedbackList.hidden = false;
    detectiveFeedbackList.innerHTML = '';

    Object.keys(cluesData).forEach(key => {
      const item = cluesData[key];
      const isFound = selectedClues.includes(key);
      const card = document.createElement('div');
      card.className = `clue-result-item ${isFound ? 'clue-result-hit' : 'clue-result-missed'}`;
      card.innerHTML = `
        <strong>${isFound ? '✓ Teridentifikasi' : '✕ Terlewat'}: ${escapeHtml(item.title)}</strong>
        <p style="margin-top: 2px;">${escapeHtml(item.desc)}</p>
      `;
      detectiveFeedbackList.appendChild(card);
    });

    if (score === 100) {
      profileStatusTitle.textContent = 'Digital Guardian Tangguh (Sempurna)';
      profileStatusDesc.textContent = 'Seluruh indikator bahaya berhasil diisolasi. Anda memiliki ketelitian forensik digital tingkat tinggi.';
      profileStrength.textContent = 'Semua Kategori (Domain, Identitas, Urgensi)';
      profileWeakness.textContent = 'Tidak Ada';
    } else if (score >= 50) {
      profileStatusTitle.textContent = 'Tingkat Deteksi Cukup Baik';
      profileStatusDesc.textContent = 'Anda mengenali sebagian pola phising, namun beberapa jebakan halus masih terlewat.';
      profileStrength.textContent = 'Pengenalan Tautan & Domain';
      profileWeakness.textContent = 'Manipulasi Psikologis Urgensi';
    } else {
      profileStatusTitle.textContent = 'Tingkat Kerentanan Tinggi';
      profileStatusDesc.textContent = 'Sebagian besar indikator penipuan belum terdeteksi. Disarankan membaca Action Guide di bawah.';
      profileStrength.textContent = 'Perlu Peningkatan Latihan';
      profileWeakness.textContent = 'Identifikasi Pengirim & Domain';
    }
  });

  resetDetectiveBtn.addEventListener('click', () => {
    clueButtons.forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });
    profileScoreNum.textContent = '--';
    profileHits.textContent = '0 / 4';
    profileStatusTitle.textContent = 'Belum Dianalisis';
    profileStatusDesc.textContent = 'Klik indikator janggal pada bukti di samping, lalu tekan tombol "Kirim Laporan Investigasi".';
    profileStrength.textContent = '-';
    profileWeakness.textContent = '-';
    detectiveFeedbackList.hidden = true;
    detectiveFeedbackList.innerHTML = '';
  });

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
});
