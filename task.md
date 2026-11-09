# Task Plan & Engineering Analysis — Digital Guardian (React Web Application)

## 1. Analisis Kritis Fitur (Critical Thinking: Bagaimana Memenangkan Lomba?)

### A. Mengapa "Chatbot API Gratis" Biasa Justru Berisiko Menurunkan Nilai Juri?
Berdasarkan dokumen studi kasus (`prompt.MD` Bagian 4) dan rubrik penilaian lomba:
1. **Aturan Studi Kasus**: *"Skenario dan penilaian menggunakan aturan yang terstruktur. AI agent tidak diwajibkan. AI bukan sebagai penentu utama kebenaran penilaian."*
2. **Risiko Teknis Saat Penjurian**: API gratis (OpenRouter/Gemini free tier) sering mengalami *rate-limit* (`HTTP 429`), kebocoran API key di repositori publik, latensi lambat (`3–8 detik`), atau halusinasi nomor Call Center palsu. Jika saat juri menguji tombol chat ternyata *error*, nilai **Fungsionalitas** langsung jatuh.
3. **Kesan "AI Slop"**: Sekadar memasang *widget chatbot* di pojok kanan bawah terlihat seperti proyek *wrapper* generik dan tidak menjawab masalah utama korban penipuan.

### B. Strategi Fitur Pemenang Lomba (High-Utility, Deterministic, Zero-Failure)
Daripada sekadar chatbot generik, kita mengimplementasikan **4 Fitur Forensik & Mitigasi Nyata** yang berjalan **100% deterministik di sisi klien (<15ms, tanpa risiko API mati)** namun memiliki kedalaman teknis tingkat lanjut:

1. **Inspektur *Magic Bytes* (Hex Signature) File & `.APK` (`fileSignatureEngine.js`)**
   - **Masalah Nyata**: Modus penipuan nomor 1 di Indonesia adalah pengiriman file `.APK` pencuri SMS OTP yang disamarkan menjadi dokumen (`Undangan.pdf.apk` atau bahkan diganti namanya menjadi `Resi_Paket.pdf`).
   - **Solusi Teknis**: Menggunakan Web API `FileReader` & `Uint8Array` untuk membaca *header* biner (*Magic Bytes*) file secara langsung di memori browser (tanpa unggah ke server):
     - Mendeteksi *signature* `50 4B 03 04` (`PK..` struktur ZIP/APK Android) dan memindai keberadaan `AndroidManifest.xml` atau `classes.dex` di dalam biner file.
     - Membedakannya dari PDF asli (`25 50 44 46` / `%PDF`) atau gambar JPEG asli (`FF D8 FF`).
     - Dilengkapi tombol **Simulasi Sampel File Biner (`.pdf.apk` vs `.pdf` Asli)** agar juri dapat menguji fitur ini dalam 1 klik tanpa harus menyiapkan file berbahaya di komputer mereka.

2. **Dekonstruktor Anatomi URL & Detektor *Typosquatting* Instansi (`heuristicEngine.js`)**
   - Membedah URL mencurigakan menjadi bagian struktural: *Protocol*, *Auth-Spoofing (`@`)*, *Subdomain Trap*, *Registrable Domain*, dan *Top-Level Domain (TLD)*.
   - Membandingkan kemiripan domain dengan 22 domain resmi Indonesia (`bca.co.id`, `bri.co.id`, `pajak.go.id`, `beacukai.go.id`, dll.) untuk menangkap *lookalike domain* (misal `bca-tarif2026.vip`).

3. **Pipeline Integrasi Lintas Modul 1-Klik (`Scanner -> Action Guide & Laporan Resmi`) + Generator Balasan Verifikasi Aman**
   - Membuktikan bahwa aplikasi ini adalah **Web Application terintegrasi**, bukan kumpulan halaman statis.
   - Saat pengguna memindai pesan berbahaya di modul **Pemindai**, tombol **"Teruskan ke Laporan Darurat"** secara otomatis mengekstrak nomor telepon pelaku, tautan URL, nama instansi yang dicatut, serta kategori modus, lalu mengisi formulir **Penyusun Kronologi Laporan Resmi** di modul **Action Guide** dan membuka prosedur penyelamatan yang sesuai.
   - Dilengkapi **Draf Balasan Verifikasi Aman (Siap Salin)** yang memberikan 3 opsi respons tegas (Verifikasi Kanal Resmi, Tolak File/Tautan, dan Peringatan Grup Keluarga) yang dapat disalin dalam 1 klik.

