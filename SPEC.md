# Spesifikasi Teknis: Aplikasi Kalkulator & Proposal Lancar Jaya (Fullstack)

## Pernyataan Masalah (Problem Statement)

Pengguna saat ini mengelola perhitungan biaya handling perjalanan (seperti Umrah) dan pembuatan proposal penawaran harga menggunakan file Excel dan halaman HTML statis. Proses ini rentan terhadap beberapa kendala:
1. Data tarif dan parameter biaya tersimpan secara lokal dan sulit dikelola secara kolaboratif oleh tim dengan hak akses berbeda (*Superadmin, Admin, Inputer, User*).
2. Perhitungan biaya internal (seperti *Direct Cost* dan *Margin* keuntungan) yang bersifat rahasia dapat terlihat secara tidak sengaja oleh klien (*role user*).
3. Sulit melacak riwayat proposal yang pernah dibuat sebelumnya secara terstruktur.
4. Desain antarmuka saat ini belum sepenuhnya optimal untuk operasional cepat dan responsif ketika diakses melalui perangkat seluler (HP) di lapangan.

## Solusi (Solution)

Membangun aplikasi Web Fullstack yang responsif dengan sistem autentikasi pengguna berbasis peran (*role-based*):
1. **Sistem Autentikasi 4 Peran**: Membatasi hak akses halaman dan data finansial sensitif berdasarkan peran (*Superadmin, Admin, Inputer, User*).
2. **Katalog Parameter Dinamis**: Mengelola data default parameter tarif dan multiplier biaya melalui database MySQL, bukan hardcoded di kode program.
3. **Kalkulator Perjalanan Interaktif**: Mereplikasi logika perhitungan dari file HTML lama secara dinamis, dengan menyembunyikan biaya internal untuk klien (*role user*) dan menyediakan fitur penyimpanan kalkulasi menjadi proposal bagi *Admin* & *Superadmin*.
4. **Daftar & Detail Proposal**: Menyimpan dan menampilkan proposal yang pernah dibuat dalam bentuk daftar dan tampilan detail yang bersih serta siap cetak (PDF).
5. **Dashboard Analisis Profit**: Menyediakan halaman dashboard interaktif bagi manajemen (*Superadmin* & *Admin*) untuk memantau metrik keuntungan dan sebaran komponen biaya.

## Cerita Pengguna (User Stories)

1. As a **Superadmin**, I want to **manage user accounts (create, update, delete, change roles)**, so that **I can control who has access to the application and what actions they can perform**.
2. As a **Superadmin**, I want to **view the global profit dashboard with SVG metrics charts**, so that **I can analyze the business performance and profit trends**.
3. As an **Admin**, I want to **view the dashboard analytics for saved proposals**, so that **I can monitor recent calculations and overall margins**.
4. As an **Admin**, I want to **CRUD catalog parameters (like hotel rates, muthowif fees, tips)**, so that **I can update the base costs as market prices fluctuate**.
5. As an **Inputer**, I want to **view and update catalog parameters**, so that **I can assist in maintaining accurate cost parameters without seeing the profit dashboard**.
6. As a **User (Client)**, I want to **login securely to the platform**, so that **I can use the calculator with default rates and fixed margins to see final selling prices**.
7. As a **User (Client)**, I want to **be prevented from seeing direct costs, overhead, margin, and profit details in the calculator**, so that **confidential internal financial calculations are not leaked to me**.
8. As an **Admin**, I want to **calculate a trip proposal by adjusting package type (Besar, Esensial, Lengkap), pax count, days, hotels, catering, and tips**, so that **the system calculates level fees and subtotal costs dynamically**.
9. As an **Admin**, I want to **use a margin slider ranging from 5% to 40% on the calculator**, so that **I can immediately see how margin adjustments affect the group sell price and group profit**.
10. As an **Admin**, I want to **see a color-coded margin status indicator (OK, Warning, Danger)**, so that **I know if a proposed price falls below the allowed floor limit (12.5%)**.
11. As an **Admin**, I want to **save a calculation as a formal Proposal with a client name**, so that **it is stored in the database for future retrieval**.
12. As a **User (Client)**, I want to **view only the proposals created for or by me**, so that **I do not see proposals belonging to other clients**.
13. As an **Admin**, I want to **view all saved proposals in a list with filters for client name and package type**, so that **I can find specific proposals quickly**.
14. As an **Admin**, I want to **copy a WhatsApp-friendly text summary of a proposal to my clipboard**, so that **I can quickly send the breakdown to the client**.
15. As an **Admin**, I want to **print a proposal details view (Ctrl+P) in a clean PDF layout without the admin sidebar, slider, or buttons**, so that **I can generate a professional official quotation document**.
16. As any **Authenticated User**, I want to **automatically log out after my session expires**, so that **unauthorized users cannot access the application from my device**.
17. As a **Mobile User**, I want **the application navigation and forms to wrap and stack nicely on my phone screen**, so that **I can compute rates on the go at airport terminals or hotel lobbies**.

