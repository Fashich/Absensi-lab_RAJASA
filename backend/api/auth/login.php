<?php
/**
 * =====================================================
 * API LOGIN
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Body: { username, password }
 * Response: { success, message, data: { user, token } }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

// Ambil data dari request body
$input = getJsonInput();

// Validasi input
$requiredFields = ['username', 'password'];
$missing = validateRequired($input, $requiredFields);

if (!empty($missing)) {
    jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
}

// Sanitasi input
$username = sanitize($input['username']);
$password = $input['password']; // Password tidak perlu di-sanitize

// Proses login
$auth = new Auth();
$result = $auth->login($username, $password);

if ($result) {
    // Log aktivitas
    logActivity("User {$username} berhasil login", 'SUCCESS');

    jsonResponse(true, 'Login berhasil', $result);
} else {
    // Log aktivitas
    logActivity("Percobaan login gagal untuk username: {$username}", 'WARNING');

    jsonResponse(false, 'Username atau password salah', null, 401);
}
?>