# Deployment ke Render

Instruksi untuk mendeploy aplikasi sistem absensi ini ke platform Render.

## Gambaran Umum

Deployment ini mencakup:

- Backend (API PHP) - `absensi-backend`
- Frontend (React) - `absensi-frontend`
- Database PostgreSQL - `absensi-db`

## Prasyarat

- Repository GitHub dengan kode sumber aplikasi
- Akun Render.com

## Langkah-langkah Deployment

### 1. Persiapan Repository

1. Pastikan file [render.yaml](file:///c%3A/xampp/htdocs/project_magang/render.yaml) berada di root direktori repository
2. Pastikan struktur direktori sebagai berikut:

```bash
project_magang/
├── backend/          # Kode PHP backend
├── frontend/         # Kode React frontend
├── config/           # File konfigurasi
├── database/         # Skrip SQL
├── render.yaml       # Konfigurasi Render
└── Dockerfile        # Dockerfile untuk backend
```

### 2. Deployment ke Render

1. Login ke [dashboard Render](https://dashboard.render.com/)
2. Klik "New +" → "Web Service"
3. Pilih repository GitHub kamu
4. Render akan otomatis membaca file [render.yaml](file:///c%3A/xampp/htdocs/project_magang/render.yaml) dan membuat semua layanan yang diperlukan

### 3. Konfigurasi Environment Variables

Setelah deployment selesai, kamu perlu mengatur environment variables:

#### Untuk `absensi-backend`

- `DATABASE_HOST`: Ambil dari URL database Render
- `DATABASE_USER`: Username database
- `DATABASE_PASSWORD`: Password database
- `DATABASE_NAME`: Nama database
- `ESP32_API_KEY`: API key untuk perangkat ESP32
- `JWT_SECRET`: Secret untuk enkripsi token JWT

#### Untuk `absensi-frontend`

Frontend seharusnya otomatis mendapatkan URL backend dari service `absensi-backend`.

### 4. Konfigurasi Database

Database PostgreSQL akan otomatis dibuat sesuai konfigurasi di [render.yaml](file:///c%3A/xampp/htdocs/project_magang/render.yaml). Kamu perlu:

1. Impor skrip SQL dari `database/sistem_absensi_lab_v2.sql` ke database Render
2. Gunakan tools seperti pgAdmin atau klien database favorit kamu

## Catatan Penting

- Pastikan untuk menyimpan secret dan credential dengan aman
- Perangkat ESP32 perlu diupdate untuk menggunakan URL production baru
- File upload akan disimpan di disk yang terpisah dengan kapasitas 1GB

## Troubleshooting

Jika mengalami masalah:

1. Periksa log dari masing-masing layanan di dashboard Render
2. Pastikan koneksi database berhasil
3. Verifikasi bahwa environment variables sudah benar
4. Cek bahwa CORS diatur dengan benar untuk komunikasi antar layanan
