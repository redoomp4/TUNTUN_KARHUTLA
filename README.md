# DOKUMENTASI SISTEM TUNTUN: DIGITAL GUARDIAN
**Platform Literasi, Forensik, dan Tanggap Darurat Penipuan Rekayasa Sosial untuk Generasi Muda & Keluarga Indonesia**

---

### Informasi Studi Kasus & Kompetisi
* **Studi Kasus Resmi**: *The Trust Trap: Navigating Digital Deception*
* **Tema Kompetisi**: *MIT-Week 2026: Guardians of the Digital Space – Empowering Today's Generation Toward a Safer Cyber Ecosystem*
* **Repositori GitHub**: `redoomp4/TUNTUN_KARHUTLA`
* **Arsitektur Aplikasi**: Client-Side Single Page Application (React 19 + Vite)
* **Status Deployment**: Siap Deploy di Vercel (Root Directory: `frontend`)

---

## 1. Panduan Cara Menjalankan Sistem

Aplikasi TUNTUN dapat dijalankan secara lokal di komputer pengembang maupun langsung diakses melalui cloud hosting Vercel.

### A. Menjalankan di Lingkungan Lokal (Local Development)

#### Prasyarat Sistem
* **Node.js**: Versi 18.0.0 atau yang lebih baru (disarankan v20+).
* **NPM**: Versi 9.0.0 atau yang lebih baru.
* **Peramban Web**: Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari modern.

#### Langkah Instalasi & Menjalankan:
1. Buka terminal (PowerShell, Command Prompt, atau Terminal Linux/macOS).
2. Pindah ke direktori antarmuka frontend:
   ```bash
   cd frontend
   ```
3. Pasang seluruh dependensi proyek:
   ```bash
   npm install
   ```
4. *(Opsional)* Konfigurasi Kunci API AI:
   Jika ingin menggunakan kuota gratis Google Gemini milik sendiri, buat file `.env` di dalam folder `frontend/`:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...kunci_anda_disini
   ```
   > **Catatan**: Jika file `.env` tidak diisi, sistem otomatis beralih ke koneksi *Cloud Neural AI Gateway* bawaan yang tetap aktif merespons percakapan secara gratis dan tanpa batas, serta didukung *Heuristic Fallback* saat luring (offline).

5. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
6. Buka peramban di alamat: `http://localhost:5173`

---

### B. Menjalankan Pengujian Otomatis (Automated Quality Assurance)

Proyek ini dilengkapi rangkaian pengujian unit dan validasi DOM untuk memastikan keandalan logika mesin deteksi:

1. **Uji Build Produksi (Vite Build)**:
   ```bash
   cd frontend
   npm run build
   ```
   *Memastikan tidak ada galat kompilasi JSX, modul CSS, atau dependensi.*

2. **Uji Mesin Deterministik (Unit & Integration Suite)**:
   ```bash
   node tests/test_engines.mjs
   ```
   *Menguji 7 suite: Heuristic Engine, Magic-Bytes Inspector, Hybrid AI Engine, Scoring Engine, Report Builder, De-obfuscation Parser, dan Domestic Whitelist.*

3. **Uji Validasi DOM & Token Accessibility**:
   ```bash
   python tests/verify_suite.py
   ```
   *Memvalidasi 80 atribut DOM ID, navigasi keyboard (Alt+1..5), dan kepatuhan kontras warna.*

---

### C. Panduan Deploy ke Vercel

Aplikasi TUNTUN 100% siap dideploy ke Vercel secara gratis dalam hitungan detik:

