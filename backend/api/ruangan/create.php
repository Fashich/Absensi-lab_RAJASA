<?php
/**
 * =====================================================
 * API CREATE RUANGAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   kode_ruangan,
 *   nama_ruangan,
 *   kapasitas,
 *   jurusan_id,
 *   fasilitas,
 *   status,
 *   lokasi,
 *   esp32_cam_id,
 *   esp32_cam_ip
 * }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/functions.php';

// Middleware autentikasi
$user = Auth::middleware();

// Validasi role akses
if (!in_array($user['role'], ['admin_operator'])) {
    jsonResponse(false, 'Akses ditolak - Hanya admin operator yang dapat menambah data ruangan', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

$input = getJsonInput();

// Validasi input
$requiredFields = ['kode_ruangan', 'nama_ruangan', 'kapasitas', 'jurusan_id'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

$kodeRuangan = sanitize($input['kode_ruangan']);
$namaRuangan = sanitize($input['nama_ruangan']);
$kapasitas = (int)$input['kapasitas'];
$jurusanId = (int)$input['jurusan_id'];
$fasilitas = isset($input['fasilitas']) ? sanitize($input['fasilitas']) : '';
$status = $input['status'] ?? 'aktif';
$lokasi = isset($input['lokasi']) ? sanitize($input['lokasi']) : '';
$esp32CamId = isset($input['esp32_cam_id']) ? sanitize($input['esp32_cam_id']) : '';
$esp32CamIp = isset($input['esp32_cam_ip']) ? sanitize($input['esp32_cam_ip']) : '';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Cek apakah jurusan dengan ID tersebut ada
    $checkJurusanQuery = "SELECT id FROM jurusan WHERE id = :jurusan_id";
    $checkJurusanStmt = $conn->prepare($checkJurusanQuery);
    $checkJurusanStmt->bindParam(':jurusan_id', $jurusanId);
    $checkJurusanStmt->execute();
    
    if (!$checkJurusanStmt->fetch()) {
        jsonResponse(false, 'Jurusan tidak ditemukan', null, 404);
    }

    // Cek apakah kode ruangan sudah digunakan
    $checkKodeQuery = "SELECT id FROM ruangan WHERE kode_ruangan = :kode_ruangan";
    $checkKodeStmt = $conn->prepare($checkKodeQuery);
    $checkKodeStmt->bindParam(':kode_ruangan', $kodeRuangan);
    $checkKodeStmt->execute();
    
    if ($checkKodeStmt->fetch()) {
        jsonResponse(false, 'Kode ruangan sudah digunakan', null, 409);
    }

    // Insert data ruangan
    $query = "INSERT INTO ruangan (
              kode_ruangan,
              nama_ruangan,
              jurusan_id,
              kapasitas,
              fasilitas,
              status,
              lokasi,
              esp32_cam_id,
              esp32_cam_ip
            ) VALUES (
              :kode_ruangan,
              :nama_ruangan,
              :jurusan_id,
              :kapasitas,
              :fasilitas,
              :status,
              :lokasi,
              :esp32_cam_id,
              :esp32_cam_ip
            )";

    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':kode_ruangan' => $kodeRuangan,
        ':nama_ruangan' => $namaRuangan,
        ':jurusan_id' => $jurusanId,
        ':kapasitas' => $kapasitas,
        ':fasilitas' => $fasilitas,
        ':status' => $status,
        ':lokasi' => $lokasi,
        ':esp32_cam_id' => $esp32CamId,
        ':esp32_cam_ip' => $esp32CamIp
    ]);

    if ($result) {
        $newId = $conn->lastInsertId();
        
        // Ambil data ruangan yang baru saja dibuat
        $getNewQuery = "SELECT r.*, j.nama_jurusan, j.kode_jurusan, j.singkatan,
                       (SELECT COUNT(*) FROM siswa WHERE jurusan_id = r.jurusan_id AND status = 'aktif') as kapasitas_terisi
                       FROM ruangan r
                       LEFT JOIN jurusan j ON r.jurusan_id = j.id
                       WHERE r.id = :id";
        
        $getNewStmt = $conn->prepare($getNewQuery);
        $getNewStmt->bindParam(':id', $newId);
        $getNewStmt->execute();
        $newRuangan = $getNewStmt->fetch();

        // Log aktivitas
        $activityDesc = "Menambahkan data ruangan baru: {$newRuangan['kode_ruangan']} - {$newRuangan['nama_ruangan']}";
        logActivity($user['id'], 'create_data', $activityDesc, $_SERVER['REMOTE_ADDR']);

        jsonResponse(true, 'Ruangan berhasil ditambahkan', $newRuangan);
    } else {
        jsonResponse(false, 'Gagal menambahkan ruangan', null, 500);
    }

} catch(PDOException $e) {
    error_log("Create Ruangan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat menambahkan ruangan', null, 500);
}
?>