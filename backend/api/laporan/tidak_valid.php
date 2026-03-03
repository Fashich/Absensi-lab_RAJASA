<?php
/**
 * =====================================================
 * API LAPORAN KEHADIRAN TIDAK VALID
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Params: tanggal_mulai, tanggal_selesai
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
$tanggalMulai = $_GET['tanggal_mulai'] ?? date('Y-m-01'); // Awal bulan
$tanggalSelesai = $_GET['tanggal_selesai'] ?? date('Y-m-d');

// Jika admin jurusan, filter hanya ruangan yang relevan
$jurusanId = $user['jurusan_id'];
$roleId = $user['role'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Query laporan kehadiran tidak valid
    $query = "SELECT 
                la.tanggal,
                la.waktu,
                la.rfid_uid,
                la.status AS status_akses,
                la.keterangan,
                r.nama_ruangan,
                r.kode_ruangan,
                j.nama_jurusan
              FROM log_akses la
              JOIN ruangan r ON la.ruangan_id = r.id
              JOIN jurusan j ON r.jurusan_id = j.id";
    
    $params = [
        ':tanggal_mulai' => $tanggalMulai,
        ':tanggal_selesai' => $tanggalSelesai
    ];
    
    $whereConditions = ["la.tanggal BETWEEN :tanggal_mulai AND :tanggal_selesai"];
    
    // Filter untuk admin jurusan
    if ($roleId === 'admin_jurusan' && $jurusanId) {
        $whereConditions[] = "j.id = :jurusan_id";
        $params[':jurusan_id'] = $jurusanId;
    }
    
    $query .= " WHERE " . implode(" AND ", $whereConditions);
    $query .= " ORDER BY la.tanggal DESC, la.waktu DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $laporan = $stmt->fetchAll();
    
    // Group data by status
    $groupedByStatus = [];
    foreach ($laporan as $item) {
        $status = $item['status_akses'];
        if (!isset($groupedByStatus[$status])) {
            $groupedByStatus[$status] = [
                'status' => $status,
                'keterangan' => ucfirst(str_replace('_', ' ', $status)),
                'jumlah' => 0,
                'data' => []
            ];
        }
        $groupedByStatus[$status]['data'][] = $item;
        $groupedByStatus[$status]['jumlah']++;
    }
    
    // Tambahkan total
    $total = count($laporan);
    
    jsonResponse(true, 'Laporan kehadiran tidak valid berhasil diambil', [
        'tanggal_mulai' => $tanggalMulai,
        'tanggal_selesai' => $tanggalSelesai,
        'total' => $total,
        'data' => array_values($groupedByStatus)
    ]);
    
} catch(PDOException $e) {
    error_log("Laporan Tidak Valid Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil laporan', null, 500);
}
?>