<?php
/**
 * FormatHelper.php
 * Helper functions untuk format tanggal, rupiah, dan fungsi umum lainnya
 * Sistem Informasi Sekolah SMK Rajasa Surabaya
 */

class FormatHelper {

    /**
     * Format tanggal Indonesia
     */
    public static function formatTanggalIndonesia($tanggal, $format = 'd F Y') {
        if (empty($tanggal) || $tanggal === '0000-00-00') {
            return '-';
        }

        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        $timestamp = strtotime($tanggal);
        $hari = date('d', $timestamp);
        $bulan_num = (int)date('m', $timestamp);
        $tahun = date('Y', $timestamp);

        return $hari . ' ' . $bulan[$bulan_num] . ' ' . $tahun;
    }

    /**
     * Format tanggal dengan waktu Indonesia
     */
    public static function formatTanggalWaktuIndonesia($datetime) {
        if (empty($datetime)) {
            return '-';
        }

        $timestamp = strtotime($datetime);
        $tanggal = self::formatTanggalIndonesia(date('Y-m-d', $timestamp));
        $waktu = date('H:i:s', $timestamp);

        return $tanggal . ' ' . $waktu;
    }

    /**
     * Format rupiah
     */
    public static function formatRupiah($nominal) {
        if (!is_numeric($nominal)) {
            return 'Rp 0';
        }

        return 'Rp ' . number_format($nominal, 0, ',', '.');
    }

    /**
     * Format nomor telepon Indonesia
     */
    public static function formatNomorTelepon($nomor) {
        if (empty($nomor)) {
            return '-';
        }

        // Hapus semua karakter non-digit
        $nomor = preg_replace('/\D/', '', $nomor);

        // Jika dimulai dengan 0, ganti dengan 62
        if (substr($nomor, 0, 1) === '0') {
            $nomor = '62' . substr($nomor, 1);
        }

        // Format: +62 XXX-XXXX-XXXX
        if (strlen($nomor) === 12 && substr($nomor, 0, 2) === '62') {
            return '+62 ' . substr($nomor, 2, 3) . '-' . substr($nomor, 5, 4) . '-' . substr($nomor, 9, 4);
        }

        // Format: +62 XX-XXXX-XXXX
        if (strlen($nomor) === 11 && substr($nomor, 0, 2) === '62') {
            return '+62 ' . substr($nomor, 2, 2) . '-' . substr($nomor, 4, 4) . '-' . substr($nomor, 8, 4);
        }

        // Jika tidak sesuai format, kembalikan asli
        return $nomor;
    }

    /**
     * Format NISN dengan pemisah
     */
    public static function formatNISN($nisn) {
        if (empty($nisn) || strlen($nisn) !== 10) {
            return $nisn;
        }

        return substr($nisn, 0, 4) . '-' . substr($nisn, 4, 4) . '-' . substr($nisn, 8, 2);
    }

    /**
     * Format grade nilai
     */
    public static function formatGrade($nilai) {
        if (!is_numeric($nilai)) {
            return '-';
        }

        if ($nilai >= 90) return 'A';
        if ($nilai >= 80) return 'B';
        if ($nilai >= 70) return 'C';
        if ($nilai >= 60) return 'D';
        return 'E';
    }

    /**
     * Hitung umur dari tanggal lahir
     */
    public static function hitungUmur($tanggal_lahir) {
        if (empty($tanggal_lahir)) {
            return '-';
        }

        $birth_date = new DateTime($tanggal_lahir);
        $today = new DateTime();
        $age = $today->diff($birth_date);

        return $age->y . ' tahun ' . $age->m . ' bulan';
    }

    /**
     * Format status pembayaran SPP
     */
    public static function formatStatusSPP($status) {
        $status_map = [
            'belum_bayar' => ['text' => 'Belum Bayar', 'color' => 'red'],
            'lunas' => ['text' => 'Lunas', 'color' => 'green'],
            'sebagian' => ['text' => 'Sebagian', 'color' => 'yellow']
        ];

        return $status_map[$status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    /**
     * Format status presensi
     */
    public static function formatStatusPresensi($status) {
        $status_map = [
            'hadir' => ['text' => 'Hadir', 'color' => 'green'],
            'sakit' => ['text' => 'Sakit', 'color' => 'orange'],
            'izin' => ['text' => 'Izin', 'color' => 'blue'],
            'alfa' => ['text' => 'Alfa', 'color' => 'red'],
            'terlambat' => ['text' => 'Terlambat', 'color' => 'yellow']
        ];

        return $status_map[$status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    /**
     * Format nama bulan Indonesia
     */
    public static function getNamaBulan($bulan) {
        $bulan_nama = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];

        return $bulan_nama[$bulan] ?? '';
    }

    /**
     * Generate slug dari string
     */
    public static function generateSlug($string) {
        $string = strtolower($string);
        $string = preg_replace('/[^a-z0-9\s-]/', '', $string);
        $string = preg_replace('/[\s-]+/', '-', $string);
        return trim($string, '-');
    }

    /**
     * Truncate text dengan ellipsis
     */
    public static function truncateText($text, $length = 100, $suffix = '...') {
        if (strlen($text) <= $length) {
            return $text;
        }

        return substr($text, 0, $length - strlen($suffix)) . $suffix;
    }

    /**
     * Format file size
     */
    public static function formatFileSize($bytes) {
        if ($bytes == 0) {
            return '0 Bytes';
        }

        $units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
    }

    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Generate random string
     */
    public static function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $random_string = '';

        for ($i = 0; $i < $length; $i++) {
            $random_string .= $characters[rand(0, strlen($characters) - 1)];
        }

        return $random_string;
    }
}
?>