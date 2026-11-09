/**
 * @fileoverview Multi-Case Forensic Scam Detective Dataset
 * @module data/detectiveCases
 *
 * Satisfies FR-07, FR-08, FR-09, FR-10:
 * - Includes both True Positive risk indicators (isRisk: true)
 *   and Safe Decoy normal phrases (isRisk: false) to test analytical precision.
 */

export const DETECTIVE_CASES = {
  prize: {
    id: 'prize',
    tabLabel: 'Undian berhadiah',
    tag: 'Pesan WhatsApp',
    title: 'Pemberitahuan Undian Festival Belanja',
    icon: 'UN',
    timestamp: 'Diterima via WhatsApp, 10:14 WIB',
    senderClue: {
      id: 'unverified-number',
      label: '+62 858-1294-0982 (Akun Pribadi)',
      isRisk: true,
      title: 'Nomor seluler pribadi tak terverifikasi',
      desc: 'Pemberitahuan hadiah resmi bernilai ratusan juta tidak pernah dikirim melalui nomor seluler pribadi tanpa identitas bisnis resmi.',
      category: 'Verifikasi Identitas Pengirim'
    },
    bodyBlocks: [
      {
        type: 'text',
        content: 'Selamat, nomor ponsel Anda terpilih sebagai pemenang Grand Prize Toyota Raize dari Panitia Festival Akhir Tahun.'
      },
      {
        type: 'clue',
        id: 'unrealistic-offer',
        label: 'Hadiah bebas biaya administrasi dan dapat langsung dicairkan dalam bentuk uang tunai Rp 250.000.000 tanpa mengikuti undian.',
        isRisk: true,
        title: 'Klaim hadiah fantastis tanpa partisipasi',
        desc: 'Janji pencairan uang ratusan juta rupiah tanpa pernah mendaftar program undian adalah pola klasik rekayasa sosial.',
        category: 'Analisis Realitas Penawaran'
      },
      {
        type: 'clue',
        id: 'safe-greeting',
        label: 'Pemenang dapat memilih warna kendaraan sesuai ketersediaan stok di diler kota masing-masing.',
        isRisk: false,
        title: 'Kalimat deskriptif normal (pengecoh)',
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
        title: 'Tautan domain phishing (.vip)',
        desc: 'Domain berekstensi .vip dengan kata kunci berulang adalah situs tiruan untuk mencuri kredensial dan kode OTP korban.',
        category: 'Forensik Domain Tautan'
      },
      {
        type: 'clue',
        id: 'urgency',
        label: 'Peringatan: Hadiah akan dibatalkan otomatis dan dialihkan dalam 15 menit ke depan jika formulir tidak diisi.',
        isRisk: true,
        title: 'Tekanan batas waktu sempit (15 menit)',
        desc: 'Menciptakan kepanikan waktu agar korban segera mengeklik tautan tanpa sempat memeriksa kebenaran informasi.',
        category: 'Deteksi Manipulasi Psikologis'
      }
    ]
  },

  hrd: {
    id: 'hrd',
    tabLabel: 'Panggilan interview HRD',
    tag: 'Email Rekrutmen',
    title: 'Surat Panggilan Interview dan Pelatihan Karyawan',
    icon: 'HR',
    timestamp: 'Diterima via Email, 16:40 WIB',
    senderClue: {
      id: 'hrd-free-email',
      label: 'rekrutmen.bumn.pusat2026@gmail.com',
      isRisk: true,
      title: 'Penggunaan email gratis (@gmail.com) untuk instansi besar',
      desc: 'Perusahaan BUMN atau korporasi nasional selalu menggunakan domain email resmi perusahaan, bukan layanan email publik gratis.',
      category: 'Verifikasi Identitas Pengirim'
    },
    bodyBlocks: [
      {
        type: 'clue',
        id: 'safe-interview-intro',
        label: 'Berdasarkan evaluasi CV yang Anda kirimkan, Anda dinyatakan lolos seleksi administrasi tahap pertama.',
        isRisk: false,
        title: 'Pernyataan standar rekrutmen (pengecoh)',
        desc: 'Kalimat pembuka tentang kelolosan seleksi administrasi adalah hal normal dalam surat panggilan kerja.',
        category: 'Pengecoh'
      },
      {
        type: 'clue',
        id: 'upfront-training-fee',
        label: 'Seluruh peserta wajib mentransfer biaya reservasi tiket, hotel, dan sertifikasi pelatihan sebesar Rp 1.250.000 ke rekening bendahara panitia.',
        isRisk: true,
        title: 'Permintaan pembayaran biaya di muka',
        desc: 'Rekrutmen kerja yang sah tidak pernah memungut biaya tiket, pelatihan, atau administrasi dari pelamar kerja.',
        category: 'Deteksi Permintaan Finansial'
      },
      {
        type: 'clue',
        id: 'reimburse-promise',
        label: 'Dana yang ditransfer dijamin akan diganti (reimburse) 100% begitu peserta tiba di lokasi pelatihan.',
        isRisk: true,
        title: 'Janji penggantian biaya (reimburse) palsu',
        desc: 'Modus penipuan travel dan rekrutmen fiktif selalu menjanjikan penggantian biaya 100% agar korban merasa aman saat mentransfer uang.',
        category: 'Analisis Realitas Penawaran'
      },
      {
        type: 'clue',
        id: 'hrd-urgency',
        label: 'Bukti transfer wajib dikirimkan maksimal 1 jam setelah pesan ini diterima atau kuota kelulusan Anda gugur.',
        isRisk: true,
        title: 'Desakan pembayaran cepat (1 jam)',
        desc: 'Memaksa pelamar membayar dalam 1 jam bertujuan mencegah pelamar mengonfirmasi ke situs karier resmi perusahaan.',
        category: 'Deteksi Manipulasi Psikologis'
      }
    ]
  },

  customs: {
    id: 'customs',
    tabLabel: 'Tagihan bea cukai',
    tag: 'Pesan Kepabeanan',
    title: 'Peringatan Penahanan Barang Kiriman Luar Negeri',
    icon: 'BC',
    timestamp: 'Diterima via WhatsApp, 08:05 WIB',
    senderClue: {
      id: 'customs-personal-wa',
      label: '+62 812-6650-3319 (Petugas Pemeriksa Lapangan)',
      isRisk: true,
      title: 'Tagihan resmi dikirim melalui nomor pribadi',
      desc: 'Bea Cukai hanya menyampaikan informasi tagihan resmi melalui sistem pelacakan resmi dan kode billing negara, bukan WhatsApp pribadi.',
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
        title: 'Transfer pajak ke rekening pribadi',
        desc: 'Penerimaan negara atau pajak selalu menggunakan Kode Billing resmi ke Kas Negara, tidak pernah ditransfer ke rekening perorangan.',
        category: 'Deteksi Permintaan Finansial'
      },
      {
        type: 'clue',
        id: 'legal-threat',
        label: 'Apabila tidak dilunasi dalam 30 menit, surat panggilan kepolisian atas tuduhan penyelundupan akan langsung diterbitkan.',
        isRisk: true,
        title: 'Intimidasi dan ancaman pidana palsu',
        desc: 'Menggunakan ancaman polisi atau hukum secara mendadak adalah taktik intimidasi psikologis agar korban takut dan langsung mentransfer uang.',
        category: 'Deteksi Manipulasi Psikologis'
      },
      {
        type: 'clue',
        id: 'safe-customs-info',
        label: 'Setiap barang kiriman dari luar negeri memang dikenakan bea masuk dan pajak impor sesuai regulasi kepabeanan yang berlaku.',
        isRisk: false,
        title: 'Fakta regulasi umum (pengecoh)',
        desc: 'Informasi bahwa barang impor dikenakan pajak adalah aturan yang benar; yang menjadikannya penipuan adalah cara penagihan ke rekening pribadi.',
        category: 'Pengecoh'
      }
    ]
  }
};
