# Cara Menjalankan Proyek Sistem Absensi Lab SMK Rajasa Surabaya

Proyek ini terdiri dari 3 bagian utama:

1. Backend (PHP)
2. Frontend (React)
3. Database (MySQL/MariaDB)

## 1. Menyiapkan Lingkungan

Pastikan Anda telah menginstal:

- Laragon (sudah termasuk Apache, MySQL, dan PHP)
- Node.js dan npm
- Browser web

## 2. Menyiapkan Database

### Opsi 1: Menggunakan phpMyAdmin (disarankan)

1. Nyalakan Laragon dan pastikan Apache dan MySQL berjalan
2. Buka browser dan akses `http://localhost/phpmyadmin`
3. Buat database baru:
   1. Klik "Database" di menu atas
   2. Isi nama database: `sistem_absensi_lab`
   3. Pilih collation: `utf8mb4_general_ci`
   4. Klik "Buat" atau "Create"

4. Impor file SQL:

   1. Klik database `sistem_absensi_lab` di sebelah kiri
   2. Klik tab "Import"
   3. Klik "Choose File", lalu cari file `database/sistem_absensi_lab.sql`
   4. Pastikan format adalah "SQL"
   5. Klik "Go"

### Opsi 2: Menggunakan Command Line

1. Buka terminal/command prompt
1. Jalankan perintah berikut:

```bash
mysql -u root -p
```

1. Masukkan password kosong (tekan Enter jika tidak ada)
1. Di dalam MySQL, buat database:

```sql
CREATE DATABASE sistem_absensi_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

1. Keluar dari MySQL:

```sql
EXIT;
```

1. Impor file SQL:

```bash
mysql -u root -p sistem_absensi_lab < c:\laragon\www\Project.Self\project_magang\database\sistem_absensi_lab.sql
```

## 3. Mengkonfigurasi Backend

1. Buka file `backend/config/database.php`
1. Pastikan konfigurasi database benar:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistem_absensi_lab');
define('DB_USER', 'root');
define('DB_PASS', '');  // Biasanya kosong di Laragon
define('DB_CHARSET', 'utf8mb4');
```

1. Juga pastikan API key dan JWT secret sudah diatur:

```php
define('ESP32_API_KEY', 'rajasa2024secure');
define('JWT_SECRET', 'rajasa2024secretkeyabsensilab');
```

## 4. Menjalankan Frontend (React)

1. Buka terminal/command prompt
1. Arahkan ke folder frontend:

```bash
cd c:\laragon\www\Project.Self\project_magang\frontend
```

1. Instal dependensi:

```bash
npm install
```

1. Jalankan aplikasi:

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 5. Menjalankan Backend (PHP)

Backend sebenarnya adalah API yang berjalan di server web. Pastikan Laragon berjalan dan Anda bisa mengakses:

- `http://localhost/project_magang/backend/api/auth/login.php` untuk menguji API

## 6. Login ke Aplikasi

Setelah semua berjalan, Anda bisa login dengan akun berikut:

| Role              | Username          | Password   |
|-------------------|-------------------|------------|
| Admin Operator    | `admin`           | `admin123` |
| Admin Jurusan TKJ | `admintkj`        | `admin123` |
| Admin Jurusan RPL | `adminrpl`        | `admin123` |
| Admin Jurusan MM  | `adminmm`         | `admin123` |

## Troubleshooting Umum

### Masalah saat npm install

- Pastikan Node.js terinstal
- Hapus folder `node_modules` dan `package-lock.json` jika instalasi gagal, lalu coba lagi

### Tidak bisa akses `http://localhost:3000`

- Pastikan tidak ada aplikasi lain yang menggunakan port 3000
- Pastikan Anda menjalankan `npm start` dari folder frontend

### Error koneksi database

- Pastikan nama database benar
- Pastikan konfigurasi di `database.php` sesuai

### Tidak bisa login

- Pastikan database sudah diimpor dengan benar
- Periksa kembali username dan password

## Catatan Penting

- Backend (folder `backend`) harus bisa diakses melalui web server (misalnya `http://localhost/project_magang/backend/`)
- Frontend berjalan secara terpisah di `http://localhost:3000`
- Pastikan kedua bagian bisa saling terhubung melalui API
