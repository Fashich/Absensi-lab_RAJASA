<?php
/**
 * =====================================================
 * API GET ALL RUANGAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params:
 *   - jurusan_id (optional)
 *   - status (optional)
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan GET.', null, 405);
}

// Verifikasi token
$user = Auth::middleware();

$jurusanId = isset($_GET['jurusan_id']) ? (int)$_GET['jurusan_id'] : null;
$status = isset($_GET['status']) ? sanitize($_GET['status']) : '';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $whereConditions = [];
    $params = [];
    
    if ($jurusanId) {
        $whereConditions[] = "r.jurusan_id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    if (!empty($status)) {
        $whereConditions[] = "r.status = :status";
        $params[':status'] = $status;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    $query = "SELECT r.*, j.nama_jurusan, j.kode_jurusan, j.singkatan,
              (SELECT COUNT(*) FROM siswa WHERE jurusan_id = r.jurusan_id AND status = 'aktif') as kapasitas_terisi
              FROM ruangan r
              LEFT JOIN jurusan j ON r.jurusan_id = j.id
              {$whereClause}
              ORDER BY r.kode_ruangan ASC";
    
    $stmt = $conn->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $ruangan = $stmt->fetchAll();
    
    jsonResponse(true, 'Data ruangan berhasil diambil', $ruangan);
    
} catch(PDOException $e) {
    error_log("Get All Ruangan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data ruangan', null, 500);
}
?>
