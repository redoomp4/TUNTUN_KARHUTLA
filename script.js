/**
 * TUNTUN oleh Tim KARHUTLA — Interactive Anti-Scam Educational Script
 * Pure Vanilla JS (No Database, No External Dependencies)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. SOUND EFFECTS ENGINE (Pure Web Audio API Synthesizer)
     ========================================================================== */
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, delay = 0, gainVal = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (_) {
      // Ignore audio errors if browser blocks autoplay before user interaction
    }
  }

  const SFX = {
    msgIn() {
      playTone(587.33, 'sine', 0.11, 0, 0.07);
      playTone(880, 'sine', 0.14, 0.08, 0.07);
    },
    msgOut() {
      playTone(440, 'triangle', 0.09, 0, 0.06);
    },
    ring() {
      playTone(698.46, 'sine', 0.18, 0, 0.07);
      playTone(880, 'sine', 0.18, 0.2, 0.07);
    },
    safe() {
      playTone(523.25, 'sine', 0.12, 0, 0.08);
      playTone(659.25, 'sine', 0.12, 0.1, 0.08);
      playTone(783.99, 'sine', 0.2, 0.2, 0.08);
    },
    danger() {
      playTone(220, 'sawtooth', 0.18, 0, 0.08);
      playTone(174.61, 'sawtooth', 0.26, 0.16, 0.08);
    }
  };

  /* ==========================================================================
     2. SCENARIO DATA (5 INTERACTIVE PHONE SIMULATIONS: CHAT & CALL)
     ========================================================================== */
  const SCENARIOS = [
    {
      id: 'kurir-apk',
      mode: 'chat',
      code: 'APK',
      title: 'Kurir Paket Mengirim File .APK',
      subtitle: 'Modus pencurian SMS OTP lewat aplikasi resi palsu',
      contactName: 'Kurir Ekspedisi (Nomor Tidak Dikenal)',
      contactBadge: 'Nomor Baru',
      contactNumber: '+62 813-9982-4410 • Online',
      warningBanner: 'Nomor ini tidak tersimpan di kontak Anda. Jangan instal file berakhiran .APK.',
      steps: {
        start: {
          incoming: [
            {
              text: 'Permisi kak, selamat siang. Saya kurir mau konfirmasi pengiriman paket atas nama kakak.',
              time: '10:14'
            },
            {
              attachment: {
                ext: 'APK',
                name: 'LIHAT-FOTO-PAKET.apk',
                size: '6.4 MB • Aplikasi Android (.apk)'
              },
              text: 'Alamat di resi agak luntur kak. Tolong buka dan klik "Install" foto paket di atas ya kak biar saya pastikan rumahnya benar.',
              time: '10:15',
              redFlag: 'TANDA BAHAYA: Foto asli berformat .JPG atau .PNG dan langsung tampil di ruang chat. File .APK adalah instaler aplikasi Android yang dipakai menyadap SMS OTP.'
            }
          ],
          choices: [
            {
              label: 'A. Klik file "LIHAT-FOTO-PAKET.apk" dan izinkan instalasi agar paket cepat sampai',
              next: 'clicked_apk',
              scoreDelta: -60,
              type: 'danger',
              feedback: 'Tindakan berbahaya. Menginstal file .APK dari chat memberi pelaku akses membaca seluruh SMS (termasuk kode OTP M-Banking Anda) dari jarak jauh.'
            },
            {
              label: 'B. Jangan klik file. Tanyakan nomor resi resmi dan minta kirim foto biasa',
              next: 'ask_resi',
              scoreDelta: +10,
              type: 'safe',
              feedback: 'Langkah tepat. Anda menolak membuka file .APK dan meminta verifikasi nomor resi yang dapat dicek di aplikasi belanja.'
            },
            {
              label: 'C. Langsung blokir nomor karena mengirim file aplikasi (.APK)',
              next: 'blocked_safe',
              scoreDelta: +15,
              type: 'safe',
              feedback: 'Keputusan aman. Kurir ekspedisi resmi tidak pernah mengirim file .APK kepada penerima paket.'
            }
          ]
        },
        clicked_apk: {
          userReply: 'Oke mas, sebentar saya buka dan instal aplikasinya ya...',
          incoming: [
            {
              system: true,
              text: 'PERINGATAN SIMULASI: Aplikasi .APK berbahaya terinstal dan meminta izin akses baca SMS di latar belakang.'
            },
            {
              text: 'Baik kak, ditunggu ya... (Pelaku sedang mencoba login ke akun M-Banking Anda dan mengambil kode OTP dari SMS yang disadap)',
              time: '10:16',
              redFlag: 'TANDA BAHAYA: Saat izin baca SMS diberikan pada file .APK asing, semua SMS OTP perbankan Anda otomatis diteruskan ke perangkat pelaku.'
            }
          ],
          choices: [
            {
              label: 'Matikan koneksi internet (Airplane Mode) sekarang dan hapus aplikasi .APK tersebut',
              next: 'recovered_apk',
              scoreDelta: +25,
              type: 'safe',
              feedback: 'Penyelamatan darurat berhasil. Mematikan internet (Airplane Mode) memutus pengiriman SMS OTP ke server pelaku sebelum saldo terkuras.'
            }
          ]
        },
        ask_resi: {
          userReply: 'Maaf mas, kenapa fotonya format .APK? Nomor resinya berapa ya? Kirim foto biasa saja.',
          incoming: [
            {
              text: 'Dari sistem kantor memang begitu kak, harus dibuka dari file itu. Kalau tidak dibuka dalam 10 menit paketnya saya retur hangus sekarang.',
              time: '10:16',
              redFlag: 'TANDA BAHAYA: Pelaku tidak bisa menyebutkan nomor resi dan menggunakan ancaman waktu 10 menit agar Anda panik.'
            }
          ],
          choices: [
            {
              label: 'A. Karena takut paket diretur, ikuti saja perintahnya dan instal file tersebut',
              next: 'clicked_apk',
              scoreDelta: -50,
              type: 'danger',
              feedback: 'Jangan terpancing gertakan pelaku. Ancaman retur dalam 10 menit adalah taktik agar Anda menginstal malware tanpa berpikir panjang.'
            },
            {
              label: 'B. Cek aplikasi belanja sendiri, pastikan tidak ada paket tersebut, lalu blokir nomor ini',
              next: 'blocked_safe',
              scoreDelta: +15,
              type: 'safe',
              feedback: 'Tepat. Mengecek status pengiriman langsung pada aplikasi belanja resmi membuktikan bahwa pesan tersebut adalah penipuan.'
            }
          ]
        },
        recovered_apk: {
          userReply: '[Mematikan Data Seluler & Wi-Fi, menghapus aplikasi mencurigakan, dan menghubungi Call Center Bank]',
          incoming: [
            {
              system: true,
              text: 'SIMULASI SELESAI: Anda sempat menginstal file, namun segera menjalankan protokol P3K Digital (Airplane Mode + Uninstall APK + Blokir M-Banking) tepat waktu.'
            }
          ],
          choices: []
        },
        blocked_safe: {
          userReply: '[Memblokir dan melaporkan nomor +62 813-9982-4410]',
          incoming: [
            {
              system: true,
              text: 'SIMULASI BERHASIL: Anda menggagalkan modus penipuan kurir file .APK. Ingat bahwa foto resi tidak pernah berformat .APK.'
            }
          ],
          choices: []
        }
      }
    },

    {
      id: 'call-cs-bank',
      mode: 'call',
      code: 'CALL',
      title: 'Telepon Palsu CS Bank (Vishing)',
      subtitle: 'Modus ancaman blokir rekening dan permintaan 6 digit OTP',
      callerName: 'Halo CS Pusat Bank (Logo Bank)',
      callerNumber: '+62 857-1029-8821 (Nomor Seluler Pribadi)',
      callerAvatar: 'CS',
      steps: {
        start: {
          callStatus: 'Berdering... Panggilan WhatsApp Masuk',
          transcript: 'Telepon masuk dari nomor +62 857-1029-8821 menggunakan foto profil logo Bank. Pilih tindakan Anda:',
          redFlag: 'TANDA BAHAYA #1: Call Center bank resmi tidak pernah menelepon nasabah memakai nomor HP pribadi (+62 8xx) atau lewat panggilan WhatsApp.',
          choices: [
            {
              label: 'Angkat telepon untuk mendengar apa yang disampaikan penelepon',
              next: 'answered_call',
              scoreDelta: 0,
              type: 'safe',
              feedback: 'Anda mengangkat telepon. Perhatikan kalimat yang dipakai pelaku untuk menciptakan kepanikan.'
            },
            {
              label: 'Tolak panggilan dan langsung blokir karena menggunakan nomor pribadi +62 857',
              next: 'rejected_safe',
              scoreDelta: +15,
              type: 'safe',
              feedback: 'Langkah tepat. Anda langsung mengenali bahwa bank resmi tidak menghubungi nasabah lewat nomor WhatsApp pribadi.'
            }
          ]
        },
        answered_call: {
          callStatus: '00:18 • Panggilan Berlangsung',
          transcript: 'Penelepon: "Selamat siang Bapak/Ibu, kami dari Divisi Keamanan Bank. Sistem kami mendeteksi kartu Anda baru saja dipakai transaksi Rp9.800.000 di luar negeri. Untuk membatalkan pendebetan dalam 3 menit ini, sebutkan 6 digit Kode Pembatalan (OTP) yang baru masuk ke SMS Anda sekarang."',
          redFlag: 'TANDA BAHAYA #2: Menciptakan kepanikan ("transaksi Rp9,8 juta dalam 3 menit") dan meminta kode OTP dengan istilah samaran "Kode Pembatalan".',
          choices: [
            {
              label: 'A. Sebutkan 6 digit angka OTP yang masuk di SMS kepada penelepon agar transaksi batal',
              next: 'gave_otp',
              scoreDelta: -70,
              type: 'danger',
              feedback: 'Kesalahan fatal. Bank tidak mengenal "Kode Pembatalan Transaksi". Kode OTP tersebut justru dipakai pelaku untuk menyetujui transfer keluar dari rekening Anda.'
            },
            {
              label: 'B. Tolak menyebutkan OTP, matikan telepon, dan periksa mutasi di aplikasi M-Banking sendiri',
              next: 'hangup_verify',
              scoreDelta: +20,
              type: 'safe',
              feedback: 'Keputusan tepat. Kode OTP adalah rahasia pribadi yang tidak boleh disebutkan kepada siapa pun, termasuk pihak yang mengaku petugas bank.'
            }
          ]
        },
        gave_otp: {
          callStatus: '00:49 • Panggilan Dimatikan Pelaku',
          transcript: 'Penelepon: "Terima kasih, kode sudah kami terima." Sambungan langsung diputus pelaku, dan muncul notifikasi SMS bahwa saldo rekening Anda sebesar Rp12.500.000 telah ditransfer keluar.',
          redFlag: 'CATATAN PENTING: Petugas bank resmi dilarang menanyakan PIN, password, maupun kode OTP nasabah.',
          choices: [
            {
              label: 'Segera hubungi Call Center resmi bank dan buat laporan ke IASC OJK (iasc.ojk.go.id)',
              next: 'end_call_lesson',
              scoreDelta: +10,
              type: 'safe',
              feedback: 'Jika hal ini terjadi di dunia nyata, segera telepon Call Center resmi bank dalam hitungan menit untuk meminta pemblokiran rekening penampung pelaku.'
            }
          ]
        },
        hangup_verify: {
          callStatus: 'Panggilan Diakhiri Oleh Anda',
          transcript: 'SIMULASI BERHASIL: Anda menutup telepon penipu dan memeriksa mutasi rekening sendiri. Tidak ada transaksi mencurigakan sama sekali.',
          choices: []
        },
        rejected_safe: {
          callStatus: 'Panggilan Ditolak & Diblokir',
          transcript: 'SIMULASI BERHASIL: Anda menolak panggilan WhatsApp dari nomor seluler pribadi yang menyamar sebagai CS Bank.',
          choices: []
        },
        end_call_lesson: {
          callStatus: 'Simulasi Selesai',
          transcript: 'Prinsip TUNTUN (Tim KARHUTLA): Saat menerima telepon yang membuat Anda panik, tutup telepon terlebih dahulu agar Anda dapat memverifikasi informasi secara jernih.',
          choices: []
        }
      }
    },

    {
      id: 'call-darurat',
      mode: 'call',
      code: 'CALL',
      title: 'Telepon Darurat "Keluarga Kecelakaan"',
      subtitle: 'Modus manipulasi kepanikan dan permintaan biaya medis',
      callerName: 'Nomor Tidak Dikenal (Mengaku RS/Polisi)',
      callerNumber: '+62 821-7741-9012',
      callerAvatar: 'IGD',
      steps: {
        start: {
          callStatus: '00:08 • Panggilan Masuk',
          transcript: 'Penelepon: "Halo! Kami dari IGD Rumah Sakit. Anak/Adik Anda baru saja kecelakaan parah dan mengalami pendarahan kepala. Harus segera dioperasi sekarang tapi alat medis harus ditebus Rp15 juta ke rekening distributor ini. Jangan tutup teleponnya, kondisinya kritis!"',
          redFlag: 'TANDA BAHAYA: Melarang Anda menutup telepon ("Jangan tutup teleponnya!") agar Anda tidak sempat menghubungi anggota keluarga asli untuk mengecek kebenarannya.',
          choices: [
            {
              label: 'A. Langsung transfer Rp15 juta ke rekening pribadi yang disebutkan penelepon',
              next: 'transferred_panic',
              scoreDelta: -65,
              type: 'danger',
              feedback: 'Tertipu kepanikan. Rumah sakit resmi tidak pernah meminta transfer uang ke rekening pribadi via telepon sebelum tindakan darurat.'
            },
            {
              label: 'B. Matikan telepon saat itu juga, lalu hubungi langsung nomor HP anggota keluarga tersebut',
              next: 'verified_family',
              scoreDelta: +20,
              type: 'safe',
              feedback: 'Keputusan terbaik. Menutup telepon dan menghubungi keluarga secara langsung langsung membongkar kebohongan pelaku.'
            },
            {
              label: 'C. Tanyakan nama lengkap keluarga, nama rumah sakit, dan minta bicara dengan dokter penanggung jawab',
              next: 'interrogate_scammer',
              scoreDelta: +15,
              type: 'safe',
              feedback: 'Langkah cerdas. Penipu umumnya menelepon nomor secara acak dan tidak mengetahui nama lengkap anggota keluarga Anda.'
            }
          ]
        },
        interrogate_scammer: {
          callStatus: '00:35 • Pelaku Menghindar',
          transcript: 'Penelepon: "Pokoknya keluarga Anda yang tadi naik motor! Jangan banyak tanya, cepat transfer sekarang atau kami tidak tanggung jawab!" (Pelaku mulai membentak karena tidak tahu nama asli keluarga Anda)',
          redFlag: 'TANDA BAHAYA: Pelaku gagal menyebutkan identitas lengkap korban dan justru meninggikan suara saat ditanya detail lokasi.',
          choices: [
            {
              label: 'Tutup telepon, blokir nomor pelaku, dan hubungi keluarga untuk memastikan kondisi mereka',
              next: 'verified_family',
              scoreDelta: +10,
              type: 'safe',
              feedback: 'Tepat. Anda tetap tenang di bawah tekanan dan mematahkan rekayasa sosial pelaku.'
            }
          ]
        },
        transferred_panic: {
          callStatus: 'Panggilan Terputus',
          transcript: 'Setelah uang ditransfer, penelepon langsung memblokir nomor Anda. Beberapa menit kemudian, anggota keluarga Anda mengabari bahwa mereka dalam keadaan sehat.',
          choices: []
        },
        verified_family: {
          callStatus: 'Panggilan Ditutup — Keluarga Aman',
          transcript: 'SIMULASI BERHASIL: Anggota keluarga Anda menjawab telepon dalam keadaan sehat. Anda berhasil mencegah kerugian akibat kepanikan.',
          choices: []
        }
      }
    },

    {
      id: 'phishing-bank',
      mode: 'chat',
      code: 'LINK',
      title: 'Link Phishing Tarif Bank Rp150.000',
      subtitle: 'Modus surat edaran palsu dan situs tiruan pencuri PIN',
      contactName: 'Info Layanan Nasabah (Palsu)',
      contactBadge: 'Bukan Akun Resmi',
      contactNumber: '+62 878-5512-0091',
      warningBanner: 'Waspadai tautan (link) yang meminta pengisian PIN, password, atau kode OTP.',
      steps: {
        start: {
          incoming: [
            {
              text: 'Yth. Nasabah, mulai bulan ini biaya admin rekening Anda akan diubah menjadi Rp150.000/bulan (otomatis terpotong dari saldo).',
              time: '14:02'
            },
            {
              attachment: {
                ext: 'LINK',
                name: 'https://form-pembatalan-tarif-bank.my.id',
                size: 'Tautan Eksternal Tidak Terverifikasi'
              },
              text: 'Jika Anda tidak setuju dan ingin tetap menggunakan tarif lama Rp6.500, silakan isi formulir pembatalan pada tautan di atas maksimal hari ini.',
              time: '14:03',
              redFlag: 'TANDA BAHAYA: Domain menggunakan akhiran ".my.id" (bukan domain resmi bank .co.id) dan mengancam pemotongan Rp150.000/bulan agar Anda terburu-buru mengisi data.'
            }
          ],
          choices: [
            {
              label: 'A. Klik tautan tersebut dan isi Username, Password M-Banking, PIN, serta OTP',
              next: 'filled_phishing',
              scoreDelta: -65,
              type: 'danger',
              feedback: 'Bahaya phishing. Situs tersebut adalah halaman tiruan buatan penipu. Semua data PIN dan OTP yang Anda ketik langsung terekam oleh pelaku.'
            },
            {
              label: 'B. Abaikan tautan tersebut, hapus pesan, dan periksa informasi resmi di aplikasi bank',
              next: 'ignored_phishing',
              scoreDelta: +20,
              type: 'safe',
              feedback: 'Sangat tepat. Bank tidak pernah meminta nasabah mengisi PIN dan kode OTP pada formulir tautan web.'
            }
          ]
        },
        filled_phishing: {
          userReply: '[Membuka tautan palsu dan mengetikkan Username, PIN M-Banking, serta Kode OTP]',
          incoming: [
            {
              system: true,
              text: 'PERINGATAN SIMULASI: Kredensial M-Banking Anda telah dikirim ke situs phishing dan pelaku mengambil alih akses akun Anda.'
            }
          ],
          choices: [
            {
              label: 'Segera telepon Call Center resmi bank untuk memblokir akun M-Banking',
              next: 'ignored_phishing',
              scoreDelta: +10,
              type: 'safe',
              feedback: 'Ingat selalu: jangan pernah mengetik PIN atau kode OTP di halaman web mana pun yang dikirim lewat chat atau SMS.'
            }
          ]
        },
        ignored_phishing: {
          userReply: '[Menghapus pesan phishing dan melaporkan nomor pengirim]',
          incoming: [
            {
              system: true,
              text: 'SIMULASI BERHASIL: Anda mengenali ciri tautan phishing (.my.id) dan menjaga kerahasiaan data perbankan Anda.'
            }
          ],
          choices: []
        }
      }
    },

    {
      id: 'misi-freelance',
      mode: 'chat',
      code: 'CHAT',
      title: 'Tawaran Kerja Misi Like & Deposit',
      subtitle: 'Modus komisi pancingan awal lalu jebakan top-up berlipat',
      contactName: 'Rekrutmen Misi Digital',
      contactBadge: 'Kontak Asing',
      contactNumber: '+62 895-3310-7721 • Telegram/WA',
      warningBanner: 'Waspadai tawaran kerja paruh waktu yang meminta Anda menyetor uang deposit.',
      steps: {
        start: {
          incoming: [
            {
              text: 'Halo kak, nomor Anda terpilih untuk kerja paruh waktu dari HP. Cukup klik Like & Subscribe akun klien kami, langsung cair Rp35.000 per tugas.',
              time: '16:20'
            },
            {
              text: 'Setelah menerima Rp35.000 pertama, kakak bisa lanjut ke Tugas VIP: cukup top-up deposit Rp1.500.000 untuk mencairkan komisi Rp2.100.000 dalam 10 menit.',
              time: '16:21',
              redFlag: 'TANDA BAHAYA: Memberi komisi kecil di awal (Rp35.000) sebagai umpan kepercayaan, lalu meminta transfer deposit jutaan rupiah.'
            }
          ],
          choices: [
            {
              label: 'A. Transfer deposit Rp1.500.000 karena tergiur komisi Rp2.100.000',
              next: 'trapped_deposit',
              scoreDelta: -60,
              type: 'danger',
              feedback: 'Jebakan deposit. Setelah Anda transfer Rp1,5 juta, pelaku akan menahan saldo Anda dan meminta top-up lebih besar lagi dengan alasan tugas belum selesai.'
            },
            {
              label: 'B. Tolak dan blokir kontak karena pekerjaan sah tidak meminta uang deposit',
              next: 'refused_deposit',
              scoreDelta: +20,
              type: 'safe',
              feedback: 'Keputusan tepat. Lowongan kerja yang benar membayar pekerja, bukan meminta pekerja menyetorkan uang.'
            }
          ]
        },
        trapped_deposit: {
          userReply: 'Sudah saya transfer Rp1.500.000 ya, kapan komisinya cair?',
          incoming: [
            {
              text: 'Maaf kak, ini adalah Tugas Gabungan (Combo). Kakak wajib transfer lagi Rp6.000.000 sekarang. Kalau tidak, saldo Rp1.500.000 kakak tadi hangus dibekukan sistem.',
              time: '16:25',
              redFlag: 'TANDA BAHAYA: Pelaku memaksa korban terus mengirim uang lebih besar demi menebus uang sebelumnya yang sudah dicuri.'
            }
          ],
          choices: [
            {
              label: 'Berhenti mentransfer uang tambahan dan segera laporkan nomor rekening pelaku',
              next: 'refused_deposit',
              scoreDelta: +15,
              type: 'safe',
              feedback: 'Tepat. Jangan pernah mengirim uang tambahan untuk mencairkan dana yang tertahan di platform penipu.'
            }
          ]
        },
        refused_deposit: {
          userReply: '[Menolak setor deposit dan memblokir kontak pelaku]',
          incoming: [
            {
              system: true,
              text: 'SIMULASI BERHASIL: Anda terhindar dari skema penipuan tugas berbayar (Task Scam).'
            }
          ],
          choices: []
        }
      }
    }
  ];

  /* ==========================================================================
     3. ANATOMY RED FLAG INSPECTOR DATA
     ========================================================================== */
  const ANATOMY_SPOTS = {
    1: {
      badge: 'TITIK KRITIS #01',
      title: 'Nomor Pengirim: Bank Resmi Tidak Memakai Nomor Seluler Pribadi (+62 8xx)',
      desc: 'Pelaku dapat memasang logo bank atau foto aparat pada profil WhatsApp mereka, tetapi nomor pengirim tetap berupa nomor seluler biasa dan bukan akun bisnis terverifikasi.',
      fakeCode: '+62 812-xxxx-xxxx (WA Pribadi)',
      fakeText: 'Menelepon lewat WhatsApp pribadi, mengirim pesan personal, dan mendesak Anda membuka file atau menyebutkan OTP.',
      realCode: 'Akun Terverifikasi & Call Center Resmi',
      realText: 'Menggunakan akun resmi bercentang verifikasi dan tidak pernah meminta PIN, password, atau kode OTP nasabah.',
      tip: 'Prinsip TUNTUN: Jangan mengandalkan nama yang muncul di aplikasi pelacak nomor. Tutup telepon dan hubungi nomor Call Center resmi di balik kartu ATM Anda.'
    },
    2: {
      badge: 'TITIK KRITIS #02',
      title: 'Tekanan Waktu dan Ancaman Blokir ("Diblokir dalam 15 Menit")',
      desc: 'Pelaku sengaja menciptakan situasi darurat palsu agar Anda mengambil keputusan tergesa-gesa tanpa sempat bertanya kepada keluarga atau pihak bank.',
      fakeCode: '"Konfirmasi dalam 10 menit atau saldo hangus!"',
      fakeText: 'Melarang Anda menutup telepon dan memaksa Anda bertindak detik itu juga di bawah tekanan.',
      realCode: 'Prosedur Resmi Terjadwal & Transparan',
      realText: 'Instansi resmi menyampaikan pemberitahuan melalui kanal resmi dan tidak pernah mengancam nasabah lewat telepon mendadak.',
      tip: 'Prinsip TUNTUN: Saat penelepon mulai mendesak atau melarang Anda menutup telepon, segera putuskan sambungan dan verifikasi secara mandiri.'
    },
    3: {
      badge: 'TITIK KRITIS #03',
      title: 'Penyamaran Ekstensi File (.PDF.APK / Foto Paket.APK)',
      desc: 'Korban sering mengira sedang membuka dokumen PDF atau melihat foto resi, padahal file tersebut adalah aplikasi Android (.APK) yang dirancang untuk membaca SMS.',
      fakeCode: 'SURAT-TILANG-ETLE.pdf.apk (6.2 MB)',
      fakeText: 'Perhatikan 3 huruf terakhir pada nama file. Jika berakhiran .APK, file tersebut adalah instaler aplikasi berbahaya.',
      realCode: 'Foto Tampil Langsung (.JPG / .PDF Asli)',
      realText: 'Foto kiriman kurir asli langsung terlihat gambarnya di ruang chat WhatsApp tanpa perlu menginstal aplikasi apa pun.',
      tip: 'Prinsip TUNTUN: Matikan izin "Install Unknown Apps" (Instal Aplikasi Tidak Dikenal) untuk WhatsApp dan Browser pada pengaturan keamanan HP Anda.'
    },
    4: {
      badge: 'TITIK KRITIS #04',
      title: 'Alamat Domain Situs Phishing vs Situs Resmi',
      desc: 'Tampilan visual situs penipu dapat meniru halaman login M-Banking asli, tetapi alamat domain pada bilah browser menunjukkan bahwa situs tersebut bukan milik bank.',
      fakeCode: 'https://form-tarif-bankku.my.id / bit.ly/xxx',
      fakeText: 'Menggunakan domain bebas (.my.id, .xyz, .top, .vercel.app) dan meminta pengisian PIN serta kode OTP.',
      realCode: 'https://www.namabank.co.id',
      realText: 'Menggunakan domain resmi (.co.id) dan tidak pernah meminta kode OTP melalui formulir pembatalan tarif.',
      tip: 'Prinsip TUNTUN: Jangan pernah masuk ke layanan perbankan melalui tautan yang dikirim lewat SMS atau chat. Buka langsung aplikasi resmi di HP Anda.'
    },
    5: {
      badge: 'TITIK KRITIS #05',
      title: 'Permintaan Kode OTP, PIN, CVV, dan Share Screen',
      desc: 'Kode OTP (One-Time Password) adalah kunci otorisasi transaksi. Memberikan kode OTP kepada penelepon sama dengan mengizinkan mereka memindahkan saldo Anda.',
      fakeCode: '"Sebutkan 6 digit Kode Pembatalan di SMS Anda"',
      fakeText: 'Mengganti istilah OTP menjadi "Kode Pembatalan" atau meminta Anda menyalakan fitur Bagikan Layar (Share Screen) WhatsApp.',
      realCode: 'Rahasia Pribadi Nasabah',
      realText: 'Petugas bank, polisi, maupun OJK tidak pernah meminta kode OTP, PIN, atau CVV dengan alasan apa pun.',
      tip: 'Prinsip TUNTUN: Jangan pernah mengaktifkan fitur Share Screen WhatsApp saat menerima telepon dari orang tidak dikenal karena layar SMS OTP Anda akan terlihat oleh pelaku.'
    }
  };

  /* ==========================================================================
     4. QUICK QUIZ DATA
     ========================================================================== */
  const QUIZ_QUESTIONS = [
    {
      q: '1. Anda menerima pesan WhatsApp dari nomor baru yang mengaku kurir ekspedisi dan mengirim file bernama "LIHAT-FOTO-PAKET.apk". Apa tindakan yang tepat?',
      options: [
        { text: 'Mengklik dan menginstal file tersebut agar tahu paket dari siapa.', correct: false },
        { text: 'Tidak mengklik file .APK sama sekali, lalu memblokir dan melaporkan nomor tersebut.', correct: true },
        { text: 'Meneruskan (forward) file .APK itu ke grup keluarga untuk menanyakan milik siapa.', correct: false }
      ],
      explanation: 'Jawaban benar: Jangan pernah mengklik maupun meneruskan (forward) file .APK ke grup keluarga karena berisiko membuat anggota keluarga lain tidak sengaja menginstalnya.'
    },
    {
      q: '2. Seseorang menelepon mengaku dari Keamanan Bank, mengabarkan ada transaksi mencurigakan Rp8 juta dan meminta Anda menyebutkan 6 digit kode SMS yang baru masuk untuk "membatalkan transaksi". Apa yang sebenarnya terjadi?',
      options: [
        { text: 'Petugas bank sedang membantu membatalkan transaksi ilegal.', correct: false },
        { text: 'Pelaku penipuan (vishing) sedang mencoba masuk ke akun M-Banking Anda dan membutuhkan OTP Anda untuk menguras saldo.', correct: true },
        { text: 'Sistem bank sedang mengalami gangguan sehingga butuh verifikasi manual lewat telepon.', correct: false }
      ],
      explanation: 'Jawaban benar: Bank tidak membutuhkan OTP nasabah untuk memblokir transaksi mencurigakan. Kode OTP yang Anda sebutkan justru dipakai pelaku untuk mengesahkan pencurian saldo.'
    },
    {
      q: '3. Jika seseorang telanjur mengklik dan menginstal file .APK penipuan di HP Android-nya, apa langkah pertolongan pertama yang harus segera dilakukan?',
      options: [
        { text: 'Segera matikan koneksi internet (aktifkan Airplane Mode dan matikan Wi-Fi), lalu hapus aplikasi mencurigakan tersebut.', correct: true },
        { text: 'Membuka aplikasi M-Banking di HP yang sama untuk memeriksa sisa saldo.', correct: false },
        { text: 'Membiarkannya saja selama aplikasi tersebut tidak dibuka.', correct: false }
      ],
      explanation: 'Jawaban benar: Mematikan internet (Airplane Mode) memutus pengiriman SMS OTP ke server penipu. Hindari membuka M-Banking di HP yang masih terinfeksi.'
    }
  ];

  /* ==========================================================================
     5. SIMULATOR ENGINE & UI CONTROLLER
     ========================================================================== */
  let currentScenarioIndex = 0;
  let securityScore = 100;
  let redFlagHighlight = false;

  const scenarioListEl = document.getElementById('scenarioList');
  const chatScreenEl = document.getElementById('chatScreen');
  const callScreenEl = document.getElementById('callScreen');
  const phoneFrameEl = document.getElementById('phoneFrame');

  // Chat DOM refs
  const chatAvatarEl = document.getElementById('chatAvatar');
  const chatContactNameEl = document.getElementById('chatContactName');
  const chatContactBadgeEl = document.getElementById('chatContactBadge');
  const chatContactNumberEl = document.getElementById('chatContactNumber');
  const chatWarningBannerEl = document.getElementById('chatWarningBanner');
  const chatMessagesEl = document.getElementById('chatMessages');
  const typingIndicatorEl = document.getElementById('typingIndicator');
  const chatChoicesListEl = document.getElementById('chatChoicesList');

  // Call DOM refs
  const callAvatarEl = document.getElementById('callAvatar');
  const callCallerNameEl = document.getElementById('callCallerName');
  const callCallerNumberEl = document.getElementById('callCallerNumber');
  const callTimerEl = document.getElementById('callTimer');
  const callTranscriptContentEl = document.getElementById('callTranscriptContent');
  const callChoicesListEl = document.getElementById('callChoicesList');

  // Coach DOM refs
  const coachScenarioTagEl = document.getElementById('coachScenarioTag');
  const securityScorePillEl = document.getElementById('securityScorePill');
  const securityScoreValueEl = document.getElementById('securityScoreValue');
  const securityMeterBarEl = document.getElementById('securityMeterBar');
  const coachFeedbackEl = document.getElementById('coachFeedback');
  const feedbackBadgeEl = document.getElementById('feedbackBadge');
  const feedbackTextEl = document.getElementById('feedbackText');

  function renderScenarioSelector() {
    scenarioListEl.innerHTML = '';
    SCENARIOS.forEach((sc, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scenario-btn' + (idx === currentScenarioIndex ? ' active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', idx === currentScenarioIndex ? 'true' : 'false');

      const modeBadgeClass = sc.mode === 'call' ? 'scenario-btn__mode--call' : 'scenario-btn__mode--chat';
      const modeLabel = sc.mode === 'call' ? 'CALL' : 'CHAT';

      btn.innerHTML = `
        <div class="scenario-btn__icon">${sc.code}</div>
        <div class="scenario-btn__info">
          <span class="scenario-btn__title">${sc.title}</span>
          <span class="scenario-btn__sub">${sc.subtitle}</span>
        </div>
        <span class="scenario-btn__mode ${modeBadgeClass}">${modeLabel}</span>
      `;

      btn.addEventListener('click', () => {
        loadScenario(idx);
      });

      scenarioListEl.appendChild(btn);
    });
  }

  function updateScoreUI(delta = 0) {
    securityScore = Math.max(0, Math.min(100, securityScore + delta));
    securityScoreValueEl.textContent = securityScore;
    securityMeterBarEl.style.width = `${securityScore}%`;

    securityScorePillEl.classList.remove('score-warn', 'score-danger');
    if (securityScore >= 75) {
      securityMeterBarEl.style.background = 'var(--dp-color-accent)';
    } else if (securityScore >= 45) {
      securityScorePillEl.classList.add('score-warn');
      securityMeterBarEl.style.background = '#d97706';
    } else {
      securityScorePillEl.classList.add('score-danger');
      securityMeterBarEl.style.background = '#dc2626';
    }
  }

  function setCoachFeedback(badge, text, state = 'neutral') {
    feedbackBadgeEl.textContent = badge;
    feedbackTextEl.textContent = text;
    coachFeedbackEl.classList.remove('feedback-safe', 'feedback-danger');
    if (state === 'safe') {
      coachFeedbackEl.classList.add('feedback-safe');
    } else if (state === 'danger') {
      coachFeedbackEl.classList.add('feedback-danger');
    }
  }

  function loadScenario(index) {
    currentScenarioIndex = index;
    securityScore = 100;
    updateScoreUI(0);
    renderScenarioSelector();

    const scenario = SCENARIOS[index];
    coachScenarioTagEl.textContent = `Skenario Aktif: ${scenario.title}`;
    setCoachFeedback(
      'Panduan Simulasi TUNTUN',
      `Anda sedang berada di simulasi "${scenario.title}". Perhatikan pesan atau transkrip suara di layar HP, aktifkan fitur "Tanda Bahaya (Red Flag)" jika memerlukan petunjuk, lalu pilih respons Anda.`,
      'neutral'
    );

    if (scenario.mode === 'chat') {
      callScreenEl.classList.add('hidden');
      chatScreenEl.classList.remove('hidden');

      chatAvatarEl.textContent = scenario.code;
      chatContactNameEl.textContent = scenario.contactName;
      chatContactBadgeEl.textContent = scenario.contactBadge;
      chatContactNumberEl.textContent = scenario.contactNumber;
      chatWarningBannerEl.textContent = scenario.warningBanner;
      chatMessagesEl.innerHTML = '';
      chatChoicesListEl.innerHTML = '';

      runChatStep(scenario, 'start');
    } else {
      chatScreenEl.classList.add('hidden');
      callScreenEl.classList.remove('hidden');

      callAvatarEl.textContent = scenario.callerAvatar;
      callCallerNameEl.textContent = scenario.callerName;
      callCallerNumberEl.textContent = scenario.callerNumber;

      SFX.ring();
      runCallStep(scenario, 'start');
    }
  }

  function createChatBubble(msgObj, direction = 'in') {
    const bubble = document.createElement('div');

    if (msgObj.system) {
      bubble.className = 'msg-bubble msg-bubble--system';
      bubble.textContent = msgObj.text;
      return bubble;
    }

    bubble.className = `msg-bubble msg-bubble--${direction}` + (msgObj.redFlag ? ' has-redflag' : '');

    let innerHTML = '';
    if (msgObj.attachment) {
      innerHTML += `
        <div class="msg-attachment">
          <span class="msg-attachment__icon">${msgObj.attachment.ext}</span>
          <div class="msg-attachment__meta">
            <strong>${msgObj.attachment.name}</strong>
            <span>${msgObj.attachment.size}</span>
          </div>
        </div>
      `;
    }

    innerHTML += `<div>${msgObj.text}</div>`;

    if (msgObj.redFlag) {
      innerHTML += `<div class="redflag-note">${msgObj.redFlag}</div>`;
    }

    if (msgObj.time) {
      innerHTML += `<span class="msg-meta">${msgObj.time}</span>`;
    }

    bubble.innerHTML = innerHTML;
    return bubble;
  }

  function scrollChatToBottom() {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function runChatStep(scenario, stepKey) {
    const step = scenario.steps[stepKey];
    if (!step) return;

    chatChoicesListEl.innerHTML = '';

    if (step.userReply) {
      const outBubble = createChatBubble({ text: step.userReply, time: 'Baru saja' }, 'out');
      chatMessagesEl.appendChild(outBubble);
      SFX.msgOut();
      scrollChatToBottom();
    }

    const incomingList = step.incoming || [];
    typingIndicatorEl.classList.remove('hidden');

    let delay = 350;
    incomingList.forEach((msg, idx) => {
      setTimeout(() => {
        if (idx === incomingList.length - 1) {
          typingIndicatorEl.classList.add('hidden');
        }
        const inBubble = createChatBubble(msg, 'in');
        chatMessagesEl.appendChild(inBubble);
        SFX.msgIn();
        scrollChatToBottom();

        if (idx === incomingList.length - 1) {
          renderChoiceButtons(scenario, step.choices, chatChoicesListEl, 'chat');
        }
      }, delay);
      delay += 550;
    });

    if (incomingList.length === 0) {
      typingIndicatorEl.classList.add('hidden');
      renderChoiceButtons(scenario, step.choices, chatChoicesListEl, 'chat');
    }
  }

  function runCallStep(scenario, stepKey) {
    const step = scenario.steps[stepKey];
    if (!step) return;

    callTimerEl.textContent = step.callStatus || 'Panggilan Aktif';

    let transcriptHTML = `<p class="${step.redFlag ? 'has-redflag' : ''}" style="padding: 6px; border-radius: 8px;">${step.transcript}</p>`;
    if (step.redFlag) {
      transcriptHTML += `<div class="redflag-note">${step.redFlag}</div>`;
    }

    callTranscriptContentEl.innerHTML = transcriptHTML;
    renderChoiceButtons(scenario, step.choices, callChoicesListEl, 'call');
  }

  function renderChoiceButtons(scenario, choices, containerEl, mode) {
    containerEl.innerHTML = '';

    if (!choices || choices.length === 0) {
      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'choice-option-btn';
      doneBtn.style.textAlign = 'center';
      doneBtn.style.borderColor = 'var(--dp-color-accent)';
      doneBtn.textContent = 'Skenario Selesai — Lanjut ke Skenario Berikutnya';
      doneBtn.addEventListener('click', () => {
        const nextIdx = (currentScenarioIndex + 1) % SCENARIOS.length;
        loadScenario(nextIdx);
      });
      containerEl.appendChild(doneBtn);
      return;
    }

    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-option-btn';
      btn.textContent = choice.label;

      btn.addEventListener('click', () => {
        updateScoreUI(choice.scoreDelta || 0);
        if (choice.type === 'danger') {
          SFX.danger();
          setCoachFeedback('Evaluasi TUNTUN: Tindakan Berisiko', choice.feedback, 'danger');
        } else {
          SFX.safe();
          setCoachFeedback('Evaluasi TUNTUN: Keputusan Tepat', choice.feedback, 'safe');
        }

        if (mode === 'chat') {
          runChatStep(scenario, choice.next);
        } else {
          runCallStep(scenario, choice.next);
        }
      });

      containerEl.appendChild(btn);
    });
  }

  /* ==========================================================================
     6. EVENT LISTENERS: CONTROLS, FILTERS, ANATOMY & QUIZ
     ========================================================================== */

  // Red Flag Inspector Toggle
  const redFlagToggleEl = document.getElementById('redFlagToggle');
  if (redFlagToggleEl) {
    redFlagToggleEl.addEventListener('change', (e) => {
      redFlagHighlight = e.target.checked;
      phoneFrameEl.classList.toggle('redflag-active', redFlagHighlight);
    });
  }

  // Restart & Next Scenario Buttons
  document.getElementById('restartScenarioBtn').addEventListener('click', () => {
    loadScenario(currentScenarioIndex);
  });

  document.getElementById('nextScenarioBtn').addEventListener('click', () => {
    const nextIdx = (currentScenarioIndex + 1) % SCENARIOS.length;
    loadScenario(nextIdx);
  });

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundLabelEl = document.getElementById('soundLabel');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundLabelEl.textContent = soundEnabled ? 'Suara: Aktif' : 'Suara: Nonaktif';
      if (soundEnabled) SFX.safe();
    });
  }

  // Modus Encyclopedia Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modusCards = document.querySelectorAll('.modus-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filterVal = btn.getAttribute('data-filter');

      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      modusCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Anatomy Red Flag Tabs
  const anatomyTabs = document.querySelectorAll('.anatomy-tab');
  const anatomyDetailCard = document.getElementById('anatomyDetailCard');

  anatomyTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const spotId = tab.getAttribute('data-spot');
      const data = ANATOMY_SPOTS[spotId];
      if (!data) return;

      anatomyTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      anatomyDetailCard.innerHTML = `
        <div class="anatomy-detail__badge">${data.badge}</div>
        <h3>${data.title}</h3>
        <p>${data.desc}</p>
        <div class="comparison-boxes">
          <div class="comp-box comp-box--fake">
            <span class="comp-label">CIRI PENIPU (PALSU)</span>
            <code>${data.fakeCode}</code>
            <p>${data.fakeText}</p>
          </div>
          <div class="comp-box comp-box--real">
            <span class="comp-label">INSTANSI RESMI (ASLI)</span>
            <code>${data.realCode}</code>
            <p>${data.realText}</p>
          </div>
        </div>
        <div class="anatomy-tip"><strong>Prinsip TUNTUN:</strong> ${data.tip.replace('Prinsip TUNTUN: ', '')}</div>
      `;
    });
  });

  // Quick Quiz Controller
  let quizIndex = 0;
  let quizCorrectCount = 0;
  const quizContainerEl = document.getElementById('quizContainer');
  const quizStatusTextEl = document.getElementById('quizStatusText');
  const resetQuizBtnEl = document.getElementById('resetQuizBtn');

  function renderQuizQuestion() {
    if (quizIndex >= QUIZ_QUESTIONS.length) {
      quizStatusTextEl.textContent = `Selesai — Skor Anda: ${quizCorrectCount}/${QUIZ_QUESTIONS.length}`;
      resetQuizBtnEl.classList.remove('hidden');
      quizContainerEl.innerHTML = `
        <div class="quiz-card" style="text-align: center;">
          <h3 style="margin-bottom: 0.5rem;">Hasil Evaluasi TUNTUN: ${quizCorrectCount} dari ${QUIZ_QUESTIONS.length} Jawaban Tepat</h3>
          <p style="color: var(--dp-color-ink-secondary); font-size: 0.92rem; margin-bottom: 1rem;">
            ${
              quizCorrectCount === QUIZ_QUESTIONS.length
                ? 'Anda memahami langkah verifikasi utama untuk menangkal penipuan telepon, tautan phishing, dan file .APK bersama Tim KARHUTLA.'
                : 'Coba ulangi simulasi HP di atas untuk melatih ketelitian Anda mengenali tanda bahaya penipuan.'
            }
          </p>
          <button type="button" class="btn btn--primary btn--sm" id="quizRetryInlineBtn">Ulangi Kuis</button>
        </div>
      `;
      document.getElementById('quizRetryInlineBtn').addEventListener('click', resetQuiz);
      return;
    }

    const item = QUIZ_QUESTIONS[quizIndex];
    quizStatusTextEl.textContent = `Pertanyaan ${quizIndex + 1} dari ${QUIZ_QUESTIONS.length}`;
    resetQuizBtnEl.classList.add('hidden');

    quizContainerEl.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-question">${item.q}</div>
        <div class="quiz-options" id="quizOptionsList"></div>
        <div class="quiz-explanation hidden" id="quizExplanationBox"></div>
      </div>
    `;

    const optionsListEl = document.getElementById('quizOptionsList');
    const explanationBoxEl = document.getElementById('quizExplanationBox');

    item.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.textContent = opt.text;

      btn.addEventListener('click', () => {
        const allBtns = optionsListEl.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach((b) => (b.disabled = true));

        if (opt.correct) {
          btn.classList.add('correct');
          quizCorrectCount++;
          SFX.safe();
        } else {
          btn.classList.add('wrong');
          SFX.danger();
        }

        explanationBoxEl.classList.remove('hidden');
        explanationBoxEl.innerHTML = `
          <p style="margin-bottom: 0.7rem;">${item.explanation}</p>
          <button type="button" class="btn btn--primary btn--sm" id="nextQuizBtn">
            ${quizIndex + 1 < QUIZ_QUESTIONS.length ? 'Pertanyaan Selanjutnya' : 'Lihat Hasil Akhir'}
          </button>
        `;

        document.getElementById('nextQuizBtn').addEventListener('click', () => {
          quizIndex++;
          renderQuizQuestion();
        });
      });

      optionsListEl.appendChild(btn);
    });
  }

  function resetQuiz() {
    quizIndex = 0;
    quizCorrectCount = 0;
    renderQuizQuestion();
  }

  if (resetQuizBtnEl) {
    resetQuizBtnEl.addEventListener('click', resetQuiz);
  }

  // Phone Live Clock
  function updatePhoneClock() {
    const clockEl = document.getElementById('phoneClock');
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}`;
  }

  /* ==========================================================================
     7. INITIALIZE APP ON DOM LOAD
     ========================================================================== */
  updatePhoneClock();
  setInterval(updatePhoneClock, 30000);
  loadScenario(0);
  renderQuizQuestion();
})();
