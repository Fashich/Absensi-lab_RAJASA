<?php
/**
 * =====================================================
 * API LAPORAN PER JURUSAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Params: jurusan_id (optional), tanggal_mulai, tanggal_selesai
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
$jurusanId = $_GET['jurusan_id'] ?? null;
$tanggalMulai = $_GET['tanggal_mulai'] ?? date('Y-m-01'); // Awal bulan
$tanggalSelesai = $_GET['tanggal_selesai'] ?? date('Y-m-d');

// Validasi bahwa admin jurusan hanya bisa mengakses jurusan mereka sendiri
if ($user['role'] === 'admin_jurusan' && $jurusanId && $jurusanId != $user['jurusan_id']) {
    jsonResponse(false, 'Akses ditolak - Anda hanya bisa mengakses jurusan Anda sendiri', null, 403);
} elseif ($user['role'] === 'admin_jurusan' && !$jurusanId) {
    $jurusanId = $user['jurusan_id'];
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query laporan per jurusan
    $query = "SELECT 
                j.nama_jurusan,
                j.kode_jurusan,
                s.kelas,
                s.rombel,
                s.nama_lengkap,
                s.nis,
                s.nisn,
                r.nama_ruangan,
                p.tanggal,
                p.waktu_masuk,
                p.waktu_keluar,
                p.status,
                p.keterangan
              FROM presensi p
              JOIN siswa s ON p.siswa_id = s.id
              JOIN jurusan j ON p.jurusan_id = j.id
              JOIN ruangan r ON p.ruangan_id = r.id";
    
    $params = [
        ':tanggal_mulai' => $tanggalMulai,
        ':tanggal_selesai' => $tanggalSelesai
    ];
    
    $whereConditions = ["p.tanggal BETWEEN :tanggal_mulai AND :tanggal_selesai"];
    
    if ($jurusanId) {
        $whereConditions[] = "j.id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    $query .= " WHERE " . implode(" AND ", $whereConditions);
    $query .= " ORDER BY j.nama_jurusan, s.kelas, s.rombel, s.nama_lengkap, p.tanggal";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $laporan = $stmt->fetchAll();
    
    // Group data by jurusan
    $groupedData = [];
    foreach ($laporan as $item) {
        $jurusanKey = $item['kode_jurusan'];
        if (!isset($groupedData[$jurusanKey])) {
            $groupedData[$jurusanKey] = [
                'jurusan' => $item['nama_jurusan'],
                'kode_jurusan' => $item['kode_jurusan'],
                'data' => []
            ];
        }
        $groupedData[$jurusanKey]['data'][] = $item;
    }
    
    // Tambahkan total
    $total = count($laporan);
    
    jsonResponse(true, 'Laporan per jurusan berhasil diambil', [
        'tanggal_mulai' => $tanggalMulai,
        'tanggal_selesai' => $tanggalSelesai,
        'total' => $total,
        'filter_jurusan' => $jurusanId,
        'data' => array_values($groupedData)
    ]);
    
} catch(PDOException $e) {
    error_log("Laporan Per Jurusan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil laporan', null, 500);
}
?>