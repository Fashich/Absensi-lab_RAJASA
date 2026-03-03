# Integrasi Hardware Sistem Absensi Lab SMK Rajasa Surabaya

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Daftar Hardware](#daftar-hardware)
- [Konektivitas](#konektivitas)
- [Pinout Koneksi](#pinout-koneksi)
- [Firmware ESP32-CAM](#firmware-esp32-cam)
- [Komunikasi dengan Backend](#komunikasi-dengan-backend)

## Gambaran Umum

Sistem ini menggunakan kombinasi perangkat keras IoT untuk memungkinkan absensi otomatis berbasis RFID dan kamera. ESP32-CAM berfungsi sebagai pusat pengumpulan data dengan integrasi RFID reader, kamera, solenoid door lock, dan indikator LED.

## Daftar Hardware

### Utama

- **ESP32-CAM** - Mikrokontroler dengan kamera OV2640
- **RC522 RFID Reader** - Pembaca UID kartu RFID
- **Solenoid Door Lock** - Kunci pintu otomatis
- **LED Hijau & Merah** - Indikator status akses
- **Relay Module** - Kontrol saklar perangkat lainnya
- **MicroSD Card Module** - Penyimpanan lokal (opsional)

### Pendukung

- **Breadboard** - Prototyping
- **Power Supply 5V/3.3V** - Sumber daya
- **Jumper Wires** - Kabel penghubung

## Konektivitas

ESP32-CAM terhubung ke RFID reader melalui protokol SPI:

- ESP32 GPIO 4 → RST (RC522)
- ESP32 GPIO 5 → SCK (RC522)
- ESP32 GPIO 13 → MISO (RC522)
- ESP32 GPIO 14 → MOSI (RC522)
- ESP32 GPIO 15 → SDA (RC522)

Solenoid door lock dikontrol melalui relay yang terhubung ke pin digital ESP32.

## Pinout Koneksi

```mermaid
ESP32-CAM Pinout:
- GPIO 4 → RST_RC522
- GPIO 5 → SCK_RC522
- GPIO 13 → MISO_RC522
- GPIO 14 → MOSI_RC522
- GPIO 15 → SDA_RC522
- GPIO 12 → RELAY_DOOR_LOCK
- GPIO 16 → RED_LED
- GPIO 2 → GREEN_LED
- GPIO 23 → ADDITIONAL_RELAY_1
- GPIO 22 → ADDITIONAL_RELAY_2
```

## Firmware ESP32-CAM

Firmware ESP32-CAM menangani:

1. **Pembacaan UID RFID** - Saat kartu didekatkan ke reader
2. **Pengambilan gambar** - Mengambil 3 foto setelah pembacaan RFID
3. **Koneksi Wi-Fi** - Terhubung ke jaringan lokal
4. **HTTP POST Request** - Mengirim data ke backend
5. **Kontrol perangkat** - Mengatur door lock, LED, relay

Contoh workflow:

```mermaid
1. RFID terdeteksi → Ambil UID
2. Tunggu 2 detik → Ambil foto 1
3. Tunggu 0.5 detik → Ambil foto 2
4. Tunggu 0.5 detik → Ambil foto 3
5. Kirim data ke backend via HTTP POST
6. Terima response → Kontrol door lock dan LED
```

## Komunikasi dengan Backend

ESP32-CAM berkomunikasi dengan backend menggunakan HTTP POST ke endpoint:

- `/api/presensi/scan_masuk.php` untuk scan masuk
- `/api/presensi/scan_keluar.php` untuk scan keluar

Format data yang dikirim:

```json
{
  "rfid_uid": "UID_KARTU_RFID",
  "ruangan_id": 1,
  "api_key": "RAHASIA_API_KEY",
  "foto_1": "data:image/jpeg;base64,...",
  "foto_2": "data:image/jpeg;base64,...",
  "foto_3": "data:image/jpeg;base64,..."
}
```

Format response dari backend:

```json
{
  "success": true,
  "message": "Presensi berhasil dicatat",
  "data": {
    "door_open": true,
    "led_color": "green",
    "buzzer": true,
    "door_open_duration": 5,
    "message_to_display": "SILAKAN MASUK"
  }
}
```

Respons ini digunakan oleh ESP32-CAM untuk:

- Membuka solenoid door lock jika akses valid
- Menyalakan LED hijau jika valid, merah jika tidak valid
- Menyalakan buzzer sebagai feedback suara
- Menampilkan pesan di LCD (jika tersedia)
