<?php
/**
 * =====================================================
 * API ACTIVITY LOGS FOR ADMINS
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params:
 *   - limit (default: 5)
 *   - offset (default: 0)
 * Response: { success, message, data: [] }
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

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get limit parameter
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
    $limit = min($limit, 20); // Maximum 20 records
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Query to get recent admin activities
    $query = "SELECT aa.*, u.nama_lengkap as user
              FROM admin_activities aa
              LEFT JOIN users u ON aa.user_id = u.id
              ORDER BY aa.created_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $activities = $stmt->fetchAll();
    
    jsonResponse(true, 'Data aktivitas admin berhasil diambil', $activities);
    
} catch(PDOException $e) {
    error_log("Admin Activities Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data aktivitas admin', null, 500);
}
?>