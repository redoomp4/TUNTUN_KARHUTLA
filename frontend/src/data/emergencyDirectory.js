/**
 * @fileoverview Incident Response Situations & Verified Official Call Center Directory
 * @module data/emergencyDirectory
 */

export const ACTION_GUIDE_SITUATIONS = [
  {
    id: 'guide-sit-1',
    title: '1. Menerima Pesan / Tautan Mencurigakan',
    lead: 'Jangan balas pesan, jangan klik tautan, dan jangan buka berkas .apk.',
    steps: [
      {
        id: 's1-1',
        bold: 'Hentikan interaksi:',
        text: 'Abaikan batas waktu pengirim dan langsung blokir nomornya.'
      },
      {
        id: 's1-2',
        bold: 'Verifikasi resmi:',
        text: 'Cek langsung lewat aplikasi resmi bank atau Call Center resmi.'
      },
      {
        id: 's1-3',
        bold: 'Cek rekening/nomor:',
        text: 'Periksa riwayat aduan nomor pelaku di portal cekrekening.id.'
      },
      {
        id: 's1-4',
        bold: 'Hapus file unduhan:',
        text: 'Hapus berkas .apk dari folder Unduhan tanpa membukanya.'
      }
    ]
  },
  {
    id: 'guide-sit-2',
    title: '2. Terlanjur Klik Tautan atau Unduh File .APK',
    lead: 'Putuskan internet seketika agar malware tidak dapat menyadap SMS OTP.',
    steps: [
      {
        id: 's2-1',
        bold: 'Nyalakan mode pesawat:',
        text: 'Matikan Wi-Fi dan data seluler untuk memutus transmisi data penyadap.'
      },
      {
        id: 's2-2',
        bold: 'Hapus aplikasi asing:',
        text: 'Buka Pengaturan > Aplikasi, lalu copot aplikasi yang baru dipasang.'
      },
      {
        id: 's2-3',
        bold: 'Cabut izin SMS:',
        text: 'Pastikan tidak ada aplikasi asing memiliki izin membaca SMS/Notifikasi.'
      },
      {
        id: 's2-4',
        bold: 'Ganti password:',
        text: 'Gunakan HP lain yang bersih untuk mengganti kata sandi m-banking.'
      }
    ]
  },
  {
    id: 'guide-sit-3',
    title: '3. Terlanjur Memberikan Kode OTP atau PIN',
    lead: 'Segera bekukan akses rekening sebelum saldo dipindahkan oleh pelaku.',
    steps: [
      {
        id: 's3-1',
        bold: 'Blokir akun di aplikasi:',
        text: 'Gunakan fitur blokir kartu darurat pada menu mobile banking Anda.'
      },
      {
        id: 's3-2',
        bold: 'Telepon Call Center Bank:',
        text: 'Minta petugas membekukan transaksi keluar dan mencabut sesi asing.'
      },
      {
        id: 's3-3',
        bold: 'Ubah PIN & kata sandi:',
        text: 'Segera perbarui PIN ATM dan kata sandi menggunakan kombinasi baru.'
      },
      {
        id: 's3-4',
        bold: 'Periksa mutasi rekening:',
        text: 'Ambil tangkapan layar jika terdapat mutasi saldo yang tidak wajar.'
      }
    ]
  },
  {
    id: 'guide-sit-4',
    title: '4. Terlanjur Mentransfer Uang ke Pelaku',
    lead: 'Jangan transfer biaya tambahan apa pun dengan dalih pencairan komisi.',
    steps: [
      {
        id: 's4-1',
        bold: 'Lapor bank darurat:',
        text: 'Minta pemblokiran darurat rekening tujuan penipuan ke bank pengirim & penerima.'
      },
      {
        id: 's4-2',
        bold: 'Amankan bukti transfer:',
        text: 'Simpan struk transfer, nomor rekening pelaku, dan tangkapan layar chat.'
      },
      {
        id: 's4-3',
        bold: 'Lapor OJK & Polisi (157):',
        text: 'Laporkan rekening penipu ke kontak 157 dan portal cekrekening.id.'
      },
      {
        id: 's4-4',
        bold: 'Waspada penipuan lanjutan:',
        text: 'Jangan percaya pihak di media sosial yang menawarkan jasa pengembalian dana berbayar.'
      }
    ]
  }
];

export const EMERGENCY_DIRECTORY_DATA = [
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
