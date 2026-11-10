# TUNTUN: Digital Guardian

**Guardians of the Digital Space: Empowering Today's Generation**  
Aplikasi web interaktif edukasi, forensik pesan/berkas `.APK`, simulasi bercabang, dan asisten chatbot AI gratis untuk pencegahan penipuan rekayasa sosial (*social engineering*).

---

## 1. Arsitektur Direktori (`frontend/` & `Backend/` Terpisah)

Proyek ini memisahkan lapisan antarmuka pengguna (**`frontend/`**) dan lapisan layanan REST API *stateless* (**`Backend/`**) secara bersih:

```text
D:\LOMBA\WEB\
├── DESIGN.md                       # Spesifikasi Design Read, Three Dials, & Audit WCAG AA
├── SYSTEM_DESIGN.md                # Dokumentasi Rekayasa Perangkat Lunak (SRS, Use Case, NFR, Rubric)
├── README.md                       # Panduan Arsitektur, Fitur, & Cara Menjalankan
├── logo_TUNTUN.jpeg                # Aset identitas visual resmi TUNTUN
├── .agents/skills/                 # 10 Skill Anti-Slop, UI, Humanizer, & Design-Taste terinstal
│   ├── antislop/
│   ├── antislop-code/
│   ├── antislop-copywriting/
│   ├── antislop-human/
│   ├── antislop-layoutmobile/
│   ├── antislop-ui/
│   ├── design-taste-frontend/
│   ├── humanizer/
│   ├── no-ai-slop/
│   └── stop-slop/
├── Backend/                        # Stateless Node.js REST API Server (Port 4000)
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── server.js               # HTTP REST Server (/api/health, /api/scan/*, /api/ai/*, /api/report/*)
│       ├── controllers/
│       │   ├── scanController.js   # Controller Heuristik R-01..R-10 & Magic-Bytes Biner
│       │   └── aiChatController.js # Controller Chatbot AI Gratis & Analisis Kontekstual
│       └── services/
│           └── engineBridge.js     # Jembatan modul mesin deterministik
├── frontend/                       # React 18 + Vite Single-Page Web Application (Port 5173)
│   ├── package.json
│   ├── vite.config.js              # Proxy /api -> http://localhost:4000
│   ├── index.html                  # App Shell & Pre-rendered DOM Contract
│   ├── style.css                   # Sistem Desain # Software + Widget + 3D Motion Graphics
│   ├── public/
│   │   └── logo_TUNTUN.jpeg        # Logo resmi TUNTUN
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Shell Navigasi, Pintasan Keyboard (Alt+1..5), & Precision Cursor
│       ├── context/
│       │   └── GuardianContext.jsx # State Sesi Terpusat (sessionStorage NFR-12)
│       ├── data/
│       │   ├── officialDomains.js
│       │   ├── simulatorScenarios.js
│       │   ├── detectiveCases.js
│       │   └── emergencyDirectory.js
│       ├── engines/
│       │   ├── heuristicEngine.js      # Mesin Deterministik R-01..R-10 + De-obfuskasi SMS
│       │   ├── fileSignatureEngine.js  # Inspektur Header Biner Magic-Bytes (50 4B 03 04 vs %PDF)
│       │   ├── hybridAiEngine.js       # Integrasi API AI Gratis (openai-fast) + Smart Synthesizer
│       │   ├── scoringEngine.js        # Kalkulator Skor Kesiapsiagaan Sesi (0-100)
│       │   └── reportBuilderEngine.js  # Generator Kronologi Laporan Resmi Bank/OJK/Polri
│       └── components/
│           ├── Navbar.jsx                  # Navigasi Ringkas + Indikator Progres Sesi
│           ├── ScannerWorkspace.jsx        # Modul 1: Pemindai Pesan, URL, & Berkas Biner
│           ├── PhoneMotionGraphic.jsx      # Visualisasi 3D Smartphone Forensic X-Ray
│           ├── SimulatorWorkspace.jsx      # Modul 2: Simulasi Bercabang & Chatbot AI Gratis
│           ├── DetectiveWorkspace.jsx      # Modul 3: Laboratorium Bukti & Pengecoh (FR-09)
│           ├── GuideToolkitWorkspace.jsx   # Modul 4: Widget Protokol Darurat & Generator Laporan
│           ├── GuardianProfileWorkspace.jsx# Modul 5: Evaluasi Sesi & Unduh Laporan (.txt)
│           └── GuardianLanyard.jsx         # Kartu ID Lanyard 3D Interaktif + Unduh Kartu (.PNG)
└── tests/
    ├── test_engines.mjs            # 7 Suite Pengujian Mesin Runtime (Node.js)
    └── verify_suite.py             # 8 Suite Pengujian Kepatuhan QA & DOM (Python)
```

