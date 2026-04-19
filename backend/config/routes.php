<?php
/**
 * routes.php — API Routing untuk Wali Murid Portal
 * SMK Rajasa Surabaya
 */

require_once __DIR__ . '/../controllers/WaliMuridController.php';

$ctrl = new WaliMuridController();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getCleanUri(string $requestUri): string
{
    $uri      = $requestUri;
    if (strpos($uri, '?') !== false) {
        $uri  = strstr($uri, '?', true);
    }
    $basePath = '/project_magang/backend';
    if (strpos($uri, $basePath) === 0) {
        $uri  = substr($uri, strlen($basePath));
    }
    return $uri;
}

$method = $_SERVER['REQUEST_METHOD'];
$uri    = getCleanUri($_SERVER['REQUEST_URI']);

switch ($uri) {
    // Dashboard
    case '/api/wali-murid/dashboard':
        $method === 'GET' ? $ctrl->getDashboard() : sendMethodNotAllowed();
        break;

    // Siswa — semua siswa (list) atau siswa tertentu
    case '/api/wali-murid/siswa':
        $method === 'GET' ? $ctrl->getSiswaData() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/siswa/list':
        $method === 'GET' ? $ctrl->getSiswaList() : sendMethodNotAllowed();
        break;

    // Jurusan & Kelas
    case '/api/wali-murid/jurusan':
        $method === 'GET' ? $ctrl->getJurusan() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/kelas':
        $method === 'GET' ? $ctrl->getKelas() : sendMethodNotAllowed();
        break;

    // Akademik
    case '/api/wali-murid/nilai':
        $method === 'GET' ? $ctrl->getNilaiAkademik() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/jadwal':
        $method === 'GET' ? $ctrl->getJadwalPelajaran() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/rapor':
        $method === 'GET' ? $ctrl->getRapor() : sendMethodNotAllowed();
        break;

    // Presensi
    case '/api/wali-murid/presensi':
        $method === 'GET' ? $ctrl->getPresensi() : sendMethodNotAllowed();
        break;

    // Pembayaran SPP
    case '/api/wali-murid/pembayaran':
        $method === 'GET' ? $ctrl->getPembayaranSPP() : sendMethodNotAllowed();
        break;

    // Pengumuman & Kegiatan
    case '/api/wali-murid/pengumuman':
        $method === 'GET' ? $ctrl->getPengumuman() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/kegiatan':
        $method === 'GET' ? $ctrl->getKegiatanSekolah() : sendMethodNotAllowed();
        break;

    // Kalender & Beasiswa
    case '/api/wali-murid/kalender':
        $method === 'GET' ? $ctrl->getKalenderAkademik() : sendMethodNotAllowed();
        break;
    case '/api/wali-murid/beasiswa':
        $method === 'GET' ? $ctrl->getBeasiswa() : sendMethodNotAllowed();
        break;

    // Export
    case '/api/wali-murid/export/nilai-pdf':
        $method === 'GET' ? $ctrl->exportNilaiPDF() : sendMethodNotAllowed();
        break;

    default:
        sendNotFound();
        break;
}

function sendNotFound(): void
{
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Endpoint tidak ditemukan', 'data' => null]);
}

function sendMethodNotAllowed(): void
{
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan', 'data' => null]);
}
?>