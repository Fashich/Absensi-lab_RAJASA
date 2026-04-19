<?php
/**
 * =====================================================
 * FUNCTIONS HELPER
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 */

use PDO;
use PDOException;

require_once __DIR__ . '/../config/database.php';

/**
 * Class JWTHandler
 * Untuk handling JSON Web Token
 */
class JWTHandler
{
    /**
     * Generate JWT Token
     * @param array $payload Data yang akan di-encode
     * @return string JWT Token
     */
    public static function generate(array $payload): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $time   = time();

        $payload['iat'] = $time;
        $payload['exp'] = $time + JWT_EXPIRED;

        $payloadEncoded = json_encode($payload);

        $base64Header  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadEncoded));

        $signature      = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Verify dan decode JWT Token
     * @param string $token JWT Token
     * @return array|false Data payload atau false jika invalid
     */
    public static function verify(string $token)
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $header            = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
        $payload           = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
        $signatureProvided = $parts[2];

        $base64Header  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature       = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
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
     * @param array $serverVars $_SERVER yang diteruskan sebagai parameter
     * @return string|null
     */
    public static function getBearerToken(array $serverVars): ?string
    {
        $headers = null;

        if (isset($serverVars['Authorization'])) {
            $headers = trim($serverVars['Authorization']);
        } elseif (isset($serverVars['HTTP_AUTHORIZATION'])) {
            $headers = trim($serverVars['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s+(\S+)/', $headers, $matches)) {
            return $matches[1];
        }

        return null;
    }
}

/**
 * Class Auth
 * Untuk autentikasi dan otorisasi
 */
class Auth
{
    private Database $database;
    private PDO $conn;

    public function __construct()
    {
        $this->database = new Database();
        $this->conn     = $this->database->getConnection();
    }

    /**
     * Login user
     */
    public function login(string $username, string $password)
    {
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
                $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = :id";
                $updateStmt  = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(':id', $user['id']);
                $updateStmt->execute();

                $tokenPayload = [
                    'user_id'      => $user['id'],
                    'username'     => $user['username'],
                    'role'         => $user['role'],
                    'jurusan_id'   => $user['jurusan_id'],
                    'ruangan_id'   => $user['ruangan_id'],
                    'foto_profile' => $user['foto_profile'],
                ];

                $token = JWTHandler::generate($tokenPayload);
                unset($user['password']);

                return ['user' => $user, 'token' => $token];
            }

            return false;
        } catch (PDOException $e) {
            error_log("Login Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Log admin activity to database
     */
    private function logAdminActivity(
        int $userId,
        string $activityType,
        string $description,
        string $ipAddress,
        string $userAgent
    ): bool {
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
        } catch (PDOException $e) {
            error_log("Log Admin Activity Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifikasi token dan dapatkan user
     */
    public function verifyToken(string $token)
    {
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
        } catch (PDOException $e) {
            error_log("Verify Token Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check apakah user memiliki akses
     */
    public function hasAccess(array $user, $allowedRoles): bool
    {
        if (!is_array($allowedRoles)) {
            $allowedRoles = [$allowedRoles];
        }

        return in_array($user['role'], $allowedRoles);
    }

    /**
     * Middleware untuk autentikasi
     */
    public static function middleware(): array
    {
        $token = JWTHandler::getBearerToken($_SERVER);

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
 */
class Pagination
{
    public static function format(array $data, int $page, int $limit, int $total): array
    {
        $totalPages = ceil($total / $limit);
        $from       = ($page - 1) * $limit + 1;
        $toPage     = min($page * $limit, $total);

        return [
            'data'       => $data,
            'pagination' => [
                'current_page'  => $page,
                'per_page'      => $limit,
                'total'         => $total,
                'total_pages'   => (int)$totalPages,
                'from'          => $from,
                'to'            => $toPage,
                'has_next_page' => $page < $totalPages,
                'has_prev_page' => $page > 1,
            ],
        ];
    }
}

/**
 * Class Upload
 */
class Upload
{
    public static function file(array $file, string $directory, array $allowedTypes = [], int $maxSize = 5242880): array
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Upload gagal: ' . self::getUploadError($file['error']), 'filename' => null];
        }

        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'Ukuran file terlalu besar (maks ' . ($maxSize / 1024 / 1024) . ' MB)', 'filename' => null];
        }

        if (!empty($allowedTypes)) {
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                return ['success' => false, 'message' => 'Tipe file tidak diizinkan', 'filename' => null];
            }
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename  = uniqid() . '_' . time() . '.' . $extension;
        $filepath  = $directory . $filename;

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => true, 'message' => 'Upload berhasil', 'filename' => $filename, 'path' => $filepath];
        }

        return ['success' => false, 'message' => 'Gagal memindahkan file', 'filename' => null];
    }

    public static function foto(array $file, string $subDirectory = ''): array
    {
        $directory = UPLOAD_PATH . 'foto/' . $subDirectory;
        if (!empty($subDirectory)) {
            $directory .= '/';
        }

        return self::file($file, $directory, ['image/jpeg', 'image/png', 'image/jpg'], 2097152);
    }

    public static function delete(string $filepath): bool
    {
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }

    private static function getUploadError(int $errorCode): string
    {
        $errors = [
            UPLOAD_ERR_INI_SIZE   => 'Ukuran file melebihi batas upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE  => 'Ukuran file melebihi batas MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL    => 'File hanya terupload sebagian',
            UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang diupload',
            UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
            UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk',
            UPLOAD_ERR_EXTENSION  => 'Upload dihentikan oleh ekstensi PHP',
        ];

        return $errors[$errorCode] ?? 'Error tidak diketahui';
    }
}

/**
 * Export data ke CSV
 */
function exportCSV(array $data, array $headers, string $filename): void
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));
    fputcsv($output, $headers);

    foreach ($data as $row) {
        fputcsv($output, $row);
    }

    fclose($output);
}

