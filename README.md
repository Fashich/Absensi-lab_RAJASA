# Sistem Informasi Sekolah - Portal Wali Murid

Sistem informasi sekolah berbasis web untuk SMK Rajasa Surabaya dengan fitur tambahan portal khusus wali murid yang dapat diakses tanpa proses autentikasi atau login.

## Fitur Utama

### Portal Wali Murid
- Akses langsung tanpa login
- Dashboard informasi siswa
- Data siswa lengkap
- Nilai akademik
- Presensi siswa
- Pembayaran SPP
- Dan berbagai fitur lainnya

### Arsitektur
- **Frontend**: React.js
- **Backend**: PHP Native dengan pola MVC
- **Database**: MySQL
- **Styling**: Tailwind CSS

## Struktur Database

File `wali_murid_portal.sql` berisi skema database baru yang mencakup:

```sql
-- Tabel wali_murid
CREATE TABLE IF NOT EXISTS `wali_murid` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` int(11) UNSIGNED NOT NULL COMMENT 'Foreign key ke tabel students',
  `nama_wali` varchar(100) NOT NULL COMMENT 'Nama lengkap wali murid',
  `nik_wali` varchar(20) NOT NULL COMMENT 'NIK wali murid',
  `pekerjaan` varchar(100) DEFAULT NULL COMMENT 'Pekerjaan wali murid',
  `no_telepon` varchar(15) NOT NULL COMMENT 'Nomor telepon wali murid',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email wali murid',
  `alamat` text DEFAULT NULL COMMENT 'Alamat lengkap wali murid',
  `hubungan_dengan_siswa` enum('ayah','ibu','wali','kakek','nenek','saudara') NOT NULL DEFAULT 'wali' COMMENT 'Hubungan dengan siswa',
  `status_aktif` tinyint(1) DEFAULT 1 COMMENT 'Status aktif wali murid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nik_wali_unique` (`nik_wali`),
  UNIQUE KEY `siswa_id_unique` (`siswa_id`) COMMENT 'Satu siswa hanya boleh memiliki satu wali aktif',
  KEY `siswa_id` (`siswa_id`),
  KEY `nik_wali` (`nik_wali`),
  KEY `no_telepon` (`no_telepon`),
  KEY `email` (`email`),
  CONSTRAINT `fk_wali_murid_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabel log akses wali murid
CREATE TABLE IF NOT EXISTS `wali_murid_logs` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `wali_murid_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID wali murid jika teridentifikasi',
  `user_type` varchar(20) NOT NULL DEFAULT 'wali_murid' COMMENT 'Tipe user yang mengakses',
  `user_identifier` varchar(50) DEFAULT NULL COMMENT 'Identifier seperti no_telepon atau IP',
  `action` varchar(100) NOT NULL COMMENT 'Aksi yang dilakukan',
  `table_accessed` varchar(50) DEFAULT NULL COMMENT 'Tabel yang diakses',
  `record_id` int(11) DEFAULT NULL COMMENT 'ID record yang diakses',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address pengakses',
  `user_agent` text DEFAULT NULL COMMENT 'User agent browser',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `wali_murid_id` (`wali_murid_id`),
  KEY `user_identifier` (`user_identifier`),
  KEY `timestamp` (`timestamp`),
  CONSTRAINT `fk_wali_murid_logs_wali` FOREIGN KEY (`wali_murid_id`) REFERENCES `wali_murid` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
);
```

## Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd project_magang
```

### 2. Setup Backend
1. Impor file `database.sql` ke phpMyAdmin
2. Impor file `wali_murid_portal.sql` ke phpMyAdmin untuk tabel tambahan
3. Konfigurasi koneksi database di `backend/config/database.php`
4. Jalankan server PHP:
```bash
cd backend
php -S localhost:8000
```

### 3. Setup Frontend
1. Install dependensi:
```bash
cd frontend
npm install
```
2. Jalankan aplikasi:
```bash
npm start
```

### 4. Konfigurasi Environment
Buat file `.env` di root direktori frontend dengan konfigurasi:

