# 🎓 Sistem Absensi Lab Komputer SMK Rajasa Surabaya

Sistem absensi berbasis IoT (Internet of Things) untuk laboratorium komputer di SMK Rajasa Surabaya. Sistem ini mengintegrasikan teknologi ESP32-CAM dengan scanning kartu RFID untuk pendataan kehadiran siswa secara otomatis dan real-time.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PHP](https://img.shields.io/badge/PHP-7.4+-purple.svg)
![React](https://img.shields.io/badge/React-18.0+-cyan.svg)

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Struktur Folder](#-struktur-folder)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Penggunaan](#-penggunaan)
- [Integrasi ESP32-CAM](#-integrasi-esp32-cam)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Tim Pengembang](#-tim-pengembang)

## ✨ Fitur Utama

### 🔐 Autentikasi & Keamanan
- Login dengan JWT (JSON Web Token)
- Multi-level admin (Operator & Jurusan)
- Session management yang aman

### 📊 Dashboard
- Statistik real-time kehadiran siswa
- Monitoring presensi terbaru
- Grafik statistik per jurusan

### 👨‍🎓 Manajemen Data
- **Data Siswa**: CRUD lengkap dengan filter dan pagination
- **Data Jurusan**: Informasi jurusan dan statistik
- **Data Ruangan**: Monitoring ruangan lab dan ESP32-CAM

### 📋 Presensi
- Scan masuk/keluar via ESP32-CAM
- Validasi RFID dan foto capture
- Status kehadiran (Hadir, Terlambat, Sakit, Izin, Alpha)

### 📈 Laporan
- Export data presensi ke CSV
- Laporan harian dan bulanan
- Log akses tidak valid

### 🔔 Notifikasi
- Notifikasi real-time
- Alert untuk akses tidak valid

## 🛠 Teknologi

### Backend
- **PHP 7.4+** - Server-side scripting
- **MySQL/MariaDB** - Database
- **JWT** - Autentikasi token-based

### Frontend
- **React 18** - UI Library
- **React Router** - Routing
- **Axios** - HTTP Client
- **Chart.js** - Data visualization
- **Toastify** - Notifications

### Hardware (IoT)
- **ESP32-CAM** - Microcontroller dengan kamera OV2640
- **RFID Reader MFRC522** - Pembaca kartu RFID 13.56MHz
- **Solenoid Door Lock 12V** - Kunci pintu elektrik
- **Relay Module 5V** - Kontrol solenoid
- **LED Indicator** - LED hijau (valid) & merah (invalid)
- **Buzzer** - Indikator suara
- **Power Supply 12V 2A** - Sumber daya

## 📁 Struktur Folder

```
sistem-absensi-lab/
├── 📁 database/
│   └── sistem_absensi_lab.sql      # Database schema & data
│
├── 📁 backend/                      # PHP API
│   ├── 📁 config/
│   │   └── database.php            # Konfigurasi database
│   ├── 📁 includes/
│   │   └── functions.php           # Helper functions
│   ├── 📁 api/
│   │   ├── 📁 auth/                # Autentikasi API
│   │   ├── 📁 siswa/               # Siswa CRUD API
│   │   ├── 📁 jurusan/             # Jurusan API
│   │   ├── 📁 ruangan/             # Ruangan API
│   │   ├── 📁 presensi/            # Presensi API
│   │   ├── 📁 admin/               # Admin API
│   │   └── 📁 export/              # Export API
│   └── 📁 uploads/                 # Folder upload
│
├── 📁 frontend/                     # React App
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable components
│   │   ├── 📁 pages/               # Page components
│   │   ├── 📁 services/            # API services
│   │   ├── 📁 context/             # React context
│   │   └── 📁 assets/              # CSS & images
│   └── package.json
│
└── README.md
```

## 🚀 Instalasi

### Persyaratan Sistem
- PHP 7.4 atau lebih tinggi
- MySQL 5.7 atau lebih tinggi / MariaDB
- Node.js 14+ dan npm
- Web Server (Apache/Nginx)
- XAMPP/WAMP/MAMP (untuk local development)

### Langkah 1: Clone/Extract Project
```bash
# Extract file ke folder web server
# XAMPP: C:\xampp\htdocs\sistem-absensi-lab
```

### Langkah 2: Setup Database

#### Cara 1: Via phpMyAdmin (Direkomendasikan)
1. Buka browser dan akses `http://localhost/phpmyadmin`
2. Klik tab **"SQL"**
3. Buka file `database/sistem_absensi_lab.sql`
4. Copy seluruh isi file
5. Paste ke kolom SQL di phpMyAdmin
6. Klik tombol **"Go"** atau **"Kirim"**

#### Cara 2: Via Command Line
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE sistem_absensi_lab;

# Import SQL file
USE sistem_absensi_lab;
SOURCE /path/to/sistem_absensi_lab.sql;
```

### Langkah 3: Konfigurasi Backend

Edit file `backend/config/database.php`:
```php
// Sesuaikan dengan konfigurasi database Anda
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistem_absensi_lab');
define('DB_USER', 'root');      // Username database
define('DB_PASS', '');          // Password database (kosong untuk XAMPP default)
```

### Langkah 4: Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm start

# Atau build untuk production
npm run build
```

### Langkah 5: Akses Aplikasi

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost/sistem-absensi-lab/backend`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

## ⚙️ Konfigurasi

### Konfigurasi ESP32-CAM

Edit file `backend/config/database.php`:
```php
// API Key untuk ESP32-CAM
define('ESP32_API_KEY', 'rajasa2024secure');

// Durasi pintu terbuka (detik)
define('DOOR_OPEN_DURATION', 5);
```

### Konfigurasi JWT
```php
// Secret key untuk JWT
define('JWT_SECRET', 'rajasa2024secretkeyabsensilab');

// Token expired (24 jam dalam detik)
define('JWT_EXPIRED', 86400);
```

## 📱 Penggunaan

### Akun Demo

| Role | Username | Password |
|------|----------|----------|
| Admin Operator | `admin` | `admin123` |
| Admin Jurusan TKJ | `admintkj` | `admin123` |
| Admin Jurusan RPL | `adminrpl` | `admin123` |
| Admin Jurusan MM | `adminmm` | `admin123` |

### Alur Kerja Sistem

1. **Siswa Scan Kartu**: Siswa menempelkan kartu RFID ke ESP32-CAM
2. **Validasi**: Sistem memvalidasi RFID dan mengambil foto
3. **Akses Diterima**: Jika valid, pintu terbuka dan LED hijau menyala
4. **Akses Ditolak**: Jika tidak valid, LED merah menyala
5. **Data Tersimpan**: Presensi tercatat di database
6. **Monitoring**: Admin dapat memantau via dashboard

---

## 🔌 Integrasi ESP32-CAM

### Alur Kerja ESP32-CAM (Sesuai Flowchart)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SISWA MENEMPELKAN KARTU RFID                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ESP32-CAM MENGAKTIFKAN KAMERA OV2640                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  JEDA 2 DETIK (Siswa memposisikan diri)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  AMBIL 3 FOTO BERTURUT-TURUT:                                           │
│  • Foto 1 → Jeda 500ms → Foto 2 → Jeda 500ms → Foto 3                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  KOMPRESI FOTO (JPEG Quality: 15)                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  KIRIM DATA KE SERVER VIA HTTP POST                                     │
│  Endpoint: /api/presensi/scan_masuk.php                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  TERIMA RESPONSE DARI SERVER:                                           │
│  • door_open: true/false                                               │
│  • led_color: "green"/"red"                                            │
│  • buzzer: true/false                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│     JIKA VALID            │       │     JIKA TIDAK VALID      │
│  ─────────────────        │       │  ─────────────────────    │
│                           │       │                           │
│  • LED HIJAU menyala      │       │  • LED MERAH berkedip     │
│  • Buzzer: suara sukses   │       │  • Buzzer: suara error    │
│  • Solenoid TERBUKA       │       │  • Solenoid TETAP KUNCI   │
│  • Pintu terbuka 5 detik  │       │  • Pintu TERTUTUP         │
│                           │       │                           │
│  SISWA DAPAT MASUK        │       │  SISWA TIDAK BISA MASUK   │
└───────────────────────────┘       └───────────────────────────┘
```

### File Hardware

| File | Deskripsi |
|------|-----------|
| `hardware/esp32_cam_rfid_scanner.ino` | Kode Arduino untuk ESP32-CAM |
| `hardware/README.md` | Dokumentasi wiring dan perakitan |
| `docs/FLOWCHART.md` | Flowchart lengkap sistem |

### Konfigurasi ESP32-CAM

Edit file `hardware/esp32_cam_rfid_scanner.ino`:

```cpp
// Konfigurasi WiFi
const char* ssid = "NAMA_WIFI_SEKOLAH";
const char* password = "PASSWORD_WIFI";

// Konfigurasi Server
const char* serverUrl = "http://192.168.1.100/sistem-absensi-lab/backend/api/presensi/scan_masuk.php";
const char* apiKey = "rajasa2024secure";
const int ruanganId = 1;  // ID ruangan ini
```

### Pin Connections

| Komponen | ESP32-CAM Pin |
|----------|---------------|
| RFID SDA | GPIO 12 |
| RFID SCK | GPIO 14 |
| RFID MOSI | GPIO 13 |
| RFID MISO | GPIO 15 |
| RFID RST | GPIO 2 |
| Relay IN | GPIO 4 |
| LED Hijau | GPIO 16 |
| LED Merah | GPIO 0 |
| Buzzer | GPIO 3 |

### Upload Kode ke ESP32-CAM

1. Install Arduino IDE dan ESP32 Board
2. Install library: MFRC522
3. Hubungkan ESP32-CAM ke komputer via FTDI/USB-TTL
4. **PENTING**: Hubungkan GPIO 0 ke GND saat upload
5. Upload kode `esp32_cam_rfid_scanner.ino`
6. Lepaskan GPIO 0 dari GND setelah upload
7. Reset ESP32-CAM

Lihat dokumentasi lengkap di folder `hardware/`.

---

## 📚 API Documentation

### Autentikasi

#### Login
```http
POST /api/auth/login.php
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Logout
```http
POST /api/auth/logout.php
Authorization: Bearer {token}
```

### Siswa

#### Get All Siswa
```http
GET /api/siswa/get_all.php?page=1&limit=10&search=keyword
Authorization: Bearer {token}
```

#### Create Siswa
```http
POST /api/siswa/create.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "nisn": "0091234567",
  "nis": "20210001",
  "nama_lengkap": "Ahmad Fauzi",
  "jenis_kelamin": "L",
  "jurusan_id": 1,
  "kelas": "XII",
  "rombel": "TKJ-1"
}
```

### Presensi (ESP32-CAM)

#### Scan Masuk
```http
POST /api/presensi/scan_masuk.php
Content-Type: application/json

{
  "api_key": "rajasa2024secure",
  "rfid_uid": "RFID-TKJ-001",
  "ruangan_id": 1,
  "foto_1": "base64_encoded_image_1",
  "foto_2": "base64_encoded_image_2",
  "foto_3": "base64_encoded_image_3"
}
```

**Response (Akses Diterima):**
```json
{
  "success": true,
  "message": "Presensi berhasil dicatat",
  "data": {
    "door_open": true,
    "led_color": "green",
    "buzzer": true,
    "buzzer_pattern": "success",
    "door_open_duration": 5,
    "message_to_display": "SILAKAN MASUK",
    "siswa": {
      "nisn": "0091234567",
      "nama": "Ahmad Fauzi",
      "kelas": "XII",
      "rombel": "TKJ-1",
      "jurusan": "Teknik Komputer dan Jaringan"
    },
    "presensi": {
      "tanggal": "2024-03-03",
      "waktu_masuk": "07:30:00",
      "status": "hadir",
      "ruangan": "Laboratorium Komputer TKJ 1"
    }
  }
}
```

**Response (Akses Ditolak):**
```json
{
  "success": false,
  "message": "Kartu RFID tidak terdaftar",
  "data": {
    "door_open": false,
    "led_color": "red",
    "buzzer": true,
    "buzzer_pattern": "error",
    "message_to_display": "KARTU TIDAK TERDAFTAR",
    "rfid_uid": "RFID-UNKNOWN-001"
  }
}
```

## 🔧 Troubleshooting

### Masalah Koneksi Database
```
Error: Connection failed
```
**Solusi:**
- Pastikan MySQL/MariaDB berjalan
- Cek konfigurasi di `backend/config/database.php`
- Pastikan database `sistem_absensi_lab` sudah dibuat

### CORS Error
```
Access-Control-Allow-Origin header is missing
```
**Solusi:**
- Headers CORS sudah dikonfigurasi di `database.php`
- Pastikan `Access-Control-Allow-Origin` sesuai dengan domain frontend

### Token Invalid
```
Error: Token tidak valid
```
**Solusi:**
- Login ulang untuk mendapatkan token baru
- Cek JWT_SECRET di konfigurasi

### Upload File Gagal
```
Error: Upload gagal
```
**Solusi:**
- Pastikan folder `backend/uploads/` writable (chmod 755)
- Cek `upload_max_filesize` di php.ini

## 👥 Tim Pengembang

**Tim Magang TKJ SMK Rajasa Surabaya**

Project ini dibuat sebagai bagian dari program magang jurusan Teknik Komputer dan Jaringan (TKJ) di SMK Rajasa Surabaya.

### Dibuat dengan ❤️ oleh:
- Tim Magang TKJ SMK Rajasa Surabaya
- Dibimbing oleh: Pak Budi Santoso (Ketua Jurusan TKJ)

---

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE)

## 🙏 Ucapan Terima Kasih

- SMK Rajasa Surabaya
- Jurusan Teknik Komputer dan Jaringan
- Semua pihak yang telah mendukung project ini

---

**© 2024 SMK Rajasa Surabaya - Tim Magang TKJ**

*Solusi IoT untuk Pendidikan yang Lebih Baik*
