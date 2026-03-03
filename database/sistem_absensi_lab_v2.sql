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
-- INSERT DATA JURUSAN (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO jurusan (kode_jurusan, nama_jurusan, singkatan, ketua_jurusan, status) VALUES
('TKJ', 'Teknik Komputer dan Jaringan', 'TKJ', 'Pak Budi Santoso', 'aktif'),
('RPL', 'Rekayasa Perangkat Lunak', 'RPL', 'Bu Ani Wulandari', 'aktif'),
('MM', 'Multimedia', 'MM', 'Pak Dedi Kurniawan', 'aktif'),
('BC', 'Broadcasting', 'BC', 'Bu Rina Susanti', 'aktif'),
('TEI', 'Teknik Elektronika Industri', 'TEI', 'Pak Ahmad Fauzi', 'aktif');

-- =====================================================
-- INSERT DATA RUANGAN/LAB (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO ruangan (kode_ruangan, nama_ruangan, jurusan_id, kapasitas, lokasi, esp32_cam_id, esp32_cam_ip, status) VALUES
('LAB-TKJ-01', 'Laboratorium Komputer TKJ 1', 1, 30, 'Lantai 2 Gedung Teknik', 'ESP32-TKJ-001', '192.168.1.101', 'aktif'),
('LAB-TKJ-02', 'Laboratorium Komputer TKJ 2', 1, 30, 'Lantai 2 Gedung Teknik', 'ESP32-TKJ-002', '192.168.1.102', 'aktif'),
('LAB-RPL-01', 'Laboratorium Komputer RPL 1', 2, 32, 'Lantai 3 Gedung Teknik', 'ESP32-RPL-001', '192.168.1.103', 'aktif'),
('LAB-RPL-02', 'Laboratorium Komputer RPL 2', 2, 32, 'Lantai 3 Gedung Teknik', 'ESP32-RPL-002', '192.168.1.104', 'aktif'),
('LAB-MM-01', 'Laboratorium Multimedia 1', 3, 28, 'Lantai 1 Gedung Seni', 'ESP32-MM-001', '192.168.1.105', 'aktif'),
('LAB-MM-02', 'Laboratorium Multimedia 2', 3, 28, 'Lantai 1 Gedung Seni', 'ESP32-MM-002', '192.168.1.106', 'aktif'),
('LAB-BC-01', 'Studio Broadcasting', 4, 25, 'Lantai 2 Gedung Seni', 'ESP32-BC-001', '192.168.1.107', 'aktif'),
('LAB-TEI-01', 'Laboratorium Elektronika', 5, 30, 'Lantai 1 Gedung Teknik', 'ESP32-TEI-001', '192.168.1.108', 'aktif');

-- =====================================================
-- INSERT DATA USERS (ADMIN) (diperbaiki untuk menghindari error duplikat)
-- Password: admin123 (untuk semua akun demo)
-- Hash bcrypt: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- =====================================================
INSERT IGNORE INTO users (username, password, nama_lengkap, email, no_telp, role, jurusan_id, ruangan_id, status) VALUES
-- Admin Operator (Full Access)
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator Utama', 'admin@smkrajasa.sch.id', '081234567890', 'admin_operator', NULL, NULL, 'aktif'),
('operator1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operator Lab 1', 'operator1@smkrajasa.sch.id', '081234567891', 'admin_operator', NULL, NULL, 'aktif'),

-- Admin Jurusan TKJ
('admintkj', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan TKJ', 'tkj@smkrajasa.sch.id', '081234567892', 'admin_jurusan', 1, 1, 'aktif'),

-- Admin Jurusan RPL
('adminrpl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan RPL', 'rpl@smkrajasa.sch.id', '081234567893', 'admin_jurusan', 2, 3, 'aktif'),

-- Admin Jurusan MM
('adminmm', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan MM', 'mm@smkrajasa.sch.id', '081234567894', 'admin_jurusan', 3, 5, 'aktif'),

-- Admin Jurusan BC
('adminbc', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan BC', 'bc@smkrajasa.sch.id', '081234567895', 'admin_jurusan', 4, 7, 'aktif'),

-- Admin Jurusan TEI
('admintei', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Jurusan TEI', 'tei@smkrajasa.sch.id', '081234567896', 'admin_jurusan', 5, 8, 'aktif');

-- =====================================================
-- INSERT DATA SISWA TKJ (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO siswa (nisn, nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telp, email, jurusan_id, kelas, rombel, rfid_uid, status) VALUES
('0091234567', '20210001', 'Ahmad Fauzi', 'L', 'Surabaya', '2005-03-15', 'Jl. Mawar No. 1, Surabaya', '081111111001', 'ahmad.fauzi@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-1', 'RFID-TKJ-001', 'aktif'),
('0091234568', '20210002', 'Budi Santoso', 'L', 'Sidoarjo', '2005-04-20', 'Jl. Melati No. 5, Sidoarjo', '081111111002', 'budi.santoso@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-1', 'RFID-TKJ-002', 'aktif'),
('0091234569', '20210003', 'Citra Lestari', 'P', 'Gresik', '2005-05-10', 'Jl. Anggrek No. 12, Gresik', '081111111003', 'citra.lestari@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-1', 'RFID-TKJ-003', 'aktif'),
('0091234570', '20210004', 'Dewi Kurniawan', 'P', 'Surabaya', '2005-06-25', 'Jl. Kenanga No. 8, Surabaya', '081111111004', 'dewi.kurniawan@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-1', 'RFID-TKJ-004', 'aktif'),
('0091234571', '20210005', 'Eko Prasetyo', 'L', 'Mojokerto', '2005-07-30', 'Jl. Cempaka No. 3, Mojokerto', '081111111005', 'eko.prasetyo@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-2', 'RFID-TKJ-005', 'aktif'),
('0091234572', '20210006', 'Fajar Nugraha', 'L', 'Surabaya', '2005-08-12', 'Jl. Dahlia No. 7, Surabaya', '081111111006', 'fajar.nugraha@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-2', 'RFID-TKJ-006', 'aktif'),
('0091234573', '20210007', 'Gita Permata', 'P', 'Lamongan', '2005-09-05', 'Jl. Flamboyan No. 15, Lamongan', '081111111007', 'gita.permata@student.smkrajasa.sch.id', 1, 'XII', 'TKJ-2', 'RFID-TKJ-007', 'aktif'),
('0091234574', '20210008', 'Hadi Wijaya', 'L', 'Surabaya', '2005-10-18', 'Jl. Gerbera No. 9, Surabaya', '081111111008', 'hadi.wijaya@student.smkrajasa.sch.id', 1, 'XI', 'TKJ-1', 'RFID-TKJ-008', 'aktif'),
('0091234575', '20210009', 'Indah Sari', 'P', 'Sidoarjo', '2005-01-22', 'Jl. Hibiscus No. 11, Sidoarjo', '081111111009', 'indah.sari@student.smkrajasa.sch.id', 1, 'XI', 'TKJ-1', 'RFID-TKJ-009', 'aktif'),
('0091234576', '20210010', 'Joko Susilo', 'L', 'Gresik', '2005-02-14', 'Jl. Iris No. 4, Gresik', '081111111010', 'joko.susilo@student.smkrajasa.sch.id', 1, 'XI', 'TKJ-2', 'RFID-TKJ-010', 'aktif');

-- =====================================================
-- INSERT DATA SISWA RPL (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO siswa (nisn, nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telp, email, jurusan_id, kelas, rombel, rfid_uid, status) VALUES
('0092234567', '20220001', 'Kevin Pratama', 'L', 'Surabaya', '2005-03-10', 'Jl. Anggrek No. 21, Surabaya', '082222222001', 'kevin.pratama@student.smkrajasa.sch.id', 2, 'XII', 'RPL-1', 'RFID-RPL-001', 'aktif'),
('0092234568', '20220002', 'Lina Marlina', 'P', 'Sidoarjo', '2005-04-15', 'Jl. Bougenville No. 8, Sidoarjo', '082222222002', 'lina.marlina@student.smkrajasa.sch.id', 2, 'XII', 'RPL-1', 'RFID-RPL-002', 'aktif'),
('0092234569', '20220003', 'Mario Gunawan', 'L', 'Gresik', '2005-05-20', 'Jl. Cattleya No. 16, Gresik', '082222222003', 'mario.gunawan@student.smkrajasa.sch.id', 2, 'XII', 'RPL-1', 'RFID-RPL-003', 'aktif'),
('0092234570', '20220004', 'Nina Agustina', 'P', 'Surabaya', '2005-06-28', 'Jl. Daffodil No. 5, Surabaya', '082222222004', 'nina.agustina@student.smkrajasa.sch.id', 2, 'XII', 'RPL-2', 'RFID-RPL-004', 'aktif'),
('0092234571', '20220005', 'Oscar Wijaya', 'L', 'Mojokerto', '2005-07-12', 'Jl. Edelweiss No. 13, Mojokerto', '082222222005', 'oscar.wijaya@student.smkrajasa.sch.id', 2, 'XII', 'RPL-2', 'RFID-RPL-005', 'aktif'),
('0092234572', '20220006', 'Putri Anggraini', 'P', 'Surabaya', '2005-08-08', 'Jl. Freesia No. 19, Surabaya', '082222222006', 'putri.anggraini@student.smkrajasa.sch.id', 2, 'XI', 'RPL-1', 'RFID-RPL-006', 'aktif'),
('0092234573', '20220007', 'Qori Rahman', 'L', 'Lamongan', '2006-01-15', 'Jl. Gardenia No. 7, Lamongan', '082222222007', 'qori.rahman@student.smkrajasa.sch.id', 2, 'XI', 'RPL-1', 'RFID-RPL-007', 'aktif'),
('0092234574', '20220008', 'Rina Susanti', 'P', 'Surabaya', '2006-02-22', 'Jl. Hydrangea No. 25, Surabaya', '082222222008', 'rina.susanti@student.smkrajasa.sch.id', 2, 'XI', 'RPL-2', 'RFID-RPL-008', 'aktif'),
('0092234575', '20220009', 'Sandi Nugroho', 'L', 'Sidoarjo', '2006-03-30', 'Jl. Ivy No. 14, Sidoarjo', '082222222009', 'sandi.nugroho@student.smkrajasa.sch.id', 2, 'X', 'RPL-1', 'RFID-RPL-009', 'aktif'),
('0092234576', '20220010', 'Tina Melati', 'P', 'Gresik', '2006-04-18', 'Jl. Jasmine No. 22, Gresik', '082222222010', 'tina.melati@student.smkrajasa.sch.id', 2, 'X', 'RPL-2', 'RFID-RPL-010', 'aktif');

-- =====================================================
-- INSERT DATA SISWA MM (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO siswa (nisn, nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telp, email, jurusan_id, kelas, rombel, rfid_uid, status) VALUES
('0093234567', '20230001', 'Umar Fadillah', 'L', 'Surabaya', '2005-05-05', 'Jl. Kamboja No. 30, Surabaya', '083333333001', 'umar.fadillah@student.smkrajasa.sch.id', 3, 'XII', 'MM-1', 'RFID-MM-001', 'aktif'),
('0093234568', '20230002', 'Vina Aulia', 'P', 'Sidoarjo', '2005-06-12', 'Jl. Lavender No. 18, Sidoarjo', '083333333002', 'vina.aulia@student.smkrajasa.sch.id', 3, 'XII', 'MM-1', 'RFID-MM-002', 'aktif'),
('0093234569', '20230003', 'Wawan Setiawan', 'L', 'Gresik', '2005-07-20', 'Jl. Lotus No. 9, Gresik', '083333333003', 'wawan.setiawan@student.smkrajasa.sch.id', 3, 'XII', 'MM-2', 'RFID-MM-003', 'aktif'),
('0093234570', '20230004', 'Xena Putri', 'P', 'Surabaya', '2005-08-25', 'Jl. Magnolia No. 27, Surabaya', '083333333004', 'xena.putri@student.smkrajasa.sch.id', 3, 'XI', 'MM-1', 'RFID-MM-004', 'aktif'),
('0093234571', '20230005', 'Yoga Pratama', 'L', 'Mojokerto', '2006-02-08', 'Jl. Narcissus No. 12, Mojokerto', '083333333005', 'yoga.pratama@student.smkrajasa.sch.id', 3, 'XI', 'MM-2', 'RFID-MM-005', 'aktif'),
('0093234572', '20230006', 'Zara Nabilla', 'P', 'Surabaya', '2006-03-15', 'Jl. Orchid No. 33, Surabaya', '083333333006', 'zara.nabilla@student.smkrajasa.sch.id', 3, 'X', 'MM-1', 'RFID-MM-006', 'aktif');

-- =====================================================
-- INSERT DATA PRESENSI (CONTOH DATA HARI INI & KEMARIN) (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO presensi (siswa_id, ruangan_id, jurusan_id, tanggal, waktu_masuk, waktu_keluar, status, keterangan, rfid_uid, validasi) VALUES
-- TKJ Hari Ini
(1, 1, 1, CURDATE(), '07:30:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-001', 'valid'),
(2, 1, 1, CURDATE(), '07:35:00', '15:05:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-002', 'valid'),
(3, 1, 1, CURDATE(), '07:45:00', NULL, 'terlambat', 'Terlambat 15 menit', 'RFID-TKJ-003', 'valid'),
(4, 1, 1, CURDATE(), '07:25:00', NULL, 'hadir', 'Masuk lebih awal', 'RFID-TKJ-004', 'valid'),
(5, 2, 1, CURDATE(), '07:30:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-005', 'valid'),
(6, 2, 1, CURDATE(), '08:00:00', NULL, 'terlambat', 'Terlambat 30 menit', 'RFID-TKJ-006', 'valid'),
(7, 2, 1, CURDATE(), NULL, NULL, 'sakit', 'Sakit demam', NULL, 'valid'),
(8, 1, 1, CURDATE(), '07:32:00', NULL, 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-008', 'valid'),
(9, 1, 1, CURDATE(), NULL, NULL, 'izin', 'Izin urusan keluarga', NULL, 'valid'),
(10, 2, 1, CURDATE(), NULL, NULL, 'alpha', 'Tidak hadir tanpa keterangan', NULL, 'valid'),

-- RPL Hari Ini
(11, 3, 2, CURDATE(), '07:28:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-RPL-001', 'valid'),
(12, 3, 2, CURDATE(), '07:30:00', NULL, 'hadir', 'Masuk tepat waktu', 'RFID-RPL-002', 'valid'),
(13, 3, 2, CURDATE(), '07:40:00', NULL, 'hadir', 'Masuk tepat waktu', 'RFID-RPL-003', 'valid'),
(14, 4, 2, CURDATE(), '07:35:00', '15:10:00', 'hadir', 'Masuk tepat waktu', 'RFID-RPL-004', 'valid'),
(15, 4, 2, CURDATE(), NULL, NULL, 'izin', 'Izin keperluan penting', NULL, 'valid'),

-- MM Hari Ini
(21, 5, 3, CURDATE(), '07:30:00', NULL, 'hadir', 'Masuk tepat waktu', 'RFID-MM-001', 'valid'),
(22, 5, 3, CURDATE(), '07:33:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-MM-002', 'valid'),
(23, 6, 3, CURDATE(), '07:45:00', NULL, 'terlambat', 'Terlambat 15 menit', 'RFID-MM-003', 'valid'),

-- TKJ Kemarin
(1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:30:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-001', 'valid'),
(2, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:32:00', '15:05:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-002', 'valid'),
(3, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:28:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-003', 'valid'),
(4, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:35:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-004', 'valid'),
(5, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:30:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-005', 'valid'),
(6, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:31:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-006', 'valid'),
(7, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:29:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-007', 'valid'),
(8, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:33:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-008', 'valid'),
(9, 1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:30:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-009', 'valid'),
(10, 2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:34:00', '15:00:00', 'hadir', 'Masuk tepat waktu', 'RFID-TKJ-010', 'valid');

-- =====================================================
-- INSERT DATA LOG AKSES (ID TIDAK VALID) (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO log_akses (ruangan_id, rfid_uid, status, keterangan, tanggal, waktu) VALUES
(1, 'RFID-UNKNOWN-001', 'id_tidak_terdaftar', 'Kartu RFID tidak terdaftar di sistem', CURDATE(), '08:15:30'),
(1, 'RFID-UNKNOWN-002', 'id_tidak_terdaftar', 'Percobaan akses dengan kartu tidak dikenal', CURDATE(), '09:20:45'),
(3, 'RFID-TKJ-001', 'ruangan_tidak_cocok', 'Siswa TKJ mencoba akses lab RPL', CURDATE(), '10:30:00'),
(2, NULL, 'foto_buram', 'Foto tidak jelas, tidak bisa verifikasi', CURDATE(), '11:45:20'),
(1, 'RFID-UNKNOWN-003', 'id_tidak_terdaftar', 'Kartu tidak terdaftar', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:50:10');

-- =====================================================
-- INSERT DATA SESI UJIAN (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO sesi_ujian (kode_ujian, nama_ujian, jurusan_id, ruangan_id, tanggal_mulai, tanggal_selesai, waktu_mulai, waktu_selesai, durasi_menit, mata_pelajaran, pengawas_id, keterangan, status, created_by) VALUES
('UAS-TKJ-001', 'UAS Semester 1 - TKJ', 1, 1, CURDATE(), CURDATE(), '08:00:00', '10:00:00', 120, 'Administrasi Infrastruktur Jaringan', 3, 'Ujian Akhir Semester 1', 'aktif', 1),
('UAS-RPL-001', 'UAS Semester 1 - RPL', 2, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '09:30:00', 90, 'Pemrograman Web', 4, 'Ujian Akhir Semester 1', 'draft', 1),
('UAS-MM-001', 'UAS Semester 1 - MM', 3, 5, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '12:00:00', 120, 'Desain Grafis', 5, 'Ujian Akhir Semester 1', 'draft', 1);

-- =====================================================
-- INSERT DATA PESERTA UJIAN (diperbaiki untuk menghindari error duplikat)
-- =====================================================
INSERT IGNORE INTO peserta_ujian (sesi_ujian_id, siswa_id, no_urut, status_kehadiran, waktu_hadir) VALUES
(1, 1, 1, 'hadir', NOW()),
(1, 2, 2, 'hadir', NOW()),
(1, 3, 3, 'hadir', NOW()),
(1, 4, 4, 'tidak_hadir', NULL),
(1, 5, 5, 'hadir', NOW()),
(1, 6, 6, 'sakit', NULL),
(1, 8, 7, 'hadir', NOW()),
(1, 9, 8, 'izin', NULL);

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