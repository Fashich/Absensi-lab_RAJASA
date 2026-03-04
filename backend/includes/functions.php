<?php
/**
 * =====================================================
 * FUNCTIONS HELPER
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Class JWTHandler
 * Untuk handling JSON Web Token
 */
class JWTHandler {

    /**
     * Generate JWT Token
     * @param array $payload Data yang akan di-encode
     * @return string JWT Token
     */
    public static function generate($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $time = time();

        $payload['iat'] = $time;
        $payload['exp'] = $time + JWT_EXPIRED;

        $payloadEncoded = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadEncoded));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Verify dan decode JWT Token
     * @param string $token JWT Token
     * @return array|false Data payload atau false jika invalid
     */
    public static function verify($token) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
        $signatureProvided = $parts[2];

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($base64Signature, $signatureProvided)) {
            return false;
        }

        $payloadData = json_decode($payload, true);

        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Get token dari header Authorization
     * @return string|null
     */
    public static function getBearerToken() {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers)) {
            if (preg_match('/Bearer\s+(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}

/**
 * Class Auth
 * Untuk autentikasi dan otorisasi
 */
class Auth {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Login user
     * @param string $username
     * @param string $password
     * @return array|false
     */
    public function login($username, $password) {
        try {
            $query = "SELECT u.*, j.nama_jurusan, j.kode_jurusan, r.nama_ruangan, r.kode_ruangan as kode_ruang
                      FROM users u
                      LEFT JOIN jurusan j ON u.jurusan_id = j.id
                      LEFT JOIN ruangan r ON u.ruangan_id = r.id
                      WHERE u.username = :username AND u.status = 'aktif'";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                // Update last login
                $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = :id";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(':id', $user['id']);
                $updateStmt->execute();

                // Generate token
                $tokenPayload = [
                    'user_id'      => $user['id'],
                    'username'     => $user['username'],
                    'role'         => $user['role'],
                    'jurusan_id'   => $user['jurusan_id'],
                    'ruangan_id'   => $user['ruangan_id'],
                    'foto_profile' => $user['foto_profile'] // Adding foto_profile to token
                ];

                $token = JWTHandler::generate($tokenPayload);

                // Hapus password dari response
                unset($user['password']);

                return [
                    'user' => $user,
                    'token' => $token
                ];
            }

            return false;
        } catch(PDOException $e) {
            error_log("Login Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Log admin activity to database
     * @param int $userId User ID
     * @param string $activityType Type of activity
     * @param string $description Description of the activity
     * @param string $ipAddress IP address of the user
     * @param string $userAgent User agent string
     * @return bool Success status
     */
    private function logAdminActivity($userId, $activityType, $description, $ipAddress, $userAgent) {
        try {
            $insertQuery = "INSERT INTO admin_activities (user_id, activity_type, activity_description, ip_address, user_agent)
                            VALUES (:user_id, :activity_type, :activity_description, :ip_address, :user_agent)";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':activity_type', $activityType);
            $stmt->bindParam(':activity_description', $description);
            $stmt->bindParam(':ip_address', $ipAddress);
            $stmt->bindParam(':user_agent', $userAgent);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Log Admin Activity Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifikasi token dan dapatkan user
     * @param string $token
     * @return array|false
     */
    public function verifyToken($token) {
        $payload = JWTHandler::verify($token);

        if (!$payload) {
            return false;
        }

        try {
            $query = "SELECT u.*, j.nama_jurusan, j.kode_jurusan, r.nama_ruangan, r.kode_ruangan as kode_ruang
                      FROM users u
                      LEFT JOIN jurusan j ON u.jurusan_id = j.id
                      LEFT JOIN ruangan r ON u.ruangan_id = r.id
                      WHERE u.id = :id AND u.status = 'aktif'";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $payload['user_id']);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                unset($user['password']);
                return $user;
            }

            return false;
        } catch(PDOException $e) {
            error_log("Verify Token Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check apakah user memiliki akses
     * @param array $user Data user
     * @param string|array $allowedRoles Role yang diizinkan
     * @return bool
     */
    public function hasAccess($user, $allowedRoles) {
        if (!is_array($allowedRoles)) {
            $allowedRoles = [$allowedRoles];
        }

        return in_array($user['role'], $allowedRoles);
    }

    /**
     * Middleware untuk autentikasi
     * @return array|false
     */
    public static function middleware() {
        $token = JWTHandler::getBearerToken();

        if (!$token) {
            jsonResponse(false, 'Token tidak ditemukan', null, 401);
        }

        $auth = new Auth();
        $user = $auth->verifyToken($token);

        if (!$user) {
            jsonResponse(false, 'Token tidak valid atau sudah expired', null, 401);
        }

        return $user;
    }
}

/**
 * Class Pagination
 * Untuk pagination data
 */
class Pagination {

    /**
     * Format data dengan pagination
     * @param array $data Array data
     * @param int $page Halaman saat ini
     * @param int $limit Jumlah data per halaman
     * @param int $total Total seluruh data
     * @return array
     */
    public static function format($data, $page, $limit, $total) {
        $totalPages = ceil($total / $limit);
        $from = ($page - 1) * $limit + 1;
        $to = min($page * $limit, $total);

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'total_pages' => (int)$totalPages,
                'from' => (int)$from,
                'to' => (int)$to,
                'has_next_page' => $page < $totalPages,
                'has_prev_page' => $page > 1
            ]
        ];
    }
}

/**
 * Class Upload
 * Untuk handling file upload
 */
class Upload {

    /**
     * Upload file
     * @param array $file $_FILES['field_name']
     * @param string $directory Direktori tujuan
     * @param array $allowedTypes Tipe file yang diizinkan
     * @param int $maxSize Ukuran maksimum dalam bytes
     * @return array [success, message, filename]
     */
    public static function file($file, $directory, $allowedTypes = [], $maxSize = 5242880) {
        // Validasi error upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'success' => false,
                'message' => 'Upload gagal: ' . self::getUploadError($file['error']),
                'filename' => null
            ];
        }

        // Validasi ukuran
        if ($file['size'] > $maxSize) {
            return [
                'success' => false,
                'message' => 'Ukuran file terlalu besar (maks ' . ($maxSize / 1024 / 1024) . ' MB)',
                'filename' => null
            ];
        }

        // Validasi tipe file
        if (!empty($allowedTypes)) {
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                return [
                    'success' => false,
                    'message' => 'Tipe file tidak diizinkan',
                    'filename' => null
                ];
            }
        }

        // Generate nama file unik
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $directory . $filename;

        // Buat direktori jika belum ada
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        // Pindahkan file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return [
                'success' => true,
                'message' => 'Upload berhasil',
                'filename' => $filename,
                'path' => $filepath
            ];
        }

        return [
            'success' => false,
            'message' => 'Gagal memindahkan file',
            'filename' => null
        ];
    }

    /**
     * Upload foto
     * @param array $file $_FILES['foto']
     * @param string $subDirectory Sub direktori (siswa/admin)
     * @return array
     */
    public static function foto($file, $subDirectory = '') {
        $directory = UPLOAD_PATH . 'foto/' . $subDirectory;
        if (!empty($subDirectory)) {
            $directory .= '/';
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        $maxSize = 2097152; // 2MB

        return self::file($file, $directory, $allowedTypes, $maxSize);
    }

    /**
     * Hapus file
     * @param string $filepath Path file
     * @return bool
     */
    public static function delete($filepath) {
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }

    /**
     * Get upload error message
     * @param int $errorCode
     * @return string
     */
    private static function getUploadError($errorCode) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'Ukuran file melebihi batas upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'Ukuran file melebihi batas MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File hanya terupload sebagian',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file yang diupload',
            UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
            UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk',
            UPLOAD_ERR_EXTENSION => 'Upload dihentikan oleh ekstensi PHP'
        ];

        return isset($errors[$errorCode]) ? $errors[$errorCode] : 'Error tidak diketahui';
    }
}

/**
 * Fungsi untuk export data ke CSV
 * @param array $data Array data
 * @param array $headers Header kolom
 * @param string $filename Nama file
 */
function exportCSV($data, $headers, $filename) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'w');

    // Add BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Tulis header
    fputcsv($output, $headers);

    // Tulis data
    foreach ($data as $row) {
        fputcsv($output, $row);
    }

    fclose($output);
    exit;
}

