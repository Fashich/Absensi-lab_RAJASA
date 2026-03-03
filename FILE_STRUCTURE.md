# Struktur dan Deskripsi File Proyek Sistem Absensi Laboratorium SMK Rajasa

Dokumentasi ini menjelaskan setiap direktori dan file dalam proyek sistem absensi laboratorium berbasis RFID dan ESP32-CAM untuk SMK Rajasa Surabaya.

## Root Directory (`/`)

### File Konfigurasi dan Dokumentasi

- **`.gitignore`**: File yang menentukan file/direktori mana saja yang tidak akan disertakan dalam repositori Git.
- **`CARA_JALANKAN_PROYEK.md`**: Panduan langkah-demi-langkah untuk menjalankan proyek secara lokal.
- **`DEPLOY.md`**: Dokumentasi tentang cara deployment proyek ke berbagai platform (Vercel, shared hosting, VPS).
- **`HARDWARE_INTEGRATION.md`**: Dokumentasi tentang integrasi perangkat keras (ESP32-CAM dan RFID reader).
- **`INSTRUCTION.md`**: Instruksi lengkap untuk penggunaan sistem dan pengembangan proyek.
- **`README.md`**: Dokumentasi utama proyek termasuk deskripsi, fitur, dan instruksi instalasi.
- **`README_INSTALL.md`**: Panduan instalasi spesifik untuk persiapan lingkungan pengembangan.
- **`FILE_STRUCTURE.md`**: Dokumentasi ini - menjelaskan setiap folder dan file dalam proyek.
- **`package.json`**: File konfigurasi Node.js yang mendefinisikan dependensi frontend dan skrip build.
- **`package-lock.json`**: File yang mengunci versi dependensi Node.js untuk konsistensi lingkungan.

## Backend (`/backend/`)

Backend menggunakan PHP dan bertugas menangani API dan operasi database.

### File Utama

- **`.htaccess`**: File konfigurasi Apache yang menangani URL rewriting dan keamanan server.
- **`test_connection.php`**: File untuk menguji koneksi ke database.
- **`test_login.php`**: File untuk menguji proses login.
- **`reset_password.php`**: Endpoint untuk mengatur ulang password pengguna.

### Direktori Konfigurasi (`/config/`)

- **`database.php`**: File konfigurasi koneksi database termasuk host, nama database, username dan password.

### Direktori Fungsi Umum (`/includes/`)

- **`functions.php`**: File berisi fungsi-fungsi umum seperti pembuatan dan verifikasi token JWT, sanitasi input, logging aktivitas, dan lainnya.

### Direktori API (`/api/`)

Berisi endpoint-endpoint RESTful untuk berbagai modul sistem:

#### Admin (`/api/admin/`)

- **`dashboard_stats.php`**: Mengambil statistik dashboard.
- **`get_all.php`**: Mendapatkan daftar semua admin.
- **`log_akses.php`**: Mengelola log akses sistem.
- **`notifikasi.php`**: Mengelola notifikasi sistem.
- **`create.php`**: Membuat admin baru.

#### Autentikasi (`/api/auth/`)

- **`login.php`**: Proses login dan pembuatan token.
- **`logout.php`**: Proses logout dan invalidasi token.

#### Ekspor Data (`/api/export/`)

- **`presensi_csv.php`**: Ekspor data presensi ke format CSV.

#### Jurusan (`/api/jurusan/`)

- **`get_all.php`**: Mendapatkan daftar semua jurusan.

#### Laporan (`/api/laporan/`)

- **`bulanan.php`**: Laporan presensi bulanan.
- **`harian.php`**: Laporan presensi harian.
- **`rekap_bulanan.php`**: Ringkasan laporan bulanan.
- **`rekap_harian.php`**: Ringkasan laporan harian.

#### Presensi (`/api/presensi/`)

- **`get_all.php`**: Mendapatkan data presensi.
- **`scan_masuk.php`**: Proses scan presensi masuk dari ESP32-CAM.
- **`create_manual.php`**: Membuat entri presensi secara manual.

#### Ruangan (`/api/ruangan/`)

- **`get_all.php`**: Mendapatkan daftar semua ruangan.
- **`create.php`**: Membuat ruangan baru.

#### Siswa (`/api/siswa/`)

- **`create.php`**: Membuat data siswa baru.
- **`delete.php`**: Menghapus data siswa.
- **`get_all.php`**: Mendapatkan daftar semua siswa.
- **`get_by_id.php`**: Mendapatkan data siswa berdasarkan ID.
- **`update.php`**: Memperbarui data siswa.

### Direktori Log (`/logs/`)

- **`activity_*.log`**: File log aktivitas sistem yang disimpan per hari.
- **`.gitkeep`**: File kosong untuk menyimpan direktori kosong di Git.

### Direktori Upload (`/uploads/`)

- **`foto/`**: Direktori untuk menyimpan foto hasil scan dari ESP32-CAM.

## Frontend (`/frontend/`)

Frontend dibangun dengan React.js dan menyediakan antarmuka pengguna yang interaktif.

### File Konfigurasi

- **`.env`**: File konfigurasi lingkungan untuk URL API.
- **`.npmrc`**: File konfigurasi untuk npm registry dan cache.
- **`vercel.json`**: File konfigurasi untuk deployment ke Vercel.

