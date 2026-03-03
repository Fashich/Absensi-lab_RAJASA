<?php
/**
 * =====================================================
 * API UPDATE SISWA
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: PUT
 * Headers: Authorization: Bearer {token}
 * Body: { id, nisn, nis, nama_lengkap, ... }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan PUT.', null, 405);
}

// Verifikasi token dan cek akses
$user = Auth::middleware();

if (!$user['role'] === 'admin_operator' && !$user['role'] === 'admin_jurusan') {
    jsonResponse(false, 'Anda tidak memiliki akses untuk mengubah data siswa', null, 403);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi ID
if (!isset($input['id']) || empty($input['id'])) {
    jsonResponse(false, 'ID siswa tidak valid', null, 400);
}

$id = (int)$input['id'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Cek apakah siswa ada
    $checkQuery = "SELECT * FROM siswa WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    $existingSiswa = $checkStmt->fetch();
    
    if (!$existingSiswa) {
        jsonResponse(false, 'Siswa tidak ditemukan', null, 404);
    }
    
    // Cek akses admin_jurusan
    if ($user['role'] === 'admin_jurusan' && $user['jurusan_id'] != $existingSiswa['jurusan_id']) {
        jsonResponse(false, 'Anda tidak memiliki akses untuk mengubah siswa ini', null, 403);
    }
    
    // Siapkan data update
    $updateData = [];
    $params = [':id' => $id];
    
    $fields = [
        'nisn', 'nis', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
        'alamat', 'no_telp', 'email', 'jurusan_id', 'kelas', 'rombel', 'rfid_uid',
        'nama_ortu', 'no_telp_ortu', 'status'
    ];
    
    foreach ($fields as $field) {
        if (isset($input[$field])) {
            $updateData[] = "{$field} = :{$field}";
            $params[":{$field}"] = $field === 'jurusan_id' ? (int)$input[$field] : sanitize($input[$field]);
        }
    }
    
    if (empty($updateData)) {
        jsonResponse(false, 'Tidak ada data yang diupdate', null, 400);
    }
    
    // Cek duplikat NISN/NIS jika diupdate
    if (isset($input['nisn']) && $input['nisn'] !== $existingSiswa['nisn']) {
        $dupQuery = "SELECT id FROM siswa WHERE nisn = :nisn AND id != :id";
        $dupStmt = $conn->prepare($dupQuery);
        $dupStmt->bindParam(':nisn', $input['nisn']);
        $dupStmt->bindParam(':id', $id);
        $dupStmt->execute();
        
        if ($dupStmt->fetch()) {
            jsonResponse(false, 'NISN sudah digunakan oleh siswa lain', null, 409);
        }
    }
    
    if (isset($input['nis']) && $input['nis'] !== $existingSiswa['nis']) {
        $dupQuery = "SELECT id FROM siswa WHERE nis = :nis AND id != :id";
        $dupStmt = $conn->prepare($dupQuery);
        $dupStmt->bindParam(':nis', $input['nis']);
        $dupStmt->bindParam(':id', $id);
        $dupStmt->execute();
        
        if ($dupStmt->fetch()) {
            jsonResponse(false, 'NIS sudah digunakan oleh siswa lain', null, 409);
        }
    }
    
    // Cek duplikat RFID jika diupdate
    if (isset($input['rfid_uid']) && !empty($input['rfid_uid']) && $input['rfid_uid'] !== $existingSiswa['rfid_uid']) {
        $rfidQuery = "SELECT id FROM siswa WHERE rfid_uid = :rfid_uid AND id != :id";
        $rfidStmt = $conn->prepare($rfidQuery);
        $rfidStmt->bindParam(':rfid_uid', $input['rfid_uid']);
        $rfidStmt->bindParam(':id', $id);
        $rfidStmt->execute();
        
        if ($rfidStmt->fetch()) {
            jsonResponse(false, 'RFID UID sudah digunakan oleh siswa lain', null, 409);
        }
    }
    
    // Query update
    $query = "UPDATE siswa SET " . implode(', ', $updateData) . ", updated_at = NOW() WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    
    // Ambil data yang sudah diupdate
    $getQuery = "SELECT s.*, j.nama_jurusan, j.kode_jurusan 
                 FROM siswa s 
                 LEFT JOIN jurusan j ON s.jurusan_id = j.id 
                 WHERE s.id = :id";
    $getStmt = $conn->prepare($getQuery);
    $getStmt->bindParam(':id', $id);
    $getStmt->execute();
    $updatedSiswa = $getStmt->fetch();
    
    // Log aktivitas
    logActivity("User {$user['username']} mengupdate siswa: {$existingSiswa['nama_lengkap']}", 'SUCCESS');
    
    jsonResponse(true, 'Siswa berhasil diupdate', $updatedSiswa);
    
} catch(PDOException $e) {
    error_log("Update Siswa Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat mengupdate siswa', null, 500);
}
?>
