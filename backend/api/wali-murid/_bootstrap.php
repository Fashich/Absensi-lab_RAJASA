<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (!defined('DB_HOST')) {
    $envPath = __DIR__ . '/../../../../.env';
    if (file_exists($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                [$k, $v] = explode('=', $line, 2);
                if (!isset($_ENV[trim($k)])) $_ENV[trim($k)] = trim($v);
            }
        }
    }
    define('DB_HOST',     $_ENV['DB_HOST']     ?? 'localhost');
    define('DB_PORT',     $_ENV['DB_PORT']     ?? '3306');
    define('DB_NAME',     $_ENV['DB_NAME']     ?? 'sistem_absensi_lab');
    define('DB_USER',     $_ENV['DB_USER']     ?? 'root');
    define('DB_PASSWORD', $_ENV['DB_PASSWORD'] ?? '');
}

if (!class_exists('Database')) {
    class Database {
        private \PDO $conn;
        public function __construct() {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT
                 . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $this->conn = new \PDO($dsn, DB_USER, DB_PASSWORD, [
                \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }
        public function getConnection(): \PDO { return $this->conn; }
    }
}

require_once __DIR__ . '/WaliMuridModel.php';
require_once __DIR__ . '/WaliMuridController.php';
