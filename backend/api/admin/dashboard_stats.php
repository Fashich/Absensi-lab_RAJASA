<?php
/**
 * =====================================================
 * API DASHBOARD STATS
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
    
    $today = date('Y-m-d');
    $whereJurusan = '';
    $params = [];
    
    // Filter untuk admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $whereJurusan = "AND jurusan_id = :jurusan_id";
        $params[':jurusan_id'] = $user['jurusan_id'];
    }
    
    // Total siswa
    $siswaQuery = "SELECT COUNT(*) as total FROM siswa WHERE status = 'aktif' {$whereJurusan}";
    $siswaStmt = $conn->prepare($siswaQuery);
    foreach ($params as $key => $value) {
        $siswaStmt->bindValue($key, $value);
    }
    $siswaStmt->execute();
    $totalSiswa = $siswaStmt->fetch()['total'];
    
    // Total hadir hari ini
    $hadirQuery = "SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('hadir', 'terlambat') {$whereJurusan}";
    $hadirStmt = $conn->prepare($hadirQuery);
    $hadirStmt->bindParam(':tanggal', $today);
    foreach ($params as $key => $value) {
        $hadirStmt->bindValue($key, $value);
    }
    $hadirStmt->execute();
    $totalHadir = $hadirStmt->fetch()['total'];
    
    // Total tidak hadir hari ini
    $tidakHadirQuery = "SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('sakit', 'izin', 'alpha') {$whereJurusan}";
    $tidakHadirStmt = $conn->prepare($tidakHadirQuery);
    $tidakHadirStmt->bindParam(':tanggal', $today);
    foreach ($params as $key => $value) {
        $tidakHadirStmt->bindValue($key, $value);
    }
    $tidakHadirStmt->execute();
    $totalTidakHadir = $tidakHadirStmt->fetch()['total'];
    
    // Total log akses tidak valid hari ini
    $logQuery = "SELECT COUNT(*) as total FROM log_akses WHERE tanggal = :tanggal";
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $logQuery .= " AND ruangan_id IN (SELECT id FROM ruangan WHERE jurusan_id = :jurusan_id)";
    }
    $logStmt = $conn->prepare($logQuery);
    $logStmt->bindParam(':tanggal', $today);
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $logStmt->bindParam(':jurusan_id', $user['jurusan_id']);
    }
    $logStmt->execute();
    $totalLogAkses = $logStmt->fetch()['total'];
    
    // Total ruangan aktif
    $ruanganQuery = "SELECT COUNT(*) as total FROM ruangan WHERE status = 'aktif'";
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $ruanganQuery .= " AND jurusan_id = :jurusan_id";
    }
    $ruanganStmt = $conn->prepare($ruanganQuery);
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $ruanganStmt->bindParam(':jurusan_id', $user['jurusan_id']);
    }
    $ruanganStmt->execute();
    $totalRuangan = $ruanganStmt->fetch()['total'];
    
    // Statistik per jurusan (hanya untuk admin_operator)
    $statistikJurusan = [];
    if ($user['role'] === 'admin_operator') {
        $jurusanQuery = "SELECT j.id, j.nama_jurusan, j.kode_jurusan,
                        (SELECT COUNT(*) FROM siswa WHERE jurusan_id = j.id AND status = 'aktif') as total_siswa,
                        (SELECT COUNT(*) FROM presensi WHERE jurusan_id = j.id AND tanggal = :tanggal AND status IN ('hadir', 'terlambat')) as hadir_hari_ini
                        FROM jurusan j
                        WHERE j.status = 'aktif'
                        ORDER BY j.nama_jurusan";
        $jurusanStmt = $conn->prepare($jurusanQuery);
        $jurusanStmt->bindParam(':tanggal', $today);
        $jurusanStmt->execute();
        $statistikJurusan = $jurusanStmt->fetchAll();
    }
    
    // Presensi terbaru
    $recentQuery = "SELECT p.*, s.nama_lengkap, s.kelas, s.rombel, r.nama_ruangan, j.nama_jurusan
                    FROM presensi p
                    LEFT JOIN siswa s ON p.siswa_id = s.id
                    LEFT JOIN ruangan r ON p.ruangan_id = r.id
                    LEFT JOIN jurusan j ON p.jurusan_id = j.id
                    WHERE p.tanggal = :tanggal";
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $recentQuery .= " AND p.jurusan_id = :jurusan_id";
    }
    $recentQuery .= " ORDER BY p.waktu_masuk DESC LIMIT 10";
    
    $recentStmt = $conn->prepare($recentQuery);
    $recentStmt->bindParam(':tanggal', $today);
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id']) {
        $recentStmt->bindParam(':jurusan_id', $user['jurusan_id']);
    }
    $recentStmt->execute();
    $presensiTerbaru = $recentStmt->fetchAll();
    
    jsonResponse(true, 'Data dashboard berhasil diambil', [
        'stats' => [
            'total_siswa' => (int)$totalSiswa,
            'total_hadir_hari_ini' => (int)$totalHadir,
            'total_tidak_hadir_hari_ini' => (int)$totalTidakHadir,
            'total_log_akses_hari_ini' => (int)$totalLogAkses,
            'total_ruangan_aktif' => (int)$totalRuangan,
            'tanggal' => $today
        ],
        'statistik_jurusan' => $statistikJurusan,
        'presensi_terbaru' => $presensiTerbaru
    ]);
    
} catch(PDOException $e) {
    error_log("Dashboard Stats Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengambil data dashboard', null, 500);
}
?>
