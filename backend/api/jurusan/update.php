<?php
/**
 * =====================================================
 * API UPDATE JURUSAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: PUT
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   id,
 *   nama_jurusan,
 *   kode_jurusan,
 *   singkatan,
 *   ketua_jurusan,
 *   status
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
    jsonResponse(false, 'Akses ditolak - Hanya admin operator yang dapat mengubah data jurusan', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan PUT.', null, 405);
}

$input = getJsonInput();

// Validasi input
$requiredFields = ['id', 'nama_jurusan', 'kode_jurusan', 'singkatan'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

$id = (int)$input['id'];
$namaJurusan = sanitize($input['nama_jurusan']);
$kodeJurusan = sanitize($input['kode_jurusan']);
$singkatan = sanitize($input['singkatan']);
$ketuaJurusan = isset($input['ketua_jurusan']) ? sanitize($input['ketua_jurusan']) : '';
$status = $input['status'] ?? 'aktif';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Cek apakah jurusan dengan ID tersebut ada
    $checkQuery = "SELECT id FROM jurusan WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if (!$checkStmt->fetch()) {
        jsonResponse(false, 'Jurusan tidak ditemukan', null, 404);
    }

    // Cek apakah kode jurusan sudah digunakan oleh jurusan lain
    $checkKodeQuery = "SELECT id FROM jurusan WHERE kode_jurusan = :kode_jurusan AND id != :id";
    $checkKodeStmt = $conn->prepare($checkKodeQuery);
    $checkKodeStmt->bindParam(':kode_jurusan', $kodeJurusan);
    $checkKodeStmt->bindParam(':id', $id);
    $checkKodeStmt->execute();
    
    if ($checkKodeStmt->fetch()) {
        jsonResponse(false, 'Kode jurusan sudah digunakan oleh jurusan lain', null, 409);
    }

    // Update data jurusan
    $query = "UPDATE jurusan SET 
              nama_jurusan = :nama_jurusan,
              kode_jurusan = :kode_jurusan,
              singkatan = :singkatan,
              ketua_jurusan = :ketua_jurusan,
              status = :status,
              updated_at = NOW()
              WHERE id = :id";

    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':id' => $id,
        ':nama_jurusan' => $namaJurusan,
        ':kode_jurusan' => $kodeJurusan,
        ':singkatan' => $singkatan,
        ':ketua_jurusan' => $ketuaJurusan,
        ':status' => $status
    ]);

    if ($result) {
        // Ambil data jurusan yang telah diperbarui
        $getUpdatedQuery = "SELECT j.*, 
                           (SELECT COUNT(*) FROM siswa WHERE jurusan_id = j.id AND status = 'aktif') as total_siswa,
                           (SELECT COUNT(*) FROM ruangan WHERE jurusan_id = j.id AND status = 'aktif') as total_ruangan
                           FROM jurusan j
                           WHERE j.id = :id";
        
        $getUpdatedStmt = $conn->prepare($getUpdatedQuery);
        $getUpdatedStmt->bindParam(':id', $id);
        $getUpdatedStmt->execute();
        $updatedJurusan = $getUpdatedStmt->fetch();

        // Log aktivitas
        $activityDesc = "Memperbarui data jurusan: {$updatedJurusan['kode_jurusan']} - {$updatedJurusan['nama_jurusan']}";
        logActivity($user['id'], 'update_data', $activityDesc, $_SERVER['REMOTE_ADDR']);

        jsonResponse(true, 'Jurusan berhasil diperbarui', $updatedJurusan);
    } else {
        jsonResponse(false, 'Gagal memperbarui jurusan', null, 500);
    }

} catch(PDOException $e) {
    error_log("Update Jurusan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat memperbarui jurusan', null, 500);
}
?>