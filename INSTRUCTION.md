# 📖 INSTRUCTION MANUAL
## Sistem Absensi Lab Komputer SMK Rajasa Surabaya

---

## 📋 Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Instalasi](#instalasi)
3. [Konfigurasi](#konfigurasi)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Integrasi Hardware](#integrasi-hardware)
6. [Deploy ke Vercel](#deploy-ke-vercel)
7. [Troubleshooting](#troubleshooting)

---

## Persyaratan Sistem

### Software
- **XAMPP/WAMP/MAMP** (PHP 7.4+, MySQL/MariaDB)
- **Node.js** 14+ dan npm
- **Git** (opsional)
- **Arduino IDE** (untuk ESP32-CAM)

### Hardware (Untuk Sistem Lengkap)
- **ESP32-CAM** dengan modul kamera OV2640
- **RFID Reader** MFRC522
- **Solenoid Door Lock** 12V
- **Relay Module** 5V
- **LED** Hijau & Merah
- **Buzzer** 5V
- **Power Supply** 12V 2A
- **Breadboard & Jumper Wires**

---

## Instalasi

### Step 1: Download Project

```bash
# Clone atau download project ini
# Extract ke folder C:\xampp\htdocs\ (Windows)
# atau /var/www/html/ (Linux)
```

### Step 2: Setup Database

#### Cara 1: Via phpMyAdmin (Direkomendasikan)

1. Buka browser dan akses `http://localhost/phpmyadmin`
2. Klik tab **"SQL"**
3. Buka file `database/sistem_absensi_lab_v2.sql`
4. Copy seluruh isi file SQL
5. Paste ke kolom SQL di phpMyAdmin
6. Klik tombol **"Go"** atau **"Kirim"**
7. Database akan terbuat otomatis dengan data lengkap

#### Cara 2: Via Command Line

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE sistem_absensi_lab;

# Import SQL file
USE sistem_absensi_lab;
SOURCE C:/xampp/htdocs/sistem-absensi-lab/database/sistem_absensi_lab_v2.sql;
```

### Step 3: Konfigurasi Backend

Edit file `backend/config/database.php`:

```php
<?php
// Konfigurasi Database - SESUAIKAN DENGAN SETTING ANDA
define('DB_HOST', 'localhost');
define('DB_NAME', 'sistem_absensi_lab');
define('DB_USER', 'root');      // Username MySQL
define('DB_PASS', '');          // Password MySQL (kosong untuk XAMPP default)
define('DB_CHARSET', 'utf8mb4');

// Konfigurasi Aplikasi
define('APP_NAME', 'Sistem Absensi Lab SMK Rajasa');
define('APP_VERSION', '1.0.0');
define('BASE_URL', 'http://localhost/sistem-absensi-lab/backend/');

// Konfigurasi JWT
define('JWT_SECRET', 'rajasa2024secretkeyabsensilab');
define('JWT_EXPIRED', 86400); // 24 jam

// Konfigurasi ESP32-CAM
define('ESP32_API_KEY', 'rajasa2024secure');
define('DOOR_OPEN_DURATION', 5); // detik
?>
```

### Step 4: Setup Frontend

```bash
# Masuk ke folder frontend
cd sistem-absensi-lab/frontend

# Install dependencies
npm install

# Jalankan development server
npm start

# Aplikasi akan berjalan di http://localhost:3000
```

### Step 5: Verifikasi Instalasi

1. **Backend API**: Buka `http://localhost/sistem-absensi-lab/backend/`
   - Jika muncul pesan "API Server Running", berarti berhasil

2. **Frontend**: Buka `http://localhost:3000`
   - Halaman login akan muncul

3. **Login dengan akun demo**:
   - Username: `admin`
   - Password: `admin123`

---

## Konfigurasi

### Konfigurasi ESP32-CAM

Edit file `hardware/esp32_cam_rfid_scanner.ino`:

```cpp
// ============================================
// KONFIGURASI WIFI - SESUAIKAN
// ============================================
const char* ssid = "NAMA_WIFI_SEKOLAH";
const char* password = "PASSWORD_WIFI";

// ============================================
// KONFIGURASI SERVER - SESUAIKAN
// ============================================
const char* serverUrl = "http://192.168.1.100/sistem-absensi-lab/backend/api/presensi/scan_masuk.php";
const char* apiKey = "rajasa2024secure";
const int ruanganId = 1;  // ID ruangan ini (1=Lab TKJ-1, 2=Lab TKJ-2, dst)
```

### Pin Connections ESP32-CAM

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

---

## Menjalankan Aplikasi

### Mode Development

```bash
# Terminal 1: Jalankan backend (XAMPP Apache)
# Pastikan Apache dan MySQL running di XAMPP Control Panel

# Terminal 2: Jalankan frontend
cd sistem-absensi-lab/frontend
npm start
```

### Mode Production

```bash
# Build frontend untuk production
cd sistem-absensi-lab/frontend
npm run build

# Copy folder build ke folder backend/public
# atau konfigurasi web server untuk serve folder build
```

---

## Integrasi Hardware

### Wiring Diagram Lengkap

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESP32-CAM PINOUT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GPIO 12 ───────► RFID SDA                                      │
│  GPIO 14 ───────► RFID SCK                                      │
│  GPIO 13 ───────► RFID MOSI                                     │
│  GPIO 15 ───────► RFID MISO                                     │
│  GPIO 2  ───────► RFID RST                                      │
│                                                                 │
│  GPIO 4  ───────► Relay IN                                      │
│  GPIO 16 ───────► LED Hijau (+)                                 │
│  GPIO 0  ───────► LED Merah (+)                                 │
│  GPIO 3  ───────► Buzzer (+)                                    │
│                                                                 │
│  3.3V  ─────────► RFID VCC, Relay VCC                           │
│  GND   ─────────► RFID GND, Relay GND, LED (-), Buzzer (-)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SOLENOID CONNECTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Solenoid (+) ──► Relay NO (Normally Open)                      │
│  Solenoid (-) ──► GND Power Supply 12V                          │
│  Relay COM ─────► +12V Power Supply                             │
│                                                                 │
│  ⚠️ PERHATIAN: Solenoid menggunakan tegangan 12V terpisah!      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Upload Kode ke ESP32-CAM

1. **Install Arduino IDE** dari https://www.arduino.cc/en/software

2. **Install ESP32 Board**:
   - Buka File → Preferences
   - Tambahkan URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Buka Tools → Board → Boards Manager
   - Cari "ESP32" dan Install

3. **Install Library**:
   - Sketch → Include Library → Manage Libraries
   - Cari dan install: `MFRC522` oleh GithubCommunity

4. **Konfigurasi Board**:
   ```
   Board: "ESP32 Wrover Module"
   Upload Speed: "921600"
   CPU Frequency: "240MHz"
   Flash Mode: "QIO"
   Partition Scheme: "Huge APP (3MB No OTA/1MB SPIFFS)"
   ```

5. **Upload Kode**:
   - Buka file `hardware/esp32_cam_rfid_scanner.ino`
   - Hubungkan ESP32-CAM ke komputer via FTDI/USB-TTL
   - **PENTING**: Hubungkan GPIO 0 ke GND saat upload
   - Klik Upload
   - Lepaskan GPIO 0 dari GND setelah upload selesai
   - Reset ESP32-CAM

---

## Deploy ke Vercel

### Step 1: Persiapan

1. **Daftar akun Vercel**: https://vercel.com
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

### Step 2: Konfigurasi Frontend untuk Deploy

Edit file `frontend/package.json`, tambahkan:

```json
{
  "homepage": ".",
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

Buat file `frontend/vercel.json`:

```json
{
  "version": 2,
  "name": "sistem-absensi-lab",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 3: Konfigurasi API URL

Edit file `frontend/src/services/api.js`:

```javascript
// Untuk production (Vercel), ganti dengan URL backend Anda
const API_URL = process.env.REACT_APP_API_URL || 
                'https://your-backend-domain.com/backend';
```

### Step 4: Deploy

```bash
# Masuk ke folder frontend
cd sistem-absensi-lab/frontend

# Login ke Vercel
vercel login

# Deploy
vercel

# Ikuti instruksi:
# - Set up and deploy? [Y/n] → Y
# - Link to existing project? [y/N] → N (untuk deploy baru)
# - What's your project name? → sistem-absensi-lab
```

### Step 5: Setup Backend untuk Production

Untuk backend PHP, Anda perlu hosting terpisah:

**Opsi 1: Shared Hosting (cPanel)**
1. Upload folder `backend/` ke hosting via FTP/cPanel File Manager
2. Import database via phpMyAdmin
3. Update konfigurasi database

**Opsi 2: VPS (DigitalOcean, AWS, dll)**
1. Setup server dengan LAMP/LEMP stack
2. Upload project ke `/var/www/html/`
3. Konfigurasi Apache/Nginx
4. Setup SSL dengan Let's Encrypt

**Opsi 3: Heroku (Free)**
1. Install Heroku CLI
2. Buat `composer.json` di folder backend
3. Deploy dengan `git push heroku main`

### Step 6: Update CORS

Edit `backend/config/database.php`, update CORS header:

```php
// Ganti dengan domain Vercel Anda
header('Access-Control-Allow-Origin: https://sistem-absensi-lab.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

## Troubleshooting

### Masalah: Database Connection Failed

**Solusi:**
```bash
# Cek MySQL running
cd C:\xampp
.\mysql\bin\mysql.exe -u root -p

# Jika password salah, reset:
# 1. Stop MySQL di XAMPP
# 2. Edit my.ini, tambahkan: skip-grant-tables
# 3. Restart MySQL
# 4. Update password
```

### Masalah: CORS Error

**Solusi:**
```php
// Edit backend/config/database.php
// Ganti * dengan domain spesifik Anda
header('Access-Control-Allow-Origin: *'); // Untuk development
header('Access-Control-Allow-Origin: https://your-domain.com'); // Untuk production
```

### Masalah: ESP32-CAM Tidak Terhubung ke WiFi

**Solusi:**
```cpp
// Cek SSID dan Password
const char* ssid = "NAMA_WIFI";  // Case sensitive!
const char* password = "PASSWORD";  // Case sensitive!

// Pastikan WiFi 2.4GHz (ESP32 tidak support 5GHz)
```

### Masalah: RFID Tidak Terbaca

**Solusi:**
1. Cek koneksi SPI (SDA, SCK, MOSI, MISO)
2. Pastikan kartu RFID 13.56MHz (MFRC522)
3. Cek tegangan supply (harus 3.3V)
4. Pastikan jarak kartu dengan reader < 5cm

### Masalah: Solenoid Tidak Berfungsi

**Solusi:**
1. Cek power supply 12V
2. Pastikan relay mendapat sinyal 5V
3. Cek koneksi NO dan COM pada relay
4. Pastikan solenoid compatible dengan arus relay

---

## 📞 Support

Jika mengalami kesulitan, hubungi:
- **Ketua Jurusan TKJ**: Pak Budi Santoso
- **Tim Magang TKJ SMK Rajasa Surabaya**

---

**© 2024 SMK Rajasa Surabaya - Tim Magang TKJ**
