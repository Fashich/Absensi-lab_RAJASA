<?php
/**
 * =====================================================
 * API DELETE SISWA
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: DELETE
 * Headers: Authorization: Bearer {token}
 * Query Params: id
 * Response: { success, message }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan DELETE.', null, 405);
}

// Verifikasi token dan cek akses
$user = Auth::middleware();

// Hanya admin_operator yang bisa hapus siswa
if ($user['role'] !== 'admin_operator') {
    jsonResponse(false, 'Anda tidak memiliki akses untuk menghapus data siswa', null, 403);
}

// Ambil ID dari parameter
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    jsonResponse(false, 'ID siswa tidak valid', null, 400);
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Cek apakah siswa ada
    $checkQuery = "SELECT * FROM siswa WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    $siswa = $checkStmt->fetch();
    
    if (!$siswa) {
        jsonResponse(false, 'Siswa tidak ditemukan', null, 404);
    }
    
    // Hapus foto jika ada
    if ($siswa['foto']) {
        $fotoPath = UPLOAD_PATH . 'foto/siswa/' . $siswa['foto'];
        if (file_exists($fotoPath)) {
            unlink($fotoPath);
        }
    }
    
    // Query delete
    $query = "DELETE FROM siswa WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    // Log aktivitas
    logActivity("User {$user['username']} menghapus siswa: {$siswa['nama_lengkap']} ({$siswa['nisn']})", 'SUCCESS');
    
    jsonResponse(true, 'Siswa berhasil dihapus');
    
} catch(PDOException $e) {
    error_log("Delete Siswa Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat menghapus siswa', null, 500);
}
?>