4. **Laboratorium Latihan Respons Ketik Mandiri (Arsitektur Hybrid AI + Guardrail Deterministik — `hybridAiEngine.js`)**
   - **Kesesuaian Eksplisit dengan `prompt.MD` Bagian 4 Aturan #5 & `NFR-09`**:
     - `prompt.MD` menyatakan: *"AI dapat dipertimbangkan sebagai pengembangan lanjutan untuk membuat dialog lebih dinamis, tetapi bukan sebagai penentu utama kebenaran penilaian"* serta mewajibkan pengujian *"Kegagalan layanan eksternal apabila integrasi AI ditambahkan (`NFR-09`)"*.
   - **Solusi Arsitektur Hibrida (`hybridAiEngine.js`)**:
     - **Penilaian 100% Deterministik (`evaluateUserDefenseResponse`)**: Saat pengguna mengetik balasan bebas kepada pelaku di *Scam Simulator*, mesin deterministik memindai apakah pengguna membocorkan OTP/PIN/data pribadi (`-45 poin`), terjebak kepanikan (`-20 poin`), atau menerapkan verifikasi aktif melalui kanal resmi (`+15 poin`). Kebenaran penilaian **tidak pernah diserahkan kepada halusinasi AI**.
     - **Dialog Pelaku Dinamis dengan *Automatic Local Fallback* (`requestHybridScammerReply`)**: Menggunakan *endpoint* LLM publik tanpa kunci (`https://text.pollinations.ai/`) dengan batas waktu ketat (`3.8 detik`). Jika *offline*, terkena *rate-limit*, atau juri mengaktifkan kotak centang **"Uji simulasi gangguan API / Mode Fallback Lokal (NFR-09)"**, sistem otomatis beralih ke generator respons kontekstual lokal tanpa jeda dan tanpa *error*.

5. **Asisten Triase Insiden & Simulasi Keputusan Bercabang (`Simulator` + `Detective` + `Guardian Profile`)**
   - **Scam Simulator**: *Branching state machine* 3 skenario (*Kurir `.APK`*, *Tarif Bank OTP*, *Kerja Paruh Waktu VIP*) dengan konsekuensi nyata di setiap cabang.
   - **Scam Detective**: Investigasi bukti pesan dengan **indikator berbahaya (*True Positive*)** dan **elemen normal pengecoh (*False Positive* dengan penalti `-15`)** serta validasi input (`FR-14`).
   - **Guardian Profile**: Kalkulasi skor kesiapsiagaan sesi (`0–100`) otomatis di `window.sessionStorage` (`NFR-12`) dengan fitur **Unduh Laporan Audit Sesi (`.txt`)** dan **Salin Ringkasan**.

### C. Evaluasi Kebutuhan User Login / Auth
- Sesuai **Batasan Sistem #1 & #6 (`prompt.MD`)**: *"MVP tidak membutuhkan registrasi maupun login pengguna. Pengguna dapat langsung menggunakan aplikasi."*
- Seluruh state dikelola secara reaktif melalui React Context (`GuardianContext.jsx`) yang disinkronkan ke `window.sessionStorage` (`dg_learning_session_v2`).

---

## 2. Standar Desain Minimalis (`# Software` Design System — Anti AI Slop)
- **0 Eyebrow Pill / Kapsul Ber-titik di Atas Judul**: Judul langsung menggunakan `Host Grotesk` bold dengan *tracking* rapat (`-0.025em`).
- **0 Emoji & Simbol Dekoratif**: Tidak ada emoji (`🔗`, `📞`, `⚠️`, `❌`, `✅`) atau panah dekoratif (`→`, `↗`) pada antarmuka.
- **0 Huruf Kapital Berjarak Lebar (`text-transform: uppercase`)**: Seluruh label menggunakan *sentence case* (`Instrument Sans` 500/600).
- **Ritme Permukaan Asli `# Software`**:
  - Latar Terang Utama (`--dp-color-ground: #fcfcfd`) + *Ruled Facts Strip* (`1px solid #dde0e6`)
  - Bidang Gelap Kontinu 1 (`--dp-color-field: #16191f`) untuk *Scam Simulator*
  - Bidang Abu-Abu Pucat (`--dp-color-ground-muted: #f3f4f6`) untuk *Scam Detective*
  - Bidang Terang dengan *Native `<details>` Disclosures* (tanda `+` berputar `45deg`) untuk *Action Guide & Toolkit*
  - Bidang Gelap Kontinu 2 (`--dp-color-field: #16191f`) untuk *Guardian Profile* & *Footer*.

