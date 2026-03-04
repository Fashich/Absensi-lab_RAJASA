<?php
/**
 * =====================================================
 * API NOTIFIKASI
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Method: GET, PUT, DELETE
 * Headers: Authorization: Bearer {token}
 * GET: Ambil notifikasi user
 * PUT: Tandai notifikasi sudah dibaca
 * DELETE: Hapus notifikasi
 * =====================================================
 */

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Verifikasi token
$user = Auth::middleware();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($method === 'GET') {
        // Parse query parameters
        $parsedUrl = parse_url($_SERVER['REQUEST_URI']);
        $queryParams = [];
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
        }
        
        $getAll = isset($queryParams['history']) && $queryParams['history'] === 'true';
        $limit = isset($queryParams['limit']) ? (int)$queryParams['limit'] : 20;
        
        if ($getAll) {
            // Ambil semua notifikasi (history)
            $notifications = getUserNotifications($user['id'], $limit);
            
            // Hitung notifikasi belum dibaca
            $unreadQuery = "SELECT COUNT(*) as total FROM notifikasi 
                            WHERE (user_id = :user_id OR user_id IS NULL) AND is_read = 0";
            $unreadStmt = $conn->prepare($unreadQuery);
            $unreadStmt->bindParam(':user_id', $user['id']);
            $unreadStmt->execute();
            $unreadCount = $unreadStmt->fetch()['total'];
            
            jsonResponse(true, 'Histori notifikasi berhasil diambil', [
                'notifikasi' => $notifications,
                'unread_count' => (int)$unreadCount
            ]);
        } else {
            // Ambil notifikasi untuk user (termasuk broadcast) - hanya beberapa terbaru
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
        }
        
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
        
    } elseif ($method === 'DELETE') {
        $parsedUrl = parse_url($_SERVER['REQUEST_URI']);
        $queryParams = [];
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
        }
        
        $notifId = isset($queryParams['id']) ? (int)$queryParams['id'] : null;
        $clearAll = isset($queryParams['clear']) && $queryParams['clear'] === 'all';
        
        if ($clearAll) {
            // Hapus semua notifikasi milik user ini yang sudah dibaca
            $query = "DELETE FROM notifikasi 
                      WHERE (user_id = :user_id OR user_id IS NULL) AND is_read = 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':user_id', $user['id']);
            $stmt->execute();
            
            jsonResponse(true, 'Semua notifikasi yang sudah dibaca telah dihapus');
        } elseif ($notifId) {
            // Hapus satu notifikasi
            $query = "DELETE FROM notifikasi WHERE id = :id AND (user_id = :user_id OR user_id IS NULL)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $notifId);
            $stmt->bindParam(':user_id', $user['id']);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                jsonResponse(true, 'Notifikasi berhasil dihapus');
            } else {
                jsonResponse(false, 'Notifikasi tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya', null, 404);
            }
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