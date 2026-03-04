<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = getJsonInput();

// Validate required fields
if (!isset($input['username']) || !isset($input['password']) || !isset($input['nama_lengkap'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username, password, dan nama lengkap wajib diisi']);
    exit();
}

$username = trim($input['username']);
$password = trim($input['password']);
$nama_lengkap = trim($input['nama_lengkap']);
$email = isset($input['email']) ? trim($input['email']) : null;
$no_telp = isset($input['no_telp']) ? trim($input['no_telp']) : null;
$role = isset($input['role']) ? trim($input['role']) : 'admin_jurusan'; // Default role
$jurusan_id = isset($input['jurusan_id']) ? (int)$input['jurusan_id'] : null;

// Validasi role
if (!in_array($role, ['admin_jurusan', 'admin_operator'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Role tidak valid']);
    exit();
}

// Jika role adalah admin_operator, tidak boleh memiliki jurusan_id
if ($role === 'admin_operator' && $jurusan_id !== null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Admin operator tidak boleh memiliki jurusan']);
    exit();
}

// Validasi password
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password minimal 6 karakter']);
    exit();
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Check if username already exists
    $checkUser = $conn->prepare("SELECT id FROM users WHERE username = :username");
    $checkUser->bindParam(':username', $username);
    $checkUser->execute();
    
    if ($checkUser->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username sudah digunakan']);
        exit();
    }

    // Encrypt password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Mulai transaksi
    $conn->beginTransaction();

    // Insert user
    $sql = "INSERT INTO users (username, password, nama_lengkap, email, no_telp, role, jurusan_id, status) 
            VALUES (:username, :password, :nama_lengkap, :email, :no_telp, :role, :jurusan_id, 'aktif')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':nama_lengkap', $nama_lengkap);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':no_telp', $no_telp);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':jurusan_id', $jurusan_id, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception("Gagal menyimpan data pengguna");
    }

    $userId = $conn->lastInsertId();

    // Buat token JWT
    $token_payload = [
        'user_id' => $userId,
        'username' => $username,
        'role' => $role,
        'jurusan_id' => $jurusan_id,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = JWTHandler::generate($token_payload);

    // Simpan aktivitas registrasi
    logAdminActivity($userId, 'signup', "Akun baru dibuat: {$username}", $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null);

    // Commit transaksi
    $conn->commit();

    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Registrasi berhasil', 
        'data' => [
            'user' => [
                'id' => $userId,
                'username' => $username,
                'nama_lengkap' => $nama_lengkap,
                'email' => $email,
                'role' => $role,
                'jurusan_id' => $jurusan_id
            ],
            'token' => $token
        ]
    ]);

} catch (Exception $e) {
    // Rollback jika terjadi kesalahan
    if ($conn->inTransaction()) {
        $conn->rollback();
    }
    
    error_log("Signup Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat registrasi']);
}
?>