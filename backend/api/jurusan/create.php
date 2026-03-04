<?php
/**
 * =====================================================
 * API CREATE JURUSAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Headers: Authorization: Bearer {token}
 * Body: {
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
    jsonResponse(false, 'Akses ditolak - Hanya admin operator yang dapat menambah data jurusan', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

$input = getJsonInput();

// Validasi input
$requiredFields = ['nama_jurusan', 'kode_jurusan', 'singkatan'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

$namaJurusan = sanitize($input['nama_jurusan']);
$kodeJurusan = sanitize($input['kode_jurusan']);
$singkatan = sanitize($input['singkatan']);
$ketuaJurusan = isset($input['ketua_jurusan']) ? sanitize($input['ketua_jurusan']) : '';
$status = $input['status'] ?? 'aktif';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Cek apakah kode jurusan sudah digunakan
    $checkKodeQuery = "SELECT id FROM jurusan WHERE kode_jurusan = :kode_jurusan";
    $checkKodeStmt = $conn->prepare($checkKodeQuery);
    $checkKodeStmt->bindParam(':kode_jurusan', $kodeJurusan);
    $checkKodeStmt->execute();
    
    if ($checkKodeStmt->fetch()) {
        jsonResponse(false, 'Kode jurusan sudah digunakan', null, 409);
    }

    // Insert data jurusan
    $query = "INSERT INTO jurusan (
              nama_jurusan,
              kode_jurusan,
              singkatan,
              ketua_jurusan,
              status
            ) VALUES (
              :nama_jurusan,
              :kode_jurusan,
              :singkatan,
              :ketua_jurusan,
              :status
            )";

    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':nama_jurusan' => $namaJurusan,
        ':kode_jurusan' => $kodeJurusan,
        ':singkatan' => $singkatan,
        ':ketua_jurusan' => $ketuaJurusan,
        ':status' => $status
    ]);

    if ($result) {
        $newId = $conn->lastInsertId();
        
        // Ambil data jurusan yang baru saja dibuat
        $getNewQuery = "SELECT j.*, 
                       (SELECT COUNT(*) FROM siswa WHERE jurusan_id = j.id AND status = 'aktif') as total_siswa,
                       (SELECT COUNT(*) FROM ruangan WHERE jurusan_id = j.id AND status = 'aktif') as total_ruangan
                       FROM jurusan j
                       WHERE j.id = :id";
        
        $getNewStmt = $conn->prepare($getNewQuery);
        $getNewStmt->bindParam(':id', $newId);
        $getNewStmt->execute();
        $newJurusan = $getNewStmt->fetch();

        // Log aktivitas
        $activityDesc = "Menambahkan data jurusan baru: {$newJurusan['kode_jurusan']} - {$newJurusan['nama_jurusan']}";
        logActivity($user['id'], 'create_data', $activityDesc, $_SERVER['REMOTE_ADDR']);

        jsonResponse(true, 'Jurusan berhasil ditambahkan', $newJurusan);
    } else {
        jsonResponse(false, 'Gagal menambahkan jurusan', null, 500);
    }

} catch(PDOException $e) {
    error_log("Create Jurusan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat menambahkan jurusan', null, 500);
}
?>