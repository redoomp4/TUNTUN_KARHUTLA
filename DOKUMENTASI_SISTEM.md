# DOKUMENTASI SISTEM TUNTUN: DIGITAL GUARDIAN
**Platform Literasi, Forensik, dan Tanggap Darurat Penipuan Digital untuk Generasi Muda & Keluarga Indonesia**

---

### Informasi Studi Kasus & Tema
* **Studi Kasus Resmi**: *The Trust Trap: Navigating Digital Deception*
* **Tema Kompetisi**: *MIT-Week 2026: Guardians of the Digital Space – Empowering Today's Generation Toward a Safer Cyber Ecosystem*
* **Repositori GitHub**: `redoomp4/TUNTUN_KARHUTLA`
* **Arsitektur**: Client-Side Single Page Application (React 19 + Vite)
* **Status Deployment**: Siap Deploy di Vercel (Root: `frontend`)

---

## 1. Kesesuaian dengan Kerangka Guardians (task.md)

Studi kasus mewajibkan solusi yang memberdayakan pengguna melalui tiga pilar utama: **Recognize**, **Learn**, dan **Act**. Seluruh modul TUNTUN dirancang terpadu untuk memenuhi kerangka ini:

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

### A. Pilar 1 — RECOGNIZE (Mengenali)
Membantu pengguna memeriksa pesan, tautan, atau berkas mencurigakan sebelum dipercaya:
* **Pemindai Heuristik Teks**: Mendeteksi pola manipulasi psikologis (urgensi waktu sempit), kata kunci perbankan palsu, tawaran komisi fiktif, serta pengirim nomor pribadi tak terverifikasi.
* **Mesin De-Obfuscation Cerdas**: Mampu membongkar teks sengaja diacak (*leetspeak* seperti `k0de 0tp`, huruf terpisah `d e p o s i t`, serta singkatan bertitik `p d f . a p k` atau `b.r.i`).
* **Anatomi Tautan & Domain**: Mengurai domain palsu berakhiran TLD berisiko (`.vip`, `.top`, `.apk`), pemendek tautan (*shortlink*), dan membedakannya dari domain periklanan resmi operator (*Telco LBA* seperti `myads.id` dengan fitur `STOP 8000`).
* **Inspeksi Magic-Bytes Biner (Client-Side)**: Menganalisis *header* heksadesimal berkas langsung di peramban pengguna. Berkas malware APK (`50 4B 03 04`) yang sengaja diubah namanya menjadi `.pdf` atau `.jpg` akan langsung terdeteksi sebagai ancaman kritis, sementara dokumen PDF asli (`25 50 44 46`) dinyatakan aman.

### B. Pilar 2 — LEARN (Belajar)
Melatih ketajaman berpikir kritis melalui simulasi realistis dan umpan balik langsung:
* **Simulator Percakapan Bercabang (*Branching State Machine*)**:
  Menyajikan 3 skenario nyata:
  1. *Kurir Ekspedisi*: Desakan membuka surat foto paket fiktif berformat `.apk`.
  2. *Keamanan Bank*: Peringatan transaksi ilegal palsu yang mendesak penyerahan 6 digit kode OTP.
  3. *Tugas VIP E-Commerce*: Jebakan komisi bertingkat yang menuntut uang deposit bertahap.
  Setiap keputusan pengguna menghasilkan konsekuensi berbeda (Bahaya, Waspada, Terselamatkan, atau Terkompromi).
* **Lawan Latihan Interaktif AI (*TUNTUN Neural Active*)**: Pengguna dapat mengetik balasan manual bebas ke AI penipu untuk melatih ketegasan menolak tekanan rekayasa sosial.
* **Detektif Forensik Bukti Penipuan**:
  Menghadapkan pengguna pada spesimen pesan undian palsu, email rekrutmen fiktif, dan bea cukai. Pengguna dilatih menandai bukti penipuan (*True Positives*) dan diuji agar tidak salah menuduh kalimat normal (*False Positives/Decoys*).

### C. Pilar 3 — ACT (Bertindak)
Memberikan langkah konkrit yang jelas saat pengguna menghadapi situasi darurat:
* **Protokol Tanggap Darurat 4 Langkah**: Panduan tindakan terukur untuk 4 skenario darurat (klik tautan phishing, instal file APK, saldo terpotong, atau akun sosial dibajak).
* **Generator Draf Laporan Resmi Bank**: Menyusun naskah kronologi insiden formal siap salin yang memuat waktu, kronologi, nomor rekening tujuan pelaku, dan nomor tiket insiden.
* **Draf Peringatan Grup Keluarga**: Menghasilkan naskah edukatif ramah keluarga untuk dibagikan ke grup WhatsApp agar kerabat dekat tidak menjadi korban berikutnya.
* **Direktori Hotline Blokir Rekening**: Akses kontak cepat 1-klik panggil ke Call Center resmi seluruh bank nasional (BCA, Mandiri, BRI, BNI, OJK 157, Patroli Siber).
* **Kartu Lanyard ID Digital 3D & Audio Lansia**:
  Kartu identitas siber personal yang dapat disesuaikan untuk tiga generasi (Remaja, Orang Tua, dan Lansia). Dilengkapi tombol **Baca Suara (Text-to-Speech)** untuk membantu lansia memahami langkah darurat tanpa harus membaca teks kecil di ponsel.

---

## 2. Kepatuhan Batasan Privasi & Keamanan (task.md)

Sesuai arahan etika pada `task.md`, sistem TUNTUN menerapkan standar keamanan data tertinggi:
1. **Zero-Data Retention (100% Client-Side)**:
   Seluruh analisis teks, pembacaan biner berkas, dan perhitungan skor dilakukan secara lokal di peramban pengguna. Tidak ada data pribadi, nomor telepon, atau isi pesan yang disimpan ke server eksternal.