---

## 3. Daftar Tugas Implementasi (Task Checklist)

- [x] **Task 1 — Analisis Kebutuhan & Penyusunan Rencana (`task.md`)**
  - Menyusun analisis kritis fitur pemenang lomba dan struktur arsitektur React yang *clean* & *scalable*.
- [x] **Task 2 — Setup Proyek React 18 + Vite (`frontend/package.json`, `vite.config.js`)**
  - Mengonfigurasi proyek React modern di direktori `frontend/` dengan struktur folder modular (`data/`, `engines/`, `context/`, `components/`, `styles/`).
- [x] **Task 3 — Implementasi Layer Data & Pure Deterministic Engines (`src/data/` & `src/engines/`)**
  - `src/data/officialDomains.js`: Daftar domain resmi & TLD berisiko.
  - `src/data/simulatorScenarios.js`: State machine 3 skenario simulasi bercabang.
  - `src/data/detectiveCases.js`: 3 kasus forensik dengan indikator risiko & pengecoh aman.
  - `src/data/emergencyDirectory.js`: Checklist 4 situasi darurat & direktori Call Center resmi.
  - `src/engines/heuristicEngine.js`: Mesin analisis pesan & dekonstruktor URL (`R-01`..`R-07`).
  - `src/engines/fileSignatureEngine.js`: Mesin inspeksi *Magic Bytes* (`Uint8Array` Hex Header) untuk mendeteksi `.APK`/`.EXE` tersembunyi vs `.PDF` asli.
  - `src/engines/scoringEngine.js`: Mesin evaluasi *Scam Detective* & agregasi *Guardian Profile*.
  - `src/engines/reportBuilderEngine.js`: Mesin pembuat draf laporan resmi & ekstraksi entitas otomatis dari hasil pindaian.
  - `src/engines/hybridAiEngine.js`: Mesin AI Hibrida untuk dialog simulasi dinamis dengan *Automatic Local Fallback (`NFR-09`)*, evaluator respons pertahanan deterministik (`prompt.MD` Aturan #5), serta generator draf balasan verifikasi aman.
- [x] **Task 4 — Implementasi React State Management (`src/context/GuardianContext.jsx`)**
  - Mengelola state sesi (`window.sessionStorage`), navigasi workspace (*Focused Tab Mode* vs *Full Scroll View*), dan *1-Click Incident Pipeline* antar-modul.
- [x] **Task 5 — Implementasi Komponen UI React Minimalis (`src/components/`)**
  - `Navbar.jsx`: Header minimalis `64px` dengan indikator aktif `2px solid #074ce0`, skor sesi *live*, dan pengalih mode tampilan.
  - `ScannerWorkspace.jsx`: Pemindai pesan/URL + Inspektur *Magic Bytes* file lokal + tombol *Teruskan ke Laporan Darurat*.
  - `SimulatorWorkspace.jsx`: Simulasi percakapan interaktif pada bidang gelap `#16191f`.
  - `DetectiveWorkspace.jsx`: Investigasi barang bukti pesan pada bidang `#f3f4f6`.
  - `GuideToolkitWorkspace.jsx`: *Native `<details>` disclosures* 16 langkah, generator kronologi laporan resmi (terintegrasi dengan Pemindai), dan direktori Call Center.
  - `GuardianProfileWorkspace.jsx`: Rapor kesiapsiagaan sesi, salin ringkasan, dan unduh laporan `.txt`.
- [x] **Task 6 — Build Production, Verifikasi Otomatis (`tests/verify_suite.py`) & Dokumentasi (`README.md`)**
  - Menjalankan `npm install` dan `npm run build` untuk memastikan *production bundle* bebas *error* (`✓ 43 modules transformed, built in 659ms`).
  - Memverifikasi skrip pengujian otomatis `tests/verify_suite.py` (`8/8 PASS`).