```
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Struktur Folder

```
project_magang/
├── backend/
│   ├── api/
│   ├── config/
│   ├── controllers/
│   │   └── WaliMuridController.php
│   ├── helpers/
│   │   └── FormatHelper.php
│   ├── middleware/
│   │   └── WaliMuridAccess.php
│   ├── models/
│   │   └── WaliMuridModel.php
│   └── routes/
│       └── routes.php
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── wali-murid/
│   │   │       └── Dashboard.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── wali-murid/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── DataSiswa.jsx
│   │   │   │   ├── NilaiAkademik.jsx
│   │   │   │   ├── PresensiSiswa.jsx
│   │   │   │   └── PembayaranSPP.jsx
│   │   └── services/
│   ├── package.json
│   └── App.js
├── database.sql
├── wali_murid_portal.sql
└── README.md
```

## Endpoint API

### Portal Wali Murid
- `GET /api/wali-murid/dashboard` - Data dashboard
- `GET /api/wali-murid/siswa` - Data siswa
- `GET /api/wali-murid/nilai` - Nilai akademik
- `GET /api/wali-murid/presensi` - Presensi siswa
- `GET /api/wali-murid/pembayaran` - Pembayaran SPP
- `GET /api/wali-murid/pengumuman` - Pengumuman
- `GET /api/wali-murid/kegiatan` - Kegiatan sekolah
- `GET /api/wali-murid/kalender` - Kalender akademik
- `GET /api/wali-murid/beasiswa` - Data beasiswa
- `GET /api/wali-murid/export/nilai-pdf` - Export nilai ke PDF

## Komponen Frontend

### Wali Murid
- Dashboard (komponen layout utama)
- DataSiswa (informasi detail siswa)
- NilaiAkademik (daftar dan grafik nilai)
- PresensiSiswa (rekap kehadiran)
- PembayaranSPP (status dan riwayat pembayaran)
- Dan komponen lainnya sesuai kebutuhan

## Desain UI/UX

### Tema Warna
- Dark Mode: 
  - Background: `#1e293b`, `#0f172a`, `#334155`
  - Accent: `#3b82f6`, `#60a5fa`, `#93c5fd`
  - Text: `#f1f5f9`, `#cbd5e1`

### Navigasi
- Sidebar kiri fixed dengan lebar ~280px
- Header navigasi dengan 4 menu utama:
  1. Beranda
  2. Akademik
  3. Rekapan Siswa
  4. Layanan Sekolah/Kalender Akademik

## Keamanan

- Validasi input untuk mencegah SQL Injection
- Sanitasi output untuk mencegah XSS
- Rate limiting untuk mencegah abuse
- Logging akses untuk audit trail
- Validasi file upload dengan whitelist ekstensi dan MIME type

## Fitur Export

- Export nilai ke PDF
- Export presensi ke Excel
- Export rapor ke PDF

## Penggunaan

1. Akses halaman login di `http://localhost:3000/login`
2. Klik tombol "Wali Murid" di bawah tombol login
3. Masukkan identitas anak (NISN atau token akses)
4. Akses informasi siswa yang tersedia

## Troubleshooting

### Umum
- Pastikan koneksi database benar
- Verifikasi bahwa semua dependensi telah diinstal
- Periksa konfigurasi CORS

### Error Database
- Pastikan skema database telah diimpor
- Periksa hak akses database
- Pastikan versi MySQL mendukung fitur yang digunakan

### Error Frontend
- Pastikan versi Node.js terbaru
- Bersihkan cache npm: `npm cache clean --force`
- Hapus dan reinstall node_modules: `rm -rf node_modules && npm install`

## Lisensi

Proyek ini adalah bagian dari tugas akademik dan bersifat open-source untuk tujuan pendidikan.

## Kontribusi