2. **Skenario dan Entitas 100% Fiktif**:
   Seluruh contoh studi kasus, nama rekening, dan nomor telepon yang disimulasikan bersifat fiktif edukatif. Sistem tidak pernah mendistribusikan atau menghosting malware berbahaya nyata.
3. **Transparansi Keterbatasan Heuristik**:
   Sistem secara transparan mencantumkan catatan bahwa penilaian merupakan indikasi edukasi literasi berbasis aturan dan AI, bukan jaminan mutlak kepastian hukum atau audit forensik yudisial.

---

## 3. Arsitektur Teknis & Clean Code

```
frontend/
├── src/
│   ├── components/         # Modul UI SPA Bersih & Responsif
│   │   ├── ScannerWorkspace.jsx          # Modul 01: Pemindai & Biner
│   │   ├── SimulatorWorkspace.jsx        # Modul 02: Percakapan & AI
│   │   ├── DetectiveWorkspace.jsx        # Modul 03: Detektif Bukti
│   │   ├── GuideToolkitWorkspace.jsx     # Modul 04: Protokol & Laporan
│   │   ├── GuardianProfileWorkspace.jsx  # Modul 05: Skor Sesi
│   │   ├── GuardianLanyard.jsx           # Kartu 3D Lanyard & TTS Suara
│   │   ├── PhoneMotionGraphic.jsx        # Visual Simulasi Ponsel
│   │   └── Navbar.jsx                    # Navigasi & Drawer Mobile
│   ├── context/
│   │   └── GuardianContext.jsx           # State Manajemen Terpusat (sessionStorage)
│   ├── data/                             # Dataset Statis Terstruktur
│   │   ├── detectiveCases.js
│   │   ├── emergencyDirectory.js
│   │   ├── officialDomains.js
│   │   └── simulatorScenarios.js
│   └── engines/                          # Logika Deterministik Murni
│       ├── fileSignatureEngine.js        # Magic Bytes File Analyzer
│       ├── heuristicEngine.js            # Text Scanner & De-obfuscation
│       ├── hybridAiEngine.js             # Multi-Tier LLM Pipeline
│       ├── reportBuilderEngine.js        # Formatter Laporan Resmi
│       └── scoringEngine.js              # Evaluator & Preparedness Index
└── tests/
    ├── test_engines.mjs                  # Unit & Integration Suite (7/7 Pass)
    └── verify_suite.py                   # QA DOM & Token Verification (80/80 Pass)
```

### Multi-Tier Free LLM API Pipeline
Di dalam [`hybridAiEngine.js`](file:///D:/LOMBA/WEB/frontend/src/engines/hybridAiEngine.js), koneksi LLM dirancang bertingkat dengan keandalan tinggi:
1. **Google Gemini 1.5 Flash**: Digunakan otomatis bila pengguna menyediakan kunci gratis di `VITE_GEMINI_API_KEY`.
2. **Groq Cloud Llama 3.3 70B**: Alternatif latensi rendah berbasis kunci gratis.
3. **TUNTUN Cloud Neural LLM Gateway**: Koneksi bawaan gratis tanpa kunci API yang selalu siap aktif via proxy OpenAI-compatible.
4. **Heuristic Contextual Fallback (NFR-09)**: Menjamin sistem tetap merespons percakapan secara cerdas saat koneksi internet terputus.

---

## 4. Panduan Alur Penggunaan (User Flow)

1. **Alur Deteksi Cepat (Halaman 01)**:
   * Masukkan teks pesan atau pilih salah satu tombol skenario cepat (*Preset*).
   * Klik **Periksa Pesan**. Sistem menampilkan Skor Risiko (0-100), label status, rincian tanda bahaya, dan sintesis analisis AI.
   * Uji berkas dengan menyeret file `.pdf` samaran untuk melihat kerja *Magic-Bytes Inspector*.
2. **Alur Latihan Interogasi (Halaman 02)**:
   * Pilih skenario: Kurir APK, CS Bank, atau Tugas VIP.
   * Baca percakapan pelaku, pilih salah satu respons cepat, atau ketik balasan manual di kolom chat untuk berdialog dengan AI.
3. **Alur Otopsi Kasus (Halaman 03)**:
   * Buka kasus undian atau email HRD.
   * Klik bagian pesan yang dicurigai sebagai manipulasi, lalu klik **Periksa Temuan**.
   * Periksa skor ketelitian dan rincian pengecoh yang berhasil dihindari.
4. **Alur Tanggap Darurat & Laporan (Halaman 04)**:
   * Pilih kondisi insiden darurat untuk membaca 4 langkah cepat penyelamatan akun.
   * Masukkan detail kronologi pada form, lalu klik **Salin Laporan Bank** untuk mendapatkan format laporan resmi.
5. **Alur Kartu Identitas & Aksesibilitas Lansia (Halaman 05)**:
   * Periksa indeks ketangguhan siber (*Preparedness Score*) dari akumulasi latihan.
   * Putar kartu Lanyard 3D, ganti mode ke **Lansia**, lalu tekan tombol **Baca Suara (Lansia)** untuk mendengarkan panduan audio.

---

## 5. Panduan Deployment Vercel

1. Buka dashboard [Vercel](https://vercel.com) dan hubungkan akun GitHub Anda.
2. Pilih repositori **`TUNTUN_KARHUTLA`**.
3. Pada halaman pemilihan aplikasi yang terdeteksi, klik **`Import single project →`** tepat di baris **`frontend`**.
4. Pastikan konfigurasi:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
5. Klik **Deploy**. Selesai.
