-- =====================================================
-- SISTEM ABSENSI LAB KOMPUTER SMK RAJASA SURABAYA
-- Database Schema & Dummy Data - Versi 2
-- =====================================================
-- Cara Penggunaan:
-- 1. Buka phpMyAdmin di browser (http://localhost/phpmyadmin)
-- 2. Klik tab "SQL"
-- 3. Copy seluruh isi file ini
-- 4. Paste ke kolom SQL
-- 5. Klik "Go" atau "Kirim"
-- =====================================================

-- Hapus database jika sudah ada (opsional, hati-hati!)
-- DROP DATABASE IF EXISTS sistem_absensi_lab;

-- Buat database baru
CREATE DATABASE IF NOT EXISTS sistem_absensi_lab
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Pilih database
USE sistem_absensi_lab;

-- =====================================================
-- TABEL JURUSAN
-- =====================================================
CREATE TABLE IF NOT EXISTS jurusan (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_jurusan VARCHAR(10) NOT NULL UNIQUE COMMENT 'Kode unik jurusan, ex: TKJ, RPL, MM',
    nama_jurusan VARCHAR(100) NOT NULL COMMENT 'Nama lengkap jurusan',
    singkatan VARCHAR(10) NOT NULL COMMENT 'Singkatan jurusan',
    ketua_jurusan VARCHAR(100) DEFAULT NULL COMMENT 'Nama ketua jurusan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL RUANGAN/LAB KOMPUTER
-- =====================================================
CREATE TABLE IF NOT EXISTS ruangan (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_ruangan VARCHAR(20) NOT NULL UNIQUE COMMENT 'Kode ruangan, ex: LAB-TKJ-01',
    nama_ruangan VARCHAR(100) NOT NULL COMMENT 'Nama ruangan',
    jurusan_id INT(11) UNSIGNED NOT NULL,
    kapasitas INT(11) DEFAULT 30 COMMENT 'Kapasitas maksimum siswa',
    lokasi VARCHAR(100) DEFAULT NULL COMMENT 'Lokasi/detail ruangan',
    esp32_cam_id VARCHAR(50) DEFAULT NULL COMMENT 'ID unik ESP32-CAM di ruangan ini',
    esp32_cam_ip VARCHAR(20) DEFAULT NULL COMMENT 'IP address ESP32-CAM',
    status ENUM('aktif', 'nonaktif', 'maintenance') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL USERS (ADMIN OPERATOR & ADMIN JURUSAN)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Password terenkripsi bcrypt',
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    no_telp VARCHAR(20) DEFAULT NULL,
    role ENUM('admin_operator', 'admin_jurusan') NOT NULL DEFAULT 'admin_jurusan',
    jurusan_id INT(11) UNSIGNED DEFAULT NULL COMMENT 'NULL untuk admin_operator, terisi untuk admin_jurusan',
    ruangan_id INT(11) UNSIGNED DEFAULT NULL COMMENT 'Ruangan yang dikelola (opsional)',
    foto_profile VARCHAR(255) DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('aktif', 'nonaktif', 'terkunci') DEFAULT 'aktif',
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL SISWA
-- =====================================================
CREATE TABLE IF NOT EXISTS siswa (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nisn VARCHAR(20) NOT NULL UNIQUE COMMENT 'Nomor Induk Siswa Nasional',
    nis VARCHAR(20) NOT NULL UNIQUE COMMENT 'Nomor Induk Sekolah',
    nama_lengkap VARCHAR(100) NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL COMMENT 'L=Laki-laki, P=Perempuan',
    tempat_lahir VARCHAR(50) DEFAULT NULL,
    tanggal_lahir DATE DEFAULT NULL,
    alamat TEXT DEFAULT NULL,
    no_telp VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    jurusan_id INT(11) UNSIGNED NOT NULL,
    kelas VARCHAR(10) NOT NULL COMMENT 'Ex: X, XI, XII',
    rombel VARCHAR(10) NOT NULL COMMENT 'Rombongan belajar, ex: TKJ-1, TKJ-2',
    rfid_uid VARCHAR(50) DEFAULT NULL COMMENT 'UID kartu RFID siswa',
    foto VARCHAR(255) DEFAULT NULL COMMENT 'Path foto siswa',
    nama_ortu VARCHAR(100) DEFAULT NULL COMMENT 'Nama orang tua/wali',
    no_telp_ortu VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('aktif', 'nonaktif', 'lulus', 'keluar') DEFAULT 'aktif',
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL PRESENSI/KEHADIRAN
-- =====================================================
CREATE TABLE IF NOT EXISTS presensi (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT(11) UNSIGNED NOT NULL,
    ruangan_id INT(11) UNSIGNED NOT NULL,
    jurusan_id INT(11) UNSIGNED NOT NULL,
    tanggal DATE NOT NULL,
    waktu_masuk TIME NOT NULL,
    waktu_keluar TIME DEFAULT NULL,
    status ENUM('hadir', 'izin', 'sakit', 'alpha', 'terlambat') DEFAULT 'hadir',
    keterangan TEXT DEFAULT NULL,
    foto_scan_1 VARCHAR(255) DEFAULT NULL COMMENT 'Foto saat scan masuk',
    foto_scan_2 VARCHAR(255) DEFAULT NULL COMMENT 'Foto kedua',
    foto_scan_3 VARCHAR(255) DEFAULT NULL COMMENT 'Foto ketiga',
    rfid_uid VARCHAR(50) DEFAULT NULL COMMENT 'UID RFID yang discan',
    validasi ENUM('valid', 'tidak_valid', 'pending') DEFAULT 'valid',
    diverifikasi_oleh INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID admin yang verifikasi',
    waktu_verifikasi DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE KEY unique_presensi_harian (siswa_id, ruangan_id, tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL LOG AKSES (UNTUK ID TIDAK VALID/PERCobaan AKSES)
-- =====================================================
CREATE TABLE IF NOT EXISTS log_akses (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ruangan_id INT(11) UNSIGNED NOT NULL,
    rfid_uid VARCHAR(50) DEFAULT NULL COMMENT 'UID RFID yang dicoba',
    foto_capture VARCHAR(255) DEFAULT NULL COMMENT 'Foto yang diambil ESP32-CAM',
    status ENUM('id_tidak_terdaftar', 'kartu_diblokir', 'ruangan_tidak_cocok', 'foto_buram', 'lainnya') NOT NULL,
    keterangan TEXT DEFAULT NULL,
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL SESI UJIAN
-- =====================================================
CREATE TABLE IF NOT EXISTS sesi_ujian (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_ujian VARCHAR(20) NOT NULL UNIQUE,
    nama_ujian VARCHAR(100) NOT NULL COMMENT 'Ex: UTS Semester 1, UAS Semester 2',
    jurusan_id INT(11) UNSIGNED NOT NULL,
    ruangan_id INT(11) UNSIGNED NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    durasi_menit INT(11) DEFAULT 90 COMMENT 'Durasi ujian dalam menit',
    mata_pelajaran VARCHAR(100) DEFAULT NULL,
    pengawas_id INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID admin yang menjadi pengawas',
    keterangan TEXT DEFAULT NULL,
    status ENUM('draft', 'aktif', 'selesai', 'dibatalkan') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT(11) UNSIGNED DEFAULT NULL,
    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pengawas_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL PESERTA UJIAN
-- =====================================================
CREATE TABLE IF NOT EXISTS peserta_ujian (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sesi_ujian_id INT(11) UNSIGNED NOT NULL,
    siswa_id INT(11) UNSIGNED NOT NULL,
    no_urut INT(11) DEFAULT NULL COMMENT 'Nomor urut duduk',
    status_kehadiran ENUM('hadir', 'tidak_hadir', 'izin', 'sakit') DEFAULT 'tidak_hadir',
    waktu_hadir DATETIME DEFAULT NULL,
    nilai DECIMAL(5,2) DEFAULT NULL,
    keterangan TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sesi_ujian_id) REFERENCES sesi_ujian(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_peserta (sesi_ujian_id, siswa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL KONFIGURASI SISTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS konfigurasi (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kunci VARCHAR(50) NOT NULL UNIQUE,
    nilai TEXT DEFAULT NULL,
    keterangan VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT(11) UNSIGNED DEFAULT NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL NOTIFIKASI
-- =====================================================
CREATE TABLE IF NOT EXISTS notifikasi (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED DEFAULT NULL COMMENT 'NULL untuk broadcast',
    judul VARCHAR(100) NOT NULL,
    pesan TEXT NOT NULL,
    tipe ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    link VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL SESI ONLINE PENGGUNA
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL COMMENT 'JWT token yang digunakan',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP address pengguna',
    user_agent TEXT DEFAULT NULL COMMENT 'Browser/Device info',
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu login',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu aktivitas terakhir',
    is_online TINYINT(1) DEFAULT 1 COMMENT 'Status online (1) atau offline (0)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL LOG AKTIVITAS ADMIN
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_activities (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED NOT NULL,
    activity_type VARCHAR(50) NOT NULL COMMENT 'Jenis aktivitas (login, logout, view_data, update_data, etc.)',
    activity_description TEXT COMMENT 'Deskripsi detail aktivitas',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP address pengguna',
    user_agent TEXT DEFAULT NULL COMMENT 'Browser/Device info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DATA JURUSAN (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO jurusan (kode_jurusan, nama_jurusan, singkatan, ketua_jurusan, status) VALUES
('TKJ', 'Teknik Komputer dan Jaringan', 'TKJ', 'Dr. Ahmad Supriyadi, S.Kom., M.Kom.', 'aktif'),
('TL', 'Teknik Listrik', 'TL', 'Dra. Sri Lestari, M.Pd.', 'aktif'),
('TM', 'Teknik Mesin', 'TM', 'Bambang Prasetya, S.Sn., M.Sn.', 'aktif');

-- =====================================================
-- INSERT DATA RUANGAN (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO ruangan (kode_ruangan, nama_ruangan, jurusan_id, kapasitas, lokasi, esp32_cam_id, esp32_cam_ip, status) VALUES
('LAB-TKJ-01', 'Laboratorium TKJ 1', 1, 30, 'Gedung C Lantai 1', 'ESP32CAM-TKJ1', '192.168.1.101', 'aktif'),
('LAB-TL-01', 'Laboratorium Teknik Listrik 1', 2, 30, 'Gedung A Lantai 1', 'ESP32CAM-TL1', '192.168.1.102', 'aktif'),
('LAB-TM-01', 'Laboratorium Teknik Mesin 1', 3, 25, 'Gedung B Lantai 2', 'ESP32CAM-TM1', '192.168.1.103', 'aktif');

-- =====================================================
-- INSERT DATA USERS (ADMIN) (diperbaiki untuk menghindari error duplikat)
-- Password: admin123 (untuk semua akun demo)
-- Hash bcrypt: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- =====================================================
INSERT IGNORE INTO users (username, password, nama_lengkap, email, no_telp, role, jurusan_id, ruangan_id, status) VALUES
-- Admin Operator (Full Access)
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator Utama', 'admin@smkrajasa.sch.id', '081234567890', 'admin_operator', NULL, NULL, 'aktif'),

-- Admin Jurusan TKJ
('admintkj', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan TKJ', 'tkj@smkrajasa.sch.id', '081234567892', 'admin_jurusan', 1, 1, 'aktif');

-- =====================================================
-- INSERT DATA KONFIGURASI SISTEM (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO konfigurasi (kunci, nilai, keterangan) VALUES
('nama_sekolah', 'SMK Rajasa Surabaya', 'Nama lengkap sekolah'),
('alamat_sekolah', 'Jl. Raya Rajasa No. 123, Surabaya', 'Alamat sekolah'),
('tahun_ajaran', '2024/2025', 'Tahun ajaran aktif'),
('semester', '1', 'Semester aktif'),
('jam_masuk', '07:30:00', 'Jam masuk standar'),
('jam_pulang', '15:00:00', 'Jam pulang standar'),
('toleransi_keterlambatan', '15', 'Toleransi keterlambatan dalam menit'),
('timezone', 'Asia/Jakarta', 'Zona waktu sistem'),
('esp32_api_key', 'rajasa2024secure', 'API Key untuk ESP32-CAM'),
('foto_quality', 'high', 'Kualitas foto capture'),
('door_open_duration', '5', 'Durasi pintu terbuka dalam detik'),
('maintenance_mode', '0', 'Mode maintenance (0=off, 1=on)');

-- =====================================================
-- INSERT DATA NOTIFIKASI (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO notifikasi (user_id, judul, pesan, tipe, is_read, link) VALUES
(NULL, 'Selamat Datang!', 'Selamat datang di Sistem Absensi Lab SMK Rajasa Surabaya', 'info', 0, NULL),
(NULL, 'Update Sistem', 'Sistem telah diupdate ke versi terbaru', 'success', 0, NULL),
(3, 'Presensi Hari Ini', 'Ada 3 siswa terlambat hari ini di jurusan Anda', 'warning', 0, '/laporan/harian'),
(3, 'Log Akses Tidak Valid', 'Ditemukan 2 percobaan akses tidak valid hari ini', 'error', 0, '/log-akses');

-- =====================================================
-- BUAT VIEW UNTUK LAPORAN
-- =====================================================

-- View Rekap Harian
CREATE OR REPLACE VIEW v_rekap_harian AS
SELECT
    p.tanggal,
    j.nama_jurusan,
    r.nama_ruangan,
    COUNT(CASE WHEN p.status = 'hadir' THEN 1 END) AS total_hadir,
    COUNT(CASE WHEN p.status = 'terlambat' THEN 1 END) AS total_terlambat,
    COUNT(CASE WHEN p.status = 'sakit' THEN 1 END) AS total_sakit,
    COUNT(CASE WHEN p.status = 'izin' THEN 1 END) AS total_izin,
    COUNT(CASE WHEN p.status = 'alpha' THEN 1 END) AS total_alpha,
    COUNT(*) AS total_siswa
FROM presensi p
JOIN jurusan j ON p.jurusan_id = j.id
JOIN ruangan r ON p.ruangan_id = r.id
GROUP BY p.tanggal, p.jurusan_id, p.ruangan_id;

-- View Presensi Detail
CREATE OR REPLACE VIEW v_presensi_detail AS
SELECT
    p.id,
    p.tanggal,
    p.waktu_masuk,
    p.waktu_keluar,
    p.status,
    p.keterangan,
    p.validasi,
    s.nisn,
    s.nis,
    s.nama_lengkap AS nama_siswa,
    s.kelas,
    s.rombel,
    s.rfid_uid,
    j.nama_jurusan,
    r.nama_ruangan,
    r.kode_ruangan
FROM presensi p
JOIN siswa s ON p.siswa_id = s.id
JOIN jurusan j ON p.jurusan_id = j.id
JOIN ruangan r ON p.ruangan_id = r.id;

-- View Log Akses Detail
CREATE OR REPLACE VIEW v_log_akses_detail AS
SELECT
    la.id,
    la.rfid_uid,
    la.status,
    la.keterangan,
    la.tanggal,
    la.waktu,
    r.nama_ruangan,
    r.kode_ruangan,
    j.nama_jurusan
FROM log_akses la
JOIN ruangan r ON la.ruangan_id = r.id
JOIN jurusan j ON r.jurusan_id = j.id;

-- =====================================================
-- SELESAI
-- =====================================================
-- Database siap digunakan!
-- Username login: admin / Password: admin123
-- =====================================================