/**
 * Kirim notifikasi
 */
function sendNotification(int $userId, string $judul, string $pesan, string $tipe = 'info', string $link = null): bool
{
    try {
        $database = new Database();
        $conn     = $database->getConnection();

        $stmt = $conn->prepare("INSERT INTO notifikasi (user_id, judul, pesan, tipe, link)
                                VALUES (:user_id, :judul, :pesan, :tipe, :link)");

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':judul', $judul);
        $stmt->bindParam(':pesan', $pesan);
        $stmt->bindParam(':tipe', $tipe);
        $stmt->bindParam(':link', $link);

        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Send Notification Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Catat aktivitas admin
 */
function logAdminActivity(
    int $userId,
    string $activityType,
    string $description = '',
    string $ipAddress = null,
    string $userAgent = null
): bool {
    try {
        $database  = new Database();
        $conn      = $database->getConnection();
        $ipAddress = $ipAddress ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
        $userAgent = $userAgent ?? ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown');

        $stmt = $conn->prepare("INSERT INTO admin_activities (user_id, activity_type, activity_description, ip_address, user_agent)
                                VALUES (:user_id, :activity_type, :activity_description, :ip_address, :user_agent)");

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':activity_type', $activityType);
        $stmt->bindParam(':activity_description', $description);
        $stmt->bindParam(':ip_address', $ipAddress);
        $stmt->bindParam(':user_agent', $userAgent);

        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Admin Activity Log Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Notifikasi user
 */
function getUserNotifications(int $userId, int $limit = 50): array
{
    try {
        $database = new Database();
        $conn     = $database->getConnection();

        $stmt = $conn->prepare("SELECT * FROM notifikasi
                                WHERE user_id = :user_id OR user_id IS NULL
                                ORDER BY created_at DESC
                                LIMIT :limit");

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Get User Notifications Error: " . $e->getMessage());
        return [];
    }
}

/**
 * Statistik dashboard
 */
function getDashboardStats(): array
{
    try {
        $database = new Database();
        $conn     = $database->getConnection();
        $today    = date('Y-m-d');

        $totalSiswa = $conn->query("SELECT COUNT(*) as total FROM siswa WHERE status = 'aktif'")->fetch()['total'];

        $hadirStmt = $conn->prepare("SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('hadir', 'terlambat')");
        $hadirStmt->bindParam(':tanggal', $today);
        $hadirStmt->execute();
        $totalHadir = $hadirStmt->fetch()['total'];

        $tidakHadirStmt = $conn->prepare("SELECT COUNT(*) as total FROM presensi WHERE tanggal = :tanggal AND status IN ('sakit', 'izin', 'alpha')");
        $tidakHadirStmt->bindParam(':tanggal', $today);
        $tidakHadirStmt->execute();
        $totalTidakHadir = $tidakHadirStmt->fetch()['total'];

        $logStmt = $conn->prepare("SELECT COUNT(*) as total FROM log_akses WHERE tanggal = :tanggal");
        $logStmt->bindParam(':tanggal', $today);
        $logStmt->execute();
        $totalLogAkses = $logStmt->fetch()['total'];

        $totalRuangan = $conn->query("SELECT COUNT(*) as total FROM ruangan WHERE status = 'aktif'")->fetch()['total'];

        return [
            'total_siswa'               => (int)$totalSiswa,
            'total_hadir_hari_ini'      => (int)$totalHadir,
            'total_tidak_hadir_hari_ini' => (int)$totalTidakHadir,
            'total_log_akses_hari_ini'  => (int)$totalLogAkses,
            'total_ruangan_aktif'       => (int)$totalRuangan,
            'tanggal'                   => $today,
        ];
    } catch (PDOException $e) {
        error_log("Dashboard Stats Error: " . $e->getMessage());
        return [
            'total_siswa'               => 0,
            'total_hadir_hari_ini'      => 0,
            'total_tidak_hadir_hari_ini' => 0,
            'total_log_akses_hari_ini'  => 0,
            'total_ruangan_aktif'       => 0,
            'tanggal'                   => date('Y-m-d'),
        ];
    }
}

// Fungsi alias untuk JWT
function verify_jwt_token(string $token)
{
    return JWTHandler::verify($token);
}

function generate_jwt_token(array $payload): string
{
    return JWTHandler::generate($payload);
}

function jsonResponse(bool $success, string $message, $data = null, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
    ]);
}

/**
 * Ambil input JSON dari request body
 */
function getJsonInput(): array
{
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return $_POST;
    }

    return $data ?? [];
}

/**
 * Validasi field wajib
 */
function validateRequired(array $data, array $fields): array
{
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
function sanitize(string $input): string
{
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Log aktivitas ke error_log
 */
function logActivity(string $message, string $level = 'INFO'): void
{
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] [{$level}] {$message}");
}
?>