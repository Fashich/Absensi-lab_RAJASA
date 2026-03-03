<?php
/**
 * =====================================================
 * API LOGOUT
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: POST
 * Headers: Authorization: Bearer {token}
 * Response: { success, message }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method tidak diizinkan. Gunakan POST.', null, 405);
}

// Verifikasi token
$user = Auth::middleware();

// Log aktivitas
logActivity("User {$user['username']} berhasil logout", 'SUCCESS');

jsonResponse(true, 'Logout berhasil');
?>
