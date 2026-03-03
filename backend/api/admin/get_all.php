<?php
/**
 * =====================================================
 * API GET ALL ADMIN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan GET.', null, 405);
}

// Verifikasi token - hanya admin_operator
$user = Auth::middleware();

if ($user['role'] !== 'admin_operator') {
    jsonResponse(false, 'Anda tidak memiliki akses', null, 403);
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "SELECT u.id, u.username, u.nama_lengkap, u.email, u.no_telp, u.role, 
              u.status, u.last_login, u.created_at, j.nama_jurusan, r.nama_ruangan
              FROM users u
              LEFT JOIN jurusan j ON u.jurusan_id = j.id
              LEFT JOIN ruangan r ON u.ruangan_id = r.id
              WHERE u.role IN ('admin_operator', 'admin_jurusan')
              ORDER BY u.role, u.nama_lengkap";
    
    $stmt = $conn->query($query);
    $admins = $stmt->fetchAll();
    
    jsonResponse(true, 'Data admin berhasil diambil', $admins);
    
} catch(PDOException $e) {
    error_log("Get All Admin Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data admin', null, 500);
}
?>
