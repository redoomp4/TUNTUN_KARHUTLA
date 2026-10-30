# DOKUMEN SYSTEM DESIGN — DIGITAL GUARDIAN
**Tema:** *"Guardians of the Digital Space — Empowering Today's Generation."*  
**Pendekatan Frontend & UI:** React 18 (TypeScript + Vite) dengan Minimalist *"Software"* Design System (`frontend-design` Skill)  
**Peran Perancang:** Senior Software Architect, System Analyst, & Software Engineer  

---

## PENDAHULUAN DAN GAMBARAN UMUM SISTEM

**Digital Guardian** adalah platform pembelajaran keamanan siber interaktif berbasis web (*Single-Page Application* menggunakan **React**) yang dirancang untuk melatih generasi muda Indonesia dalam mengenali, menganalisis, dan merespons berbagai ancaman penipuan digital (*digital scam*), *phishing*, dan rekayasa sosial (*social engineering*).

Berbeda dengan portal artikel pasif, Digital Guardian menempatkan pengguna (*Pemain*) di dalam situasi pengambilan keputusan nyata secara aman melalui empat modul terintegrasi:
1. **Scam Simulator**: Simulasi percakapan interaktif bercabang (*branching narrative*) dengan karakter fiktif untuk melatih refleks keputusan saat menghadapi manipulasi psikologis, permintaan *One-Time Password* (OTP), file `.APK` berbahaya, atau tawaran kerja fiktif.
2. **Scam Detective**: Modul investigasi kasus berbasis bukti (*evidence inspection*) di mana pemain mengidentifikasi indikator risiko (*red flags*) dari pesan, profil pengirim, klaim, dan tautan fiktif.
3. **Action Guide**: Panduan tanggap insiden (*incident response guide*) kontekstual berdasarkan 4 tahapan kritis paparan risiko.
4. **Guardian Profile**: Evaluasi hasil sesi pembelajaran secara deterministik yang merangkum skor, keputusan berisiko, indikator risiko yang terlewat, dan rekomendasi latihan ulang.

Secara visual dan antarmuka, sistem mengadopsi **Minimalist "Software" Design System** sesuai prinsip `frontend-design`: menggunakan permukaan terang yang bersih (`#fcfcfd`), tipografi tegas tanpa dekorasi berlebihan (`Host Grotesk` & `Instrument Sans`), warna aksi *electric-blue* (`#074ce0`) yang disiplin, serta transisi *continuous dark field* (`#16191f`) khusus pada area fokus simulasi dan ringkasan akhir.

---

## BAGIAN 1 — ANALISIS KEBUTUHAN DAN RUANG LINGKUP

### 1.1 Masalah Utama yang Ingin Diselesaikan
Generasi muda Indonesia memiliki tingkat penetrasi internet yang tinggi, namun masih rentan terhadap rekayasa sosial karena:
1. **Kesulitan Mengenali Indikator Penipuan**: Tidak menyadari tanda-tanda pesan penipuan (*urgency manipulation*, *typosquatting domain*, nomor tidak resmi).
2. **Mudah Terpikat Tawaran Manipulatif**: Mudah percaya pada undian hadiah, komisi tugas paruh waktu, investasi instan, atau kurir paket berformat `.apk`.
3. **Kurangnya Pemahaman Risiko Kredensial**: Belum memahami bahaya fatal membagikan kode OTP, PIN, *password*, atau izin baca SMS aplikasi.
4. **Kebingungan Saat Menerima Pesan Mencurigakan**: Tidak tahu cara memverifikasi kebenaran informasi melalui kanal independen.
5. **Kepanikan Pasca-Insiden**: Tidak mengetahui langkah mitigasi darurat ketika terlanjur mengeklik tautan *phishing*, menyerahkan OTP, atau mentransfer dana.

### 1.2 Tujuan Sistem
1. Menyediakan lingkungan simulasi tanpa risiko (*safe sandbox*) untuk melatih pengambilan keputusan menghadapi *scam*.
2. Melatih ketelitian analitis pengguna dalam membedakan pesan aman dan pesan berbahaya berdasarkan indikator risiko objektif.
3. Memberikan umpan balik (*feedback*) edukatif secara instan dan deterministik atas setiap pilihan tindakan.
4. Menyediakan panduan mitigasi darurat (*Action Guide*) yang terstruktur sesuai tingkat keterlanjuran pengguna.
5. Memberikan evaluasi sesi (*Guardian Profile*) yang transparan tanpa mengumpulkan data pribadi pengguna.

### 1.3 Aktor yang Terlibat
Pada ruang lingkup **MVP (Minimum Viable Product)**, sistem hanya memiliki **1 Aktor Utama**:
- **Pemain (Pengguna / Generasi Muda)**: Individu yang mengakses aplikasi web untuk menjalankan simulasi, melakukan investigasi kasus, membaca panduan tindakan, dan melihat evaluasi hasil sesi pembelajarannya.
- *Catatan Arsitektur Mengenai Aktor Lain*:
  - **Admin** *tidak dimasukkan* ke dalam MVP karena skenario dikelola secara terstruktur melalui kode/berkas JSON statis yang tervalidasi pada repositori (*Git-based content management*).
  - **AI Agent** dan **Database** bukan merupakan aktor eksternal, melainkan komponen internal implementasi (di mana AI tidak diwajibkan pada MVP).

### 1.4 Kebutuhan Bisnis (Business Requirements)
1. Aplikasi harus dapat langsung dimainkan (*zero-friction onboarding*) tanpa kewajiban registrasi atau *login* agar tingkat partisipasi pengguna maksimal.
2. Biaya operasional dan infrastruktur harus minimal namun memiliki ketersediaan tinggi dan dapat diakses melalui URL publik untuk keperluan demonstrasi, pengujian pengguna, dan penilaian juri.
3. Seluruh konten simulasi harus 100% fiktif dan bebas dari risiko hukum maupun penyalahgunaan (tidak memuat tautan berbahaya aktif).

### 1.5 Kebutuhan Pengguna (User Needs)
1. Antarmuka yang minimalis, cepat, bebas distraksi visual, dan nyaman dibaca di perangkat *mobile* maupun *desktop*.
2. Alur simulasi yang terasa nyata dengan pilihan respons yang masuk akal dan konsekuensi percakapan yang benar-benar berubah sesuai pilihan.
3. Penjelasan yang mudah dipahami (bukan jargon teknis yang rumit) mengenai *mengapa* suatu pilihan berbahaya atau aman.
4. Panduan langkah demi langkah yang langsung dapat dipraktikkan saat menghadapi situasi darurat penipuan.

### 1.6 Batasan dan Asumsi Sistem
#### Batasan Sistem (Constraints):
1. **Tanpa Registrasi/Login**: MVP tidak memiliki fitur pembuatan akun atau autentikasi.
2. **Akses Langsung**: Pengguna langsung berinteraksi dengan modul pembelajaran saat membuka aplikasi.
3. **Rule-Based Deterministik**: Skenario dan penilaian menggunakan aturan terstruktur (*deterministic rule engine*), bukan *probabilistic LLM* pada MVP.
4. **Sesi Sementara (Ephemeral Session)**: Progres disimpan selama sesi aktif di peramban (`React State` + `sessionStorage`) dan tidak membutuhkan pelacakan lintas perangkat.
5. **Data 100% Fiktif & Aman**: Dilarang meminta data pribadi nyata (OTP, *password*, nomor rekening) dan dilarang menggunakan domain *phishing* aktif atau file `.apk` sungguhan.
6. **Transparansi Edukasi**: Sistem wajib menyertakan *disclaimer* bahwa skor sesi adalah sarana edukasi, bukan jaminan mutlak bebas penipuan.

#### Asumsi Teknis & Dampaknya terhadap Desain:
| No | Asumsi Teknis | Dampak terhadap Desain Sistem |
| :--- | :--- | :--- |
| **A-01** | Jumlah skenario awal berkisar antara 5–15 skenario Simulator dan 5–15 kasus Detective dengan ukuran payload data < 200 KB. | Data skenario dapat dibundel sebagai modul JSON statis bertipe kuat (*strongly-typed TypeScript JSON*) atau disajikan melalui API ringan tanpa latensi query kompleks. |
| **A-02** | Pengguna mayoritas mengakses aplikasi melalui peramban ponsel pintar (Chrome Android / Safari iOS) dan laptop. | Desain komponen React wajib mengutamakan *responsive layout* (breakpoint `1050px`, `760px`, `480px`) dan target sentuh (*touch target*) minimal `44x44px`. |
| **A-03** | Pengguna mungkin tidak sengaja memuat ulang (*refresh*) halaman di tengah simulasi. | State sesi di React disinkronkan ke `window.sessionStorage` agar sesi yang sedang berjalan tidak hilang saat *page reload*, namun otomatis bersih saat tab ditutup. |

