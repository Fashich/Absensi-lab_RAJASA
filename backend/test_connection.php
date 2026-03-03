<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($conn) {
        echo "✅ Koneksi database berhasil!\n";
        echo "Database: " . DB_NAME . "\n";
        echo "Host: " . DB_HOST . "\n";
        
        // Cek apakah tabel users ada
        $stmt = $conn->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Tabel 'users' ditemukan\n";
            
            // Cek jumlah user
            $userCount = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
            echo "Jumlah user dalam database: $userCount\n";
            
            // Ambil beberapa user untuk dicek
            $users = $conn->query("SELECT id, username, role FROM users LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
            echo "Daftar user (maksimal 5):\n";
            foreach ($users as $user) {
                echo "- ID: {$user['id']}, Username: {$user['username']}, Role: {$user['role']}\n";
            }
        } else {
            echo "❌ Tabel 'users' tidak ditemukan. Database mungkin belum diimpor.\n";
        }
    } else {
        echo "❌ Gagal membuat koneksi database\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>