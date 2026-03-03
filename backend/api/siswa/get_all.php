<?php
/**
 * =====================================================
 * API GET ALL SISWA
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params: 
 *   - page (default: 1)
 *   - limit (default: 10)
 *   - search (optional)
 *   - jurusan_id (optional)
 *   - kelas (optional)
 *   - status (optional)
 * Response: { success, message, data: { data[], pagination{} } }
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

// Ambil parameter query
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
$jurusanId = isset($_GET['jurusan_id']) ? (int)$_GET['jurusan_id'] : null;
$kelas = isset($_GET['kelas']) ? sanitize($_GET['kelas']) : '';
$status = isset($_GET['status']) ? sanitize($_GET['status']) : '';

// Offset untuk pagination
$offset = ($page - 1) * $limit;

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query dasar
    $whereConditions = [];
    $params = [];
    
    // Filter berdasarkan role admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $whereConditions[] = "s.jurusan_id = :user_jurusan_id";
        $params[':user_jurusan_id'] = $user['jurusan_id'];
    }
    
    // Filter search
    if (!empty($search)) {
        $whereConditions[] = "(s.nisn LIKE :search OR s.nis LIKE :search OR s.nama_lengkap LIKE :search OR s.rfid_uid LIKE :search)";
        $params[':search'] = "%{$search}%";
    }
    
    // Filter jurusan_id
    if ($jurusanId) {
        $whereConditions[] = "s.jurusan_id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    // Filter kelas
    if (!empty($kelas)) {
        $whereConditions[] = "s.kelas = :kelas";
        $params[':kelas'] = $kelas;
    }
    
    // Filter status
    if (!empty($status)) {
        $whereConditions[] = "s.status = :status";
        $params[':status'] = $status;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Query untuk menghitung total data
    $countQuery = "SELECT COUNT(*) as total FROM siswa s {$whereClause}";
    $countStmt = $conn->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Query untuk mengambil data
    $query = "SELECT s.*, j.nama_jurusan, j.kode_jurusan, j.singkatan
              FROM siswa s
              LEFT JOIN jurusan j ON s.jurusan_id = j.id
              {$whereClause}
              ORDER BY s.created_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $siswa = $stmt->fetchAll();
    
    // Format data
    foreach ($siswa as &$s) {
        if ($s['foto']) {
            $s['foto_url'] = FOTO_URL . 'siswa/' . $s['foto'];
        } else {
            $s['foto_url'] = null;
        }
    }
    
    // Response dengan pagination
    $response = Pagination::format($siswa, $page, $limit, $total);
    
    jsonResponse(true, 'Data siswa berhasil diambil', $response);
    
} catch(PDOException $e) {
    error_log("Get All Siswa Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data siswa', null, 500);
}
?>