### 1.7 Pembagian Fitur MVP vs Pengembangan Berikutnya (MoSCoW Prioritization)

| Prioritas | Kode & Nama Fitur | Status Ruang Lingkup | Alasan Pemilihan |
| :--- | :--- | :--- | :--- |
| **Must Have** | **M-01**: Landing & Navigasi Mode Minimalis (*Software Design System*) | **MVP** | Pintu masuk utama aplikasi dan orientasi pengguna terhadap 4 modul. |
| **Must Have** | **M-02**: *Scam Simulator* dengan Percabangan Nyata (*True Branching Node*) | **MVP** | Fitur inti untuk melatih pengambilan keputusan interaktif dalam percakapan. |
| **Must Have** | **M-03**: *Deterministic Scoring & Immediate Feedback Engine* | **MVP** | Memberikan alasan edukatif dan konsekuensi langsung di setiap tahapan pilihan. |
| **Must Have** | **M-04**: *Scam Detective* (Inspeksi Bukti & Evaluasi Indikator Risiko) | **MVP** | Fitur inti untuk melatih analisis bukti dan mengenali *red flags* penipuan. |
| **Must Have** | **M-05**: *Action Guide* (Panduan 4 Situasi Tanggap Insiden) | **MVP** | Fitur krusial untuk mitigasi darurat sesuai kondisi pengguna. |
| **Must Have** | **M-06**: *Guardian Profile* (Ringkasan Skor Sesi, Kesalahan, & Rekomendasi) | **MVP** | Evaluasi akhir sesi pembelajaran dan umpan balik komprehensif. |
| **Must Have** | **M-07**: Reset / Pengulangan Sesi Baru & Validasi Input | **MVP** | Menjamin pengujian ulang tidak mencampur skor sesi lama dan bebas dari *invalid state*. |
| **Should Have** | **S-01**: Penyimpanan Sesi Sementara pada `sessionStorage` | **MVP** | Mencegah hilangnya progres saat pengguna tidak sengaja me-*refresh* halaman. |
| **Should Have** | **S-02**: Integrasi Rekomendasi *Action Guide* dari Hasil *Detective/Simulator* | **MVP** | Menghubungkan indikator risiko yang terlewat dengan langkah panduan yang relevan. |
| **Could Have** | **C-01**: Backend REST API + PostgreSQL untuk Pencatatan Analitik Anonim | **Opsional / Fase 2** | Berguna jika tim ingin menganalisis skenario mana yang paling sering menjebak pengguna secara agregat. |
| **Could Have** | **C-02**: *Admin CMS Dashboard* untuk CRUD Skenario secara Dinamis | **Ditunda (Post-MVP)** | Pada MVP, pengelolaan skenario melalui file JSON terstruktur jauh lebih cepat, aman, dan bebas *overhead* autentikasi. |
| **Could Have** | **C-03**: *AI Dynamic Dialogue & Custom Scam Message Analyzer* | **Ditunda (Post-MVP)** | Membutuhkan biaya API LLM, *rate limiting* ketat, dan moderasi keamanan agar hasil penilaian tetap konsisten. |
| **Could Have** | **C-04**: Akun Pengguna, *Leaderboard*, dan Lencana (*Badges*) Permanen | **Ditunda (Post-MVP)** | Bertentangan dengan batasan MVP tanpa login dan prinsip minimalisasi data. |

---

## BAGIAN 2 — FUNCTIONAL DAN NON-FUNCTIONAL REQUIREMENTS

### 2.1 Functional Requirements (Kebutuhan Fungsional)
Seluruh kebutuhan fungsional diselaraskan dengan spesifikasi referensi sistem (`FR-01` s.d. `FR-14`):

