<?php
/**
 * =====================================================
 * API LAPORAN HARIAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Params: tanggal (optional, default: today)
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Method tidak diizinkan', null, 405);
}

// Middleware autentikasi
$user = Auth::middleware();

// Validasi role akses
if (!in_array($user['role'], ['admin_operator', 'admin_jurusan'])) {
    jsonResponse(false, 'Akses ditolak', null, 403);
}

// Ambil parameter
$tanggal = $_GET['tanggal'] ?? date('Y-m-d');
$jurusanId = $user['jurusan_id']; // Filter berdasarkan akses user

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query laporan harian
    $query = "SELECT 
                p.tanggal,
                j.nama_jurusan,
                r.nama_ruangan,
                r.kode_ruangan,
                s.nama_lengkap,
                s.nis,
                s.nisn,
                s.kelas,
                s.rombel,
                p.waktu_masuk,
                p.waktu_keluar,
                p.status,
                p.keterangan,
                p.foto_scan_1,
                p.foto_scan_2,
                p.foto_scan_3
              FROM presensi p
              JOIN siswa s ON p.siswa_id = s.id
              JOIN jurusan j ON p.jurusan_id = j.id
              JOIN ruangan r ON p.ruangan_id = r.id";
    
    // Tambahkan filter berdasarkan akses user
    $params = [':tanggal' => $tanggal];
    if ($user['role'] === 'admin_jurusan' && $jurusanId) {
        $query .= " WHERE p.tanggal = :tanggal AND j.id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    } else {
        $query .= " WHERE p.tanggal = :tanggal";
    }
    
    $query .= " ORDER BY j.nama_jurusan, r.kode_ruangan, s.nama_lengkap";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $laporan = $stmt->fetchAll();
    
    // Tambahkan total
    $total = count($laporan);
    
    jsonResponse(true, 'Laporan harian berhasil diambil', [
        'tanggal' => $tanggal,
        'total' => $total,
        'data' => $laporan
    ]);
    
} catch(PDOException $e) {
    error_log("Laporan Harian Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil laporan', null, 500);
}
?>