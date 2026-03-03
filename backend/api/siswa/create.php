<?php
/**
 * =====================================================
 * API CREATE SISWA
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Headers: Authorization: Bearer {token}
 * Body: { nisn, nis, nama_lengkap, jenis_kelamin, jurusan_id, kelas, rombel, ... }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

// Verifikasi token dan cek akses
$user = Auth::middleware();

if (!$user['role'] === 'admin_operator' && !$user['role'] === 'admin_jurusan') {
    jsonResponse(false, 'Anda tidak memiliki akses untuk membuat data siswa', null, 403);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi input wajib
$requiredFields = ['nisn', 'nis', 'nama_lengkap', 'jenis_kelamin', 'jurusan_id', 'kelas', 'rombel'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

// Sanitasi input
$data = [
    'nisn' => sanitize($input['nisn']),
    'nis' => sanitize($input['nis']),
    'nama_lengkap' => sanitize($input['nama_lengkap']),
    'jenis_kelamin' => sanitize($input['jenis_kelamin']),
    'jurusan_id' => (int)$input['jurusan_id'],
    'kelas' => sanitize($input['kelas']),
    'rombel' => sanitize($input['rombel']),
    'tempat_lahir' => isset($input['tempat_lahir']) ? sanitize($input['tempat_lahir']) : null,
    'tanggal_lahir' => isset($input['tanggal_lahir']) ? sanitize($input['tanggal_lahir']) : null,
    'alamat' => isset($input['alamat']) ? sanitize($input['alamat']) : null,
    'no_telp' => isset($input['no_telp']) ? sanitize($input['no_telp']) : null,
    'email' => isset($input['email']) ? sanitize($input['email']) : null,
    'rfid_uid' => isset($input['rfid_uid']) ? sanitize($input['rfid_uid']) : null,
    'nama_ortu' => isset($input['nama_ortu']) ? sanitize($input['nama_ortu']) : null,
    'no_telp_ortu' => isset($input['no_telp_ortu']) ? sanitize($input['no_telp_ortu']) : null,
    'status' => isset($input['status']) ? sanitize($input['status']) : 'aktif'
];

// Cek akses admin_jurusan hanya bisa tambah siswa di jurusannya
if ($user['role'] === 'admin_jurusan' && $user['jurusan_id'] != $data['jurusan_id']) {
    jsonResponse(false, 'Anda hanya dapat menambahkan siswa di jurusan Anda', null, 403);
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Cek apakah NISN sudah ada
    $checkQuery = "SELECT id FROM siswa WHERE nisn = :nisn OR nis = :nis";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':nisn', $data['nisn']);
    $checkStmt->bindParam(':nis', $data['nis']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        jsonResponse(false, 'NISN atau NIS sudah terdaftar', null, 409);
    }
    
    // Cek apakah RFID sudah digunakan (jika diisi)
    if (!empty($data['rfid_uid'])) {
        $rfidQuery = "SELECT id FROM siswa WHERE rfid_uid = :rfid_uid";
        $rfidStmt = $conn->prepare($rfidQuery);
        $rfidStmt->bindParam(':rfid_uid', $data['rfid_uid']);
        $rfidStmt->execute();
        
        if ($rfidStmt->fetch()) {
            jsonResponse(false, 'RFID UID sudah digunakan oleh siswa lain', null, 409);
        }
    }
    
    // Query insert
    $query = "INSERT INTO siswa (nisn, nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, 
              alamat, no_telp, email, jurusan_id, kelas, rombel, rfid_uid, nama_ortu, no_telp_ortu, status)
              VALUES (:nisn, :nis, :nama_lengkap, :jenis_kelamin, :tempat_lahir, :tanggal_lahir, 
              :alamat, :no_telp, :email, :jurusan_id, :kelas, :rombel, :rfid_uid, :nama_ortu, :no_telp_ortu, :status)";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($data);
    
    $newId = $conn->lastInsertId();
    
    // Ambil data yang baru dibuat
    $getQuery = "SELECT s.*, j.nama_jurusan, j.kode_jurusan 
                 FROM siswa s 
                 LEFT JOIN jurusan j ON s.jurusan_id = j.id 
                 WHERE s.id = :id";
    $getStmt = $conn->prepare($getQuery);
    $getStmt->bindParam(':id', $newId);
    $getStmt->execute();
    $newSiswa = $getStmt->fetch();
    
    // Log aktivitas
    logActivity("User {$user['username']} menambahkan siswa: {$data['nama_lengkap']} ({$data['nisn']})", 'SUCCESS');
    
    // Kirim notifikasi
    sendNotification(
        null,
        'Siswa Baru Ditambahkan',
        "Siswa {$data['nama_lengkap']} telah ditambahkan ke sistem",
        'success'
    );
    
    jsonResponse(true, 'Siswa berhasil ditambahkan', $newSiswa, 201);
    
} catch(PDOException $e) {
    error_log("Create Siswa Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat menambahkan siswa', null, 500);
}
?>
