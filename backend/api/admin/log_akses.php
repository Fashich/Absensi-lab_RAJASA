<?php
/**
 * =====================================================
 * API LOG AKSES (ID TIDAK VALID)
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params:
 *   - page (default: 1)
 *   - limit (default: 10)
 *   - tanggal (optional)
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
$tanggal = isset($_GET['tanggal']) ? sanitize($_GET['tanggal']) : '';

$offset = ($page - 1) * $limit;

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $whereConditions = [];
    $params = [];
    
    // Filter berdasarkan role admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $whereConditions[] = "r.jurusan_id = :user_jurusan_id";
        $params[':user_jurusan_id'] = $user['jurusan_id'];
    }
    
    // Filter tanggal
    if (!empty($tanggal)) {
        $whereConditions[] = "la.tanggal = :tanggal";
        $params[':tanggal'] = $tanggal;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Query count total
    $countQuery = "SELECT COUNT(*) as total FROM log_akses la 
                   LEFT JOIN ruangan r ON la.ruangan_id = r.id 
                   {$whereClause}";
    $countStmt = $conn->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Query data
    $query = "SELECT la.*, r.nama_ruangan, r.kode_ruangan, j.nama_jurusan
              FROM log_akses la
              LEFT JOIN ruangan r ON la.ruangan_id = r.id
              LEFT JOIN jurusan j ON r.jurusan_id = j.id
              {$whereClause}
              ORDER BY la.tanggal DESC, la.waktu DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $logAkses = $stmt->fetchAll();
    
    // Format status
    $statusLabels = [
        'id_tidak_terdaftar' => 'ID Tidak Terdaftar',
        'kartu_diblokir' => 'Kartu Diblokir',
        'ruangan_tidak_cocok' => 'Ruangan Tidak Cocok',
        'foto_buram' => 'Foto Buram',
        'lainnya' => 'Lainnya'
    ];
    
    foreach ($logAkses as &$log) {
        $log['status_label'] = $statusLabels[$log['status']] ?? $log['status'];
    }
    
    $response = Pagination::format($logAkses, $page, $limit, $total);
    
    jsonResponse(true, 'Data log akses berhasil diambil', $response);
    
} catch(PDOException $e) {
    error_log("Log Akses Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data log akses', null, 500);
}
?>