---

## 2. Lima Modul Inti & Inovasi Unggulan

1. **Pemindai Pesan, URL & Biner Berkas (`ScannerWorkspace.jsx`)**:
   - **10 Aturan Deterministik (`R-01` s.d. `R-10`) + De-obfuskasi**: Mendeteksi berkas `.APK` samaran (`R-01`), *lookalike domain* perbankan (`R-02`), pancingan OTP/PIN (`R-03`), tautan pendek pengalih (`R-04`), tekanan waktu (`R-05`), iming-iming hadiah/VIP (`R-06`), nomor pribadi (`R-07`), promosi judi/penarikan dana tersamar seperti `'With-draw'` (`R-08`), serta membedakan SMS promosi resmi operator seperti `myads.id` & `Kirim STOP ke 8000` (`R-09` & `R-10`).
   - **Inspektur *Magic-Bytes* Biner Lokal**: Memeriksa 8 byte pertama berkas menggunakan `FileReader` + `Uint8Array` di memori browser (`50 4B 03 04` ZIP/APK vs `25 50 44 46` PDF asli) tanpa mengunggah berkas ke server (**NFR-07**).
   - **3D Smartphone Forensic X-Ray (`PhoneMotionGraphic.jsx`) & 3-Lane Pulsing Pipeline**: Memvisualisasikan anatomi ancaman di dalam layar ponsel secara interaktif.
2. **Simulasi Keputusan & Chatbot AI Gratis (`SimulatorWorkspace.jsx`)**:
   - **3 Skenario Bercabang**: Kurir Paket `.APK`, Phishing Tarif Bank, dan Kerja Paruh Waktu VIP.
   - **Chatbot Latihan Pertahanan (API AI Gratis `openai-fast` + Guardrail Deterministik)**: Menggunakan endpoint gratis `https://text.pollinations.ai/openai` dan *Smart Contextual Synthesizer* (`buildSmartContextualScammerReply`) dengan penilaian keamanan 100% deterministik (**NFR-09**).
3. **Detektif Bukti (`DetectiveWorkspace.jsx`)**:
   - 3 kasus investigasi bukti pesan dengan elemen berbahaya (*True Positives*) dan elemen normal pengecoh (*False Positives*) sesuai **FR-09**.
4. **Widget Protokol Darurat & Generator Laporan (`GuideToolkitWorkspace.jsx`)**:
   - Menyajikan 4 tab kondisi darurat dalam bentuk **Grid Kartu Widget Informasi (`LANGKAH 01..04`)** tanpa *checkbox* yang melelahkan, dilengkapi **Generator Kronologi Laporan Resmi** siap salin dan **Direktori Call Center Resmi Terverifikasi** (`BCA 1500888`, `BRI 14017`, `Mandiri 14000`, `BNI 1500046`, `OJK 157`, `CekRekening.id`).
5. **Profil & Kartu ID Lanyard 3D Interaktif (`GuardianProfileWorkspace.jsx` & `GuardianLanyard.jsx`)**:
   - Menghitung indeks kesiapsiagaan sesi (`0–100`) dan menampilkan **Kartu ID Lanyard 3D** dengan fisika tali *multi-node*, efek kilau *hologram foil*, input nama/callsign langsung, pemilih divisi, 3 tema warna kartu (`Obsidian`, `Cobalt`, `Emerald`), dan tombol **Unduh Kartu (`.PNG`)**.

---

## 3. Cara Menjalankan & Memverifikasi

### A. Menjalankan Frontend (Port 5173)
```powershell
cd D:\LOMBA\WEB\frontend
npm install
npm run dev
```
Buka **`http://localhost:5173/`** di browser.

### B. Menjalankan Backend API (Port 4000, Opsional)
```powershell
cd D:\LOMBA\WEB\Backend
npm start
```

### C. Menjalankan Suite Pengujian Otomatis
```powershell
cd D:\LOMBA\WEB\frontend
npm run build
node D:\LOMBA\WEB\tests\test_engines.mjs
py -3 D:\LOMBA\WEB\tests\verify_suite.py
```

---

## 4. Panduan Deploy Vercel & Naskah Presentasi Demo

Panduan lengkap langkah demi langkah deploy ke Vercel dan naskah script presentasi demo 3 menit dapat dibaca langsung pada:
📄 **[`DOKUMENTASI_DAN_SCRIPT_DEMO.md`](./DOKUMENTASI_DAN_SCRIPT_DEMO.md)**
- Langkah Deploy Vercel (Metode GitHub & Vercel CLI)
- Ringkasan Fitur & Alur Penggunaan
- Naskah Script Demo Lengkap dengan Petunjuk Aksi Layar (*Cues*)
