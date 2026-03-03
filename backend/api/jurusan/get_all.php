<?php
/**
 * =====================================================
 * API GET ALL JURUSAN
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

// Verifikasi token
$user = Auth::middleware();

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "SELECT j.*, 
              (SELECT COUNT(*) FROM siswa WHERE jurusan_id = j.id AND status = 'aktif') as total_siswa,
              (SELECT COUNT(*) FROM ruangan WHERE jurusan_id = j.id AND status = 'aktif') as total_ruangan
              FROM jurusan j
              ORDER BY j.nama_jurusan ASC";
    
    $stmt = $conn->query($query);
    $jurusan = $stmt->fetchAll();
    
    jsonResponse(true, 'Data jurusan berhasil diambil', $jurusan);
    
} catch(PDOException $e) {
    error_log("Get All Jurusan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data jurusan', null, 500);
}
?>
