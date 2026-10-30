# MASTER PROMPT — SYSTEM DESIGN DIGITAL GUARDIAN

## 1. PERAN DAN KEAHLIAN

Anda berperan sebagai **Senior Software Architect, System Analyst, dan Software Engineer** yang berpengalaman dalam merancang sistem aplikasi web, arsitektur perangkat lunak, database, API, keamanan aplikasi, serta system design.

Tugas Anda adalah merancang System Design secara profesional, terstruktur, realistis, dan dapat diimplementasikan oleh tim developer.

Jangan hanya memberikan penjelasan konseptual. Buat rancangan teknis yang memiliki hubungan jelas antara kebutuhan sistem, komponen aplikasi, alur proses, database, API, keamanan, dan deployment.

Gunakan bahasa Indonesia yang jelas, profesional, dan mudah dipahami oleh mahasiswa maupun developer.

---

## 2. LATAR BELAKANG STUDI KASUS

Saya sedang mengembangkan sebuah aplikasi web bernama **Digital Guardian** dengan tema:

"Guardians of the Digital Space — Empowering Today's Generation."

Aplikasi ini ditujukan untuk membantu generasi muda Indonesia meningkatkan kesadaran dan kemampuan dalam mengenali penipuan digital (digital scam), phishing, social engineering, serta ancaman keamanan digital lainnya.

Permasalahan yang ingin diselesaikan adalah masih banyaknya pengguna internet yang:
- Tidak dapat mengenali tanda-tanda pesan penipuan.
- Mudah percaya terhadap tawaran hadiah, lowongan pekerjaan, atau investasi yang mencurigakan.
- Tidak memahami risiko membagikan OTP, kata sandi, dan informasi sensitif.
- Tidak mengetahui tindakan yang harus dilakukan ketika menerima pesan mencurigakan.
- Tidak mengetahui langkah penanganan ketika sudah mengeklik tautan, memberikan kredensial, atau melakukan transfer kepada pihak mencurigakan.

Digital Guardian bukan sekadar website penyedia informasi edukasi, tetapi merupakan platform pembelajaran interaktif yang melatih pengguna mengambil keputusan melalui simulasi dan investigasi kasus.

## 3. KONSEP DAN FITUR UTAMA SISTEM

Sistem memiliki empat modul utama.

### A. Scam Simulator

Fitur simulasi percakapan interaktif yang menggambarkan situasi penipuan digital.

Gambaran proses:
1. Pengguna memilih skenario.
2. Sistem menampilkan percakapan dengan karakter fiktif.
3. Karakter memberikan pesan secara bertahap.
4. Pada titik tertentu, karakter memberikan permintaan mencurigakan, seperti meminta OTP, mengirim tautan, meminta pembayaran, atau memberikan tawaran tidak masuk akal.
5. Pengguna memilih tindakan atau respons.
6. Sistem memproses pilihan dan menentukan cabang percakapan berikutnya.
7. Sistem menampilkan konsekuensi dan penjelasan atas keputusan pengguna.
8. Setelah skenario selesai, sistem menampilkan hasil evaluasi.

Ketentuan:
- Percakapan harus memiliki cabang yang benar-benar berubah berdasarkan pilihan pengguna.
- Setiap keputusan penting harus memiliki konsekuensi dan feedback edukatif.
- Gunakan skenario serta identitas yang sepenuhnya fiktif.
- Penilaian harus deterministik dan dapat diuji.
- Jangan menjadikan semua jawaban "ya" sebagai jawaban salah. Penilaian harus mempertimbangkan konteks tindakan.
- AI tidak diwajibkan pada MVP.

### B. Scam Detective

Fitur investigasi kasus untuk melatih kemampuan mengenali indikator penipuan digital.

Gambaran proses:
1. Pengguna memilih kasus.
2. Sistem menampilkan informasi kasus, pesan, profil, klaim, atau bukti lainnya.
3. Pengguna memeriksa bukti.
4. Pengguna memilih bagian atau indikator yang dianggap mencurigakan.
5. Sistem membandingkan jawaban dengan indikator target.
6. Sistem menghitung indikator yang benar, tidak tepat, dan terlewat.
7. Sistem menampilkan penjelasan bukti dan hasil evaluasi.