## Keputusan Implementasi (Implementation Decisions)

### Modul Aplikasi
1. **Modul Autentikasi**: Menggunakan JWT (JSON Web Tokens) untuk manajemen sesi aman di backend dan validasi role-based middleware pada endpoint API.
2. **Modul Katalog**: RESTful API CRUD untuk data parameter kalkulator. Data katalog awal dimigrasikan (*seeded*) dari file HTML saat instalasi database.
3. **Modul Kalkulator & Proposal**: Logika perhitungan matematika dijalankan di backend untuk keakuratan dan keamanan (tidak membocorkan rumus margin jika role `user` mengakses kalkulator). Admin bisa menyimpan data kalkulasi yang tersimpan dalam format JSON ke dalam tabel `proposals`.
4. **Modul Dashboard**: Menghasilkan data agregasi profit, rata-rata margin, total proposal, dan statistik biaya langsung yang divisualisasikan menggunakan diagram SVG interaktif di frontend (untuk meminimalkan library grafik pihak ketiga).

### Skema & Kontrak API
1. **Autentikasi API**:
   - `POST /api/auth/login` -> Menerima username/password, mengembalikan JWT token dan role user.
   - `GET /api/auth/users` (Khusus Superadmin) -> CRUD pengguna.
2. **Katalog API**:
   - `GET /api/catalog` -> Mengambil semua parameter tarif.
   - `PUT /api/catalog/:id` (Superadmin/Admin/Inputer) -> Mengubah rate atau qty default.
3. **Proposal API**:
   - `GET /api/proposals` -> List proposal (difilter berdasarkan hak akses role).
   - `GET /api/proposals/:id` -> Mengambil detail rincian proposal.
   - `POST /api/proposals` (Superadmin/Admin) -> Menyimpan kalkulasi baru sebagai proposal.
4. **Dashboard API**:
   - `GET /api/dashboard/stats` (Superadmin/Admin) -> Mengembalikan statistik margin, profit, dan grafik komposisi direct cost.

## Keputusan Pengujian (Testing Decisions)

1. **Pengujian Fungsionalitas Matematika**:
   - Pengujian terhadap kalkulasi matematika (Level Fee multiplier, Catering rate, Tips scenario) harus diuji di backend dengan test runner untuk memastikan hasil perhitungan sama persis dengan sheet/HTML yang lama.
2. **Pengujian Batasan Akses (Role-based Gate)**:
   - Pengujian terotomatisasi untuk memastikan token JWT dengan role `user` diblokir (mendapatkan HTTP 403) ketika menembak endpoint `/api/dashboard/stats` atau `/api/proposals` (POST).
   - Pengujian visual (manual/browser) untuk memastikan elemen UI internal cost tersembunyi total saat login sebagai role `user`.

## Di Luar Lingkup (Out of Scope)

1. **Alur Persetujuan Bertingkat (Approvals)**: Peninjauan dan persetujuan bertingkat atas proposal yang dibuat di bawah batas floor margin (ditangguhkan untuk pengembangan berikutnya).
2. **Sinkronisasi Multi-Mata Uang Otomatis**: Integrasi API kurs SAR/IDR secara langsung ke bank sentral (kurs menggunakan nilai input manual di katalog).
3. **Notifikasi WhatsApp**: Pengiriman pesan ringkasan otomatis ke nomor klien via API WhatsApp (cukup dengan fitur "Salin Ringkasan" secara manual).

## Catatan Tambahan (Further Notes)

Aplikasi akan mematuhi arsitektur yang ringan dengan meminimalkan ketergantungan library eksternal agar ukuran file tetap kompak. Desain CSS akan terpusat menggunakan Tailwind CSS v3 dengan layout yang clean, asimetris, dan profesional yang mencerminkan kredibilitas institusional PT Lancar Jaya.
