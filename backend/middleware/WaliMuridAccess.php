<?php
/**
 * WaliMuridAccess.php
 * Middleware untuk validasi akses portal wali murid
 * Sistem Informasi Sekolah SMK Rajasa Surabaya
 */

require_once __DIR__ . '/../config/database.php';

class WaliMuridAccess {
    private $db;

    public function __construct() {
        $this->db = getDBConnection();
    }

    /**
     * Log akses wali murid untuk audit trail
     */
    public function logAccess($action, $table_accessed = null, $record_id = null) {
        try {
            // Dapatkan informasi dari request
            $ip_address = $this->getClientIP();
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $user_identifier = $ip_address; // Karena tidak ada login, gunakan IP sebagai identifier

            $query = "INSERT INTO wali_murid_logs
                     (user_type, user_identifier, action, table_accessed, record_id, ip_address, user_agent)
                     VALUES (?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->db->prepare($query);
            $stmt->bind_param("ssssiss",
                $user_type = 'wali_murid',
                $user_identifier,
                $action,
                $table_accessed,
                $record_id,
                $ip_address,
                $user_agent
            );

            $stmt->execute();
            $stmt->close();

        } catch (Exception $e) {
            // Log error tapi jangan hentikan eksekusi
            error_log('Error logging wali murid access: ' . $e->getMessage());
        }
    }

    /**
     * Validasi rate limiting untuk mencegah abuse
     */
    public function checkRateLimit() {
        try {
            $ip_address = $this->getClientIP();
            $time_window = 60; // 1 menit
            $max_requests = 100; // maksimal 100 request per menit

            // Hitung jumlah request dalam time window
            $query = "SELECT COUNT(*) as request_count
                     FROM wali_murid_logs
                     WHERE ip_address = ?
                     AND timestamp >= DATE_SUB(NOW(), INTERVAL ? MINUTE)";

            $stmt = $this->db->prepare($query);
            $stmt->bind_param("si", $ip_address, $time_window);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();

            if ($row['request_count'] >= $max_requests) {
                // Rate limit exceeded
                http_response_code(429);
                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Terlalu banyak request. Silakan coba lagi nanti.',
                    'data' => null
                ]);
                exit;
            }

        } catch (Exception $e) {
            // Jika ada error, lanjutkan saja (fail-safe)
            error_log('Error checking rate limit: ' . $e->getMessage());
        }
    }

    /**
     * Validasi input untuk mencegah SQL injection dan XSS
     */
    public function validateInput($input) {
        if (is_array($input)) {
            return array_map([$this, 'validateInput'], $input);
        }

        if (is_string($input)) {
            // Sanitize input
            $input = trim($input);
            $input = stripslashes($input);
            $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        }

        return $input;
    }

    /**
     * Validasi file upload untuk mencegah upload file berbahaya
     */
    public function validateFileUpload($file) {
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
        $allowed_mime_types = ['image/jpeg', 'image/png', 'application/pdf'];
        $max_file_size = 5 * 1024 * 1024; // 5MB

        // Cek apakah file ada
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'message' => 'File upload error'];
        }

        // Cek ukuran file
        if ($file['size'] > $max_file_size) {
            return ['valid' => false, 'message' => 'File terlalu besar (maksimal 5MB)'];
        }

        // Cek ekstensi file
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($file_extension, $allowed_extensions)) {
            return ['valid' => false, 'message' => 'Tipe file tidak diizinkan'];
        }

        // Cek MIME type
        $file_mime = mime_content_type($file['tmp_name']);
        if (!in_array($file_mime, $allowed_mime_types)) {
            return ['valid' => false, 'message' => 'Tipe file tidak valid'];
        }

        return ['valid' => true, 'message' => 'File valid'];
    }

    /**
     * Mendapatkan IP address client
     */
    private function getClientIP() {
        $ip_headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($ip_headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // Handle multiple IPs (take first one)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    /**
     * Sanitize output untuk mencegah XSS
     */
    public function sanitizeOutput($output) {
        if (is_array($output)) {
            return array_map([$this, 'sanitizeOutput'], $output);
        }

        if (is_string($output)) {
            return htmlspecialchars($output, ENT_QUOTES, 'UTF-8');
        }

        return $output;
    }
}
?>