Contoh indikator:
- Permintaan OTP atau kata sandi.
- Desakan untuk segera melakukan tindakan.
- Permintaan pembayaran di muka.
- Identitas pengirim yang tidak terverifikasi.
- Tautan atau domain yang mencurigakan.
- Tawaran yang terlalu menggiurkan.

### C. Action Guide

Fitur panduan tindakan berdasarkan situasi yang dihadapi pengguna.

Situasi yang harus didukung:
1. Pengguna baru menerima pesan mencurigakan.
2. Pengguna sudah mengeklik tautan.
3. Pengguna sudah memasukkan kata sandi atau OTP.
4. Pengguna sudah melakukan transfer uang.

Sistem harus memberikan panduan yang relevan, langkah penanganan, dan rekomendasi menggunakan kanal resmi.

### D. Guardian Profile

Fitur evaluasi hasil pembelajaran pengguna.

Informasi yang ditampilkan:
- Skor hasil sesi.
- Jumlah keputusan yang tepat.
- Keputusan berisiko.
- Indikator risiko yang terlewat.
- Kategori kemampuan yang sudah baik.
- Rekomendasi materi atau skenario untuk dipelajari kembali.

Guardian Profile pada MVP merupakan ringkasan hasil sesi, bukan profil akun permanen.

---

## 4. BATASAN DAN ASUMSI SISTEM

Gunakan batasan berikut sebagai dasar perancangan:

1. MVP tidak membutuhkan registrasi maupun login pengguna.
2. Pengguna dapat langsung menggunakan aplikasi.
3. Skenario dan penilaian menggunakan aturan yang terstruktur.
4. AI agent tidak diwajibkan.
5. AI dapat dipertimbangkan sebagai pengembangan lanjutan untuk membuat dialog lebih dinamis, tetapi bukan sebagai penentu utama kebenaran penilaian.
6. Penyimpanan progres permanen lintas sesi belum menjadi kebutuhan MVP.
7. Data percakapan dan bukti simulasi harus sepenuhnya fiktif.
8. Sistem tidak boleh meminta data pribadi nyata, OTP, kata sandi, nomor rekening, atau informasi sensitif pengguna.
9. Tidak boleh menggunakan tautan phishing aktif, malware, atau file berbahaya dalam simulasi.
10. Hasil evaluasi merupakan sarana edukasi, bukan jaminan bahwa pengguna dapat mengenali semua penipuan.
11. Dashboard admin dan pengelolaan skenario secara dinamis merupakan pengembangan opsional.
12. Aplikasi harus dapat di-deploy dan diuji melalui URL publik.

Apabila terdapat kebutuhan teknis yang belum ditentukan, buat asumsi yang masuk akal, tuliskan asumsi tersebut, dan jelaskan dampaknya terhadap desain sistem. Jangan mengarang kebutuhan yang tidak didukung studi kasus.

---

# 5. TUGAS UTAMA: RANCANG SYSTEM DESIGN

Berdasarkan studi kasus dan batasan di atas, buat rancangan System Design dengan struktur berikut.

## BAGIAN 1 — Analisis Kebutuhan dan Ruang Lingkup

Jelaskan:
1. Masalah utama yang ingin diselesaikan.
2. Tujuan sistem.
3. Aktor yang terlibat.
4. Kebutuhan bisnis.
5. Kebutuhan pengguna.
6. Batasan sistem.
7. Fitur yang masuk dalam MVP.
8. Fitur yang ditunda untuk pengembangan berikutnya.

Buat tabel pembagian fitur berdasarkan prioritas Must Have, Should Have, dan Could Have.

## BAGIAN 2 — Functional dan Non-Functional Requirements

Susun kebutuhan fungsional dengan ID FR-01, FR-02, dan seterusnya.

Setiap requirement harus:
- Memiliki deskripsi yang jelas.
- Dapat diuji.
- Tidak saling tumpang tindih.
- Memiliki prioritas.
- Memiliki kriteria penerimaan.

Susun juga non-functional requirements berdasarkan:
- Performance.
- Security.
- Privacy.
- Availability.
- Usability.
- Maintainability.
- Scalability.
- Reliability.
- Compatibility.
- Accessibility.

Gunakan ukuran atau indikator yang dapat diuji apabila memungkinkan. Bedakan target desain dengan hasil pengujian aktual.

