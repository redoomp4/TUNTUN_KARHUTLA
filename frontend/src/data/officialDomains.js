/**
 * @fileoverview Authoritative Domain Whitelist, Suspicious TLDs, and Preset Samples
 * @module data/officialDomains
 */

export const OFFICIAL_DOMAINS = [
  'bca.co.id',
  'klikbca.com',
  'bri.co.id',
  'bankmandiri.co.id',
  'bni.co.id',
  'bankbsi.co.id',
  'bsi.co.id',
  'ojk.go.id',
  'bi.go.id',
  'pajak.go.id',
  'beacukai.go.id',
  'kominfo.go.id',
  'cekrekening.id',
  'patrolisiber.id',
  'jet.co.id',
  'jne.co.id',
  'posindonesia.co.id',
  'sicepat.com',
  'shopee.co.id',
  'tokopedia.com',
  'gojek.com',
  'dana.id',
  'ovo.id',
  'bpjs-kesehatan.go.id',
  'bpjsketenagakerjaan.go.id'
];

export const SUSPICIOUS_TLDS = [
  '.vip',
  '.xyz',
  '.top',
  '.click',
  '.buzz',
  '.cc',
  '.icu',
  '.cfd',
  '.live',
  '.monster',
  '.loan',
  '.win',
  '.site',
  '.online',
  '.my.id',
  '.sbs',
  '.cyou'
];

export const SHORTENER_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  's.id',
  'cutt.ly',
  'rb.gy',
  'is.gd',
  't.co',
  'rebrand.ly',
  'shorturl.at'
];

export const SCANNER_PRESETS = {
  apk: {
    label: 'Kurir file .APK',
    text: 'Halo Kak, selamat siang. Saya Budi dari ekspedisi J&T Express (+62 821-9901-4421). Paket Kakak tertahan karena alamat luntur. Mohon cek foto resi di lampiran Lihat_Foto_Paket.pdf.apk dan klik "Izinkan Semua" akses SMS ya Kak.'
  },
  phish: {
    label: 'Tautan tarif bank',
    text: 'PEMBERITAHUAN RESMI BANK BCA: Tarif transaksi transfer Anda akan diubah menjadi Rp 150.000/bulan otomatis malam ini. Jika tidak setuju, segera batalkan dalam 15 menit melalui formulir: http://bca-tarif-layanan2026.vip/batal dan masukkan PIN serta kode OTP Anda.'
  },
  job: {
    label: 'Deposit kerja paruh waktu',
    text: 'Halo Kak! Kami dari HRD Rekrutmen Mitra Shopee menawarkan pekerjaan paruh waktu Like & Subscribe YouTube. Komisi Rp 50.000 langsung cair! Untuk membuka Misi VIP komisi Rp 2.500.000, silakan transfer deposit modal awal Rp 500.000 ke rekening bendahara kami.'
  },
  safe: {
    label: 'Pesan resmi bank',
    text: 'Info Resmi Bank: Jangan pernah bagikan kode OTP, PIN, atau CVV kepada siapa pun termasuk petugas bank. Untuk informasi produk resmi, kunjungi situs https://www.bca.co.id atau hubungi Halo BCA di 1500888.'
  }
};
