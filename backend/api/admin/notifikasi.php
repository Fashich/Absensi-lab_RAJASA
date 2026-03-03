<?php
/**
 * =====================================================
 * API NOTIFIKASI
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET, PUT
 * Headers: Authorization: Bearer {token}
 * GET: Ambil notifikasi user
 * PUT: Tandai notifikasi sudah dibaca
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Verifikasi token
$user = Auth::middleware();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($method === 'GET') {
        // Ambil notifikasi untuk user (termasuk broadcast)
        $query = "SELECT * FROM notifikasi 
                  WHERE user_id = :user_id OR user_id IS NULL
                  ORDER BY created_at DESC
                  LIMIT 20";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        
        $notifikasi = $stmt->fetchAll();
        
        // Hitung notifikasi belum dibaca
        $unreadQuery = "SELECT COUNT(*) as total FROM notifikasi 
                        WHERE (user_id = :user_id OR user_id IS NULL) AND is_read = 0";
        $unreadStmt = $conn->prepare($unreadQuery);
        $unreadStmt->bindParam(':user_id', $user['id']);
        $unreadStmt->execute();
        $unreadCount = $unreadStmt->fetch()['total'];
        
        jsonResponse(true, 'Notifikasi berhasil diambil', [
            'notifikasi' => $notifikasi,
            'unread_count' => (int)$unreadCount
        ]);
        
    } elseif ($method === 'PUT') {
        $input = getJsonInput();
        $notifId = isset($input['id']) ? (int)$input['id'] : null;
        $markAll = isset($input['mark_all']) ? (bool)$input['mark_all'] : false;
        
        if ($markAll) {
            // Tandai semua notifikasi sudah dibaca
            $query = "UPDATE notifikasi SET is_read = 1 
                      WHERE (user_id = :user_id OR user_id IS NULL) AND is_read = 0";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':user_id', $user['id']);
            $stmt->execute();
            
            jsonResponse(true, 'Semua notifikasi ditandai sudah dibaca');
        } elseif ($notifId) {
            // Tandai satu notifikasi sudah dibaca
            $query = "UPDATE notifikasi SET is_read = 1 WHERE id = :id AND (user_id = :user_id OR user_id IS NULL)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $notifId);
            $stmt->bindParam(':user_id', $user['id']);
            $stmt->execute();
            
            jsonResponse(true, 'Notifikasi ditandai sudah dibaca');
        } else {
            jsonResponse(false, 'ID notifikasi tidak valid', null, 400);
        }
        
    } else {
        jsonResponse(false, 'Method tidak diizinkan', null, 405);
    }
    
} catch(PDOException $e) {
    error_log("Notifikasi Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan', null, 500);
}
?>
