<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Verify JWT token
$headers = apache_request_headers();
if (!isset($headers['Authorization']) || !preg_match('/^Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$jwt = $matches[1];
$decoded = verify_jwt_token($jwt);

if (!$decoded) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit();
}

// Check if file was uploaded without errors
if (!isset($_FILES['foto_profil']) || $_FILES['foto_profil']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Error uploading file']);
    exit();
}

$file = $_FILES['foto_profil'];

// Validate file type
$allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File type not allowed. Only JPG, PNG, and GIF are allowed.']);
    exit();
}

// Validate file size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit.']);
    exit();
}

// Create uploads directory if it doesn't exist
$upload_dir = __DIR__ . '/../../uploads/foto_profil/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generate unique filename
$file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$new_filename = 'foto_profil_' . $decoded['user_id'] . '_' . time() . '.' . $file_extension;
$target_path = $upload_dir . $new_filename;

// Move uploaded file to destination
if (move_uploaded_file($file['tmp_name'], $target_path)) {
    // Optionally, resize the image to standard dimensions
    // This is optional and can be added later if needed

    // Update the user's profile picture in the database
    try {
        $db = new Database();
        $conn = $db->getConnection();

        if (!$conn) {
            throw new Exception('Koneksi database gagal');
        }

        $stmt = $conn->prepare("UPDATE users SET foto_profile = ? WHERE id = ?");
        $result = $stmt->execute([$new_filename, $decoded['user_id']]);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Foto profil berhasil diunggah',
                'filename' => $new_filename
            ]);
        } else {
            // Delete the uploaded file if DB update fails
            unlink($target_path);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui data pengguna']);
        }
    } catch (Exception $e) {
        // Delete the uploaded file if DB update fails
        if (file_exists($target_path)) {
            unlink($target_path);
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal mengunggah file']);
}
?>