| ID | Kebutuhan Fungsional | Deskripsi | Prioritas | Kriteria Penerimaan (Acceptance Criteria - Dapat Diuji) |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Menampilkan Halaman Utama | Sistem menampilkan informasi singkat tentang Digital Guardian, pengantar visual (*hero diagram*), dan pilihan mode pembelajaran. | Must Have | 1. Halaman utama menampilkan judul, deskripsi singkat, dan navigasi ke *Scam Simulator*, *Scam Detective*, *Action Guide*, serta *Guardian Profile*.<br>2. Menampilkan *disclaimer* bahwa seluruh skenario bersifat fiktif. |
| **FR-02** | Memilih Mode dan Skenario | Pemain dapat memilih mode *Scam Simulator* atau *Scam Detective* serta memilih skenario/kasus fiktif yang tersedia. | Must Have | 1. Daftar skenario menampilkan judul, deskripsi singkat, kategori ancaman, dan tingkat kesulitan.<br>2. Saat skenario diklik, sistem memuat data skenario yang dipilih tanpa *error*. |
| **FR-03** | Membuat Sesi Pembelajaran | Sistem membuat sesi pembelajaran baru (`LEARNING_SESSION`) setiap kali pemain memulai sebuah skenario. | Must Have | 1. Sistem membangkitkan `session_id` unik dengan `status = IN_PROGRESS` dan skor awal terdefinisi.<br>2. Riwayat jawaban pada sesi aktif dimulai dari kondisi kosong (`[]`). |
| **FR-04** | Menampilkan Percakapan Simulasi | Sistem menampilkan pesan karakter fiktif secara bertahap dan daftar pilihan tindakan sesuai `SCENARIO_NODE` aktif. | Must Have | 1. Menampilkan identitas fiktif pengirim, isi pesan pada node saat ini, dan minimal 2 tombol pilihan tindakan.<br>2. Teks pesan tidak mengandung tautan berbahaya aktif. |
| **FR-05** | Memproses Pilihan Pemain | Sistem memproses `choice_id` yang dipilih pemain dan menentukan cabang percakapan (`next_node_id`) berikutnya. | Must Have | 1. Pilihan berbeda yang memiliki `next_node_id` berbeda harus membawa pemain ke pesan/node percakapan yang berbeda pula (*true branching*).<br>2. Jika `next_node_id` bernilai `null`, sistem menandai alur percakapan skenario selesai. |
| **FR-06** | Mengevaluasi Keputusan Simulasi | Sistem menilai keputusan pemain secara deterministik berdasarkan bobot skor (`score_delta`) dan tingkat risiko (`risk_level`) pada aturan pilihan. | Must Have | 1. Pilihan yang sama pada kondisi node yang sama selalu menghasilkan perubahan skor dan label tingkat risiko (`SAFE`, `RISKY`, `DANGEROUS`, `BEST`) yang identik.<br>2. Jawaban "Ya/Lanjut" pada konteks verifikasi resmi dinilai aman (kontekstual, bukan sekadar menghukum kata "Ya"). |
| **FR-07** | Menampilkan Feedback Keputusan | Sistem menampilkan penjelasan edukatif mengapa suatu keputusan dinilai aman atau berisiko beserta konsekuensi langsungnya. | Must Have | 1. Setelah pemain memilih tindakan, panel *feedback* langsung tampil memuat judul evaluasi, alasan analisis risiko, dan konsekuensi situasi.<br>2. Pemain dapat membaca *feedback* sebelum lanjut ke node berikutnya atau hasil akhir. |
| **FR-08** | Menampilkan Bukti Investigasi | Pada *Scam Detective*, sistem menampilkan informasi kasus, pesan, profil pengirim fiktif, klaim, atau bukti lain (`SCENARIO_EVIDENCE`) untuk diperiksa. | Must Have | 1. Seluruh bukti kasus ditampilkan dengan jelas (misal: metadata pengirim, isi pesan, URL pratinjau fiktif, lampiran fiktif).<br>2. Menampilkan daftar opsi indikator risiko (`RISK_INDICATOR`) yang dapat dipilih pemain. |
| **FR-09** | Mengevaluasi Indikator Risiko | Sistem membandingkan indikator risiko yang dipilih pemain dengan indikator target (`SCENARIO_INDICATOR`) pada kasus tersebut. | Must Have | 1. Sistem menghitung jumlah indikator yang **Tepat** (*True Positive*), **Tidak Tepat** (*False Positive*), dan **Terlewat** (*False Negative*).<br>2. Sistem menampilkan penjelasan bukti pendukung (`EVIDENCE_INDICATOR`) untuk setiap indikator target serta edukasi bahwa satu tanda mencurigakan perlu dilihat secara utuh. |
| **FR-10** | Menampilkan Action Guide | Sistem menyediakan panduan langkah penanganan berdasarkan 4 situasi kritis yang dipilih pemain atau berdasarkan temuan risiko. | Must Have | 1. Mendukung 4 situasi: (1) Baru menerima pesan mencurigakan, (2) Sudah mengeklik tautan, (3) Sudah memasukkan kata sandi/OTP, (4) Sudah melakukan transfer uang.<br>2. Menampilkan langkah mitigasi berurutan, rekomendasi kanal resmi, dan *disclaimer* bahwa pemulihan dana/akun tidak dijamin pasti berhasil. |
| **FR-11** | Menghitung Hasil Pembelajaran | Sistem menghitung skor akhir sesi dan merangkum performa pemain selama satu sesi (`SESSION_RESULT`). | Must Have | 1. Skor akhir dihitung secara deterministik pada rentang `0–100` berdasarkan akumulasi keputusan Simulator dan/atau ketepatan indikator Detective.<br>2. Menghasilkan daftar keputusan berisiko, indikator terlewat, dan kategori kemampuan yang sudah baik. |
| **FR-12** | Menampilkan Guardian Profile | Sistem menampilkan ringkasan evaluasi sesi (*Guardian Profile*) berisi skor, rincian ketepatan, indikator terlewat, dan rekomendasi latihan. | Must Have | 1. Menampilkan kartu metrik skor sesi, jumlah keputusan tepat, keputusan berisiko, dan indikator terlewat.<br>2. Menampilkan rekomendasi spesifik materi/*Action Guide* atau skenario yang perlu dipelajari kembali. |
| **FR-13** | Mengulang Skenario (Reset Sesi) | Pemain dapat mengulangi skenario atau mereset sesi menggunakan `LEARNING_SESSION` baru agar hasil percobaan tidak tercampur. | Must Have | 1. Menekan tombol "Ulangi Skenario" atau "Reset Sesi" membuat `session_id` baru dan mengembalikan node ke tahap awal.<br>2. Skor dan jawaban dari sesi sebelumnya tidak mencemari perhitungan sesi baru. |
| **FR-14** | Menangani Jawaban Tidak Valid | Sistem memvalidasi input pilihan pemain, mencegah pengiriman jawaban kosong/tidak sah, dan menampilkan pesan arah yang jelas. | Must Have | 1. Jika pemain menekan "Evaluasi Bukti" pada *Scam Detective* tanpa memilih satu pun indikator, sistem menolak pemrosesan dan menampilkan pesan instruktif.<br>2. Sistem menolak `choice_id` atau `indicator_id` yang bukan milik skenario yang sedang aktif. |

---

### 2.2 Non-Functional Requirements (Kebutuhan Non-Fungsional)
Disusun berdasarkan kategori standar rekayasa perangkat lunak dan diselaraskan dengan `NFR-01` s.d. `NFR-12`:

| ID | Kategori | Deskripsi Kebutuhan | Indikator / Metrik Pengujian (Target Desain) |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Usability** (Kemudahan Penggunaan) | Antarmuka mudah dipahami oleh generasi muda tanpa latar belakang teknis keamanan siber; menggunakan bahasa aktif dan jelas. | Pengguna baru dapat memulai simulasi maksimal dalam **2 klik** dari halaman utama tanpa membaca panduan eksternal. |
| **NFR-02** | **Compatibility & Responsiveness** | Tata letak beradaptasi secara mulus pada layar *desktop*, *tablet*, dan ponsel sesuai *breakpoint* sistem desain. | Tidak ada *horizontal overflow* pada lebar layar `360px` (Mobile), `760px` (Tablet), `1050px` (Compact Desktop), hingga `1440px+`. |
| **NFR-03** | **Performance** (Kinerja) | Transisi percabangan simulasi, evaluasi bukti, dan kalkulasi skor berjalan cepat tanpa jeda yang mengganggu fokus belajar. | Waktu respons pemrosesan pilihan lokal di React **< 100 ms** (target desain maksimal **≤ 2 detik** pada jaringan 4G normal). *First Contentful Paint* (FCP) target desain **≤ 1.5 detik**. |
| **NFR-04** | **Availability** (Ketersediaan) | Aplikasi dapat diakses kapan saja melalui URL publik untuk keperluan edukasi dan pengujian juri. | Target desain ketersediaan layanan hosting statis/CDN **≥ 99.5%** selama masa pengujian/kompetisi. |
| **NFR-05** | **Security** (Keamanan Aplikasi) | Seluruh input divalidasi ketat; terbebas dari kerentanan *Cross-Site Scripting* (XSS), injeksi konten, maupun tautan *phishing* sungguhan. | **0 penggunaan** `dangerouslySetInnerHTML` tanpa sanitasi; seluruh URL dalam bukti skenario menggunakan protokol non-aktif atau domain reservasi contoh (`.example` / teks statis); *Content Security Policy* (CSP) aktif. |
| **NFR-06** | **Privacy** (Privasi Pengguna) | Sistem tidak pernah meminta kata sandi asli, OTP nyata, nomor rekening, atau data pribadi sensitif pengguna. | **0 kolom input bebas (free-text)** yang meminta kredensial/PII pada seluruh alur simulasi. |
| **NFR-07** | **Privacy & Data Minimization** | MVP tidak mengumpulkan identitas pengguna dan tidak menyimpan riwayat sesi secara permanen tanpa alasan yang jelas. | Penyimpanan sesi hanya menggunakan memori React / `sessionStorage` lokal yang otomatis terhapus ketika tab peramban ditutup. |
| **NFR-08** | **Reliability & Consistency** | Mesin penilai (*Scoring & Rule Engine*) bersifat deterministik dan menghasilkan output yang konsisten. | Input himpunan pilihan yang sama pada versi skenario yang sama menghasilkan output skor dan *feedback* yang **100% identik** pada pengujian berulang (*unit test*). |
| **NFR-09** | **Accessibility** (Aksesibilitas) | Mendukung navigasi papan ketik (*keyboard navigation*), indikator fokus terlihat jelas, rasio kontras memadai, dan menghormati preferensi *reduced motion*. | Rasio kontras teks utama terhadap latar **≥ 4.5:1** (WCAG AA); *focus ring* `2px solid #074ce0` terlihat saat tombol `Tab` ditekan; `@media (prefers-reduced-motion: reduce)` menonaktifkan transisi gerak; status aman/bahaya disertai ikon & label teks (bukan warna saja). |
| **NFR-10** | **Maintainability** (Kemudahan Pemeliharaan) | Data skenario, node, pilihan, bukti, indikator, dan panduan dipisahkan dari kode komponen UI React. | Penambahan 1 skenario baru hanya memerlukan penambahan objek pada katalog data tervalidasi TypeScript/JSON tanpa mengubah logika komponen React. |
| **NFR-11** | **Compatibility** (Kompatibilitas Browser) | Berjalan konsisten pada peramban modern lintas sistem operasi. | Teruji berjalan tanpa *runtime error* pada 2 versi terbaru Google Chrome, Microsoft Edge, Mozilla Firefox, dan Apple Safari. |
| **NFR-12** | **Transparency** (Transparansi) | Sistem secara eksplisit menyatakan sifat fiktif skenario dan batasan hasil evaluasi. | Terdapat *banner/notice* eksplisit pada *Action Guide* dan *Guardian Profile* bahwa evaluasi bersifat edukatif dan bukan jaminan deteksi *scam* 100%. |

> **Catatan Perbedaan Target Desain vs Hasil Pengujian Aktual:**  
> Angka metrik pada tabel di atas (seperti waktu respons ≤ 2 detik dan FCP ≤ 1.5 detik) merupakan **Target Desain (Design Targets)** sebagai acuan rekayasa. Hasil pengujian aktual baru diperoleh setelah *build* produksi diuji menggunakan *Lighthouse* / *WebPageTest* pada URL *deployment*.

---

## BAGIAN 3 — USE CASE DIAGRAM DAN DESKRIPSI USE CASE

### 3.1 Analisis Aktor dan Pemisahan Tujuan Pengguna vs Proses Internal
- **Aktor MVP**: Hanya **Pemain**. Admin tidak diperlukan pada MVP karena skenario tidak diubah secara dinamis oleh pengguna akhir.
- **Pemisahan Fungsi Internal**: Proses seperti *"Menghitung Skor"*, *"Memvalidasi Input"*, atau *"Mengambil Node dari JSON"* adalah **proses internal sistem**, sehingga **tidak** dijadikan Use Case tersendiri, melainkan bagian dari *Main/Alternative Flow* di dalam Use Case yang memiliki nilai tujuan langsung bagi Pemain.
- **Ketepatan Relasi `<<include>>` dan `<<extend>>`**:
  - `UC-03 (Memainkan Scam Simulator)` selalu membutuhkan tindakan memilih keputusan (`UC-04`) dan selalu menampilkan umpan balik konsekuensi (`UC-05`), sehingga menggunakan relasi `<<include>>`.
  - `UC-06 (Menyelidiki Kasus Scam Detective)` selalu membutuhkan pemilihan indikator risiko (`UC-07`) dan melihat hasil evaluasi investigasi (`UC-08`), sehingga menggunakan relasi `<<include>>`.
  - `UC-09 (Mendapatkan Panduan Tindakan Aman / Action Guide)` dapat diakses secara mandiri oleh Pemain kapan saja, **atau** dibuka sebagai tindak lanjut opsional ketika Pemain melihat *feedback* simulasi (`UC-05`) maupun hasil investigasi (`UC-08`). Oleh karena itu, hubungannya dengan `UC-05` dan `UC-08` menggunakan relasi **`<<extend>>`** (bukan `<<include>>`, karena pemain tidak selalu diwajibkan membuka panduan pada setiap kasus).

### 3.2 Use Case Diagram (PlantUML)

```plantuml
@startuml DigitalGuardian_UseCaseDiagram
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false
skinparam Monochrome false
skinparam ActorBorderColor #16191f
skinparam ActorBackgroundColor #fcfcfd
skinparam UseCaseBorderColor #074ce0
skinparam UseCaseBackgroundColor #ffffff
skinparam ArrowColor #454c58

actor "Pemain\n(Generasi Muda)" as Player

rectangle "Sistem Aplikasi Web Digital Guardian (MVP)" {
    usecase "UC-01: Memulai Sesi\nPembelajaran" as UC01
    usecase "UC-02: Memilih Mode\ndan Skenario" as UC02
    
    package "Modul Scam Simulator" {
        usecase "UC-03: Memainkan\nScam Simulator" as UC03
        usecase "UC-04: Memilih Tindakan\ndalam Simulasi" as UC04
        usecase "UC-05: Melihat Feedback\ndan Konsekuensi" as UC05
    }
    
    package "Modul Scam Detective" {
        usecase "UC-06: Menyelidiki Kasus\nScam Detective" as UC06
        usecase "UC-07: Memilih Indikator\nRisiko" as UC07
        usecase "UC-08: Melihat Hasil\nInvestigasi" as UC08
    }
    
    package "Modul Panduan & Evaluasi" {
        usecase "UC-09: Mendapatkan Panduan\nTindakan Aman (Action Guide)" as UC09
        usecase "UC-10: Melihat Hasil Pembelajaran\n(Guardian Profile)" as UC10
        usecase "UC-11: Mengulang Skenario\n(Sesi Baru)" as UC11
    }
}

' Relasi Aktor ke Use Case Utama
Player --> UC01
Player --> UC02
Player --> UC03
Player --> UC06
Player --> UC09
Player --> UC10
Player --> UC11

' Relasi Include (Selalu dijalankan)
UC01 ..> UC02 : <<include>>
UC03 ..> UC04 : <<include>>
UC04 ..> UC05 : <<include>>
UC06 ..> UC07 : <<include>>
UC07 ..> UC08 : <<include>>

' Relasi Extend (Opsional / Kondisional berdasarkan konteks)
UC09 ..> UC05 : <<extend>>\n(jika butuh langkah mitigasi)
UC09 ..> UC08 : <<extend>>\n(jika ingin lihat tindak lanjut)
UC11 ..> UC10 : <<extend>>\n(jika ingin latihan ulang)

@enduml
```

#### Penjelasan Use Case Diagram:
Diagram di atas memetakan 11 Use Case (`UC-01` s.d. `UC-11`) yang berpusat pada tujuan Pemain. Pemain dapat langsung memulai sesi dan memilih skenario (`UC-01`, `UC-02`), berlatih di *Scam Simulator* (`UC-03` beserta `UC-04` dan `UC-05`), menginvestigasi kasus di *Scam Detective* (`UC-06` beserta `UC-07` dan `UC-08`), membuka *Action Guide* (`UC-09`) baik secara langsung maupun sebagai perluasan (`<<extend>>`) dari hasil evaluasi, meninjau rangkasan *Guardian Profile* (`UC-10`), serta mengulang skenario pada sesi baru (`UC-11`).

### 3.3 Tabel Deskripsi Use Case dan Keterkaitan dengan Functional Requirements

| ID Use Case | Nama Use Case | Aktor | Tujuan | Precondition | Main Flow (Alur Utama) | Alternative / Exception Flow | Postcondition | Relasi FR |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Memulai Sesi Pembelajaran | Pemain | Memulai kegiatan belajar interaktif di Digital Guardian. | Pemain membuka URL aplikasi Digital Guardian di peramban. | 1. Sistem merender halaman utama dengan informasi pengantar dan pilihan modul.<br>2. Pemain menekan tombol mulai latihan.<br>3. Sistem menginisialisasi konteks sesi (`LEARNING_SESSION`) dan mengarahkan ke pemilihan mode/skenario (`UC-02`). | **A1**: Jika terdapat sesi aktif di `sessionStorage`, sistem memulihkan state sesi tersebut atau mengizinkan pemain memulai sesi baru. | Sesi pembelajaran aktif tersedia di memori aplikasi. | FR-01, FR-03 |
| **UC-02** | Memilih Mode dan Skenario | Pemain | Menentukan mode latihan (*Simulator* atau *Detective*) beserta skenario spesifik. | Halaman utama atau pemilih modul telah tampil. | 1. Pemain memilih tab/bagian *Scam Simulator* atau *Scam Detective*.<br>2. Sistem menampilkan daftar skenario pada mode tersebut.<br>3. Pemain memilih salah satu skenario.<br>4. Sistem membuat sesi baru untuk skenario terpilih dan memuat data awalnya. | **A1**: Pemain berpindah skenario saat skenario lama belum selesai -> Sistem mereset sesi skenario tersebut menjadi sesi baru yang bersih. | Skenario terpilih siap dimainkan pada sesi aktif. | FR-02, FR-03 |
| **UC-03** | Memainkan Scam Simulator | Pemain | Mengikuti simulasi percakapan interaktif bercabang sampai selesai. | Pemain telah memilih skenario bertipe `SIMULATOR`. | 1. Sistem menampilkan identitas pengirim fiktif dan pesan pada node awal (`SCENARIO_NODE`).<br>2. Pemain menjalankan pemilihan tindakan (`UC-04`) dan membaca *feedback* (`UC-05`).<br>3. Sistem memuat node cabang berikutnya sesuai pilihan pemain hingga mencapai node akhir (`next_node_id = null`). | **A1**: Pilihan pemain memicu kondisi *Game Over* / kompromi fatal lebih awal -> Sistem langsung menampilkan *feedback* akhir dan menyelesaikan skenario. | Skenario simulasi selesai dan skor tercatat pada hasil sesi. | FR-04, FR-05 |
| **UC-04** | Memilih Tindakan dalam Simulasi | Pemain | Menentukan respons/keputusan terhadap pesan mencurigakan di setiap tahap. | Node percakapan aktif dan daftar pilihan (`CHOICE`) ditampilkan. | 1. Pemain membaca pesan karakter fiktif.<br>2. Pemain memilih salah satu opsi respons.<br>3. Sistem memvalidasi bahwa `choice_id` sah untuk node aktif.<br>4. Sistem mengevaluasi bobot skor (`score_delta`) dan tingkat risiko pilihan, lalu mencatatnya ke `SESSION_ANSWER`. | **E1 (FR-14)**: Jika `choice_id` tidak valid atau sudah pernah dikirim pada step yang sama, sistem menolak aksi ganda dan mempertahankan konsistensi state. | Keputusan pemain tercatat dan siap ditampilkan umpan baliknya. | FR-05, FR-06, FR-14 |
| **UC-05** | Melihat Feedback dan Konsekuensi | Pemain | Memahami tingkat risiko, alasan keamanan, dan dampak dari pilihan yang diambil. | Pemain baru saja memilih tindakan pada `UC-04`. | 1. Sistem menampilkan kartu *feedback* berisi status risiko, penjelasan edukatif, dan konsekuensi.<br>2. Pemain membaca penjelasan.<br>3. Pemain menekan tombol lanjut ke tahap berikutnya (atau lihat evaluasi akhir jika skenario berakhir). | **A1 (`<<extend>>` ke UC-09)**: Jika keputusan pemain berisiko tinggi, sistem menampilkan tautan cepat menuju situasi *Action Guide* yang relevan. | Pemain memahami alasan di balik evaluasi keputusannya. | FR-07 |
| **UC-06** | Menyelidiki Kasus Scam Detective | Pemain | Memeriksa bukti-bukti kasus fiktif untuk mengidentifikasi indikasi penipuan. | Pemain telah memilih skenario bertipe `DETECTIVE`. | 1. Sistem menampilkan deskripsi kasus dan daftar bukti (`SCENARIO_EVIDENCE` seperti profil pengirim, isi pesan, tautan fiktif).<br>2. Pemain memeriksa bukti satu per satu.<br>3. Pemain memilih indikator risiko (`UC-07`) dan mengevaluasi hasil investigasi (`UC-08`). | **A1**: Pemain meninjau ulang bukti dan mengubah pilihan indikator sebelum menekan tombol kirim. | Kasus selesai diselidiki dan nilai investigasi tercatat. | FR-08 |
| **UC-07** | Memilih Indikator Risiko | Pemain | Menandai petunjuk/indikator yang dianggap mencurigakan pada kasus. | Bukti kasus dan daftar indikator (`RISK_INDICATOR`) telah tampil. | 1. Pemain memilih satu atau lebih indikator risiko pada matriks pilihan.<br>2. Pemain menekan tombol "Evaluasi Bukti Investigasi".<br>3. Sistem memvalidasi bahwa minimal 1 indikator telah dipilih.<br>4. Sistem menyimpan pilihan ke `SESSION_ANSWER`. | **E1 (FR-14)**: Pemain menekan tombol evaluasi tanpa memilih satu pun indikator -> Sistem membatalkan evaluasi dan menampilkan pesan peringatan *"Pilih minimal satu indikator risiko terlebih dahulu."* | Daftar indikator pilihan pemain tervalidasi untuk dievaluasi. | FR-08, FR-09, FR-14 |
| **UC-08** | Melihat Hasil Investigasi | Pemain | Mengetahui ketepatan indikator yang dipilih, indikator yang terlewat, dan penjelasan buktinya. | Pemain telah mengirimkan pilihan indikator yang valid pada `UC-07`. | 1. Sistem membandingkan pilihan pemain dengan `SCENARIO_INDICATOR` target.<br>2. Sistem menghitung jumlah indikator **Tepat**, **Tidak Tepat (Keliru)**, dan **Terlewat**.<br>3. Sistem menampilkan rincian evaluasi beserta penjelasan bukti pendukung (`EVIDENCE_INDICATOR`). | **A1 (`<<extend>>` ke UC-09)**: Pemain menekan rekomendasi panduan tindakan terkait indikator yang ditemukan/terlewat. | Hasil investigasi tampil dan terakumulasi ke sesi pembelajaran. | FR-09, FR-11 |
| **UC-09** | Mendapatkan Panduan Tindakan Aman | Pemain | Memperoleh langkah penanganan insiden yang tepat sesuai situasi yang dihadapi. | Pemain membuka bagian *Action Guide* atau mengeklik rujukan dari hasil evaluasi. | 1. Sistem menampilkan 4 kategori situasi insiden.<br>2. Pemain memilih situasi yang dialami (misal: *Sudah memasukkan OTP*).<br>3. Sistem menampilkan daftar langkah penanganan berurutan, rujukan kanal resmi, dan *disclaimer* edukasi. | **A1**: Pemain membuka beberapa situasi secara bergantian menggunakan komponen *native disclosure* (`<details>`). | Pemain mendapatkan informasi langkah mitigasi yang relevan. | FR-10 |
| **UC-10** | Melihat Hasil Pembelajaran (Guardian Profile) | Pemain | Melihat rangkuman skor sesi, keputusan berisiko, indikator terlewat, dan rekomendasi belajar. | Minimal satu skenario Simulator atau Detective telah diselesaikan dalam sesi aktif. | 1. Sistem mengagregasi data jawaban sesi menjadi `SESSION_RESULT`.<br>2. Sistem menampilkan *Guardian Profile* berisi skor sesi, statistik keputusan tepat/berisiko, daftar indikator terlewat, kategori kemampuan, dan rekomendasi latihan. | **A1**: Jika pemain belum menyelesaikan skenario apa pun, bagian *Guardian Profile* menampilkan status awal (*empty state*) dengan ajakan memulai simulasi. | Ringkasan evaluasi sesi ditampilkan secara transparan kepada pemain. | FR-11, FR-12 |
| **UC-11** | Mengulang Skenario (Sesi Baru) | Pemain | Memainkan kembali skenario dari awal dengan sesi baru tanpa tercampur skor lama. | Pemain telah menyelesaikan skenario atau berada di panel *Guardian Profile*. | 1. Pemain menekan tombol "Ulangi Skenario" atau "Reset Sesi Evaluasi".<br>2. Sistem mengarsipkan/menghapus state sesi lama dan membuat `LEARNING_SESSION` baru.<br>3. Sistem merender ulang node awal skenario atau mereset pilihan indikator. | - | Sesi baru terbentuk dengan skor awal bersih dan siap dimainkan ulang. | FR-03, FR-13 |

---

## BAGIAN 4 — ACTIVITY DIAGRAM

Empat Activity Diagram dirancang menggunakan **Mermaid Flowchart** untuk memodelkan alur proses yang memiliki logika keputusan, validasi, pengulangan, dan percabangan utama.

### 4.1 Activity Diagram 1: Alur Scam Simulator
**Mendukung Use Case:** `UC-02`, `UC-03`, `UC-04`, `UC-05`, `UC-10`, `UC-11`

```mermaid
flowchart TD
    Start([Mulai]) --> SelectScenario[Pemain memilih mode Scam Simulator & memilih Skenario]
    SelectScenario --> CreateSession[Sistem membuat LEARNING_SESSION baru\ndan memuat SCENARIO_NODE awal]
    CreateSession --> RenderNode[Sistem menampilkan pesan karakter fiktif\ndan daftar CHOICE pada node aktif]
    RenderNode --> ChooseOption[Pemain memilih salah satu tindakan / CHOICE]
    ChooseOption --> ValidateChoice{Apakah choice_id valid\nuntuk node aktif?}
    
    ValidateChoice -- Tidak Valid --> ShowError[Sistem menolak aksi &\nmenampilkan pesan kesalahan validasi]
    ShowError --> RenderNode
    
    ValidateChoice -- Valid --> EvaluateChoice[Sistem mengevaluasi pilihan secara deterministik:\nhitung score_delta & tentukan risk_level]
    EvaluateChoice --> SaveAnswer[Sistem menyimpan pilihan ke SESSION_ANSWER\ndan memperbarui skor sesi]
    SaveAnswer --> ShowFeedback[Sistem menampilkan Feedback Edukatif\n& Konsekuensi Keputusan]
    
    ShowFeedback --> CheckNextNode{Apakah pilihan memiliki\nnext_node_id != null?}
    
    CheckNextNode -- Ya (Masih ada cabang) --> AdvanceNode[Pemain menekan 'Lanjut' &\nSistem memuat SCENARIO_NODE berikutnya]
    AdvanceNode --> RenderNode
    
    CheckNextNode -- Tidak (Node Akhir / Tamat) --> FinalizeSession[Sistem menyelesaikan sesi skenario &\nmemperbarui SESSION_RESULT / Guardian Profile]
    FinalizeSession --> AskReplay{Apakah Pemain ingin\nmengulang skenario?}
    
    AskReplay -- Ya (Ulangi) --> CreateSession
    AskReplay -- Tidak --> End([Selesai])
```

#### Penjelasan Alur Scam Simulator:
1. Ketika pemain memilih skenario simulasi, sistem selalu membuat sesi baru dan mengambil node pertama.
2. Setiap pilihan pemain divalidasi terlebih dahulu (`FR-14`). Jika valid, *Rule Engine* menilai perubahan skor dan tingkat risiko (`FR-06`), menyimpannya ke `SESSION_ANSWER`, lalu menampilkan *feedback* konsekuensi (`FR-07`).
3. Percabangan sesungguhnya terjadi pada decision **`next_node_id != null`**: pilihan yang berbeda mengarahkan ke ID node tujuan yang berbeda (`FR-05`). Ketika `next_node_id` bernilai `null`, sesi diselesaikan dan dirangkum ke *Guardian Profile* (`FR-11`, `FR-12`).

---

### 4.2 Activity Diagram 2: Alur Scam Detective
**Mendukung Use Case:** `UC-02`, `UC-06`, `UC-07`, `UC-08`, `UC-09`, `UC-10`, `UC-11`

```mermaid
flowchart TD
    Start([Mulai]) --> SelectCase[Pemain memilih kasus pada Scam Detective]
    SelectCase --> InitCaseSession[Sistem membuat LEARNING_SESSION baru &\nmenampilkan daftar SCENARIO_EVIDENCE serta opsi RISK_INDICATOR]
    InitCaseSession --> InspectEvidence[Pemain memeriksa bukti kasus\ndan memilih/menandai indikator risiko]
    InspectEvidence --> ReviewLoop{Masih ingin meninjau\nbukti atau ubah pilihan?}
    
    ReviewLoop -- Ya --> InspectEvidence
    ReviewLoop -- Tidak, Klik 'Evaluasi Bukti' --> ValidateSelection{Apakah minimal 1 indikator\ndipilih & milik kasus ini?}
    
    ValidateSelection -- Tidak (Kosong/Invalid) --> AlertValidation[Sistem membatalkan evaluasi &\nmenampilkan peringatan 'Pilih minimal 1 indikator']
    AlertValidation --> InspectEvidence
    
    ValidateSelection -- Ya (Valid) --> SaveDetectiveAnswers[Sistem mencatat indikator terpilih ke SESSION_ANSWER]
    SaveDetectiveAnswers --> CompareIndicators[Sistem membandingkan pilihan pemain\ndengan SCENARIO_INDICATOR target]
    CompareIndicators --> CalcMetrics[Sistem menghitung indikator:\n1. Tepat / True Positive\n2. Tidak Tepat / False Positive\n3. Terlewat / False Negative]
    CalcMetrics --> ShowDetectiveResult[Sistem menampilkan Skor Investigasi,\nPenjelasan EVIDENCE_INDICATOR, & Catatan Edukasi]
    ShowDetectiveResult --> UpdateProfile[Sistem memperbarui SESSION_RESULT / Guardian Profile]
    
    UpdateProfile --> NeedGuide{Ingin melihat Action Guide\nterkait temuan?}
    NeedGuide -- Ya --> GoActionGuide[Sistem mengarahkan ke Action Guide terkait]
    NeedGuide -- Tidak --> End([Selesai])
    GoActionGuide --> End
```

#### Penjelasan Alur Scam Detective:
1. Pemain memeriksa bukti fiktif (pesan, klaim, URL, profil) dan dapat mengubah-ubah centang indikator risiko sebelum menekan tombol pengiriman.
2. Saat dikirim, sistem memvalidasi agar pengiriman kosong dicegah (`FR-14`).
3. Sistem membandingkan himpunan indikator yang dipilih pemain terhadap himpunan indikator target pada kasus tersebut (`FR-09`), memisahkan mana yang **Tepat**, **Keliru**, dan **Terlewat**, lalu menampilkan penjelasan mengapa bukti tertentu mendukung indikator tersebut (`EVIDENCE_INDICATOR`).

---

### 4.3 Activity Diagram 3: Alur Action Guide
**Mendukung Use Case:** `UC-09`

```mermaid
flowchart TD
    Start([Mulai]) --> OpenGuide[Pemain membuka modul Action Guide\nsecara langsung atau dari rujukan hasil evaluasi]
    OpenGuide --> DisplaySituations[Sistem menampilkan 4 Situasi Tanggap Insiden:\n1. Baru menerima pesan mencurigakan\n2. Sudah mengeklik tautan\n3. Sudah memasukkan password / OTP\n4. Sudah melakukan transfer uang]
    DisplaySituations --> SelectSituation[Pemain memilih / membuka situasi yang sesuai kondisi]
    SelectSituation --> FetchGuide[Sistem mengambil data ACTION_GUIDE\nberdasarkan situation_type atau indikator terkait]
    FetchGuide --> RenderSteps[Sistem menampilkan langkah penanganan terurut,\nrekomendasi kanal resmi, & peringatan/disclaimer]
    RenderSteps --> SwitchOther{Apakah Pemain ingin memeriksa\nsituasi lainnya atau latihan terkait?}
    
    SwitchOther -- Pilih Situasi Lain --> SelectSituation
    SwitchOther -- Buka Simulasi Terkait --> NavigateSim[Sistem mengarahkan ke modul Simulator / Detective]
    SwitchOther -- Selesai Membaca --> End([Selesai])
    NavigateSim --> End
```

#### Penjelasan Alur Action Guide:
Alur ini memastikan pengguna yang sedang panik atau ingin belajar langkah mitigasi dapat langsung memilih kondisi keterlanjurannya tanpa harus menyelesaikan kuis terlebih dahulu. Sistem menampilkan langkah-langkah terstruktur sesuai `situation_type` (`FR-10`).

---

### 4.4 Activity Diagram 4: Alur Penyelesaian Sesi dan Pembentukan Guardian Profile
**Mendukung Use Case:** `UC-10`, `UC-11`

```mermaid
flowchart TD
    Start([Mulai: Skenario Simulator / Kasus Detective Selesai]) --> CollectSessionData[Sistem mengumpulkan seluruh SESSION_ANSWER\ndari sesi pembelajaran aktif]
    CollectSessionData --> CalcTotalScore[Scoring Engine menghitung Skor Sesi Gabungan 0-100,\njumlah keputusan tepat, & jumlah keputusan berisiko]
    CalcTotalScore --> IdentifyMissed[Analysis Engine mengidentifikasi daftar RISK_INDICATOR\nyang terlewat atau gagal dikenali pemain]
    IdentifyMissed --> MapStrengthsAndRecs[Sistem memetakan kategori kemampuan yang sudah baik\nserta menyusun rekomendasi materi / skenario ulang]
    MapStrengthsAndRecs --> GenerateResult[Sistem membentuk entitas SESSION_RESULT\ndan merender panel Guardian Profile]
    GenerateResult --> ViewProfile[Pemain meninjau Guardian Profile\ndan membaca disclaimer edukasi]
    
    ViewProfile --> UserAction{Tindakan Pemain selanjutnya?}
    UserAction -- Klik 'Reset / Ulangi Sesi' --> ClearSession[Sistem membersihkan sesi aktif &\nmembentuk LEARNING_SESSION baru yang bersih]
    ClearSession --> ReturnToStart[Sistem mengatur ulang tampilan Simulator & Detective ke awal]
    ReturnToStart --> End([Selesai])
    
    UserAction -- Lanjut Skenario Lain --> End
```

#### Penjelasan Alur Pembentukan Guardian Profile:
Setiap kali pemain menuntaskan skenario Simulator atau evaluasi Detective, sistem mengagregasi seluruh jawaban di dalam sesi aktif untuk menghasilkan satu ringkasan `SESSION_RESULT` yang ditampilkan pada bagian **Guardian Profile** (`FR-11`, `FR-12`). Jika pemain memilih reset/ulangi (`FR-13`), state sesi lama dibersihkan sehingga percobaan berikutnya dimulai dari kondisi nol.

---

## BAGIAN 5 — SYSTEM ARCHITECTURE DESIGN

### 5.1 Evaluasi dan Perbandingan Alternatif Arsitektur untuk MVP
Sesuai instruksi studi kasus, kita membandingkan tiga pendekatan arsitektur yang relevan:

| Kriteria Pembanding | Opsi 1: Client-Side React SPA + Structured JSON Engine (Dipilih untuk MVP) | Opsi 2: React Frontend + Backend REST API + PostgreSQL (Modular Monolith) | Opsi 3: Microservices Architecture |
| :--- | :--- | :--- | :--- |
| **Kesesuaian dengan Batasan MVP** | **Sangat Sesuai**. MVP tidak butuh login, tidak butuh penyimpanan lintas sesi permanen, dan skenario bersifat deterministik. | **Sesuai untuk Fase 2**, namun menambah kompleksitas server & database yang belum wajib pada MVP tanpa akun. | **Tidak Sesuai (Overengineered)**. Terlalu rumit untuk skala aplikasi edukasi tanpa transaksi kompleks. |
| **Kecepatan Respons (NFR-03)** | **Instan (< 50 ms)**. Seluruh evaluasi percabangan dan indikator berjalan di memori peramban tanpa latensi jaringan. | Bergantung pada *round-trip* HTTP API dan *cold start* server gratis (100 ms – 3 detik). | Latensi tinggi akibat komunikasi antar-layanan (*network hop*). |
| **Ketersediaan & Deployment (NFR-04)** | **Sangat Tinggi (99.9%) & Gratis**. Di-deploy ke Static CDN (Vercel / Cloudflare Pages / Netlify) tanpa risiko *database sleep*. | Rawan *downtime* jika *free-tier* backend/DB mengalami *sleep mode* saat diuji juri. | Mahal dan sulit dipelihara oleh tim kecil. |
| **Privasi & Keamanan (NFR-05/06/07)** | **Maksimal**. Tidak ada data pengguna yang dikirim ke server eksternal; permukaan serangan (*attack surface*) sangat kecil. | Memerlukan proteksi *rate limiting*, CORS, dan pengamanan database dari spam. | Memerlukan *API Gateway* dan manajemen rahasia yang kompleks. |
| **Kemudahan Ekstensi ke Backend** | Dirancang dengan **Repository/Service Pattern** di React sehingga sumber data JSON dapat diganti ke panggilan REST API kapan saja tanpa merombak komponen UI. | Sudah memiliki backend sejak awal, namun waktu *development* MVP terbagi dua. | Sangat lambat untuk dikembangkan. |

#### Keputusan Arsitektur:
Untuk **MVP Digital Guardian**, arsitektur yang dipilih adalah **Modular Client-Side React Application (SPA) dengan Deterministic Engine & Repository Layer yang Siap Diintegrasikan ke Backend REST API (Hybrid-Ready Modular Architecture)**.
- **Alasan Pemilihan**:
  1. Memenuhi 100% kebutuhan fungsional (`FR-01` s.d. `FR-14`) dan non-fungsional (`NFR-01` s.d. `NFR-12`) dengan keandalan tertinggi saat diuji juri melalui URL publik.
  2. Logika bisnis (*Scenario Engine*, *Analysis/Rule Engine*, *Scoring Engine*, dan *Action Guide Engine*) diisolasi ke dalam modul TypeScript murni (*pure domain services*) di luar komponen UI React.
  3. Apabila tim mengaktifkan Backend API dan PostgreSQL (disediakan rancangannya secara lengkap pada Bagian 7 dan Bagian 8), aplikasi cukup mengganti `JsonScenarioRepository` menjadi `ApiScenarioRepository` melalui *Dependency Injection / Custom Hook* tanpa mengubah satu baris pun kode tampilan React.

---

### 5.2 Arsitektur Visual & Desain Antarmuka React ("Software" Minimalist Design System)
Sesuai dengan skill `frontend-design` dan spesifikasi `<design-system># Software`, arsitektur komponen React dibangun di atas sistem token desain yang ketat dan minimalis:

#### 1. Sistem Token Desain Otoritatif (`src/styles/tokens.css`)
- **Surface & Background Continuity**:
  - `--dp-color-ground: #fcfcfd` (Latar dasar halaman yang bersih dan terbuka — digunakan pada *Header*, *Hero Section*, dan *Action Guide*).
  - `--dp-color-ground-muted: #f3f4f6` (Latar abu-abu pucat untuk pengelompokan konten analisis — digunakan pada *Module Overview* dan *Scam Detective*).
  - `--dp-color-panel: #ffffff` (Kartu putih dengan border halus `1px solid #dde0e6`, radius `12px`, dan bayangan lembut ke bawah).
  - `--dp-color-field: #16191f` dengan teks `--dp-color-on-field: #fcfcfd` dan `--dp-color-on-field-secondary: #d0d4dd` (**Dua Continuous Dark Fields**: digunakan secara sengaja hanya pada ruang latihan **Scam Simulator** dan ruang penutup **Guardian Profile & Footer** untuk menciptakan fokus imersif).
- **Typography & Hierarchy**:
  - `--font-display: 'Host Grotesk', sans-serif` (Digunakan untuk judul, metrik skor besar, dan header bagian dengan *tight tracking* `-0.025em` serta `line-height: 1.15`).
  - `--font-body: 'Instrument Sans', sans-serif` (Digunakan untuk paragraf edukasi, balon percakapan, label kontrol, dan bukti dengan ukuran `16px`, `line-height: 1.6`, dan lebar baca `< 75ch`).
- **Action & Focus Restraint**:
  - `--dp-color-accent: #074ce0` (*Electric Blue* — hanya digunakan untuk tombol aksi utama, indikator yang sedang dipilih, dan titik fokus diagram; tidak digunakan sebagai dekorasi acak).
  - Keyboard Accessibility: `:focus-visible` wajib menampilkan `outline: 2px solid #074ce0; outline-offset: 2px`.
  - Motion Restraint: Transisi interaksi `160ms ease-out`, diagram hero statis (tenang), dan mematuhi `@media (prefers-reduced-motion: reduce)`.

#### 2. Struktur Hirarki Komponen React (`src/`)
```text
src/
├── main.tsx                        # Entry point React 18
├── App.tsx                         # Layout utama dengan urutan Background Continuity
├── styles/
│   ├── tokens.css                  # CSS Custom Properties (--dp-*) dari skill Software Design
│   └── global.css                  # Reset, tipografi Host Grotesk & Instrument Sans, utilitas a11y
├── types/
│   └── domain.ts                   # Kontrak TypeScript (Scenario, Node, Choice, Evidence, Session, dll.)
├── data/
│   ├── scenarios.json              # Data skenario Simulator & Detective tervalidasi
│   ├── riskIndicators.json         # Katalog indikator risiko standar
│   └── actionGuides.json           # Data panduan 4 situasi tanggap insiden
├── engines/                        # Pure TypeScript Domain Engines (Deterministic & Unit-Testable)
│   ├── ScenarioEngine.ts           # Mengelola state node, transisi next_node_id, dan validasi pilihan
│   ├── AnalysisEngine.ts           # Mengevaluasi indikator risiko Detective (TP, FP, FN) & bukti
│   ├── ScoringEngine.ts            # Menghitung skor sesi (0-100), profil risiko, dan rekomendasi
│   └── ActionGuideEngine.ts        # Memfilter panduan berdasarkan situation_type atau indikator
├── context/
│   └── LearningSessionContext.tsx  # React Context + useReducer + sessionStorage sync untuk sesi aktif
└── components/
    ├── layout/
    │   ├── Header.tsx              # Navigasi minimalis & status sesi aktif
    │   ├── HeroSection.tsx         # Split 1.45:1 + Compact Threat Convergence Diagram + Ruled Facts Strip
    │   └── Footer.tsx              # Dark closing & transparansi edukasi
    ├── simulator/                  # [Continuous Dark Field 1: #16191f]
    │   ├── ScamSimulatorSection.tsx
    │   ├── ScenarioSelector.tsx
    │   ├── ChatViewport.tsx        # Balon pesan bertahap & status risiko
    │   ├── ChoicePanel.tsx         # Tombol keputusan kontekstual
    │   └── FeedbackBanner.tsx      # Penjelasan konsekuensi instan & rujukan Action Guide
    ├── detective/                  # [Pale Field: #f3f4f6]
    │   ├── ScamDetectiveSection.tsx
    │   ├── EvidenceViewer.tsx      # Panel bukti pesan, klaim, URL, dan metadata pengirim fiktif
    │   ├── IndicatorChecklist.tsx  # Matriks pemilihan indikator risiko dengan state aria-pressed/checked
    │   └── DetectiveEvaluation.tsx # Rincian indikator Tepat, Keliru, dan Terlewat
    ├── guide/                      # [Open Ground Field: #fcfcfd]
    │   ├── ActionGuideSection.tsx
    │   └── SituationDisclosure.tsx # Native <details>/<summary> dengan ikon plus berputar 45 derajat
    └── profile/                    # [Continuous Dark Field 2: #16191f]
        ├── GuardianProfileSection.tsx
        ├── ScoreSummaryCard.tsx    # Skor akhir, keputusan tepat/berisiko, indikator terlewat
        └── RecommendationList.tsx  # Rekomendasi latihan & tombol Reset Sesi
```

---

### 5.3 Diagram Arsitektur (C4 Model: Context, Container, Component)

#### 1. System Context Diagram (C4 Level 1)
Menunjukkan hubungan antara Pemain dengan sistem Digital Guardian secara keseluruhan.

```mermaid
flowchart LR
    Player["👤 Pemain\n(Generasi Muda Indonesia)\nMengakses via Browser Mobile/Desktop"]
    
    subgraph SystemBoundary ["Sistem Digital Guardian (MVP)"]
        DG["🛡️ Aplikasi Web Digital Guardian\n(Interactive Scam Education Platform)\nMelatih deteksi scam melalui Simulator,\nDetective, Action Guide, & Guardian Profile"]
    end
    
    Player -- "1. Memilih skenario, mengambil keputusan\nsimulasi, & menandai indikator bukti (HTTPS)" --> DG
    DG -- "2. Menampilkan cabang cerita, feedback risiko,\npanduan tindakan, & evaluasi Guardian Profile" --> Player
```

**Penjelasan System Context Diagram:**  
Pemain berinteraksi langsung dengan aplikasi web Digital Guardian melalui koneksi HTTPS tanpa memerlukan sistem autentikasi pihak ketiga atau pengiriman data pribadi keluar sistem.

---

#### 2. Container Diagram (C4 Level 2)
Menampilkan wadah eksekusi (*containers*) pada arsitektur MVP serta jalur integrasi opsional apabila Backend API diaktifkan.

```mermaid
flowchart TB
    Player["👤 Pemain\n(Browser Chrome / Safari / Edge / Firefox)"]

    subgraph BrowserEnv ["Lingkungan Peramban Pengguna (Client-Side Container)"]
        SPA["⚛️ React 18 SPA Container\n(TypeScript + Vite + Software Design System)\nMerender UI minimalis, mengelola interaksi,\ndan menjaga aksesibilitas"]
        DomainEngine["⚙️ Client-Side Deterministic Engines\n(Scenario, Analysis, Scoring, ActionGuide Engine)\nMemproses aturan percabangan & penilaian secara lokal"]
        SessionStore["💾 Browser Session Storage\n(In-Memory React State + sessionStorage)\nMenyimpan LEARNING_SESSION, SESSION_ANSWER,\ndan SESSION_RESULT sementara"]
        StaticData["📦 Embedded JSON Knowledge Base\n(scenarios.json, riskIndicators.json, actionGuides.json)"]
    end

    subgraph CloudCDN ["Infrastruktur Hosting Publik"]
        CDN["☁️ Static Web & CDN Hosting\n(Vercel / Cloudflare Pages)\nMenyajikan bundel aset React via HTTPS"]
    end

    subgraph OptionalBackend ["Container Backend Opsional (Fase Ekstensi / Full-Stack Mode)"]
        API["🚀 REST API Server\n(Node.js Express / Fastify)\nMenyediakan endpoint skenario & validasi sesi"]
        DB[("🐘 PostgreSQL Database\nMenyimpan tabel SCENARIO, NODE, CHOICE,\nEVIDENCE, INDICATOR, & SESSION")]
    end

    CDN -- "Mengirimkan bundel HTML/CSS/JS" --> SPA
    Player -- "Berinteraksi dengan modul" --> SPA
    SPA <--> DomainEngine
    DomainEngine <--> SessionStore
    DomainEngine -- "Membaca aturan skenario & indikator (Mode MVP)" --> StaticData
    DomainEngine -. "HTTP JSON Request (Mode Full-Stack Opsional)" .-> API
    API -. "SQL Query" .-> DB
```

**Penjelasan Container Diagram:**  
Pada mode MVP, seluruh aplikasi dimuat dari **Static Web & CDN Hosting** ke dalam peramban pemain. **React 18 SPA Container** berkomunikasi langsung dengan **Client-Side Deterministic Engines** yang membaca katalog skenario dari **Embedded JSON Knowledge Base** dan menyimpan progres sesi aktif di **Browser Session Storage**. Jika tim membutuhkan penyimpanan terpusat, lapisan repositori dapat diarahkan ke **REST API Server** dan **PostgreSQL Database**.

---

#### 3. Component Diagram (C4 Level 3 — Arsitektur Internal React & Engines)
Menjelaskan komponen internal aplikasi React dan aliran data antar-modul.

```mermaid
flowchart TB
    subgraph UI_Layer ["Presentation Layer (React Components - Software Design System)"]
        HeroUI["HeroSection & Header\n(Ground #fcfcfd)"]
        SimUI["ScamSimulatorSection\n(Dark Field #16191f)"]
        DetUI["ScamDetectiveSection\n(Muted Field #f3f4f6)"]
        GuideUI["ActionGuideSection\n(Native Disclosures #fcfcfd)"]
        ProfUI["GuardianProfileSection\n(Dark Field #16191f)"]
    end

    subgraph State_Layer ["State & Session Orchestration Layer"]
        SessionCtx["LearningSessionContext\n(useReducer + sessionStorage Adapter)\nMengelola siklus hidup LEARNING_SESSION"]
    end

    subgraph Engine_Layer ["Domain / Business Logic Layer (Pure TypeScript Engines)"]
        ScenEng["ScenarioEngine\n- getInitialNode()\n- validateAndAdvanceChoice()"]
        AnalEng["AnalysisEngine\n- validateIndicatorSelection()\n- evaluateDetectiveCase()"]
        ScoreEng["ScoringEngine\n- calculateSessionScore()\n- buildGuardianProfile()"]
        GuideEng["ActionGuideEngine\n- getGuideBySituation()\n- getGuidesByIndicators()"]
    end

    subgraph Data_Layer ["Data Access / Repository Layer"]
        Repo["Scenario & Guide Repository\n(Menyediakan akses tervalidasi ke JSON / REST API)"]
    end

    HeroUI --> SessionCtx
    SimUI <--> SessionCtx
    DetUI <--> SessionCtx
    GuideUI <--> GuideEng
    ProfUI <--> SessionCtx

    SessionCtx --> ScenEng
    SessionCtx --> AnalEng
    SessionCtx --> ScoreEng
    ProfUI --> GuideEng

    ScenEng --> Repo
    AnalEng --> Repo
    ScoreEng --> Repo
    GuideEng --> Repo
```

### 5.4 Tanggung Jawab Setiap Komponen dan Aliran Data
1. **Presentation Layer (React Components)**: Bertanggung jawab merender state menjadi elemen DOM yang semantik, aksesibel, dan sesuai token *Software Design System*. Tidak boleh menghitung skor secara langsung di dalam JSX.
2. **LearningSessionContext (State Orchestration)**: Menyimpan objek `LearningSession`, daftar `SessionAnswer`, dan `SessionResult` yang sedang aktif. Menerima aksi dari pengguna (`START_SCENARIO`, `SUBMIT_CHOICE`, `SUBMIT_DETECTIVE`, `RESET_SESSION`) dan mendelegasikannya ke *Engine Layer*.
3. **ScenarioEngine**: Memvalidasi apakah `choice_id` milik `node_id` aktif, mengambil perubahan skor (`score_delta`), menentukan `next_node_id`, dan mengembalikan objek *feedback*.
4. **AnalysisEngine**: Memvalidasi pilihan indikator risiko pada *Scam Detective*, membandingkannya dengan `SCENARIO_INDICATOR` target, memetakan bukti pendukung (`EVIDENCE_INDICATOR`), dan mengklasifikasikan hasil menjadi *True Positive* (Tepat), *False Positive* (Tidak Tepat), dan *False Negative* (Terlewat).
5. **ScoringEngine**: Mengagregasi seluruh jawaban sesi dari Simulator dan Detective menjadi skor ternormalisasi (`0–100`), menyusun daftar keputusan berisiko, indikator terlewat, kategori kemampuan yang sudah dikuasai, serta rekomendasi skenario/materi.
6. **ActionGuideEngine**: Mengambil langkah-langkah panduan tanggap insiden berdasarkan `situation_type` (4 kondisi utama) maupun berdasarkan daftar `indicator_id` yang terlewat oleh pemain.
7. **Scenario & Guide Repository**: Mengabstraksi sumber data (file JSON statis pada MVP atau panggilan `fetch()` ke REST API pada arsitektur backend).
