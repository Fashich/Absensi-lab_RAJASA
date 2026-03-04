<?php
/**
 * =====================================================
 * API UPDATE RUANGAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: PUT
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   id,
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
    jsonResponse(false, 'Akses ditolak - Hanya admin operator yang dapat mengubah data ruangan', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan PUT.', null, 405);
}

$input = getJsonInput();

// Validasi input
$requiredFields = ['id', 'kode_ruangan', 'nama_ruangan', 'kapasitas', 'jurusan_id'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

$id = (int)$input['id'];
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

    // Cek apakah ruangan dengan ID tersebut ada
    $checkQuery = "SELECT id FROM ruangan WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        jsonResponse(false, 'Ruangan tidak ditemukan', null, 404);
    }

    // Cek apakah jurusan dengan ID tersebut ada
    $checkJurusanQuery = "SELECT id FROM jurusan WHERE id = :jurusan_id";
    $checkJurusanStmt = $conn->prepare($checkJurusanQuery);
    $checkJurusanStmt->bindParam(':jurusan_id', $jurusanId);
    $checkJurusanStmt->execute();
    
    if (!$checkJurusanStmt->fetch()) {
        jsonResponse(false, 'Jurusan tidak ditemukan', null, 404);
    }

    // Cek apakah kode ruangan sudah digunakan oleh ruangan lain
    $checkKodeQuery = "SELECT id FROM ruangan WHERE kode_ruangan = :kode_ruangan AND id != :id";
    $checkKodeStmt = $conn->prepare($checkKodeQuery);
    $checkKodeStmt->bindParam(':kode_ruangan', $kodeRuangan);
    $checkKodeStmt->bindParam(':id', $id);
    $checkKodeStmt->execute();
    
    if ($checkKodeStmt->fetch()) {
        jsonResponse(false, 'Kode ruangan sudah digunakan oleh ruangan lain', null, 409);
    }

    // Update data ruangan
    $query = "UPDATE ruangan SET 
              kode_ruangan = :kode_ruangan,
              nama_ruangan = :nama_ruangan,
              kapasitas = :kapasitas,
              jurusan_id = :jurusan_id,
              fasilitas = :fasilitas,
              status = :status,
              lokasi = :lokasi,
              esp32_cam_id = :esp32_cam_id,
              esp32_cam_ip = :esp32_cam_ip,
              updated_at = NOW()
              WHERE id = :id";

    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':id' => $id,
        ':kode_ruangan' => $kodeRuangan,
        ':nama_ruangan' => $namaRuangan,
        ':kapasitas' => $kapasitas,
        ':jurusan_id' => $jurusanId,
        ':fasilitas' => $fasilitas,
        ':status' => $status,
        ':lokasi' => $lokasi,
        ':esp32_cam_id' => $esp32CamId,
        ':esp32_cam_ip' => $esp32CamIp
    ]);

    if ($result) {
        // Ambil data ruangan yang telah diperbarui
        $getUpdatedQuery = "SELECT r.*, j.nama_jurusan, j.kode_jurusan, j.singkatan,
                           (SELECT COUNT(*) FROM siswa WHERE jurusan_id = r.jurusan_id AND status = 'aktif') as kapasitas_terisi
                           FROM ruangan r
                           LEFT JOIN jurusan j ON r.jurusan_id = j.id
                           WHERE r.id = :id";
        
        $getUpdatedStmt = $conn->prepare($getUpdatedQuery);
        $getUpdatedStmt->bindParam(':id', $id);
        $getUpdatedStmt->execute();
        $updatedRuangan = $getUpdatedStmt->fetch();

        // Log aktivitas
        $activityDesc = "Memperbarui data ruangan: {$updatedRuangan['kode_ruangan']} - {$updatedRuangan['nama_ruangan']}";
        logActivity($user['id'], 'update_data', $activityDesc, $_SERVER['REMOTE_ADDR']);

        jsonResponse(true, 'Ruangan berhasil diperbarui', $updatedRuangan);
    } else {
        jsonResponse(false, 'Gagal memperbarui ruangan', null, 500);
    }

} catch(PDOException $e) {
    error_log("Update Ruangan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat memperbarui ruangan', null, 500);
}
?>