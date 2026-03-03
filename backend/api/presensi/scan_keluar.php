<?php
/**
 * =====================================================
 * API SCAN KELUAR (ESP32-CAM)
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Body: { rfid_uid, ruangan_id, api_key }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan', null, 405);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi API Key
if (!isset($input['api_key']) || $input['api_key'] !== ESP32_API_KEY) {
    jsonResponse(false, 'API Key tidak valid', null, 401);
}

// Validasi input
$requiredFields = ['rfid_uid', 'ruangan_id'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

$rfidUid = sanitize($input['rfid_uid']);
$ruanganId = (int)$input['ruangan_id'];
$tanggal = date('Y-m-d');
$waktuSekarang = date('H:i:s');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Cek siswa berdasarkan RFID
    $siswaQuery = "SELECT * FROM siswa WHERE rfid_uid = :rfid_uid AND status = 'aktif'";
    $siswaStmt = $conn->prepare($siswaQuery);
    $siswaStmt->bindParam(':rfid_uid', $rfidUid);
    $siswaStmt->execute();
    $siswa = $siswaStmt->fetch();
    
    if (!$siswa) {
        jsonResponse(false, 'Kartu RFID tidak terdaftar', [
            'door_open' => false,
            'led_color' => 'red'
        ], 404);
    }
    
    // Cek presensi hari ini
    $presensiQuery = "SELECT p.*, r.nama_ruangan FROM presensi p 
                      LEFT JOIN ruangan r ON p.ruangan_id = r.id
                      WHERE p.siswa_id = :siswa_id AND p.tanggal = :tanggal AND p.waktu_keluar IS NULL
                      ORDER BY p.id DESC LIMIT 1";
    $presensiStmt = $conn->prepare($presensiQuery);
    $presensiStmt->execute([
        ':siswa_id' => $siswa['id'],
        ':tanggal' => $tanggal
    ]);
    $presensi = $presensiStmt->fetch();
    
    if (!$presensi) {
        jsonResponse(false, 'Anda belum melakukan presensi masuk hari ini', [
            'door_open' => false,
            'led_color' => 'red',
            'siswa' => [
                'nisn' => $siswa['nisn'],
                'nama' => $siswa['nama_lengkap']
            ]
        ], 404);
    }
    
    // Update presensi dengan waktu keluar
    $updateQuery = "UPDATE presensi SET waktu_keluar = :waktu_keluar WHERE id = :id";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->execute([
        ':waktu_keluar' => $waktuSekarang,
        ':id' => $presensi['id']
    ]);
    
    // Log aktivitas
    logActivity("Siswa {$siswa['nama_lengkap']} scan keluar dari {$presensi['nama_ruangan']}", 'SUCCESS');
    
    jsonResponse(true, 'Presensi keluar berhasil dicatat', [
        'door_open' => true,
        'led_color' => 'green',
        'door_open_duration' => DOOR_OPEN_DURATION,
        'siswa' => [
            'nisn' => $siswa['nisn'],
            'nama' => $siswa['nama_lengkap']
        ],
        'presensi' => [
            'tanggal' => $tanggal,
            'waktu_masuk' => $presensi['waktu_masuk'],
            'waktu_keluar' => $waktuSekarang,
            'ruangan' => $presensi['nama_ruangan']
        ]
    ]);
    
} catch(PDOException $e) {
    error_log("Scan Keluar Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat memproses scan keluar', null, 500);
}
?>