Kontribusi sangat diterima. Silakan buat pull request untuk perbaikan atau tambahan fitur.
# Sistem Presensi Laboratorium SMK Rajasa Surabaya

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech Stack](https://img.shields.io/badge/tech-React%20%7C%20Node.js%20%7C%20PHP%20%7C%20MySQL-informational)

Sistem informasi laboratorium presensi berbasis web full-stack MVP yang production-ready untuk SMK Rajasa Surabaya dengan integrasi portal orang tua siswa dan sistem presensi lab yang sudah ada.

## Fitur Utama

- 🏫 **Sistem Presensi Laboratorium**: Presensi berbasis IoT untuk laboratorium komputer
- 👨‍👩‍👧‍👦 **Portal Orang Tua**: Akses untuk orang tua/wali murid tanpa autentikasi
- 🔐 **Autentikasi Multi-Level**: Login untuk administrator dan staff
- 📊 **Dashboard Interaktif**: Statistik presensi, nilai, dan pembayaran
- 📈 **Laporan Terpadu**: Presensi, nilai akademik, dan pembayaran SPP
- 📱 **Responsive Design**: Tampilan yang optimal di berbagai perangkat

## Instalasi dan Konfigurasi

### Prasyarat Sistem

- [XAMPP](https://www.apachefriends.org/download.html) (Apache 2.4+, MySQL 5.7+, PHP 7.4+)
- [Node.js](https://nodejs.org/) (versi 14 atau lebih baru)
- [npm](https://www.npmjs.com/) (tersedia bersama Node.js)
- [phpMyAdmin](https://www.phpmyadmin.net/) (untuk manajemen database)

### Langkah-langkah Instalasi

#### 1. Clone Repository

```bash
git clone https://github.com/[username]/project_magang.git
cd project_magang
```

#### 2. Instal Dependencies Frontend

```bash
cd frontend
npm install
```

#### 3. Import Database

1. Buka [phpMyAdmin](http://localhost/phpmyadmin)
2. Buat database baru dengan nama `sistem_presensi_smk`
3. Klik tab "Import"
4. Pilih file `database.sql` dari folder proyek
5. Klik "Go" untuk mengimpor

#### 4. Konfigurasi Backend

1. Salin file `.env.example` dan ubah namanya menjadi `.env`
2. Sesuaikan konfigurasi database di file `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sistem_presensi_smk
   JWT_SECRET=your_secret_key_here
   ```

#### 5. Menjalankan Aplikasi

**Menjalankan Frontend:**

```bash
cd frontend
npm start
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

**Menjalankan Backend:**

Letakkan folder `backend` di direktori `htdocs` XAMPP dan akses melalui [http://localhost/project_magang/backend](http://localhost/project_magang/backend)

## Struktur Folder

```
project_magang/
├── backend/                 # File-file backend (PHP)
│   ├── api/                # Endpoint API
│   ├── config/             # Konfigurasi database dan environment
│   ├── includes/           # Fungsi-fungsi umum
│   └── ...
├── frontend/               # File-file frontend (React)
│   ├── public/             # File statis
│   ├── src/
│   │   ├── assets/         # Gambar, CSS, dan font
│   │   ├── components/     # Komponen React yang dapat digunakan kembali
│   │   ├── pages/          # Halaman utama (Dashboard, DataSiswa, dll.)
│   │   ├── services/       # Panggilan API
│   │   └── ...
│   └── ...
├── database/               # File SQL untuk database
├── hardware/               # Dokumentasi integrasi hardware
├── ml-training/            # File-file pelatihan machine learning
├── README.md
└── ...
```

## Fitur-Fitur yang Tersedia

### Dashboard Administrator
- Statistik jumlah siswa
- Presensi harian
- Progres pembayaran SPP
- Pengumuman terbaru

### Manajemen Siswa
- CRUD data siswa
- Filter berdasarkan kelas dan jurusan
- Impor/ekspor data dalam format Excel

### Presensi Laboratorium
- Monitoring presensi real-time
- Grafik kehadiran per bulan
- Filter rentang tanggal

### Nilai Akademik
- Input dan tampilan nilai
- Perhitungan otomatis (harian, UTS, UAS, praktek)
- Grade otomatis berdasarkan standar penilaian

### Pembayaran SPP
- Tracking status pembayaran
- Riwayat pembayaran
- Upload bukti transfer

### Portal Orang Tua
- Akses tanpa login menggunakan NISN atau nomor HP
- Melihat profil anak
- Riwayat presensi
- Nilai akademik
- Status pembayaran SPP

## API Documentation

### Endpoint Otentikasi
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/logout` - Logout pengguna
- `POST /api/auth/change_password` - Ganti password

### Endpoint Siswa
- `GET /api/siswa/get_all` - Ambil semua data siswa
- `POST /api/siswa/create` - Tambah siswa baru
- `PUT /api/siswa/update` - Update data siswa
- `DELETE /api/siswa/delete` - Hapus data siswa

### Endpoint Presensi
- `GET /api/presensi/get_all` - Ambil semua data presensi
- `POST /api/presensi/scan_masuk` - Scan presensi masuk
- `POST /api/presensi/scan_keluar` - Scan presensi keluar

(Lihat dokumentasi API lengkap di folder `backend/api`)

## Teknologi yang Digunakan

### Frontend
- **React.js** - Library JavaScript untuk antarmuka pengguna
- **React Router DOM** - Routing untuk aplikasi SPA
- **Tailwind CSS** - Framework CSS untuk styling
- **Chart.js** - Visualisasi data dan grafik
- **React Icons** - Ikon-ikon untuk UI
- **Axios** - Client HTTP untuk komunikasi API

### Backend
- **PHP 7.4+** - Server-side scripting
- **MySQL** - Database relasional
- **JWT** - Authentication token
- **BCrypt** - Hashing password

### Hardware (Opsional)
- **ESP32-CAM** - Modul IoT untuk scanning presensi
- **RFID Reader** - Pembaca kartu presensi

## Troubleshooting

### Database Connection Error
Pastikan konfigurasi database di file `.env` sudah benar dan server MySQL sedang berjalan.

### CORS Error
Pastikan konfigurasi CORS di backend sesuai dengan domain frontend.

### Build Error
- Jalankan `npm install` di folder frontend untuk menginstal dependencies
- Pastikan versi Node.js memenuhi syarat minimum

## Kontribusi

Kontribusi sangat diterima! Silakan ikuti langkah-langkah berikut:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/NamaFitur`)
3. Commit perubahan (`git commit -m 'Add some NameFeature'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## Tim Pengembang

- Ahmad Fashich Azzuhri R. - Junior Full-Stack Developer
- Tim Magang Teknik Komputer dan Jaringan SMK Rajasa Surabaya