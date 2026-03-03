# 🔌 Dokumentasi Hardware ESP32-CAM

## Sistem Absensi Lab SMK Rajasa Surabaya

Dokumentasi lengkap untuk perakitan hardware ESP32-CAM dengan RFID Reader, Solenoid Door Lock, dan LED Indicator.

---

## 📋 Daftar Komponen

| No | Komponen | Spesifikasi | Jumlah | Estimasi Harga |
|----|----------|-------------|--------|----------------|
| 1 | ESP32-CAM | AI-Thinker ESP32-CAM + OV2640 | 1 | Rp 85.000 |
| 2 | RFID Reader | MFRC522 RC522 | 1 | Rp 25.000 |
| 3 | RFID Card | Kartu RFID 13.56MHz | 10 | Rp 50.000 |
| 4 | Relay Module | 5V 1-Channel Relay | 1 | Rp 15.000 |
| 5 | Solenoid Door Lock | 12V Electric Strike | 1 | Rp 150.000 |
| 6 | LED Hijau | 5mm Green LED | 1 | Rp 2.000 |
| 7 | LED Merah | 5mm Red LED | 1 | Rp 2.000 |
| 8 | Resistor | 220Ω | 2 | Rp 1.000 |
| 9 | Buzzer | Active Buzzer 5V | 1 | Rp 5.000 |
| 10 | Power Supply | 12V 2A Adapter | 1 | Rp 75.000 |
| 11 | Breadboard | 830 tie-points | 1 | Rp 35.000 |
| 12 | Jumper Wires | Male-to-Male, Male-to-Female | 1 set | Rp 25.000 |
| 13 | Casing | Project Box / Custom 3D Print | 1 | Rp 100.000 |
| | | **TOTAL** | | **Rp 570.000** |

---

## 🔌 Wiring Diagram

### ESP32-CAM Pinout

```
                    ESP32-CAM (AI-Thinker)
                    =====================
    
    ┌─────────────────────────────────────────┐
    │                                         │
    │  [GND] [3V3] [SD2] [SD3] [SD1] [SD0]   │
    │    │     │     │     │     │     │     │
    │    ▼     ▼     ▼     ▼     ▼     ▼     │
    │                                         │
    │         ┌─────────────┐                 │
    │         │   OV2640    │                 │
    │         │   CAMERA    │                 │
    │         └─────────────┘                 │
    │                                         │
    │  [VCC] [GND] [SDD] [SDC] [SCK] [SDO]   │
    │    │     │     │     │     │     │     │
    │    ▼     ▼     ▼     ▼     ▼     ▼     │
    │                                         │
    │  [GPIO 0] [GPIO 4] [GPIO 16] [GPIO 2]  │
    │     │        │         │         │      │
    │     ▼        ▼         ▼         ▼      │
    │                                         │
    └─────────────────────────────────────────┘
```

### Koneksi RFID Reader (MFRC522)

```
MFRC522          ESP32-CAM
─────────        ─────────
SDA (SS)  ─────► GPIO 12
SCK       ─────► GPIO 14
MOSI      ─────► GPIO 13
MISO      ─────► GPIO 15
RST       ─────► GPIO 2
GND       ─────► GND
3.3V      ─────► 3.3V
```

### Koneksi Relay Module

```
Relay Module     ESP32-CAM
────────────     ─────────
VCC       ─────► 3.3V / 5V
GND       ─────► GND
IN        ─────► GPIO 4
```

### Koneksi Solenoid Door Lock

```
Solenoid         Relay          Power Supply
─────────        ─────          ────────────
+ (Red)   ─────► NO (Normally Open)
- (Black) ─────► GND ─────────► GND 12V
                 COM ─────────► +12V
```

### Koneksi LED Indicator

```
LED Hijau (Akses Diterima)
──────────────────────────
Anode (+)  ───[220Ω]───► GPIO 16
Cathode (-) ───────────► GND

LED Merah (Akses Ditolak)
─────────────────────────
Anode (+)  ───[220Ω]───► GPIO 0
Cathode (-) ───────────► GND
```

### Koneksi Buzzer

```
Buzzer           ESP32-CAM
──────           ─────────
+ (VCC)   ─────► GPIO 3
- (GND)   ─────► GND
```

---

## 📐 Skema Rangkaian Lengkap

