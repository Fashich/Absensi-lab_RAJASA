<?php
/**
 * =====================================================
 * API EKSPOR PRESENSI KE CSV
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET
 * Params: 
 *   - tanggal_mulai (default: awal bulan ini)
 *   - tanggal_selesai (default: hari ini)
 *   - jenis (harian, bulanan, per_jurusan, per_ruangan)
 * Response: CSV file
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
$tanggalMulai = $_GET['tanggal_mulai'] ?? date('Y-m-01');
$tanggalSelesai = $_GET['tanggal_selesai'] ?? date('Y-m-d');
$jenis = $_GET['jenis'] ?? 'harian'; // harian, bulanan, per_jurusan, per_ruangan

// Jika admin jurusan, filter hanya data yang relevan
$jurusanId = $user['jurusan_id'];
$roleId = $user['role'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Tentukan query berdasarkan jenis laporan
    switch ($jenis) {
        case 'harian':
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
            
            if ($roleId === 'admin_jurusan' && $jurusanId) {
                $whereConditions[] = "j.id = :jurusan_id";
                $params[':jurusan_id'] = $jurusanId;
            }
            
            $query .= " WHERE " . implode(" AND ", $whereConditions);
            $query .= " ORDER BY p.tanggal, j.nama_jurusan, r.kode_ruangan, s.nama_lengkap";
            
            break;
            
        case 'per_jurusan':
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
            
            if ($roleId === 'admin_jurusan' && $jurusanId) {
                $whereConditions[] = "j.id = :jurusan_id";
                $params[':jurusan_id'] = $jurusanId;
            }
            
            $query .= " WHERE " . implode(" AND ", $whereConditions);
            $query .= " ORDER BY j.nama_jurusan, s.kelas, s.rombel, p.tanggal, s.nama_lengkap";
            
            break;
            
        case 'per_ruangan':
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
            
            if ($roleId === 'admin_jurusan' && $jurusanId) {
                $whereConditions[] = "j.id = :jurusan_id";
                $params[':jurusan_id'] = $jurusanId;
            }
            
            $query .= " WHERE " . implode(" AND ", $whereConditions);
            $query .= " ORDER BY r.kode_ruangan, j.nama_jurusan, s.kelas, s.rombel, p.tanggal, s.nama_lengkap";
            
            break;
            
        default:
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
            
            if ($roleId === 'admin_jurusan' && $jurusanId) {
                $whereConditions[] = "j.id = :jurusan_id";
                $params[':jurusan_id'] = $jurusanId;
            }
            
            $query .= " WHERE " . implode(" AND ", $whereConditions);
            $query .= " ORDER BY p.tanggal, j.nama_jurusan, r.kode_ruangan, s.nama_lengkap";
            
            break;
    }
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_NUM);
    
    // Tentukan header berdasarkan jenis laporan
    switch ($jenis) {
        case 'per_jurusan':
            $headers = ['Jurusan', 'Kode Jurusan', 'Kelas', 'Rombel', 'Nama Siswa', 'NIS', 'NISN', 'Ruangan', 'Tanggal', 'Waktu Masuk', 'Waktu Keluar', 'Status', 'Keterangan'];
            break;
        case 'per_ruangan':
            $headers = ['Kode Ruangan', 'Nama Ruangan', 'Jurusan', 'Nama Siswa', 'NIS', 'NISN', 'Kelas', 'Rombel', 'Tanggal', 'Waktu Masuk', 'Waktu Keluar', 'Status', 'Keterangan'];
            break;
        default:
            $headers = ['Tanggal', 'Jurusan', 'Ruangan', 'Kode Ruangan', 'Nama Siswa', 'NIS', 'NISN', 'Kelas', 'Rombel', 'Waktu Masuk', 'Waktu Keluar', 'Status', 'Keterangan'];
            break;
    }
    
    // Generate filename
    $filename = 'laporan_presensi_' . $jenis . '_' . date('Y-m-d_H-i-s') . '.csv';
    
    // Log aktivitas
    logActivity("User {$user['username']} export presensi CSV: jenis={$jenis}, {$tanggalMulai} sampai {$tanggalSelesai}", 'SUCCESS');
    
    // Export to CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    $output = fopen('php://output', 'w');
    
    // Add BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Write headers
    fputcsv($output, $headers);
    
    // Write data
    foreach ($data as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit;
    
} catch(PDOException $e) {
    error_log("Export CSV Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengekspor data', null, 500);
}
?>
