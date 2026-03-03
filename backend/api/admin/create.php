<?php
/**
 * =====================================================
 * API CREATE ADMIN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Headers: Authorization: Bearer {token}
 * Body: { username, password, nama_lengkap, email, role, jurusan_id }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

// Verifikasi token - hanya admin_operator
$user = Auth::middleware();

if ($user['role'] !== 'admin_operator') {
    jsonResponse(false, 'Anda tidak memiliki akses untuk membuat admin', null, 403);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi input wajib
$requiredFields = ['username', 'password', 'nama_lengkap', 'role'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

// Sanitasi input
$data = [
    'username' => sanitize($input['username']),
    'password' => password_hash($input['password'], PASSWORD_BCRYPT),
    'nama_lengkap' => sanitize($input['nama_lengkap']),
    'email' => isset($input['email']) ? sanitize($input['email']) : null,
    'no_telp' => isset($input['no_telp']) ? sanitize($input['no_telp']) : null,
    'role' => sanitize($input['role']),
    'jurusan_id' => isset($input['jurusan_id']) ? (int)$input['jurusan_id'] : null,
    'ruangan_id' => isset($input['ruangan_id']) ? (int)$input['ruangan_id'] : null,
    'status' => 'aktif'
];

// Validasi role
if (!in_array($data['role'], ['admin_operator', 'admin_jurusan'])) {
    jsonResponse(false, 'Role tidak valid', null, 400);
}

// Admin jurusan wajib punya jurusan_id
if ($data['role'] === 'admin_jurusan' && !$data['jurusan_id']) {
    jsonResponse(false, 'Admin jurusan harus memiliki jurusan_id', null, 400);
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Cek apakah username sudah ada
    $checkQuery = "SELECT id FROM users WHERE username = :username";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':username', $data['username']);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        jsonResponse(false, 'Username sudah digunakan', null, 409);
    }
    
    // Query insert
    $query = "INSERT INTO users (username, password, nama_lengkap, email, no_telp, role, jurusan_id, ruangan_id, status)
              VALUES (:username, :password, :nama_lengkap, :email, :no_telp, :role, :jurusan_id, :ruangan_id, :status)";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($data);
    
    $newId = $conn->lastInsertId();
    
    // Ambil data yang baru dibuat
    $getQuery = "SELECT u.*, j.nama_jurusan, r.nama_ruangan 
                 FROM users u 
                 LEFT JOIN jurusan j ON u.jurusan_id = j.id 
                 LEFT JOIN ruangan r ON u.ruangan_id = r.id 
                 WHERE u.id = :id";
    $getStmt = $conn->prepare($getQuery);
    $getStmt->bindParam(':id', $newId);
    $getStmt->execute();
    $newAdmin = $getStmt->fetch();
    
    unset($newAdmin['password']);
    
    // Log aktivitas
    logActivity("User {$user['username']} membuat admin baru: {$data['username']}", 'SUCCESS');
    
    jsonResponse(true, 'Admin berhasil ditambahkan', $newAdmin, 201);
    
} catch(PDOException $e) {
    error_log("Create Admin Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat menambahkan admin', null, 500);
}
?>