```
┌─────────────────────────────────────────────────────────────────────┐
│                         POWER SUPPLY 12V 2A                         │
│                                                                     │
│    +12V ─────────────────────┬────────────────────────────────────  │
│                              │                                      │
│    GND  ─────────────────────┴────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SOLENOID DOOR LOCK                          │
│                                                                     │
│    +12V ◄───────────────────┐                                       │
│                             │                                       │
│    GND  ◄───────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                         RELAY MODULE 5V                             │
│                                                                     │
│    VCC ◄─── 3.3V/5V                                                 │
│    GND ◄─── GND                                                     │
│    IN  ◄─── GPIO 4 (ESP32-CAM)                                      │
│                                                                     │
│    NO  ───► Solenoid (+)                                            │
│    COM ───► +12V                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ESP32-CAM                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │   GPIO 12 ◄─── SDA (RFID)                                    │  │
│  │   GPIO 14 ◄─── SCK (RFID)                                    │  │
│  │   GPIO 13 ◄─── MOSI (RFID)                                   │  │
│  │   GPIO 15 ◄─── MISO (RFID)                                   │  │
│  │   GPIO 2  ◄─── RST (RFID)                                    │  │
│  │                                                               │  │
│  │   GPIO 4  ───► IN (Relay)                                    │  │
│  │   GPIO 16 ───► LED Hijau (via 220Ω)                          │  │
│  │   GPIO 0  ───► LED Merah (via 220Ω)                          │  │
│  │   GPIO 3  ───► Buzzer (+)                                    │  │
│  │                                                               │  │
│  │   3.3V  ───► VCC (RFID)                                      │  │
│  │   GND   ───► GND (RFID, LED, Buzzer, Relay)                  │  │
│  │                                                               │  │
│  │   ┌─────────────┐                                            │  │
│  │   │   OV2640    │                                            │  │
│  │   │   CAMERA    │                                            │  │
│  │   └─────────────┘                                            │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         RFID READER RC522                           │
│                                                                     │
│    3.3V ◄─── 3.3V (ESP32-CAM)                                       │
│    GND  ◄─── GND (ESP32-CAM)                                        │
│    SDA  ───► GPIO 12                                                │
│    SCK  ───► GPIO 14                                                │
│    MOSI ───► GPIO 13                                                │
│    MISO ───► GPIO 15                                                │
│    RST  ───► GPIO 2                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         LED INDICATOR                               │
│                                                                     │
│    LED HIJAU              LED MERAH                                 │
│    ─────────              ─────────                                 │
│    (+) ──[220Ω]──► GPIO 16  (+) ──[220Ω]──► GPIO 0                 │
│    (-) ──────────► GND      (-) ──────────► GND                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         BUZZER                                      │
│                                                                     │
│    (+) ───► GPIO 3                                                  │
│    (-) ───► GND                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Langkah Perakitan

### Step 1: Persiapan Komponen
1. Siapkan semua komponen sesuai daftar
2. Pastikan ESP32-CAM sudah terpasang modul kamera OV2640
3. Siapkan breadboard dan jumper wires

### Step 2: Koneksi RFID Reader
1. Hubungkan pin RFID ke ESP32-CAM sesuai tabel wiring
2. Pastikan koneksi SPI benar (SDA, SCK, MOSI, MISO)
3. Jangan salah polaritas VCC dan GND

### Step 3: Koneksi Relay dan Solenoid
1. Hubungkan Relay IN ke GPIO 4 ESP32-CAM
2. Hubungkan Relay VCC ke 3.3V/5V
3. Hubungkan Relay GND ke GND
4. **PERHATIAN**: Solenoid menggunakan tegangan 12V terpisah!
5. Hubungkan Solenoid (+) ke Relay NO
6. Hubungkan Solenoid (-) ke GND Power Supply 12V
7. Hubungkan Relay COM ke +12V Power Supply

### Step 4: Koneksi LED Indicator
1. Pasang resistor 220Ω di kaki anoda (+) LED
2. Hubungkan LED Hijau ke GPIO 16
3. Hubungkan LED Merah ke GPIO 0
4. Hubungkan kaki katoda (-) LED ke GND

### Step 5: Koneksi Buzzer
1. Hubungkan kaki (+) Buzzer ke GPIO 3
2. Hubungkan kaki (-) Buzzer ke GND

### Step 6: Verifikasi Koneksi
1. Periksa ulang semua koneksi
2. Pastikan tidak ada kabel yang terbalik
3. Siapkan multimeter untuk cek tegangan (opsional)

---

## 💻 Upload Kode ke ESP32-CAM

### Prerequisites
1. Install Arduino IDE: https://www.arduino.cc/en/software
2. Install ESP32 Board di Arduino IDE:
   - Buka File → Preferences
   - Tambahkan URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - B Tools → Board → Boards Manager
   - Cari "ESP32" dan Install

3. Install Library yang dibutuhkan:
   - MFRC522 (by GithubCommunity)
   - ESP32 Camera

### Konfigurasi Board
```
Board: "ESP32 Wrover Module"
Upload Speed: "921600"
CPU Frequency: "240MHz"
Flash Frequency: "80MHz"
Flash Mode: "QIO"
Partition Scheme: "Huge APP (3MB No OTA/1MB SPIFFS)"
Port: [Pilih port USB yang terhubung]
```

### Upload Kode
1. Buka file `esp32_cam_rfid_scanner.ino`
2. Edit konfigurasi WiFi dan Server URL
3. Hubungkan ESP32-CAM ke komputer via FTDI/USB-TTL
4. **PENTING**: Hubungkan GPIO 0 ke GND saat upload
5. Klik Upload di Arduino IDE
6. Lepaskan GPIO 0 dari GND setelah upload selesai
7. Reset ESP32-CAM

---

## 🧪 Testing

### Test 1: Koneksi WiFi
1. Buka Serial Monitor (115200 baud)
2. Periksa pesan "WiFi Connected"
3. Catat IP Address yang ditampilkan

### Test 2: RFID Reader
1. Tempelkan kartu RFID ke reader
2. Periksa apakah UID terbaca di Serial Monitor
3. Pastikan tidak ada error

### Test 3: Kamera
1. Perhatikan proses pengambilan foto
2. Pastikan 3 foto diambil dengan jeda 2 detik
3. Periksa response dari server

### Test 4: LED dan Buzzer
1. Jika akses diterima: LED hijau menyala + buzzer bunyi
2. Jika akses ditolak: LED merah berkedip + buzzer bunyi

### Test 5: Solenoid Door Lock
1. Jika akses diterima: Solenoid terbuka selama 5 detik
2. Setelah 5 detik: Solenoid terkunci otomatis

---

## ⚠️ Troubleshooting

### Masalah: ESP32-CAM tidak terdeteksi
**Solusi:**
- Pastikan driver FTDI/USB-TTL sudah terinstall
- Cek kabel USB
- Pastikan GPIO 0 terhubung ke GND saat upload

### Masalah: RFID tidak terbaca
**Solusi:**
- Cek koneksi SPI (SDA, SCK, MOSI, MISO)
- Pastikan kartu RFID dalam jangkauan (0-5cm)
- Cek tegangan supply (harus 3.3V)

### Masalah: Kamera tidak mengambil foto
**Solusi:**
- Pastikan modul kamera terpasang dengan benar
- Cek konektor kamera (jangan terbalik)
- Restart ESP32-CAM

### Masalah: Solenoid tidak berfungsi
**Solusi:**
- Cek power supply 12V
- Pastikan relay mendapat sinyal dari GPIO 4
- Cek koneksi NO dan COM pada relay

### Masalah: Tidak bisa terhubung ke server
**Solusi:**
- Pastikan WiFi terhubung
- Cek IP Address server
- Pastikan API Key benar
- Cek firewall/router

---

## 📷 Foto Dokumentasi

### Rekomendasi Foto:
1. Foto keseluruhan rangkaian
2. Close-up koneksi RFID
3. Close-up koneksi Relay dan Solenoid
4. Close-up LED dan Buzzer
5. Screenshot Serial Monitor saat testing
6. Foto tampilan dashboard web

---

## 📞 Kontak Support

Jika mengalami kesulitan dalam perakitan, hubungi:
- Ketua Jurusan TKJ: Pak Budi Santoso
- Tim Magang TKJ SMK Rajasa Surabaya

---

**© 2024 SMK Rajasa Surabaya - Tim Magang TKJ**
