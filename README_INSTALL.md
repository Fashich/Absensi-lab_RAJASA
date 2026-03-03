# Instalasi Cepat - Sistem Absensi Lab SMK Rajasa Surabaya

Ikuti langkah-langkah berikut untuk menjalankan proyek ini:

## 1. Pastikan Prasyarat Terpenuhi

- Laragon terinstal dan berjalan (Apache & MySQL aktif)
- Node.js dan npm terinstal

## 2. Siapkan Database

1. Buka phpMyAdmin di `http://localhost/phpmyadmin`
2. Buat database baru bernama `sistem_absensi_lab`
3. Impor file `database/sistem_absensi_lab.sql` ke database tersebut

## 3. Konfigurasi Backend

Pastikan file `backend/config/database.php` memiliki konfigurasi benar:

- DB_HOST: 'localhost'
- DB_NAME: 'sistem_absensi_lab'
- DB_USER: 'root'
- DB_PASS: '' (kosong untuk Laragon default)

## 4. Jalankan Frontend

Buka terminal/command prompt dan jalankan perintah berikut:

```bash
# Masuk ke folder frontend
cd c:\laragon\www\Project.Self\project_magang\frontend

# Instal dependensi
npm install

# Jalankan aplikasi
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 5. Akses Aplikasi

Setelah frontend berjalan, buka browser dan kunjungi `http://localhost:3000`

Login dengan akun berikut:

- Username: `admin`
- Password: `admin123`

## Catatan Tambahan

- Backend (API) dapat diakses di `http://localhost/project_magang/backend`
- Jika terjadi masalah CORS, pastikan file `src/setupProxy.js` sudah dibuat
- Jika terjadi masalah koneksi database, periksa kembali konfigurasi di `backend/config/database.php`

Jika masih mengalami masalah, silakan merujuk ke file CARA_JALANKAN_PROYEK.md untuk instruksi lebih lengkap.