### Package Management

- **`package.json`**: Definisi dependensi dan skrip untuk frontend.
- **`package-lock.json`**: Versi terkunci dari semua dependensi npm.

### Public Assets (`/public/`)

- **`index.html`**: Template HTML utama aplikasi React.
- **`favicon.ico`**: Ikon favicon aplikasi.

### Source Code (`/src/`)

#### Aplikasi Utama (`App.js`)

- **`App.js`**: Komponen utama aplikasi React yang menangani routing dan otentikasi.

#### File Induk (`index.js`)

- **`index.js`**: Entry point utama aplikasi React.

#### File Proxy (`setupProxy.js`)

- **`setupProxy.js`**: File konfigurasi untuk proxy API request ke backend, menghindari masalah CORS saat pengembangan.

#### Assets (`/assets/css/`)

- **`index.css`**: File CSS global untuk aplikasi.

#### Komponen Umum (`/components/`)

- **`common/`**: Komponen-komponen reusable seperti Loading, ProtectedRoute, dll.
  - **`Loading.js`**: Komponen indikator loading.
  - **`ProtectedRoute.js`**: Komponen untuk melindungi route yang membutuhkan autentikasi.
  - **`Toast.js`**: Komponen notifikasi toast.

#### Layout (`/components/layout/`)

- **`MainLayout.js`**: Layout utama aplikasi dengan sidebar dan header.
- **`MainLayout.css`**: Styling untuk layout utama.
- **`AuthLayout.js`**: Layout untuk halaman autentikasi.

#### Konteks (`/context/`)

- **`AuthContext.js`**: Context React untuk manajemen otentikasi pengguna.

#### Layanan (`/services/`)

- **`api.js`**: File konfigurasi dan definisi API calls menggunakan Axios.

#### Halaman (`/pages/`)

##### Admin (`/pages/admin/`)

- **`AdminForm.js`**: Form untuk menambah/edit admin.
- **`AdminForm.css`**: Styling untuk form admin.
- **`AdminList.js`**: Daftar admin.
- **`AdminList.css`**: Styling untuk daftar admin.
- **`Pengaturan.js`**: Halaman pengaturan sistem.
- **`Pengaturan.css`**: Styling untuk halaman pengaturan.

##### Autentikasi (`/pages/auth/`)

- **`Login.js`**: Halaman login pengguna.
- **`Login.css`**: Styling untuk halaman login.

##### Dashboard (`/pages/dashboard/`)

- **`Dashboard.js`**: Dashboard utama aplikasi.
- **`Dashboard.css`**: Styling untuk dashboard.

##### Laporan (`/pages/laporan/`)

- **`LaporanBulanan.js`**: Laporan presensi bulanan.
- **`LaporanBulanan.css`**: Styling untuk laporan bulanan.
- **`LaporanHarian.js`**: Laporan presensi harian.
- **`LaporanHarian.css`**: Styling untuk laporan harian.
- **`LogAkses.js`**: Log akses sistem.
- **`LogAkses.css`**: Styling untuk log akses.

##### Manajemen (`/pages/manajemen/`)

- **`JurusanList.js`**: Daftar jurusan.
- **`JurusanList.css`**: Styling untuk daftar jurusan.
- **`RuanganList.js`**: Daftar ruangan.
- **`RuanganList.css`**: Styling untuk daftar ruangan.
- **`SiswaForm.js`**: Form untuk menambah/edit siswa.
- **`SiswaForm.css`**: Styling untuk form siswa.
- **`SiswaList.js`**: Daftar siswa.
- **`SiswaList.css`**: Styling untuk daftar siswa.

##### Presensi (`/pages/presensi/`)

- **`PresensiList.js`**: Daftar data presensi.
- **`PresensiList.css`**: Styling untuk daftar presensi.
- **`RealtimeMonitor.js`**: Monitor presensi realtime.
- **`RealtimeMonitor.css`**: Styling untuk monitor realtime.

##### Profil (`/pages/profil/`)

- **`Profil.js`**: Halaman profil pengguna.
- **`Profil.css`**: Styling untuk halaman profil.

## Database (`/database/`)

- **`sistem_absensi_lab_v2.sql`**: Skema database lengkap dengan tabel-tabel, trigger, view, dan data dummy untuk sistem absensi.

## Hardware (`/hardware/`)

- **`esp32_cam_rfid_scanner.ino`**: Firmware untuk ESP32-CAM yang menangani RFID scanning dan pengambilan foto.
- **`README.md`**: Dokumentasi implementasi perangkat keras.
- **`HARDWARE_INTEGRATION.md`**: Dokumentasi tentang integrasi perangkat keras.

## ML Training (`/ml-training/`)

- **`barcode_scanner.py`**: Script untuk scanning barcode.
- **`face_recognition.py`**: Implementasi face recognition.
- **`requirements.txt`**: Daftar dependensi Python untuk modul machine learning.

## Templates (`/templates/`)

- **`email_template.html`**: Template email untuk notifikasi.
- **`sms_template.txt`**: Template SMS untuk notifikasi.

## Git (`/.git/`)

Direktori Git standar yang menyimpan informasi repositori, history commit, dan konfigurasi Git.
