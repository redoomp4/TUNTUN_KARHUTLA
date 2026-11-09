/**
 * @fileoverview Branching Conversation Scenarios for Scam Simulator
 * @module data/simulatorScenarios
 *
 * Satisfies FR-02, FR-03, FR-04, FR-05, FR-06:
 * - True branching state transitions (nextStep changes based on user choice)
 * - Context-aware evaluation (not all affirmative answers are wrong)
 * - 100% fictional entities and phone numbers
 */

export const SIMULATOR_SCENARIOS = {
  courier: {
    id: 'courier',
    tabLabel: 'Kurir paket (.APK)',
    title: 'Kurir paket fiktif (.APK tersembunyi)',
    desc: 'Penipu mengaku kurir ekspedisi dan mendesak korban membuka file surat bukti pengiriman berformat APK untuk menyadap SMS OTP.',
    contactName: 'Budi - Ekspedisi Kilat Express',
    contactAvatar: 'EK',
    contactStatus: '+62 821-9901-4421',
    initialRisk: 'Normal',
    steps: [
      {
        stepNum: 1,
        botMessages: [
          'Halo Kak, selamat siang. Saya Budi dari ekspedisi Kilat Express.',
          'Ada kiriman paket penting atas nama Anda dengan nomor resi KL-99201. Alamat tertutup sedikit lakban, mohon periksa foto paket di lampiran Surat_Foto_Paket.apk ini ya Kak.'
        ],
        choices: [
          {
            text: 'Unduh dan pasang file Surat_Foto_Paket.apk agar paket segera dikirim.',
            nextStep: 2,
            consequence: 'DANGEROUS',
            riskLevel: 'Bahaya tinggi',
            scoreDelta: -40,
            feedbackTitle: 'Tindakan berisiko tinggi (instalasi APK)',
            feedbackText: 'File berekstensi .apk di Android adalah paket instalasi aplikasi, bukan foto dokumen. Memasangnya dari luar toko aplikasi resmi berisiko menyadap SMS OTP perbankan Anda.'
          },
          {
            text: 'Minta kurir mengirimkan foto langsung dalam format gambar biasa (JPG/PNG), bukan file aplikasi.',
            nextStep: 3,
            consequence: 'SAFE',
            riskLevel: 'Waspada',
            scoreDelta: 0,
            feedbackTitle: 'Keputusan tepat dan kritis',
            feedbackText: 'Kurir resmi tidak pernah mengirimkan file aplikasi untuk memeriksa alamat paket. Meminta foto standar menguji keaslian pengirim.'
          },
          {
            text: 'Abaikan file lampiran, lalu periksa nomor resi KL-99201 langsung di situs resmi ekspedisi.',
            nextStep: 4,
            consequence: 'BEST',
            riskLevel: 'Aman terverifikasi',
            scoreDelta: 0,
            feedbackTitle: 'Respons pertahanan terbaik',
            feedbackText: 'Memverifikasi nomor resi secara mandiri melalui aplikasi atau situs resmi ekspedisi memutus rantai manipulasi rekayasa sosial.'
          }
        ]
      },
      {
        stepNum: 2,
        botMessages: [
          'Kak, aplikasinya sudah dibuka? Nanti muncul permintaan izin akses notifikasi dan SMS, pilih "Izinkan Semua" supaya sistem ekspedisi bisa sinkronisasi.'
        ],
        choices: [
          {
            text: 'Pilih Izinkan Semua agar proses pengecekan resi selesai.',
            nextStep: null,
            consequence: 'GAME_OVER',
            riskLevel: 'Kompromi data total',
            scoreDelta: -60,
            feedbackTitle: 'Akses SMS berhasil disadap pelaku',
            feedbackText: 'Dengan memberikan izin baca SMS, aplikasi jahat meneruskan seluruh SMS kode OTP m-banking Anda ke server pelaku. Segera matikan internet, hapus aplikasi, dan hubungi bank.'
          },
          {
            text: 'Sadari kejanggalan izin SMS, batalkan proses, matikan internet, dan hapus file APK.',
            nextStep: null,
            consequence: 'RECOVERY',
            riskLevel: 'Terselamatkan',
            scoreDelta: 20,
            feedbackTitle: 'Langkah pemulihan cepat',
            feedbackText: 'Menghentikan proses sebelum izin akses SMS diberikan berhasil mencegah penyadapan OTP. Pastikan aplikasi terhapus dari menu Pengaturan ponsel.'
          }
        ]
      },
      {
        stepNum: 3,
        botMessages: [
          'Sistem gudang kami hanya bisa mengirim lewat file tersebut Kak. Kalau tidak dibuka dalam 10 menit, paket terpaksa kami hanguskan di gudang pusat.'
        ],
        choices: [
          {
            text: 'Khawatir paket hangus, akhirnya mengunduh dan membuka file APK tersebut.',
            nextStep: null,
            consequence: 'DANGEROUS',
            riskLevel: 'Bahaya tinggi',
            scoreDelta: -50,
            feedbackTitle: 'Terjebak manipulasi kepanikan waktu',
            feedbackText: 'Pelaku sengaja menciptakan tenggat waktu sempit agar korban panik. Perusahaan ekspedisi resmi tidak pernah menghanguskan paket pelanggan karena menolak membuka file.'
          },
          {
            text: 'Tetap tenang, tolak gertakan pengirim, dan blokir nomor tersebut.',
            nextStep: null,
            consequence: 'BEST',
            riskLevel: 'Aman total',
            scoreDelta: 0,
            feedbackTitle: 'Manipulasi urgensi berhasil dipatahkan',
            feedbackText: 'Anda tidak terpancing ancaman penghangusan paket dan berhasil menghindari jebakan pemasangan malware APK.'
          }
        ]
      },
      {
        stepNum: 4,
        botMessages: [
          'Saat diperiksa di situs resmi ekspedisi, nomor resi KL-99201 ternyata tidak terdaftar. Pelaku kembali mengirim pesan: "Halo Kak, kenapa filenya belum dibuka?"'
        ],
        choices: [
          {
            text: 'Blokir nomor pengirim dan laporkan kontak pelaku melalui kanal pengaduan resmi.',
            nextStep: null,
            consequence: 'BEST',
            riskLevel: 'Aman sempurna',
            scoreDelta: 0,
            feedbackTitle: 'Skenario selesai dengan keputusan tepat',
            feedbackText: 'Anda melakukan verifikasi mandiri melalui kanal resmi, menolak mengunduh file berbahaya, dan memutus komunikasi dengan pelaku.'
          },
          {
            text: 'Coba tetap membuka file lampiran karena penasaran isi paket tersebut.',
            nextStep: null,
            consequence: 'DANGEROUS',
            riskLevel: 'Bahaya tinggi',
            scoreDelta: -45,
            feedbackTitle: 'Berbahaya membuka file meskipun sudah curiga',
            feedbackText: 'Rasa penasaran sering dimanfaatkan pelaku. Begitu resi terbukti palsu di situs resmi, jangan pernah menyentuh file lampiran pelaku.'
          }
        ]
      }
    ]
  },

  bank: {
    id: 'bank',
    tabLabel: 'Tarif bank (OTP)',
    title: 'Perubahan tarif bank (pencurian OTP dan kredensial)',
    desc: 'Pesan mengaku dari bank nasional yang mengancam perubahan tarif transfer menjadi Rp 150.000 per bulan kecuali dibatalkan melalui tautan formulir.',
    contactName: 'Layanan Pengumuman Tarif',
    contactAvatar: 'BK',
    contactStatus: '+62 813-7744-1100',
    initialRisk: 'Normal',
    steps: [
      {
        stepNum: 1,
        botMessages: [
          'Pemberitahuan Resmi: Tarif transaksi transfer antarbank Anda akan diperbarui menjadi Rp 150.000/bulan terhitung malam ini.',
          'Jika Anda tidak menyetujui perubahan ini dan ingin tetap di tarif Rp 6.500, segera batalkan melalui formulir: http://bca-tarif-layanan2026.vip/batal'
        ],
        choices: [
          {
            text: 'Klik tautan tersebut agar saldo rekening tidak terpotong Rp 150.000 setiap bulan.',
            nextStep: 2,
            consequence: 'DANGEROUS',
            riskLevel: 'Bahaya tinggi',
            scoreDelta: -40,
            feedbackTitle: 'Tautan menuju domain tiruan (phishing)',
            feedbackText: 'Alamat bca-tarif-layanan2026.vip bukan situs resmi bank. Penipu mencatut nama bank di bagian depan domain murah (.vip) untuk mengecoh nasabah.'
          },
          {
            text: 'Abaikan tautan, lalu periksa informasi resmi melalui aplikasi mobile banking atau Call Center 1500888.',
            nextStep: 3,
            consequence: 'BEST',
            riskLevel: 'Aman terverifikasi',
            scoreDelta: 0,
            feedbackTitle: 'Verifikasi kanal resmi yang tepat',
            feedbackText: 'Pengumuman resmi perbankan tidak pernah dikirim melalui nomor WhatsApp pribadi dan tidak pernah mengarahkan nasabah ke domain .vip.'
          }
        ]
      },
      {
        stepNum: 2,
        botMessages: [
          'Halaman situs terbuka dan menampilkan formulir pembatalan tarif yang meminta: Nomor Kartu Debit, kode CVV 3 digit, PIN, serta kode OTP SMS.'
        ],
        choices: [
          {
            text: 'Isi nomor kartu, CVV, PIN, dan kode OTP agar pembatalan tarif berhasil diproses.',
            nextStep: null,
            consequence: 'GAME_OVER',
            riskLevel: 'Kerugian finansial kritis',
            scoreDelta: -60,
            feedbackTitle: 'Kredensial perbankan diambil alih',
            feedbackText: 'Nomor kartu, CVV, PIN, dan kode OTP memberi pelaku akses penuh untuk memindahkan saldo rekening Anda. Bank tidak pernah meminta OTP atau PIN untuk pembatalan layanan.'
          },
          {
            text: 'Tutup halaman web seketika karena bank resmi tidak pernah meminta PIN dan kode OTP pada formulir web.',
            nextStep: null,
            consequence: 'RECOVERY',
            riskLevel: 'Terselamatkan',
            scoreDelta: 20,
            feedbackTitle: 'Rekening berhasil diselamatkan',
            feedbackText: 'Menolak memasukkan PIN dan OTP pada situs mencurigakan mencegah terjadinya pengambilalihan akun perbankan Anda.'
          }
        ]
      },
      {
        stepNum: 3,
        botMessages: [
          'Di dalam aplikasi mobile banking resmi, terdapat pengumuman bahwa surat perubahan tarif Rp 150.000/bulan adalah murni modus penipuan.'
        ],
        choices: [
          {
            text: 'Blokir nomor pengirim pesan dan ingatkan anggota keluarga agar tidak mengeklik tautan serupa.',
            nextStep: null,
            consequence: 'BEST',
            riskLevel: 'Aman sempurna',
            scoreDelta: 0,
            feedbackTitle: 'Skenario diselesaikan dengan aman',
            feedbackText: 'Anda memvalidasi informasi melalui aplikasi resmi dan melindungi kerahasiaan data perbankan Anda.'
          },
          {
            text: 'Balas pesan pelaku dengan mengirimkan tangkapan layar saldo rekening untuk membuktikan akun Anda aktif.',
            nextStep: null,
            consequence: 'ELEVATED',
            riskLevel: 'Waspada kebocoran data',
            scoreDelta: -25,
            feedbackTitle: 'Jangan membagikan informasi rekening ke penipu',
            feedbackText: 'Membalas pesan pelaku atau mengirimkan bukti tangkapan layar memberikan informasi tambahan yang dapat digunakan untuk target penipuan berikutnya.'
          }
        ]
      }
    ]
  },

  job: {
    id: 'job',
    tabLabel: 'Kerja paruh waktu',
    title: 'Lowongan paruh waktu (skema deposit tugas VIP)',
    desc: 'Tawaran pekerjaan paruh waktu sederhana dengan iming-iming komisi instan yang berujung pada permintaan setoran modal (task scam).',
    contactName: 'Jessica - Rekrutmen Mitra Digital',
    contactAvatar: 'HR',
    contactStatus: '+62 895-3211-9877',
    initialRisk: 'Normal',
    steps: [
      {
        stepNum: 1,
        botMessages: [
          'Halo Kak, kami dari Mitra Rekrutmen Digital menawarkan pekerjaan paruh waktu dari ponsel. Cukup menyukai 3 video YouTube dan kami bayar Rp 30.000 langsung ke rekening.',
          'Apakah Kakak bersedia mencoba tugas pertama sekarang?'
        ],
        choices: [
          {
            text: 'Ikuti tugas pertama untuk melihat apakah komisi Rp 30.000 benar-benar dibayarkan.',
            nextStep: 2,
            consequence: 'ELEVATED',
            riskLevel: 'Waspada umpan',
            scoreDelta: -10,
            feedbackTitle: 'Tahap umpan pancingan dimulai',
            feedbackText: 'Sindikat penipuan tugas (task scam) sengaja membayar komisi kecil di awal untuk membangun kepercayaan korban sebelum meminta transfer deposit besar.'
          },
          {
            text: 'Tolak tawaran dan tanyakan identitas badan hukum perusahaan serta kontrak kerja resmi.',
            nextStep: 3,
            consequence: 'BEST',
            riskLevel: 'Aman terverifikasi',
            scoreDelta: 0,
            feedbackTitle: 'Sikap kritis terhadap rekrutmen tidak resmi',
            feedbackText: 'Perusahaan resmi tidak merekrut pekerja melalui pesan singkat acak untuk memanipulasi interaksi media sosial.'
          }
        ]
      },
      {
        stepNum: 2,
        botMessages: [
          'Komisi Rp 30.000 sudah ditransfer ke rekening Anda.',
          'Untuk melanjutkan ke Tugas VIP dengan komisi Rp 2.500.000, silakan transfer deposit modal awal Rp 500.000 ke rekening bendahara kami. Modal dan komisi cair 15 menit kemudian.'
        ],
        choices: [
          {
            text: 'Transfer deposit Rp 500.000 karena tugas pertama tadi terbukti membayar.',
            nextStep: null,
            consequence: 'GAME_OVER',
            riskLevel: 'Kerugian deposit',
            scoreDelta: -90,
            feedbackTitle: 'Terjebak skema deposit berantai',
            feedbackText: 'Setelah Anda menyetor Rp 500.000, pelaku akan menahan pencairan dengan alasan tugas gabungan dan meminta deposit jutaan rupiah lagi.'
          },
          {
            text: 'Hentikan interaksi segera karena pekerjaan sah tidak pernah meminta karyawan menyetor uang deposit.',
            nextStep: null,
            consequence: 'BEST',
            riskLevel: 'Aman terlindungi',
            scoreDelta: 10,
            feedbackTitle: 'Berhasil menghindari jebakan deposit',
            feedbackText: 'Prinsip utama keamanan kerja digital: setiap tawaran pekerjaan yang meminta Anda mentransfer uang terlebih dahulu adalah penipuan.'
          }
        ]
      },
      {
        stepNum: 3,
        botMessages: [
          'Pengirim membalas dengan nada mendesak: "Tidak perlu tanya dokumen perusahaan Kak, kuota terbatas hari ini kalau mau penghasilan tambahan!"'
        ],
        choices: [
          {
            text: 'Blokir kontak pengirim dan laporkan nomor tersebut.',
            nextStep: null,
            consequence: 'BEST',
            riskLevel: 'Aman sempurna',
            scoreDelta: 0,
            feedbackTitle: 'Skenario selesai dengan aman',
            feedbackText: 'Penolakan menunjukkan identitas resmi perusahaan dan desakan kuota terbatas merupakan indikator kuat penipuan lowongan kerja.'
          },
          {
            text: 'Karena tergiur kuota terbatas, akhirnya mengirimkan foto KTP dan nomor rekening.',
            nextStep: null,
            consequence: 'DANGEROUS',
            riskLevel: 'Bahaya pencurian identitas',
            scoreDelta: -45,
            feedbackTitle: 'Data identitas pribadi berisiko disalahgunakan',
            feedbackText: 'Mengirimkan foto KTP pada pihak rekrutmen tidak jelas berisiko disalahgunakan untuk pendaftaran pinjaman online ilegal atau pembukaan akun palsu.'
          }
        ]
      }
    ]
  }
};
