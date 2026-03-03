<?php
require_once __DIR__ . '/config/database.php';

$db = new Database();
$conn = $db->getConnection();

// Test dulu apakah hash lama cocok
$stmt = $conn->query("SELECT username, password FROM users LIMIT 3");
$users = $stmt->fetchAll();

echo "=== CEK HASH LAMA ===\n";
foreach ($users as $u) {
    $match = password_verify('admin123', $u['password']);
    echo $u['username'] . ": " . ($match ? "✅ COCOK" : "❌ TIDAK COCOK") . "\n";
    echo "Hash: " . $u['password'] . "\n\n";
}

// Reset semua password ke admin123
$newHash = password_hash('admin123', PASSWORD_BCRYPT);
$conn->exec("UPDATE users SET password = '$newHash'");

echo "\n=== PASSWORD DIRESET ===\n";
echo "Semua user sekarang pakai password: admin123\n";
echo "Hash baru: $newHash\n";
?>