## BAGIAN 3 — Use Case Diagram dan Deskripsi Use Case

Buat use case diagram berdasarkan tujuan aktor dalam menggunakan aplikasi.

Ketentuan:
- Identifikasi seluruh use case yang benar-benar relevan.
- Jangan membuat use case hanya untuk menggambarkan fungsi internal seperti menghitung skor atau mengambil data.
- Pisahkan tujuan pengguna dari proses internal sistem.
- Gunakan relasi include dan extend secara benar.
- Jangan memaksakan relasi include jika fungsi tidak selalu dijalankan.
- Tentukan apakah aktor admin memang diperlukan dalam MVP.

Buat diagram menggunakan **PlantUML Use Case** agar notasi UML lebih tepat.

Setelah diagram, buat tabel deskripsi use case yang terdiri dari:
- ID use case.
- Nama use case.
- Aktor.
- Tujuan.
- Precondition.
- Main flow.
- Alternative flow.
- Postcondition.

Pastikan setiap use case berhubungan dengan functional requirements.

## BAGIAN 4 — Activity Diagram

Buat activity diagram untuk proses yang mempunyai alur, keputusan, dan percabangan yang penting.

Minimal pertimbangkan:
1. Alur Scam Simulator.
2. Alur Scam Detective.
3. Alur Action Guide.
4. Alur penyelesaian sesi dan pembentukan Guardian Profile.

Jangan membuat activity diagram hanya untuk memenuhi jumlah diagram. Tentukan berdasarkan kompleksitas alur sistem.

Gunakan Mermaid atau PlantUML.

Pastikan diagram mencakup:
- Titik awal.
- Aktivitas pengguna.
- Aktivitas sistem.
- Decision atau percabangan.
- Pengulangan apabila ada.
- Titik akhir.

Beri penjelasan untuk masing-masing diagram dan hubungkan dengan use case terkait.

## BAGIAN 5 — System Architecture Design

Rancang arsitektur aplikasi secara keseluruhan.

Jelaskan:
1. Arsitektur yang paling sesuai untuk MVP.
2. Komponen frontend.
3. Komponen backend apabila diperlukan.
4. Analysis Engine atau Rule Engine.
5. Scenario Engine.
6. Scoring Engine.
7. Action Guide Engine.
8. Database atau penyimpanan data.
9. Integrasi layanan eksternal jika dibutuhkan.
10. Komunikasi antar-komponen.

Pertimbangkan pendekatan:
- Modular monolith.
- Client-side application dengan skenario JSON.
- Backend API dengan database.

Bandingkan pilihan yang relevan dan tentukan satu arsitektur yang paling rasional untuk MVP. Jangan menggunakan microservices hanya karena terlihat lebih kompleks atau modern.

Buat:
- System Context Diagram.
- Container Diagram.
- Component Diagram.

Diagram boleh menggunakan Mermaid atau PlantUML.

Jelaskan tanggung jawab setiap komponen dan aliran data di antara komponen tersebut.

## BAGIAN 6 — Detailed Design Setiap Modul

Jelaskan desain internal dari empat modul utama.

### Scam Simulator
- Struktur skenario.
- Struktur node.
- Struktur pilihan.
- Mekanisme percabangan.
- Mekanisme validasi pilihan.
- Penilaian tindakan.
- Feedback dan konsekuensi.

### Scam Detective
- Struktur kasus.
- Struktur bukti.
- Struktur indikator risiko.
- Hubungan bukti dengan indikator.
- Mekanisme evaluasi jawaban.
- Perhitungan skor investigasi.

### Action Guide
- Pengelompokan situasi.
- Struktur panduan.
- Mekanisme penentuan panduan.
- Hubungan dengan indikator risiko.

### Guardian Profile
- Data yang digunakan untuk menghasilkan profil.
- Perhitungan skor.
- Ringkasan kesalahan.
- Rekomendasi pembelajaran.
- Mekanisme reset atau pengulangan sesi.

## BAGIAN 7 — Database Design dan ERD

Rancang ERD yang benar-benar mendukung fungsi sistem.

Pertimbangkan entitas:
- SCENARIO.
- SCENARIO_NODE.
- CHOICE.
- SCENARIO_EVIDENCE.
- RISK_INDICATOR.
- SCENARIO_INDICATOR.
- EVIDENCE_INDICATOR.
- ACTION_GUIDE.
- INDICATOR_ACTION.
- LEARNING_SESSION.
- SESSION_ANSWER.
- SESSION_RESULT.

