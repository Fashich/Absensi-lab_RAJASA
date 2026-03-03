# 📊 Flowchart Sistem Absensi Lab

## Sistem Absensi Lab Komputer SMK Rajasa Surabaya

Dokumentasi lengkap alur kerja sistem absensi berbasis ESP32-CAM dan RFID.

---

## 🔄 Flowchart Utama - Proses Scan Masuk

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MULAI                                              │
│                    (Sistem Standby)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SISWA MENDEKATI AREA AKSES                                                  │
│  ───────────────────────────                                                 │
│  Siswa membawa ID Card yang telah terdaftar                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SISWA MENEMPELKAN ID CARD PADA SENSOR                                       │
│  ─────────────────────────────────────────                                   │
│  RFID Reader mendeteksi kartu                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESP32-CAM MENGAKTIFKAN KAMERA                                               │
│  ───────────────────────────────                                             │
│  Kamera OV2640 mulai bersiap                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  JEDA 2 DETIK                                                                │
│  ─────────────                                                               │
│  Memberikan kesempatan siswa memposisikan diri                               │
│  Buzzer: Beep pendek (1 detik)                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AMBIL FOTO 1                                                                │
│  ────────────                                                                │
│  Kamera mengambil foto pertama                                               │
│  Buzzer: Beep singkat                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  JEDA SINGKAT (500ms)                                                        │
│  ────────────────────                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AMBIL FOTO 2                                                                │
│  ────────────                                                                │
│  Kamera mengambil foto kedua                                                 │
│  Buzzer: Beep singkat                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  JEDA SINGKAT (500ms)                                                        │
│  ────────────────────                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AMBIL FOTO 3                                                                │
│  ────────────                                                                │
│  Kamera mengambil foto ketiga                                                │
│  Buzzer: Beep singkat                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  KOMPRESI FOTO                                                               │
│  ─────────────                                                               │
│  Mengurangi ukuran file untuk menghemat bandwidth                            │
│  Format: JPEG dengan kualitas 15 (0-63)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  GABUNGKAN DATA                                                              │
│  ──────────────                                                              │
│  • RFID UID                                                                  │
│  • Foto 1 (base64)                                                           │
│  • Foto 2 (base64)                                                           │
│  • Foto 3 (base64)                                                           │
│  • Ruangan ID                                                                │
│  • API Key                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  KIRIM DATA KE SERVER VIA HTTP POST                                          │
│  ───────────────────────────────────                                         │
│  Endpoint: /api/presensi/scan_masuk.php                                      │
│  Protocol: HTTP/1.1                                                          │
│  Content-Type: application/json                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SERVER MENERIMA DATA                                                        │
│  ───────────────────                                                         │
│  Menerima paket data dari ESP32-CAM                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  VALIDASI DATA                                                               │
│  ─────────────                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Cek API Key                                                     │    │
│  │  2. Cek Ruangan ID valid & aktif                                    │    │
│  │  3. Cek RFID UID terdaftar di database                              │    │
│  │  4. Cek siswa sudah presensi hari ini?                              │    │
│  │  5. Cek jam masuk & tentukan status (Hadir/Terlambat)               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│         RFID VALID                  │   │         RFID TIDAK VALID            │
│   ─────────────────────             │   │   ─────────────────────────         │
│   • ID terdaftar di database        │   │   • ID tidak terdaftar              │
│   • Siswa aktif                     │   │   • Ruangan tidak aktif             │
│   • Belum presensi hari ini         │   │   • Sudah presensi hari ini         │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│  SIMPAN DATA PRESENSI               │   │  CATAT LOG AKSES TIDAK VALID        │
│  ───────────────────                │   │  ───────────────────────────        │
│  • Siswa ID                         │   │  Simpan ke tabel log_akses:         │
│  • Ruangan ID                       │   │  • RFID UID                         │
│  • Jurusan ID                       │   │  • Status: id_tidak_terdaftar       │
│  • Tanggal & Waktu                  │   │  • Keterangan                       │
│  • Status (Hadir/Terlambat)         │   │  • Tanggal & Waktu                  │
│  • 3 Foto Scan                      │   │  • Ruangan ID                       │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│  KIRIM NOTIFIKASI                   │   │  KIRIM RESPONSE KE ESP32:           │
│  ────────────────                   │   │  ─────────────────────────          │
│  Notifikasi ke Admin Jurusan:       │   │  {                                  │
│  "Siswa [Nama] masuk ke [Ruangan]"  │   │    "success": false,              │
│                                     │   │    "door_open": false,            │
│                                     │   │    "led_color": "red",            │
│                                     │   │    "buzzer": true,                │
│                                     │   │    "buzzer_pattern": "error"      │
│                                     │   │  }                                  │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│  KIRIM RESPONSE KE ESP32:           │   │  ESP32 MENERIMA RESPONSE            │
│  ─────────────────────────          │   │  ───────────────────────            │
│  {                                  │   │                                     │
│    "success": true,                 │   │  LED MERAH MENYALA                  │
│    "door_open": true,               │   │  BUZZER: Pola error                 │
│    "led_color": "green",            │   │                                     │
│    "buzzer": true,                  │   │  SOLENOID: TETAP TERKUNCI           │
│    "buzzer_pattern": "success",     │   │  (Pintu tidak terbuka)              │
│    "door_open_duration": 5          │   │                                     │
│  }                                  │   │  SISWA TIDAK BISA MASUK             │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│  ESP32 MENERIMA RESPONSE            │   │  SISWA DIMINTA UNTUK:               │
│  ───────────────────────            │   │  ───────────────────                │
│                                     │   │  • Hubungi administrator            │
│  LED HIJAU MENYALA                  │   │  • Periksa kartu RFID               │
│  BUZZER: Pola sukses                │   │  • Daftar ke sistem jika belum      │
│                                     │   │                                     │
│  SOLENOID TERBUKA (5 DETIK)         │   │                                     │
│  (Pintu terbuka)                    │   │                                     │
│                                     │   │                                     │
│  SISWA DAPAT MASUK                  │   │                                     │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SETELAH 5 DETIK                                                             │
│  ───────────────                                                             │
│  Solenoid otomatis terkunci kembali                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KEMBALI KE STANDBY                                │
│                    (Menunggu scan RFID berikutnya)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flowchart Autentikasi Admin

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN                                              │
│  ─────────                                                                   │
│  User memasukkan username & password                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  VALIDASI CREDENTIALS                                                        │
│  ─────────────────────                                                       │
│  • Cek username ada di database                                              │
│  • Verifikasi password dengan bcrypt                                         │
│  • Cek status user aktif                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│         LOGIN SUKSES                │   │         LOGIN GAGAL                 │
│  ───────────────────                │   │  ────────────────                   │
│                                     │   │                                     │
│  Generate JWT Token                 │   │  Tampilkan pesan error              │
│  Update last_login                  │   │  Redirect ke halaman login          │
│  Redirect ke Dashboard              │   │                                     │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
```

---

## 📊 Flowchart Hak Akses

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEVEL AKSES                                          │
│  ────────────────                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   ADMIN OPERATOR    │   │   ADMIN JURUSAN     │   │       SISWA         │
│  ───────────────    │   │  ──────────────     │   │  ─────────          │
│                     │   │                     │   │                     │
│  ✓ Full Access      │   │  ✓ Data Siswa       │   │  ✓ Scan RFID        │
│                     │   │    Jurusan Sendiri  │   │  ✓ Lihat Presensi   │
│  • Kelola Admin     │   │                     │   │    Sendiri          │
│  • Semua Data       │   │  • Input Data       │   │                     │
│    Presensi         │   │    Siswa            │   │  ✗ Tidak bisa       │
│  • Export CSV       │   │  • Verifikasi       │   │    akses dashboard  │
│  • Pengaturan       │   │    Presensi         │   │                     │
│    Sistem           │   │  • Laporan          │   │                     │
│                     │   │    Jurusan          │   │                     │
│  • Kelola Jurusan   │   │                     │   │                     │
│  • Kelola Ruangan   │   │  ✗ Tidak bisa       │   │                     │
│                     │   │    lihat data       │   │                     │
│                     │   │    jurusan lain     │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 📈 Flowchart Export Laporan

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPORT LAPORAN                                       │
│  ────────────────                                                            │
│  Admin memilih filter dan klik Export CSV                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FILTER DATA                                                                 │
│  ───────────                                                                 │
│  • Rentang Tanggal (Dari - Sampai)                                           │
│  • Jurusan (opsional)                                                        │
│  • Ruangan (opsional)                                                        │
│  • Status Kehadiran (opsional)                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  QUERY DATABASE                                                              │
│  ──────────────                                                              │
│  SELECT * FROM presensi WHERE ...                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  GENERATE CSV FILE                                                           │
│  ────────────────                                                            │
│  Format:                                                                     │
│  Tanggal, Waktu Masuk, Waktu Keluar, NISN, NIS, Nama, Kelas,                 │
│  Jurusan, Ruangan, Status, Keterangan                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DOWNLOAD FILE                                                               │
│  ────────────                                                                │
│  presensi_YYYY-MM-DD_sampai_YYYY-MM-DD.csv                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔔 Flowchart Notifikasi Real-time

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRIGGER EVENT                                        │
│  ──────────────                                                              │
│  • Siswa scan masuk                                                          │
│  • Akses tidak valid terdeteksi                                              │
│  • Jadwal penting                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CEK TARGET NOTIFIKASI                                                       │
│  ─────────────────────                                                       │
│  • Broadcast (semua user)                                                    │
│  • Spesifik user (Admin Jurusan terkait)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIMPAN KE DATABASE                                                          │
│  ──────────────────                                                          │
│  Tabel: notifikasi                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TAMPILKAN DI DASHBOARD                                                      │
│  ──────────────────────                                                      │
│  • Icon notifikasi dengan badge count                                        │
│  • Dropdown list notifikasi terbaru                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Sequence Diagram - Scan RFID

```text
Siswa          ESP32-CAM          Server           Database         Admin
  │                 │                 │                 │              │
  │  Tempel Kartu   │                 │                 │              │
  │────────────────►│                 │                 │              │
  │                 │  Baca RFID UID  │                 │              │
  │                 │────────────────►│                 │              │
  │                 │                 │  Validasi RFID  │              │
  │                 │                 │────────────────►│              │
  │                 │                 │◄────────────────│              │
  │                 │                 │                 │              │
  │                 │  Ambil 3 Foto   │                 │              │
  │                 │  (dengan jeda)  │                 │              │
  │                 │                 │                 │              │
  │                 │  Kirim Data     │                 │              │
  │                 │  (HTTP POST)    │                 │              │
  │                 │────────────────►│                 │              │
  │                 │                 │  Simpan Data    │              │
  │                 │                 │────────────────►│              │
  │                 │                 │◄────────────────│              │
  │                 │                 │                 │              │
  │                 │  Response       │                 │              │
  │                 │◄────────────────│                 │              │
  │                 │                 │                 │              │
  │                 │  Kontrol LED    │                 │              │
  │                 │  & Solenoid     │                 │              │
  │                 │                 │                 │              │
  │  Masuk/Pintu    │                 │                 │              │
  │  Tertutup       │                 │                 │              │
  │◄────────────────│                 │                 │              │
  │                 │                 │  Kirim Notif    │              │
  │                 │                 │──────────────────────────────►│