/**
 * Fungsi untuk kirim notifikasi (placeholder untuk integrasi real)
 * @param int $userId ID user (NULL untuk broadcast)
 * @param string $judul Judul notifikasi
 * @param string $pesan Isi notifikasi
 * @param string $tipe Tipe notifikasi
 * @param string $link Link terkait (opsional)
 * @return bool
 */
function sendNotification($userId, $judul, $pesan, $tipe = 'info', $link = null) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "INSERT INTO notifikasi (user_id, judul, pesan, tipe, link)
                  VALUES (:user_id, :judul, :pesan, :tipe, :link)";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':judul', $judul);
        $stmt->bindParam(':pesan', $pesan);
        $stmt->bindParam(':tipe', $tipe);
        $stmt->bindParam(':link', $link);

        return $stmt->execute();
    } catch(PDOException $e) {
        error_log("Send Notification Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Fungsi untuk mencatat aktivitas admin
 * @param int $userId ID pengguna admin
 * @param string $activityType Jenis aktivitas (create, update, delete, login, etc.)
 * @param string $description Deskripsi lengkap aktivitas
 * @param string $ipAddress IP address pengguna (opsional)
 * @param string $userAgent User agent pengguna (opsional)
 * @return bool
 */
function logAdminActivity($userId, $activityType, $description = '', $ipAddress = null, $userAgent = null) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Jika IP address atau user agent tidak disediakan, ambil dari server
        if ($ipAddress === null) {
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }

        if ($userAgent === null) {
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        }

        $stmt = $conn->prepare("
            INSERT INTO admin_activities (user_id, activity_type, activity_description, ip_address, user_agent)
            VALUES (:user_id, :activity_type, :activity_description, :ip_address, :user_agent)
        ");

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':activity_type', $activityType);
        $stmt->bindParam(':activity_description', $description);
        $stmt->bindParam(':ip_address', $ipAddress);
        $stmt->bindParam(':user_agent', $userAgent);

        return $stmt->execute();
    } catch(PDOException $e) {
        error_log("Admin Activity Log Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Fungsi untuk mendapatkan semua notifikasi untuk user tertentu (termasuk broadcast)
 * @param int $userId ID user
 * @param int $limit Jumlah maksimal notifikasi yang diambil (default 50)
 * @return array
 */
function getUserNotifications($userId, $limit = 50) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "SELECT * FROM notifikasi 
                  WHERE user_id = :user_id OR user_id IS NULL
                  ORDER BY created_at DESC
                  LIMIT :limit";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        error_log("Get User Notifications Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fungsi untuk mendapatkan statistik dashboard
 * @return array
 */
function getDashboardStats() {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $today = date('Y-m-d');

        // Total siswa
        $siswaQuery = "SELECT COUNT(*) as total FROM siswa WHERE status = 'aktif'";
        $siswaStmt = $conn->query($siswaQuery);
        $totalSiswa = $siswaStmt->fetch()['total'];

        // Total hadir hari ini
        $hadirQuery = "SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('hadir', 'terlambat')";
        $hadirStmt = $conn->prepare($hadirQuery);
        $hadirStmt->bindParam(':tanggal', $today);
        $hadirStmt->execute();
        $totalHadir = $hadirStmt->fetch()['total'];

        // Total tidak hadir hari ini
        $tidakHadirQuery = "SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('sakit', 'izin', 'alpha')";
        $tidakHadirStmt = $conn->prepare($tidakHadirQuery);
        $tidakHadirStmt->bindParam(':tanggal', $today);
        $tidakHadirStmt->execute();
        $totalTidakHadir = $tidakHadirStmt->fetch()['total'];

        // Total log akses tidak valid hari ini
        $logQuery = "SELECT COUNT(*) as total FROM log_akses WHERE tanggal = :tanggal";
        $logStmt = $conn->prepare($logQuery);
        $logStmt->bindParam(':tanggal', $today);
        $logStmt->execute();
        $totalLogAkses = $logStmt->fetch()['total'];

        // Total ruangan aktif
        $ruanganQuery = "SELECT COUNT(*) as total FROM ruangan WHERE status = 'aktif'";
        $ruanganStmt = $conn->query($ruanganQuery);
        $totalRuangan = $ruanganStmt->fetch()['total'];

        return [
            'total_siswa' => (int)$totalSiswa,
            'total_hadir_hari_ini' => (int)$totalHadir,
            'total_tidak_hadir_hari_ini' => (int)$totalTidakHadir,
            'total_log_akses_hari_ini' => (int)$totalLogAkses,
            'total_ruangan_aktif' => (int)$totalRuangan,
            'tanggal' => $today
        ];
    } catch(PDOException $e) {
        error_log("Dashboard Stats Error: " . $e->getMessage());
        return [
            'total_siswa' => 0,
            'total_hadir_hari_ini' => 0,
            'total_tidak_hadir_hari_ini' => 0,
            'total_log_akses_hari_ini' => 0,
            'total_ruangan_aktif' => 0,
            'tanggal' => date('Y-m-d')
        ];
    }
}

// Fungsi alias untuk JWT
function verify_jwt_token($token) {
    return JWTHandler::verify($token);
}

function generate_jwt_token($payload) {
    return JWTHandler::generate($payload);
}

function jsonResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ]);
    exit();
}

/**
 * Ambil input JSON dari request body
 */
function getJsonInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return $_POST; // fallback ke POST biasa
    }
    return $data ?? [];
}

/**
 * Validasi field wajib
 */
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Sanitasi input
 */
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Log aktivitas ke error_log
 */
function logActivity($message, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] [{$level}] {$message}");
}
?>