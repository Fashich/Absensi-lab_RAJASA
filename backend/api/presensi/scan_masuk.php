<?php
/**
 * =====================================================
 * API SCAN MASUK (ESP32-CAM)
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Body: { 
 *   rfid_uid, 
 *   ruangan_id, 
 *   api_key, 
 *   foto_1,      // Foto pertama (base64)
 *   foto_2,      // Foto kedua (base64)
 *   foto_3       // Foto ketiga (base64)
 * }
 * Response: { 
 *   success, 
 *   message, 
 *   data, 
 *   door_open,      // true/false - untuk kontrol solenoid
 *   led_color,      // "green" atau "red" - untuk kontrol LED
 *   buzzer          // true/false - untuk kontrol buzzer (opsional)
 * }
 * =====================================================
 * 
 * ALUR KERJA ESP32-CAM:
 * 1. RFID terdeteksi → Aktifkan kamera
 * 2. Jeda 2 detik → Ambil foto 1
 * 3. Jeda singkat → Ambil foto 2
 * 4. Jeda singkat → Ambil foto 3
 * 5. Kompresi foto → Kirim ke server via HTTP POST
 * 6. Tunggu response → Kontrol LED & Solenoid
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan', [
        'door_open' => false,
        'led_color' => 'red',
        'buzzer' => true
    ], 405);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi API Key
if (!isset($input['api_key']) || $input['api_key'] !== ESP32_API_KEY) {
    jsonResponse(false, 'API Key tidak valid', [
        'door_open' => false,
        'led_color' => 'red',
        'buzzer' => true
    ], 401);
}

// Validasi input
$requiredFields = ['rfid_uid', 'ruangan_id'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), [
        'door_open' => false,
        'led_color' => 'red',
        'buzzer' => true
    ], 400);
}

$rfidUid = sanitize($input['rfid_uid']);
$ruanganId = (int)$input['ruangan_id'];
$tanggal = date('Y-m-d');
$waktuSekarang = date('H:i:s');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // =====================================================
    // STEP 1: CEK RUANGAN AKTIF
    // =====================================================
    $ruanganQuery = "SELECT r.*, j.nama_jurusan, j.kode_jurusan 
                     FROM ruangan r 
                     LEFT JOIN jurusan j ON r.jurusan_id = j.id 
                     WHERE r.id = :ruangan_id AND r.status = 'aktif'";
    $ruanganStmt = $conn->prepare($ruanganQuery);
    $ruanganStmt->bindParam(':ruangan_id', $ruanganId);
    $ruanganStmt->execute();
    $ruangan = $ruanganStmt->fetch();
    
    if (!$ruangan) {
        // Log akses tidak valid - Ruangan tidak ditemukan
        $logQuery = "INSERT INTO log_akses (ruangan_id, rfid_uid, status, keterangan, tanggal, waktu) 
                     VALUES (:ruangan_id, :rfid_uid, 'ruangan_tidak_cocok', 'Ruangan tidak ditemukan atau tidak aktif', :tanggal, :waktu)";
        $logStmt = $conn->prepare($logQuery);
        $logStmt->execute([
            ':ruangan_id' => $ruanganId,
            ':rfid_uid' => $rfidUid,
            ':tanggal' => $tanggal,
            ':waktu' => $waktuSekarang
        ]);
        
        // Response untuk ESP32: LED MERAH + SOLENOID TERTUTUP
        jsonResponse(false, 'Ruangan tidak ditemukan atau tidak aktif', [
            'door_open' => false,
            'led_color' => 'red',
            'buzzer' => true,
            'buzzer_pattern' => 'error',  // Pola bunyi error
            'rfid_uid' => $rfidUid
        ], 404);
    }
    
    // =====================================================
    // STEP 2: VALIDASI ID CARD SISWA
    // =====================================================
    $siswaQuery = "SELECT s.*, j.nama_jurusan, j.kode_jurusan 
                   FROM siswa s 
                   LEFT JOIN jurusan j ON s.jurusan_id = j.id 
                   WHERE s.rfid_uid = :rfid_uid AND s.status = 'aktif'";
    $siswaStmt = $conn->prepare($siswaQuery);
    $siswaStmt->bindParam(':rfid_uid', $rfidUid);
    $siswaStmt->execute();
    $siswa = $siswaStmt->fetch();
    
    if (!$siswa) {
        // Log akses tidak valid - ID tidak terdaftar
        $logQuery = "INSERT INTO log_akses (ruangan_id, rfid_uid, status, keterangan, tanggal, waktu) 
                     VALUES (:ruangan_id, :rfid_uid, 'id_tidak_terdaftar', 'RFID tidak terdaftar di sistem', :tanggal, :waktu)";
        $logStmt = $conn->prepare($logQuery);
        $logStmt->execute([
            ':ruangan_id' => $ruanganId,
            ':rfid_uid' => $rfidUid,
            ':tanggal' => $tanggal,
            ':waktu' => $waktuSekarang
        ]);
        
        // Response untuk ESP32: LED MERAH + SOLENOID TERTUTUP
        jsonResponse(false, 'Kartu RFID tidak terdaftar', [
            'door_open' => false,
            'led_color' => 'red',
            'buzzer' => true,
            'buzzer_pattern' => 'error',
            'rfid_uid' => $rfidUid,
            'message_to_display' => 'KARTU TIDAK TERDAFTAR'
        ], 404);
    }
    
    // =====================================================
    // STEP 3: CEK DUPLIKAT PRESENSI HARI INI
    // =====================================================
    $cekPresensiQuery = "SELECT id, waktu_masuk FROM presensi 
                         WHERE siswa_id = :siswa_id AND ruangan_id = :ruangan_id AND tanggal = :tanggal";
    $cekPresensiStmt = $conn->prepare($cekPresensiQuery);
    $cekPresensiStmt->execute([
        ':siswa_id' => $siswa['id'],
        ':ruangan_id' => $ruanganId,
        ':tanggal' => $tanggal
    ]);
    $presensiExist = $cekPresensiStmt->fetch();
    
    if ($presensiExist) {
        // Siswa sudah presensi hari ini
        jsonResponse(false, 'Anda sudah melakukan presensi hari ini di ruangan ini', [
            'door_open' => false,
            'led_color' => 'red',
            'buzzer' => true,
            'buzzer_pattern' => 'warning',
            'siswa' => [
                'nisn' => $siswa['nisn'],
                'nama' => $siswa['nama_lengkap']
            ],
            'message_to_display' => 'SUDAH PRESENSI'
        ], 409);
    }
    
    // =====================================================
    // STEP 4: CEK JAM MASUK & TENTUKAN STATUS
    // =====================================================
    $konfigQuery = "SELECT nilai FROM konfigurasi WHERE kunci = 'jam_masuk'";
    $konfigStmt = $conn->query($konfigQuery);
    $jamMasuk = $konfigStmt->fetch()['nilai'] ?? '07:30:00';
    
    $status = 'hadir';
    $waktuMasukTimestamp = strtotime($waktuSekarang);
    $jamMasukTimestamp = strtotime($jamMasuk);
    $toleransi = 15 * 60; // 15 menit dalam detik
    
    if ($waktuMasukTimestamp > ($jamMasukTimestamp + $toleransi)) {
        $status = 'terlambat';
    }
    
    // =====================================================
    // STEP 5: SIMPAN 3 FOTO SCAN (BASE64)
    // =====================================================
    $fotoDir = UPLOAD_PATH . 'foto/scan/';
    if (!is_dir($fotoDir)) {
        mkdir($fotoDir, 0755, true);
    }
    
    $fotoFiles = [
        'foto_1' => null,
        'foto_2' => null,
        'foto_3' => null
    ];
    
    $timestamp = date('Ymd_His');
    
    // Simpan foto 1
    if (isset($input['foto_1']) && !empty($input['foto_1'])) {
        $fotoName1 = 'scan_' . $siswa['nisn'] . '_' . $timestamp . '_1.jpg';
        $fotoPath1 = $fotoDir . $fotoName1;
        $fotoData1 = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $input['foto_1']));
        if ($fotoData1 && file_put_contents($fotoPath1, $fotoData1)) {
            $fotoFiles['foto_1'] = $fotoName1;
        }
    }
    
    // Simpan foto 2
    if (isset($input['foto_2']) && !empty($input['foto_2'])) {
        $fotoName2 = 'scan_' . $siswa['nisn'] . '_' . $timestamp . '_2.jpg';
        $fotoPath2 = $fotoDir . $fotoName2;
        $fotoData2 = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $input['foto_2']));
        if ($fotoData2 && file_put_contents($fotoPath2, $fotoData2)) {
            $fotoFiles['foto_2'] = $fotoName2;
        }
    }
    
    // Simpan foto 3
    if (isset($input['foto_3']) && !empty($input['foto_3'])) {
        $fotoName3 = 'scan_' . $siswa['nisn'] . '_' . $timestamp . '_3.jpg';
        $fotoPath3 = $fotoDir . $fotoName3;
        $fotoData3 = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $input['foto_3']));
        if ($fotoData3 && file_put_contents($fotoPath3, $fotoData3)) {
            $fotoFiles['foto_3'] = $fotoName3;
        }
    }
    
    // =====================================================
    // STEP 6: INSERT DATA PRESENSI KE DATABASE
    // =====================================================
    $insertQuery = "INSERT INTO presensi (
                        siswa_id, 
                        ruangan_id, 
                        jurusan_id, 
                        tanggal, 
                        waktu_masuk, 
                        status, 
                        rfid_uid, 
                        foto_scan_1, 
                        foto_scan_2, 
                        foto_scan_3, 
                        validasi
                    ) VALUES (
                        :siswa_id, 
                        :ruangan_id, 
                        :jurusan_id, 
                        :tanggal, 
                        :waktu_masuk, 
                        :status, 
                        :rfid_uid, 
                        :foto_scan_1, 
                        :foto_scan_2, 
                        :foto_scan_3, 
                        'valid'
                    )";
    
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->execute([
        ':siswa_id' => $siswa['id'],
        ':ruangan_id' => $ruanganId,
        ':jurusan_id' => $siswa['jurusan_id'],
        ':tanggal' => $tanggal,
        ':waktu_masuk' => $waktuSekarang,
        ':status' => $status,
        ':rfid_uid' => $rfidUid,
        ':foto_scan_1' => $fotoFiles['foto_1'],
        ':foto_scan_2' => $fotoFiles['foto_2'],
        ':foto_scan_3' => $fotoFiles['foto_3']
    ]);
    
    $presensiId = $conn->lastInsertId();
    
    // =====================================================
    // STEP 7: KIRIM NOTIFIKASI KE ADMIN JURUSAN
    // =====================================================
    $notifQuery = "SELECT id FROM users 
                   WHERE jurusan_id = :jurusan_id 
                   AND role = 'admin_jurusan' 
                   AND status = 'aktif'";
    $notifStmt = $conn->prepare($notifQuery);
    $notifStmt->bindParam(':jurusan_id', $siswa['jurusan_id']);
    $notifStmt->execute();
    $adminJurusan = $notifStmt->fetch();
    
    if ($adminJurusan) {
        sendNotification(
            $adminJurusan['id'],
            'Siswa Masuk Lab',
            "{$siswa['nama_lengkap']} ({$siswa['kelas']} {$siswa['rombel']}) masuk ke {$ruangan['nama_ruangan']} pukul {$waktuSekarang}",
            'success',
            '/presensi'
        );
    }
    
    // =====================================================
    // STEP 8: LOG AKTIVITAS
    // =====================================================
    logActivity(
        "[SCAN MASUK] {$siswa['nama_lengkap']} ({$siswa['nisn']}) - {$ruangan['nama_ruangan']} - {$status}", 
        'SUCCESS'
    );
    
    // =====================================================
    // STEP 9: RESPONSE KE ESP32-CAM
    // =====================================================
    // JIKA VALID: LED HIJAU + SOLENOID TERBUKA
    jsonResponse(true, 'Presensi berhasil dicatat', [
        'door_open' => true,                    // Solenoid terbuka
        'led_color' => 'green',                 // LED hijau menyala
        'buzzer' => true,                       // Buzzer bunyi sukses
        'buzzer_pattern' => 'success',          // Pola bunyi sukses
        'door_open_duration' => DOOR_OPEN_DURATION,  // Durasi pintu terbuka (detik)
        'message_to_display' => 'SILAKAN MASUK',     // Pesan untuk LCD (jika ada)
        
        // Data siswa untuk ditampilkan
        'siswa' => [
            'id' => $siswa['id'],
            'nisn' => $siswa['nisn'],
            'nis' => $siswa['nis'],
            'nama' => $siswa['nama_lengkap'],
            'kelas' => $siswa['kelas'],
            'rombel' => $siswa['rombel'],
            'jurusan' => $siswa['nama_jurusan'],
            'kode_jurusan' => $siswa['kode_jurusan']
        ],
        
        // Data presensi
        'presensi' => [
            'id' => $presensiId,
            'tanggal' => $tanggal,
            'waktu_masuk' => $waktuSekarang,
            'status' => $status,
            'ruangan' => $ruangan['nama_ruangan'],
            'kode_ruangan' => $ruangan['kode_ruangan']
        ],
        
        // Status foto
        'foto_saved' => [
            'foto_1' => $fotoFiles['foto_1'] ? true : false,
            'foto_2' => $fotoFiles['foto_2'] ? true : false,
            'foto_3' => $fotoFiles['foto_3'] ? true : false
        ]
    ]);
    
} catch(PDOException $e) {
    error_log("[SCAN MASUK ERROR] " . $e->getMessage());
    
    // Response error ke ESP32
    jsonResponse(false, 'Terjadi kesalahan saat memproses scan', [
        'door_open' => false,
        'led_color' => 'red',
        'buzzer' => true,
        'buzzer_pattern' => 'error',
        'message_to_display' => 'SYSTEM ERROR'
    ], 500);
}
?>