Evaluasi kembali apakah semua entitas tersebut diperlukan dan apakah ada entitas tambahan yang dibutuhkan.

Jangan sekadar menggunakan daftar tabel tersebut tanpa analisis.

Jelaskan:
1. Fungsi setiap entitas.
2. Primary key dan foreign key.
3. Relasi one-to-one, one-to-many, dan many-to-many.
4. Kardinalitas relasi.
5. Normalisasi data.
6. Constraint dan validasi.
7. Indeks yang dibutuhkan.
8. Aturan penyimpanan dan penghapusan data.

Buat ERD menggunakan Mermaid `erDiagram`.

Berikan juga rancangan atribut dengan tipe data yang sesuai, misalnya untuk PostgreSQL.

Periksa konsistensi ERD dengan functional requirements dan architecture design.

Jika aplikasi MVP tidak membutuhkan database permanen, jelaskan entitas mana yang dapat disimpan sebagai JSON atau data sesi sementara dan jangan memaksakan pembuatan database yang tidak diperlukan.

## BAGIAN 8 — API Design

Jika arsitektur membutuhkan backend, buat rancangan REST API.

Minimal pertimbangkan endpoint untuk:
- Mendapatkan daftar skenario.
- Mendapatkan detail skenario.
- Memulai sesi.
- Mendapatkan node atau tahap simulasi.
- Mengirim pilihan pemain.
- Mengirim jawaban investigasi.
- Mendapatkan hasil sesi.
- Mendapatkan panduan tindakan.

Untuk setiap endpoint jelaskan:
- HTTP method.
- URL.
- Tujuan.
- Request body atau parameter.
- Response JSON.
- Validasi.
- Kemungkinan error.

Gunakan penamaan endpoint dan format response yang konsisten.

Jangan membuat endpoint yang tidak diperlukan apabila MVP dipilih sebagai aplikasi statis tanpa backend.

## BAGIAN 9 — Sequence Diagram

Buat sequence diagram yang menjelaskan komunikasi antar-komponen untuk:
1. Pemain menjalankan Scam Simulator.
2. Pemain melakukan investigasi Scam Detective.
3. Sistem menyelesaikan sesi dan membuat Guardian Profile.

Tunjukkan komunikasi antara pemain, frontend, service/engine, dan database bila memang digunakan.

## BAGIAN 10 — Security dan Privacy Design

Lakukan analisis keamanan dengan mempertimbangkan:
- Validasi input.
- XSS.
- CSRF apabila menggunakan autentikasi dan cookie yang relevan.
- Rate limiting apabila backend menyediakan endpoint publik.
- Proteksi API.
- Keamanan API key.
- Keamanan koneksi HTTPS.
- Minimalisasi data.
- Retensi data sesi.
- Perlindungan data sensitif.
- Kegagalan layanan eksternal apabila integrasi AI ditambahkan.

Buat threat model sederhana:
- Aset yang perlu dilindungi.
- Potensi ancaman.
- Dampak.
- Mitigasi.

Jangan menganggap semua ancaman berlaku untuk arsitektur yang dipilih. Jelaskan relevansi setiap ancaman.

## BAGIAN 11 — Deployment Architecture

Rancang cara aplikasi dipublikasikan agar dapat diuji oleh pengguna dan juri.

Jelaskan:
- Lingkungan development.
- Lingkungan production.
- Hosting frontend.
- Hosting backend jika diperlukan.
- Database hosting jika diperlukan.
- Environment variables.
- CI/CD.
- Logging dan monitoring.
- Penanganan error.

Buat deployment diagram menggunakan Mermaid atau PlantUML.

Prioritaskan deployment sederhana, murah, dan realistis untuk MVP.

## BAGIAN 12 — Testing Strategy

Susun strategi pengujian berdasarkan modul.

Minimal mencakup:
- Unit testing.
- Integration testing.
- Functional testing.
- API testing jika ada backend.
- Security testing.
- Responsive testing.
- Deployment testing.
- User acceptance testing.

Buat test case dalam tabel:

| Test Case ID | Modul | Skenario Pengujian | Input | Expected Result |
|---|---|---|---|---|

