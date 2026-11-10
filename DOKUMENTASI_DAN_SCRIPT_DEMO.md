# 🛡️ TUNTUN: DIGITAL GUARDIAN
## Dokumentasi Ringkas, Panduan Deploy Vercel & Naskah Script Presentasi Demo

---

## DAFTAR ISI
1. [Ringkasan Fitur Utama & Keunggulan](#1-ringkasan-fitur-utama--keunggulan)
2. [Panduan Penggunaan Sistem (User Flow)](#2-panduan-penggunaan-sistem-user-flow)
3. [Langkah-Langkah Deploy ke Vercel](#3-langkah-langkah-deploy-ke-vercel)
4. [Naskah Script Presentasi Demo (Live Pitch)](#4-naskah-script-presentasi-demo-live-pitch)

---

## 1. RINGKASAN FITUR UTAMA & KEUNGGULAN

**TUNTUN (Digital Guardian)** adalah platform web edukasi interaktif dan perlindungan kejahatan siber sosial (*social engineering*) untuk keluarga Indonesia—dari Remaja, Orang Tua, hingga Lansia. 

Sistem berjalan **100% lokal di peramban (client-side execution)** tanpa menyimpan data pribadi pengguna ke server manapun, gratis, dan beroperasi instan.

### 5 Modul Utama:

| No | Modul | Fungsi Utama | Nilai Keunggulan Nyata |
|---|---|---|---|
| **01** | **Pemindai Forensik Pesan & File** | Membedah teks SMS/WA, tautan phishing, dan berkas biner `.APK` bertopeng dokumen | Deteksi *Magic Bytes* (ZIP/APK header), dekonstruksi subdomain manipulatif, pembedaan akurat pesan iklan resmi operator vs phishing, serta kalkulasi skor risiko deterministik. |
| **02** | **Simulator Chat Penipu (Hibrida AI)** | Simulasi percakapan langsung melawan bot penipu kurir paket, tarif bank, dan loker komisi palsu | Pengguna dapat merespons dengan **Tombol Pilihan Cepat** maupun **mengetik manual balasan bebas** yang dievaluasi secara dinamis oleh AI Guardrail. |
| **03** | **Detektif Modus Siber** | Otopsi interaktif kasus rekayasa sosial nyata di Indonesia | Pengguna melatih kepekaan dengan mengklik kata/frasa manipulatif (urgensi palsu, ancaman denda) sambil diuji tidak terjebak pada kata umpan yang aman (*decoy penalty*). |
| **04** | **Panduan Tanggap Darurat & Draf Laporan** | Protokol 4 langkah pertolongan pertama & generator draf kronologi siap kirim | Rekomendasi aksi darurat instan (saat klik APK / bocor OTP / transfer) dan pembuatan teks laporan resmi ke Bank, Kepolisian, dan OJK 157 dalam 1 klik. |
| **05** | **Profil Kesiapan & Kartu Lanyard S.O.S.** | Kartu identitas interaktif fisik/digital untuk pegangan keluarga | Dilengkapi **Mode Lansia (A+)** berfont besar, nomor darurat keluarga yang dapat dikustomisasi, dan tombol panggil 1-ketuk (*1-tap emergency call*). |

---

## 2. PANDUAN PENGGUNAAN SISTEM (USER FLOW)

Alur penggunaan dirancang sederhana agar pengguna awam dapat mahir dalam 3 menit:

### Alur 1: Memeriksa Pesan Mencurigakan (Modul 01 - Pemindai)
1. Salin pesan teks mencurigakan (SMS/WA) atau pilih salah satu tombol contoh cepat (*Contoh APK Kurir*, *Contoh Phishing Bank*, atau *SMS Resmi Telco*).
2. Klik tombol **Periksa Pesan**.
3. Sistem seketika menampilkan:
   - **Skor Risiko (0 - 100)** dengan badge status warna tegas.
   - **Kartu Temuan Forensik** yang menjabarkan mengapa pesan tersebut berbahaya.
   - Opsi tab: *Detail Domain*, *Balasan Aman*, dan *Simulasi Layar HP*.
4. Jika mencurigai file samaran (misal `surat_undangan.pdf`), unggah berkas pada kotak **Inspeksi Berkas Samaran** untuk memverifikasi apakah isi aslinya adalah paket aplikasi Android `.APK`.

### Alur 2: Menguji Refleks Melawan Penipu (Modul 02 - Simulasi)
1. Pilih skenario: **Kurir Paket (.APK)**, **Tarif Bank (OTP)**, atau **Tugas VIP (Deposit)**.
2. Baca dialog pembuka dari pelaku.
3. Tentukan pertahanan Anda:
   - Pilih salah satu **Pilihan Cepat**, ATAU
   - Ketik sendiri kata-kata Anda di kotak balasan manual lalu tekan **Kirim**.
4. Sistem menilai keputusan Anda: apakah aman, waspada, atau berbahaya, lalu memperbarui skor kesiapan sesi Anda.

### Alur 3: Melaporkan Insiden & Amankan Akun (Modul 04 - Panduan)
1. Jika terlanjur menjadi korban, buka tab **Panduan**.
2. Pilih salah satu kondisi: *Terima Pesan Aneh*, *Terlanjur Klik .APK*, *Bocor OTP/PIN*, atau *Sudah Transfer Dana*.
3. Ikuti **4 Langkah Utama** berturut-turut.
4. Isi formulir singkat di sebelah kiri dan klik **Salin Laporan Bank** untuk mendapatkan draf kronologi format resmi kepolisian/perbankan.

### Alur 4: Hotline Cepat & Kartu Lanyard S.O.S. (Footer & Modul 05)
- Di bagian bawah situs (Footer), klik tombol **🚨 Hotline Bank & OJK** untuk menampilkan nomor darurat 24 jam bank-bank utama Indonesia (BCA, BRI, Mandiri, BNI, OJK 157) dengan fitur salin nomor instan.
- Buka modul **Lanyard ID** untuk mencetak atau menyimpan kartu darurat digital bagi orang tua atau anak di rumah.

---

## 3. LANGKAH-LANGKAH DEPLOY KE VERCEL

Proyek ini telah dikonfigurasi dengan standar monorepo modern dan file [`vercel.json`](file:///D:/LOMBA/WEB/vercel.json) siap pakai.

### Metode 1: Menggunakan GitHub & Vercel Dashboard (Paling Direkomendasikan)

1. **Pastikan Kode Sudah di-Push ke Repositori GitHub:**
   Buka terminal di root proyek (`D:\LOMBA\WEB`), lalu jalankan:
   ```bash
   git add .
   git commit -m "feat: Siap rilis produksi TUNTUN Digital Guardian"
   git push origin main
   ```

2. **Buka Dasbor Vercel:**
   - Kunjungi [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
   - Klik tombol **"Add New..."** lalu pilih **"Project"**.

3. **Impor Repositori:**
   - Cari repositori proyek web ini di daftar GitHub Anda, lalu klik **"Import"**.

4. **Konfigurasi Pengaturan Project di Vercel:**
   Vercel akan secara otomatis mendeteksi konfigurasi dari file `vercel.json` di root:
   - **Framework Preset:** Vite (atau biarkan default *Other*)
   - **Root Directory:** `./` (Folder Utama / Root)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   *(Biarkan sesuai pengaturan bawaan vercel.json proyek)*

5. **Klik "Deploy":**
   - Tunggu proses build selama kurang lebih 30–60 detik.
   - Setelah selesai, Vercel akan memberikan domain publik gratis bersertifikat SSL HTTPS, contohnya:
     `https://tuntun-digital-guardian.vercel.app`

---

### Metode 2: Deploy Cepat via Terminal (Vercel CLI)

1. **Instal Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login ke Akun Vercel:**
   ```powershell
   vercel login
   ```

3. **Jalankan Perintah Deploy:**
   Pastikan Anda berada di direktori `D:\LOMBA\WEB`:
   ```powershell
   vercel --prod
   ```
   - Ikuti prompt tanya-jawab singkat:
     - *Set up and deploy?* -> Tekan `Y`
     - *Which scope?* -> Pilih akun Anda
     - *Link to existing project?* -> Tekan `N`
     - *Project name?* -> Isi `tuntun-digital-guardian`
     - *In which directory is your code located?* -> Tekan `Enter` (`./`)
   - URL produksi langsung aktif dalam hitungan detik.

---

## 4. NASKAH SCRIPT PRESENTASI DEMO (LIVE PITCH)

*Gunakan naskah berikut saat menjelaskan dan mendemokan aplikasi di hadapan juri, penilai, atau audiens. Total durasi: ± 3 hingga 4 menit.*

---

### **[00:00 - 00:30] PEMBUKAAN & URGENSI MASALAH**

> *"Selamat pagi/siang Dewan Juri dan Rekan-rekan sekalian,*
> 
> *Setiap hari, jutaan keluarga di Indonesia menerima pesan singkat: paket tertahan, surat tilang palsu, hingga ancaman blokir rekening. Yang mengerikan, kejahatan ini tidak lagi menyerang sistem perbankan secara langsung, melainkan mengeksploitasi kepanikan psikologis manusia—terutama orang tua, lansia, dan remaja.*
> 
> *Pertanyaannya: ke mana masyarakat awam harus bertanya saat menerima pesan janggal sebelum uang di tabungan mereka terkuras?*
> 
> *Perkenalkan, ini adalah **TUNTUN: Digital Guardian**, platform perisai forensik dan literasi keamanan digital keluarga yang berjalan 100% lokal, tanpa menyimpan data pribadi, dan dapat diakses gratis oleh siapa saja."*

---

### **[00:30 - 01:30] DEMO FITUR 1: PEMINDAI FORENSIK CERDAS**

> **[Aksi Layar: Buka Halaman 01 - Pemindai. Klik tombol 'Contoh APK Kurir' lalu klik 'Periksa Pesan']**
> 
> *"Mari kita lihat skenario pertama di modul **Pemindai**. Di sini, pengguna dapat menempelkan chat WhatsApp atau SMS apa pun.*
> 
> *Ketika saya menekan tombol periksa, mesin forensik kami bekerja seketika. Sistem tidak hanya menebak kata-kata, melainkan membedah pola URL, tautan biner, hingga ekstensi berkas. Terlihat skor risikonya melonjak ke **100/100 (Bahaya Kritis)** dengan label deteksi APK Kurir Samaran.*
> 
> *Yang paling canggih, kami menyematkan **Inspektur Magic Bytes**. Seringkali penipu mengganti nama file virus `.APK` menjadi `.PDF` untuk mengelabui korban. Mesin kami membaca byte heksadesimal file secara lokal di peramban, sehingga trik penggantian nama file langsung terbongkar sebelum pengguna menginstalnya.*
> 
> *Bahkan jika pesan yang masuk adalah SMS promosi resmi operator seperti MyAds Telkomsel, sistem kami cukup cerdas untuk memvalidasinya sebagai iklan aman berisiko 0, sehingga tidak terjadi kepanikan palsu."*

---

### **[01:30 - 02:15] DEMO FITUR 2: SIMULATOR PERCAKAPAN & DETEKTIF**

> **[Aksi Layar: Klik Tab 02 - Simulasi. Tunjukkan tampilan chat, ketik balasan manual atau pilih 'Pilihan Cepat']**
> 
> *"Namun, teori saja tidak cukup. Masyarakat butuh refleks nyata. Di sinilah modul **Simulasi Chat Penipu** hadir.*
> 
> *Pengguna diajak berhadapan langsung dengan bot penipu. Pengguna bebas memilih opsi pertahanan cepat, atau mengetik balasan kalimat bebas mereka sendiri. AI Guardrail kami mengevaluasi apakah respons pengguna sudah aman, seperti menolak memberikan OTP atau meminta video call verifikasi.*
> 
> *Lalu di modul **Detektif**, kami melatih insting pengguna membedah kalimat manipulatif psikologis: seperti kata 'segera', 'denda otomatis', dan nomor rekening janggal, melatih mereka agar tidak mudah panik."*

---

### **[02:15 - 03:00] DEMO FITUR 3: PANDUAN PENYELAMATAN & LANYARD S.O.S.**

> **[Aksi Layar: Klik Tab 04 - Panduan, lalu tunjukkan tombol Hotline di footer dan modul 05 Lanyard]**
> 
> *"Lalu bagaimana jika seseorang sudah terlanjur menjadi korban?*
> 
> *Di modul **Panduan Tanggap Darurat**, kami menyediakan 4 langkah pertolongan pertama instan: matikan koneksi, cabut izin SMS, dan generator draf laporan resmi siap salin ke Bank dan OJK 157 dalam satu ketukan.*
> 
> *Di bagian bawah situs, kami menyematkan **Pusat Hotline Darurat 24 Jam** yang merangkum kontak resmi seluruh bank nasional (BCA, BRI, Mandiri, BNI, dan OJK) lengkap dengan fitur panggil dan salin nomor instan.*
> 
> *Terakhir, di modul **Lanyard ID**, kami menghadirkan kartu proteksi fisik dan digital dengan **Mode Lansia (A+)** berfont besar, yang bisa disimpan di galeri ponsel orang tua sebagai pegangan nomor darurat keluarga."*

---

### **[03:00 - 03:30] PENUTUP & KESIMPULAN DAMPAK**

> *"Sebagai penutup, **TUNTUN** dirancang bukan sekadar sebagai aplikasi, melainkan benteng pertahanan pertama keluarga Indonesia menghadapi badai kejahatan digital.*
> 
> *Arsitektur webnya ringan, responsif dari HP hingga desktop, siap di-deploy secara global di Vercel, dan sepenuhnya menjaga privasi masyarakat.*
> 
> *Satu keputusan sadar dapat menyelamatkan tabungan seumur hidup satu keluarga. Bersama TUNTUN, mari kita lindungi ruang digital kita.*
> 
> *Terima kasih, saya siap menerima pertanyaan dari Dewan Juri."*

---
*(Dokumentasi dan naskah demo siap digunakan).*
