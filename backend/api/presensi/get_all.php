<?php
/**
 * =====================================================
 * API GET ALL PRESENSI
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params:
 *   - page (default: 1)
 *   - limit (default: 10)
 *   - tanggal (default: hari ini)
 *   - jurusan_id (optional)
 *   - ruangan_id (optional)
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
$tanggal = isset($_GET['tanggal']) ? sanitize($_GET['tanggal']) : date('Y-m-d');
$jurusanId = isset($_GET['jurusan_id']) ? (int)$_GET['jurusan_id'] : null;
$ruanganId = isset($_GET['ruangan_id']) ? (int)$_GET['ruangan_id'] : null;
$status = isset($_GET['status']) ? sanitize($_GET['status']) : '';

$offset = ($page - 1) * $limit;

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $whereConditions = [];
    $params = [];
    
    // Filter berdasarkan role admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $whereConditions[] = "p.jurusan_id = :user_jurusan_id";
        $params[':user_jurusan_id'] = $user['jurusan_id'];
    }
    
    // Filter tanggal
    if (!empty($tanggal)) {
        $whereConditions[] = "p.tanggal = :tanggal";
        $params[':tanggal'] = $tanggal;
    }
    
    // Filter jurusan_id
    if ($jurusanId) {
        $whereConditions[] = "p.jurusan_id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    // Filter ruangan_id
    if ($ruanganId) {
        $whereConditions[] = "p.ruangan_id = :ruangan_id";
        $params[':ruangan_id'] = $ruanganId;
    }
    
    // Filter status
    if (!empty($status)) {
        $whereConditions[] = "p.status = :status";
        $params[':status'] = $status;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Query count total
    $countQuery = "SELECT COUNT(*) as total FROM presensi p {$whereClause}";
    $countStmt = $conn->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Query data
    $query = "SELECT p.*, s.nisn, s.nis, s.nama_lengkap, s.kelas, s.rombel, s.rfid_uid,
              j.nama_jurusan, j.kode_jurusan, r.nama_ruangan, r.kode_ruangan,
              u.nama_lengkap as verifikator
              FROM presensi p
              LEFT JOIN siswa s ON p.siswa_id = s.id
              LEFT JOIN jurusan j ON p.jurusan_id = j.id
              LEFT JOIN ruangan r ON p.ruangan_id = r.id
              LEFT JOIN users u ON p.diverifikasi_oleh = u.id
              {$whereClause}
              ORDER BY p.waktu_masuk DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $presensi = $stmt->fetchAll();
    
    // Format data
    foreach ($presensi as &$p) {
        $p['foto_scan_url'] = [];
        if ($p['foto_scan_1']) $p['foto_scan_url'][] = FOTO_URL . 'scan/' . $p['foto_scan_1'];
        if ($p['foto_scan_2']) $p['foto_scan_url'][] = FOTO_URL . 'scan/' . $p['foto_scan_2'];
        if ($p['foto_scan_3']) $p['foto_scan_url'][] = FOTO_URL . 'scan/' . $p['foto_scan_3'];
    }
    
    $response = Pagination::format($presensi, $page, $limit, $total);
    
    jsonResponse(true, 'Data presensi berhasil diambil', $response);
    
} catch(PDOException $e) {
    error_log("Get All Presensi Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data presensi', null, 500);
}
?>
