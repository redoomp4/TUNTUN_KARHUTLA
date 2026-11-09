# TUNTUN — Backend API (`D:\LOMBA\WEB\Backend`)

Arsitektur Backend *Stateless* (tanpa penyimpanan data pribadi sesuai **NFR-07** & **NFR-12**) untuk **TUNTUN — Digital Guardian**.

## Struktur Direktori Backend
```text
Backend/
├── package.json                  # Konfigurasi modul Node.js ESM
├── README.md                     # Dokumentasi endpoint Backend
└── src/
    ├── server.js                 # HTTP REST API Server (Port 4000)
    ├── controllers/
    │   ├── scanController.js     # Handler inspeksi pesan, URL & Magic-Bytes biner
    │   └── aiChatController.js   # Proxy AI Hibrida Gratis + Guardrail Deterministik
    └── services/
        └── engineBridge.js       # Jembatan modul mesin deterministik (shared)
```

## Daftar Endpoint REST API
| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status kesehatan server & daftar aturan `R-01..R-10` |
| `POST` | `/api/scan/message` | Evaluasi heuristik pesan/SMS/URL + balasan aman |
| `POST` | `/api/scan/binary` | Evaluasi *Magic Bytes* heksadesimal berkas (`.APK` vs `.PDF`) |
| `POST` | `/api/ai/chat` | Chatbot latihan simulasi (AI Gratis + Guardrail Deterministik) |
| `POST` | `/api/ai/analyze` | Analisis motif & konteks pesan berbasis AI Hibrida |
| `POST` | `/api/report/build` | Generator draf laporan resmi Bank / OJK 157 / Kepolisian |