Uji juga:
- Pilihan simulator yang aman.
- Pilihan simulator yang berisiko.
- Cabang percakapan yang berbeda.
- Indikator Detective yang benar.
- Indikator yang terlewat.
- Input kosong dan tidak valid.
- Pengulangan skenario.
- Kegagalan layanan eksternal jika menggunakan AI.

## BAGIAN 13 — Requirement Traceability Matrix

Buat tabel keterkaitan antara:

Functional Requirement → Use Case → Activity Diagram → Component → Database Entity/API → Test Case.

Tujuannya adalah memastikan semua kebutuhan fungsional mempunyai implementasi dan pengujian yang jelas.

Jangan sampai ada fitur dalam requirement yang tidak memiliki tempat dalam desain sistem.

## BAGIAN 14 — Rekomendasi Teknologi

Rekomendasikan teknologi yang sesuai dengan skala dan kebutuhan MVP.

Pertimbangkan:
- Frontend framework.
- Backend framework.
- Database.
- API style.
- Hosting.
- Testing framework.
- Diagram dan dokumentasi.
- Pengelolaan skenario.

Untuk setiap teknologi:
- Jelaskan alasan pemilihan.
- Jelaskan alternatifnya.
- Jelaskan kelebihan dan kekurangannya.
- Hindari overengineering.

Jangan memilih teknologi hanya karena populer.

---

# 6. STANDAR KUALITAS JAWABAN

Ikuti seluruh aturan berikut saat membuat system design:

1. Gunakan bahasa Indonesia untuk seluruh penjelasan.
2. Gunakan istilah teknis bahasa Inggris apabila merupakan istilah standar industri, lalu jelaskan artinya.
3. Buat rancangan berdasarkan studi kasus Digital Guardian, bukan template aplikasi generik.
4. Semua diagram harus memiliki kode sumber Mermaid atau PlantUML yang valid dan dapat dirender.
5. Setiap diagram harus diikuti penjelasan.
6. Pastikan nama use case, functional requirement, komponen, tabel database, dan endpoint konsisten.
7. Jangan menambahkan login, autentikasi, admin dashboard, AI agent, atau fitur lain ke MVP tanpa alasan kebutuhan yang jelas.
8. Bedakan fitur MVP dengan pengembangan masa depan.
9. Jangan membuat sistem terlalu kompleks untuk kebutuhan demonstrasi dan deployment.
10. Jelaskan alasan setiap keputusan arsitektur.
11. Jangan membuat asumsi teknis tanpa menuliskannya.
12. Jika rancangan memiliki kekurangan atau konflik, tunjukkan dan perbaiki sebelum memberikan hasil akhir.
13. Jangan mengklaim aplikasi telah dibuat, dijalankan, diuji, atau di-deploy. Tugas ini hanya menghasilkan desain sistem.
14. Hindari duplikasi diagram dan penjelasan yang tidak memberikan nilai tambah.
15. Pastikan rancangan bisa menjadi pedoman implementasi bagi developer.

## 7. HASIL AKHIR YANG DIHARAPKAN

Saya ingin mendapatkan dokumen System Design Digital Guardian yang tersusun seperti dokumen rekayasa perangkat lunak profesional.

Struktur akhirnya harus mencakup:

1. Pendahuluan dan gambaran umum sistem.
2. Analisis kebutuhan dan ruang lingkup.
3. Functional Requirements.
4. Non-Functional Requirements.
5. Use Case Diagram dan deskripsi use case.
6. Activity Diagram.
7. System Architecture Design.
8. Detailed Component Design.
9. Database Design dan ERD.
10. API Design.
11. Sequence Diagram.
12. Security dan Privacy Design.
13. Deployment Architecture.
14. Testing Strategy.
15. Requirement Traceability Matrix.
16. Rekomendasi teknologi dan tahapan implementasi.

Mulailah dengan menganalisis kebutuhan dan asumsi terlebih dahulu. Kemudian susun desain secara sistematis dari kebutuhan pengguna hingga detail teknis implementasi.

**Prioritas utama adalah menghasilkan desain sistem yang konsisten, aman, tidak berlebihan, dapat diuji, dan benar-benar menyelesaikan permasalahan dalam studi kasus Digital Guardian.**