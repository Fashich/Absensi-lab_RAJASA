<?php
/**
 * =====================================================
 * API LAPORAN PER RUANGAN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Params: ruangan_id (optional), tanggal_mulai, tanggal_selesai
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
$ruanganId = $_GET['ruangan_id'] ?? null;
$tanggalMulai = $_GET['tanggal_mulai'] ?? date('Y-m-01'); // Awal bulan
$tanggalSelesai = $_GET['tanggal_selesai'] ?? date('Y-m-d');

// Jika admin jurusan, filter hanya ruangan yang relevan
$jurusanId = $user['jurusan_id'];
$roleId = $user['role'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query laporan per ruangan
    $query = "SELECT 
                r.kode_ruangan,
                r.nama_ruangan,
                j.nama_jurusan,
                s.nama_lengkap,
                s.nis,
                s.nisn,
                s.kelas,
                s.rombel,
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
    
    // Filter untuk admin jurusan
    if ($roleId === 'admin_jurusan' && $jurusanId) {
        $whereConditions[] = "j.id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    // Filter berdasarkan ruangan jika disediakan
    if ($ruanganId) {
        $whereConditions[] = "r.id = :ruangan_id";
        $params[':ruangan_id'] = $ruanganId;
    }
    
    $query .= " WHERE " . implode(" AND ", $whereConditions);
    $query .= " ORDER BY r.kode_ruangan, j.nama_jurusan, s.kelas, s.rombel, s.nama_lengkap, p.tanggal";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $laporan = $stmt->fetchAll();
    
    // Group data by ruangan
    $groupedData = [];
    foreach ($laporan as $item) {
        $ruanganKey = $item['kode_ruangan'];
        if (!isset($groupedData[$ruanganKey])) {
            $groupedData[$ruanganKey] = [
                'ruangan' => $item['nama_ruangan'],
                'kode_ruangan' => $item['kode_ruangan'],
                'data' => []
            ];
        }
        $groupedData[$ruanganKey]['data'][] = $item;
    }
    
    // Tambahkan total
    $total = count($laporan);
    
    jsonResponse(true, 'Laporan per ruangan berhasil diambil', [
        'tanggal_mulai' => $tanggalMulai,
        'tanggal_selesai' => $tanggalSelesai,
        'total' => $total,
        'filter_ruangan' => $ruanganId,
        'data' => array_values($groupedData)
    ]);
    
} catch(PDOException $e) {
    error_log("Laporan Per Ruangan Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil laporan', null, 500);
}
?>