1. Masuk ke akun [Vercel](https://vercel.com) menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** lalu pilih **Project**.
3. Cari repositori **`redoomp4/TUNTUN_KARHUTLA`** dan klik **Import**.
4. **Pada tampilan Import Project Vercel**:
   * Vercel akan mendeteksi dua folder (`Backend` dan `frontend`).
   * Klik tombol **`Import single project →`** tepat di baris **`frontend (Vite)`**.
5. Pastikan parameter konfigurasi terisi sebagai berikut:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `vite build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
6. Klik tombol **Deploy**.
7. Dalam 30-45 detik, aplikasi akan tayang di domain Vercel publik (contoh: `https://tuntun-karhutla.vercel.app`).

---

## 2. Fitur-Fitur Utama Sistem (Kerangka Guardians)

Sesuai arahan `task.md` (*Studi Kasus: The Trust Trap: Navigating Digital Deception*), sistem TUNTUN dirancang dalam tiga pilar terintegrasi:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TUNTUN DIGITAL GUARDIAN                         │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│     1. RECOGNIZE    │         2. LEARN         │         3. ACT        │
│      (Mengenali)    │         (Belajar)        │      (Bertindak)      │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ • Pemindai SMS / WA │ • Simulator Interaktif   │ • Protokol Darurat    │
│ • De-obfuscation    │   Bercabang (3 Modus)    │ • Generator Laporan   │
│ • Anatomi Tautan    │ • Chat Lawan Bicara AI   │   Resmi Bank          │
│ • Magic-Bytes Biner │ • Detektif Forensik      │ • Peringatan Keluarga │
│   Inspektor APK/PDF │   Bukti vs Pengecoh      │ • Lanyard ID + Audio  │
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

---

### Pilar 1: RECOGNIZE (Mengenali Modus & Sinyal Bahaya)

Modul ini membantu pengguna mengevaluasi pesan, tautan, dan berkas mencurigakan sebelum dipercaya, dengan hasil deteksi yang dapat dijelaskan secara transparan.

1. **Pemindai Pesan & Rekayasa Sosial (Heuristic Scanner)**:
   * **Pola Manipulasi Psikologis**: Mendeteksi desakan batas waktu sempit (urgensi palsu), ancaman pemblokiran rekening sepihak, dan iming-iming hadiah fiktif.
   * **Mesin De-Obfuskasi Cerdas**: Mampu membongkar taktik pelaku penipuan yang menyamarkan kata kunci dengan:
     - Teks spasi renggang (contoh: `d e p o s i t`).
     - Teks pengganti angka / *leetspeak* (contoh: `k0de 0tp`, `tr4nsfer`).
     - Singkatan bertitik (contoh: `p d f . a p k`, `b.r.i`).
   * **Anatomi Domain & Deteksi Penipuan URL**: Membedakan tautan berisiko tinggi (TLD `.apk`, `.top`, `.vip`, atau pemendek tautan) dari domain promosi resmi operator telekomunikasi (*Telco LBA* seperti `myads.id` yang memiliki opsi `STOP 8000`).

2. **Inspektur Header Biner Magic-Bytes Berkas (Client-Side)**:
   * Membaca langsung byte heksadesimal berkas di peramban tanpa mengunggah berkas ke internet.
   * Mendeteksi berkas instalasi Android `.apk` berbahaya yang sengaja dinamai ulang sebagai berkas dokumen (contoh: `Undangan_Pernikahan.pdf.apk` atau `Surat_Tilang.pdf` palsu ber-header `50 4B 03 04`).
   * Mengonfirmasi integritas berkas dokumen PDF asli ber-header biner standar `%PDF-` (`25 50 44 46`).

3. **Analisis Sintesis AI Bertingkat (TUNTUN Neural Core)**:
   * Mengintegrasikan model LLM untuk membedah motivasi psikologis pelaku, merumuskan alasan bahaya dalam bahasa Indonesia yang ringkas, serta merekomendasikan tindakan pencegahan langsung.

---

### Pilar 2: LEARN (Belajar Mengambil Keputusan yang Aman)

Modul ini melatih ketajaman pengguna melalui simulasi interaktif realistis dan latihan investigasi bukti digital.

1. **Simulator Percakapan Bercabang (*Branching State Machine*)**:
   * Menyajikan 3 skenario nyata yang sering dihadapi anak muda:
     - **Kurir Ekspedisi**: Modus paket salah kirim yang mendesak korban menginstal aplikasi pelacak kurir berformat `.apk`.
     - **Keamanan Bank**: Modus notifikasi transaksi mencurigakan yang meminta 6 digit kode OTP verifikasi akun.
     - **Tugas VIP E-Commerce**: Modus paruh waktu menyelesaikan ulasan produk dengan iming-iming komisi bertingkat yang menuntut deposit modal berulang.
   * Memberikan respons interaktif berupa tombol **Pilihan Cepat** atau kolom **Ketik Balasan Manual** langsung ke bot AI penipu.
   * Setiap langkah menghasilkan status konsekuensi dinamis: *Aman (Safe)*, *Waspada (Caution)*, *Bahaya (Danger)*, atau *Terkompromi (Compromised)*.

2. **Laboratorium Detektif Bukti Forensik**:
   * Menghadapkan pengguna pada kasus penipuan digital realistis (surat undian resmi, email penawaran kerja HRD luar negeri, dan konfirmasi paket tertahan bea cukai).
   * Melatih pengguna membedah kalimat per kalimat untuk membedakan antara tanda bahaya nyata (*True Positives*) dan kalimat normal pengecoh (*Decoys/Distractors*).
   * Memberikan skor ketelitian observasi dan ulasan investigasi forensik.

---

### Pilar 3: ACT (Bertindak Melindungi Diri & Keluarga)

Modul ini memberikan panduan terukur dan alat praktis saat pengguna atau keluarganya menghadapi situasi darurat penipuan digital.

1. **Protokol Tanggap Darurat 4 Menit Pertama**:
   * Panduan langkah teknis sistematis untuk 4 skenario kritis:
     - Terlanjur mengklik tautan mencurigakan.
     - Terlanjur memasang file `.apk` di ponsel Android.
     - Terlanjur mengirim kode OTP atau saldo rekening terpotong.
     - Akun media sosial atau perpesanan diambil alih peretas.

2. **Generator Draf Laporan Resmi Bank & OJK**:
   * Mengubah formulir kronologi kejadian menjadi draf surat laporan formal siap kirim yang memuat:
     - Identitas pelapor dan nomor kontak.
     - Rincian kronologi insiden dan waktu transaksi.
     - Nomor rekening dan nama bank tujuan milik penipu.
     - Nomor tiket referensi laporan kepolisian / perbankan.

3. **Draf Peringatan Cepat Grup Keluarga**:
   * Menghasilkan teks edukasi ramah keluarga dalam satu klik salin (*Copy to WhatsApp*), siap dibagikan ke grup keluarga atau RT/RW untuk menghentikan rantai penipuan di lingkungan terdekat.

4. **Direktori Hotline Cepat Call Center Perbankan**:
   * Direktori kontak darurat resmi untuk BCA, Mandiri, BRI, BNI, Permata, Jenius, Kontak OJK 157, dan Patroli Siber Polri dengan tombol panggil langsung.
   * Dilengkapi modal interaktif yang ramah perangkat seluler (mobile touch-friendly dengan target sentuh minimal 44px).

5. **Kartu Lanyard SOS Digital 3D & Aksesibilitas Suara (Lansia)**:
   * Visualisasi kartu Lanyard 3D interaktif yang dapat dibalik untuk menampilkan identitas kesiapsiagaan siber pengguna.
   * Menghitung **Preparedness Score** (0-100) berdasarkan akumulasi skor latihan di modul pemindai, simulator, dan detektif bukti.
   * Menyediakan mode profil khusus: **Remaja**, **Orang Tua**, dan **Lansia**.
   * Dilengkapi fitur **Baca Suara (Text-to-Speech)** yang melafalkan panduan darurat secara lantang dalam bahasa Indonesia untuk memudahkan kalangan lansia yang kesulitan membaca teks berukuran kecil di ponsel.

---

## 3. Arsitektur Teknis & Kepatuhan Privasi

### Struktur Direktori Proyek
```text
frontend/
├── src/
│   ├── components/                   # Komponen Antarmuka Pengguna SPA
│   │   ├── ScannerWorkspace.jsx      # Modul 01: Pemindai Forensik & Header Biner
│   │   ├── SimulatorWorkspace.jsx    # Modul 02: Percakapan Bercabang & AI
│   │   ├── DetectiveWorkspace.jsx    # Modul 03: Detektif Bukti & Pengecoh
│   │   ├── GuideToolkitWorkspace.jsx # Modul 04: Tanggap Darurat & Form Laporan
│   │   ├── GuardianProfileWorkspace.jsx # Modul 05: Evaluasi Skor Kesiapsiagaan
│   │   ├── GuardianLanyard.jsx       # Kartu Lanyard 3D & Fitur Audio TTS Lansia
│   │   ├── PhoneMotionGraphic.jsx    # Visual Interaktif Smartphone Forensik
│   │   └── Navbar.jsx                # Navigasi Atas & Menu Drawer Mobile
│   ├── context/
│   │   └── GuardianContext.jsx       # State Manajemen Terpusat (sessionStorage)
│   ├── data/                         # Basis Data Pengetahuan Statis
│   │   ├── officialDomains.js        # Whitelist Domain Nasional & Format Telco
│   │   ├── simulatorScenarios.js     # State Machine Skenario Kurir, Bank, VIP
│   │   ├── detectiveCases.js         # Kasus Forensik Bukti & Pengecoh
│   │   └── emergencyDirectory.js     # Direktori Hotline Bank Resmi & OJK
│   └── engines/                      # Mesin Komputasi Bersih
│       ├── heuristicEngine.js        # Analisis Pola, Aturan R-01..R-10, De-obfuskasi
│       ├── fileSignatureEngine.js    # Analisis Magic-Bytes Header Biner Berkas
│       ├── hybridAiEngine.js         # Pipeline Multi-Tier Integrasi LLM
│       ├── reportBuilderEngine.js    # Mesin Generator Draf Kronologi Laporan
│       └── scoringEngine.js          # Mesin Evaluator Kesiapsiagaan Sesi
```

### Kepatuhan Batasan Privasi & Keamanan (Sesuai Arahan task.md)
1. **Zero-Data Retention (100% Client-Side)**:
   Seluruh pemrosesan teks, pembacaan biner berkas, dan perhitungan skor dilakukan secara lokal di peramban pengguna. Tidak ada data pribadi, nomor rekening, atau riwayat pesan yang disimpan ke basis data server eksternal.
2. **Skenario dan Data Fiktif Aman**:
   Seluruh contoh kasus, tautan uji coba, nomor rekening, dan dialog pelaku bersifat fiktif edukatif. Sistem tidak menghosting berkas berbahaya nyata.
3. **Transparansi Keterbatasan Deteksi**:
   Sistem secara terbuka menyatakan bahwa hasil evaluasi adalah panduan literasi heuristik dan AI untuk kehati-hatian pengguna, bukan jaminan kepastian hukum atau sertifikasi keamanan mutlak.
