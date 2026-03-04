<?php
/**
 * =====================================================
 * API UPDATE PROFILE
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: PUT
 * Headers: Authorization: Bearer {token}
 * Response: { success, message, user, token }
 * =====================================================
 */

// Set content type to JSON
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Verifikasi token menggunakan Auth::middleware()
$user = Auth::middleware();
// Log untuk debugging
error_log("Update Profile: User authenticated - " . json_encode($user));

// Ambil user_id dengan fallback key
$user_id = $user['user_id'] ?? $user['id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User ID tidak ditemukan dari token']);
    exit();
}

// Get the request body
$input = json_decode(file_get_contents('php://input'), true);

// Log untuk debugging
error_log("Update Profile: Input data - " . json_encode($input));

// Ambil field yang akan diupdate
$foto_profile = isset($input['foto_profile']) ? $input['foto_profile'] : null;
$nama_lengkap = isset($input['nama_lengkap']) ? $input['nama_lengkap'] : null;
$username = isset($input['username']) ? $input['username'] : null;

// Minimal satu field harus diisi
if ($nama_lengkap === null && $username === null && $foto_profile === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'At least one field (nama_lengkap, username, or foto_profile) is required']);
    exit();
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        jsonResponse(false, 'Koneksi database gagal', null, 500);
    }

    $updates = [];
    $params = [];

    if ($nama_lengkap !== null) {
        $updates[] = "nama_lengkap = ?";
        $params[] = $nama_lengkap;
    }

    if ($username !== null) {
        // Cek apakah username sudah dipakai user lain
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $checkStmt->execute([$username, $user_id]);
        if ($checkStmt->fetch()) {
            jsonResponse(false, 'Username sudah digunakan oleh pengguna lain', null, 409);
        }
        $updates[] = "username = ?";
        $params[] = $username;
    }

    if ($foto_profile !== null) {
        $updates[] = "foto_profile = ?";
        $params[] = $foto_profile;
    }

    $params[] = $user_id;

    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute($params);

    if ($result) {
        // Ambil data user yang sudah diupdate
        $selectStmt = $conn->prepare("SELECT id, username, nama_lengkap, role, jurusan_id, foto_profile FROM users WHERE id = ?");
        $selectStmt->execute([$user_id]);
        $updatedUser = $selectStmt->fetch(PDO::FETCH_ASSOC);

        if ($updatedUser) {
            // Generate token baru dengan info terbaru, termasuk foto_profile
            $newToken = JWTHandler::generate([
                'user_id'      => $updatedUser['id'],
                'username'     => $updatedUser['username'],
                'role'         => $updatedUser['role'],
                'jurusan_id'   => $updatedUser['jurusan_id'],
                'foto_profile' => $updatedUser['foto_profile'] // Menambahkan foto_profile ke token
            ]);

            jsonResponse(true, 'Profil berhasil diperbarui', [
                'user'  => $updatedUser,
                'token' => $newToken
            ]);
        } else {
            jsonResponse(false, 'Gagal mengambil data user setelah update', null, 500);
        }
    } else {
        jsonResponse(false, 'Gagal memperbarui profil', null, 500);
    }
} catch(PDOException $e) {
    error_log("Update Profile Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan saat memperbarui profil', null, 500);
}
?>