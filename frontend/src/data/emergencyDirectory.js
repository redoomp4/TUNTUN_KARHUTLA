/**
 * @fileoverview Incident Response Situations & Verified Official Call Center Directory
 * @module data/emergencyDirectory
 */

export const ACTION_GUIDE_SITUATIONS = [
  {
    id: 'guide-sit-1',
    title: '1. Baru menerima pesan, tautan, atau file mencurigakan',
    lead: 'Jangan membalas pesan, jangan mengeklik tautan, dan jangan membuka lampiran file berakhiran .apk.',
    steps: [
      {
        id: 's1-1',
        bold: 'Hentikan interaksi:',
        text: 'Abaikan batas waktu atau gertakan pengirim. Blokir nomor di WhatsApp atau SMS.'
      },
      {
        id: 's1-2',
        bold: 'Verifikasi mandiri:',
        text: 'Hubungi instansi terkait hanya melalui aplikasi resmi atau nomor Call Center resmi.'
      },
      {
        id: 's1-3',
        bold: 'Periksa rekening atau nomor:',
        text: 'Cek riwayat pelaporan nomor pelaku melalui situs resmi cekrekening.id.'
      },
      {
        id: 's1-4',
        bold: 'Hapus file mencurigakan:',
        text: 'Jika file .apk terunduh otomatis, hapus dari folder Unduhan tanpa membukanya.'
      }
    ]
  },
  {
    id: 'guide-sit-2',
    title: '2. Sudah terlanjur mengeklik tautan atau menginstal file .APK',
    lead: 'Putuskan koneksi internet segera agar aplikasi berbahaya tidak dapat meneruskan SMS OTP ke server pelaku.',
    steps: [
      {
        id: 's2-1',
        bold: 'Aktifkan mode pesawat:',
        text: 'Matikan Wi-Fi dan data seluler seketika untuk memutus koneksi aplikasi penyadap.'
      },
      {
        id: 's2-2',
        bold: 'Hapus aplikasi asing:',
        text: 'Buka Pengaturan > Aplikasi, lalu copot aplikasi mencurigakan yang baru terpasang.'
      },
      {
        id: 's2-3',
        bold: 'Cabut izin akses SMS dan aksesibilitas:',
        text: 'Pastikan tidak ada aplikasi tak dikenal yang memiliki izin membaca SMS.'
      },
      {
        id: 's2-4',
        bold: 'Ganti kata sandi dari perangkat lain:',
        text: 'Gunakan perangkat berbeda yang bersih untuk mengganti kata sandi email dan bank.'
      }
    ]
  },
  {
    id: 'guide-sit-3',
    title: '3. Sudah terlanjur memberikan kode OTP, PIN, atau kata sandi',
    lead: 'Anda berpacu dengan waktu. Segera bekukan akses rekening sebelum saldo dipindahkan oleh pelaku.',
    steps: [
      {
        id: 's3-1',
        bold: 'Blokir kartu dan akun di aplikasi:',
        text: 'Gunakan fitur blokir darurat pada aplikasi mobile banking atau e-wallet Anda.'
      },
      {
        id: 's3-2',
        bold: 'Hubungi Call Center resmi bank:',
        text: 'Minta petugas memblokir sementara seluruh transaksi keluar dan mencabut sesi perangkat asing.'
      },
      {
        id: 's3-3',
        bold: 'Ubah PIN dan kata sandi:',
        text: 'Segera perbarui kredensial dan jangan gunakan kombinasi yang sama.'
      },
      {
        id: 's3-4',
        bold: 'Periksa mutasi transaksi:',
        text: 'Catat dan simpan bukti tangkapan layar jika terdapat transaksi tidak sah.'
      }
    ]
  },
  {
    id: 'guide-sit-4',
    title: '4. Sudah terlanjur mentransfer uang ke rekening pelaku',
    lead: 'Jangan pernah mentransfer uang tambahan dengan alasan biaya pencairan atau pajak.',
    steps: [
      {
        id: 's4-1',
        bold: 'Lapor ke bank pengirim dan bank penerima:',
        text: 'Minta pemblokiran darurat atas rekening tujuan penipuan.'
      },
      {
        id: 's4-2',
        bold: 'Kumpulkan bukti lengkap:',
        text: 'Simpan bukti transfer, nomor rekening pelaku, nomor telepon, dan riwayat percakapan.'
      },
      {
        id: 's4-3',
        bold: 'Laporkan ke OJK Anti-Scam Centre (157):',
        text: 'Daftarkan nomor rekening pelaku di cekrekening.id dan patrolisiber.id.'
      },
      {
        id: 's4-4',
        bold: 'Waspadai penipuan pemulihan dana:',
        text: 'Jangan percaya pihak di media sosial yang menjanjikan jasa balik dana dengan biaya di muka.'
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
