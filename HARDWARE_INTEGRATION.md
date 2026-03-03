# Integrasi Hardware ESP32-CAM RFID Scanner

## Gambaran Umum

Sistem absensi laboratorium komputer SMK Rajasa Surabaya dilengkapi dengan integrasi hardware berupa pembaca RFID dan kamera berbasis ESP32-CAM. Modul ini bertugas untuk:

- Membaca UID kartu RFID siswa
- Mengambil foto wajah siswa menggunakan kamera OV2640
- Mengirim data ke server backend PHP untuk diproses
- Mengontrol mekanisme akses (pintu) secara otomatis

## Komponen Hardware

- **ESP32-CAM** (dengan kamera OV2640)
- **RFID Reader RC522**
- **Modul Relay 5V** (untuk mengontrol solenoid)
- **LED Hijau & Merah** (indikator status)
- **Buzzer** (indikator suara, opsional)
- **Solenoid Door Lock 12V**

## Konektivitas

### Koneksi RFID RC522

- SDA  -> GPIO 12
- SCK  -> GPIO 14
- MOSI -> GPIO 13
- MISO -> GPIO 15
- RST  -> GPIO 2

### Koneksi Output

- Relay (solenoid) -> GPIO 4
- LED Hijau -> GPIO 16
- LED Merah -> GPIO 0
- Buzzer -> GPIO 3

## Konfigurasi Firmware

Sebelum meng-upload firmware ke ESP32, pastikan Anda mengubah beberapa pengaturan dalam file firmware:

```cpp
// Konfigurasi WiFi
const char* ssid = "NAMA_WIFI_SEKOLAH";        // Ganti dengan nama WiFi Anda
const char* password = "PASSWORD_WIFI";        // Ganti dengan password WiFi Anda

// Konfigurasi Server
const char* serverUrl = "http://192.168.1.100/project_magang/backend/api/presensi/scan_masuk.php";  // Ganti dengan URL server Anda
const char* apiKey = "rajasa2024secure";      // Harus sama dengan API_KEY di backend
const int ruanganId = 1;                      // ID ruangan tempat pemasangan perangkat
```

## Persyaratan Pengembangan

Untuk mengembangkan dan meng-upload firmware ke ESP32-CAM, Anda membutuhkan:

- **Arduino IDE** atau VS Code dengan ekstensi PlatformIO
- Pustaka-pustaka berikut:
  - `WiFi.h`
  - `HTTPClient.h`
  - `SPI.h`
  - `MFRC522.h` (library untuk RFID reader)
  - `esp_camera.h` (library untuk kamera ESP32-CAM)
  - `soc/soc.h`
  - `soc/rtc_cntl_reg.h`

### Instalasi Library Tambahan (Arduino IDE)

1. Buka Arduino IDE
2. Pergi ke Tools > Board > Boards Manager
3. Cari dan instal "ESP32 by Espressif Systems"
4. Pergi ke Sketch > Include Library > Manage Libraries
5. Instal library berikut:
   - "MFRC522 by GithubCommunity"

### Konfigurasi Board (Arduino IDE)

- Board: AI Thinker ESP32-CAM
- Flash Frequency: 40MHz
- Flash Mode: QIO
- Partition Scheme: No OTA (Large APP)
- Core Debug Level: None
- PSRAM: Disabled
- Upload Speed: 115200

## Instalasi Firmware

1. Buka file [esp32_cam_rfid_scanner.ino](file:///c:/laragon/www/Project.Self/project_magang/hardware/esp32_cam_rfid_scanner.ino) di Arduino IDE
2. Lakukan perubahan konfigurasi sesuai kebutuhan jaringan Anda
3. Hubungkan board ESP32-CAM ke komputer melalui kabel micro-USB
4. Pastikan board dan settingan upload sudah benar
5. Klik tombol Upload

Catatan: Selama proses upload, Anda mungkin perlu menahan tombol "FLASH" pada board hingga proses upload dimulai.

## Cara Kerja Sistem

1. ESP32-CAM menginisialisasi komponen (RFID, kamera, LED, relay)
2. Terhubung ke jaringan WiFi
3. Menunggu kartu RFID ditempelkan ke pembaca
4. Setelah mendeteksi kartu, sistem akan:
   - Memberikan jeda 2 detik untuk posisi siswa
   - Mengambil 3 foto berturut-turut
   - Mengirim data UID RFID dan foto-foto tersebut ke server backend
5. Backend memvalidasi data dan mengirimkan respon
6. Jika valid, pintu akan terbuka selama 5 detik dan LED hijau menyala
7. Jika tidak valid, LED merah akan menyala dan akses ditolak

## Troubleshooting

### Jika tidak bisa upload ke ESP32-CAM

- Pastikan Anda memilih board yang benar
- Pastikan mode upload (Flash) aktif dengan menahan tombol FLASH
- Cek koneksi USB dan driver yang diperlukan

### Jika tidak bisa terhubung ke WiFi

- Pastikan SSID dan password WiFi benar
- Pastikan router WiFi aktif dan ESP32 berada dalam jangkauan

### Jika tidak bisa mengirim data ke server

- Pastikan alamat server benar dan dapat diakses
- Pastikan API key cocok antara firmware dan backend
- Cek koneksi jaringan dan firewall

## Keamanan

- Ubah API key default baik di firmware maupun di backend
- Gunakan koneksi WiFi yang aman
- Pertimbangkan untuk menggunakan HTTPS ketika produksi
