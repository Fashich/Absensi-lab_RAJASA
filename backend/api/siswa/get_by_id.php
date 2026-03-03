<?php
/**
 * =====================================================
 * API GET SISWA BY ID
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Headers: Authorization: Bearer {token}
 * Query Params: id
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

// Ambil ID dari parameter
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    jsonResponse(false, 'ID siswa tidak valid', null, 400);
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "SELECT s.*, j.nama_jurusan, j.kode_jurusan, j.singkatan
              FROM siswa s
              LEFT JOIN jurusan j ON s.jurusan_id = j.id
              WHERE s.id = :id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    $siswa = $stmt->fetch();
    
    if (!$siswa) {
        jsonResponse(false, 'Siswa tidak ditemukan', null, 404);
    }
    
    // Cek akses untuk admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id'] != $siswa['jurusan_id']) {
        jsonResponse(false, 'Anda tidak memiliki akses ke data siswa ini', null, 403);
    }
    
    // Format foto URL
    if ($siswa['foto']) {
        $siswa['foto_url'] = FOTO_URL . 'siswa/' . $siswa['foto'];
    } else {
        $siswa['foto_url'] = null;
    }
    
    jsonResponse(true, 'Data siswa berhasil diambil', $siswa);
    
} catch(PDOException $e) {
    error_log("Get Siswa By ID Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data siswa', null, 500);
}
?>