```

---

## 🗄️ ERD (Entity Relationship Diagram)

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    JURUSAN      │       │     SISWA       │       │    PRESENSI     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id           │◄──────┤ PK id           │◄──────┤ PK id           │
│ kode_jurusan    │       │ FK jurusan_id   │       │ FK siswa_id     │
│ nama_jurusan    │       │ nisn            │       │ FK ruangan_id   │
│ singkatan       │       │ nis             │       │ FK jurusan_id   │
│ ketua_jurusan   │       │ nama_lengkap    │       │ tanggal         │
│ status          │       │ jenis_kelamin   │       │ waktu_masuk     │
└─────────────────┘       │ tempat_lahir    │       │ waktu_keluar    │
                          │ tanggal_lahir   │       │ status          │
┌─────────────────┐       │ alamat          │       │ rfid_uid        │
│    RUANGAN      │       │ no_telp         │       │ foto_scan_1     │
├─────────────────┤       │ email           │       │ foto_scan_2     │
│ PK id           │◄──────┤ kelas           │       │ foto_scan_3     │
│ FK jurusan_id   │       │ rombel          │       │ validasi        │
│ kode_ruangan    │       │ rfid_uid        │       └─────────────────┘
│ nama_ruangan    │       │ foto            │
│ kapasitas       │       │ status          │
│ lokasi          │       └─────────────────┘
│ esp32_cam_id    │
│ esp32_cam_ip    │
│ status          │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │   LOG_AKSES     │       │  NOTIFIKASI     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK id           │       │ PK id           │
│ username        │       │ FK ruangan_id   │       │ FK user_id      │
│ password        │       │ rfid_uid        │       │ judul           │
│ nama_lengkap    │       │ foto_capture    │       │ pesan           │
│ email           │       │ status          │       │ tipe            │
│ no_telp         │       │ keterangan      │       │ is_read         │
│ role            │       │ tanggal         │       │ link            │
│ FK jurusan_id   │       │ waktu           │       │ created_at      │
│ FK ruangan_id   │       └─────────────────┘       └─────────────────┘
│ status          │
└─────────────────┘
```

---

## © 2024 SMK Rajasa Surabaya - Tim Magang TKJ
