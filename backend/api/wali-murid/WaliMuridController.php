<?php
/**
 * WaliMuridController.php
 * Controller untuk portal wali murid
 */



class WaliMuridController
{
    private WaliMuridModel $model;

    public function __construct()
    {
        $this->model = new WaliMuridModel();
    }

    private function send(bool $ok, string $msg, $data = null, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'status'    => $ok ? 'success' : 'error',
            'message'   => $msg,
            'data'      => $data,
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
    }

    private function siswaId(): int
    {
        return isset($_GET['siswa_id']) ? (int)$_GET['siswa_id'] : 1;
    }

    // ── Endpoints ──────────────────────────────────────────────

    public function getDashboard(): void
    {
        try {
            $data = $this->model->getDashboardData($this->siswaId());
            $this->send(true, 'Data dashboard berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat dashboard', null, 500);
        }
    }

    public function getSiswaData(): void
    {
        try {
            $data = $this->model->getSiswaData($this->siswaId());
            $this->send(true, 'Data siswa berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data siswa', null, 500);
        }
    }

    public function getSiswaList(): void
    {
        try {
            $search = $_GET['search'] ?? '';
            $page   = max(1, (int)($_GET['page'] ?? 1));
            $limit  = (int)($_GET['limit'] ?? 15);
            $data   = $this->model->getAllSiswa($search, $page, $limit);
            $this->send(true, 'Data siswa berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data siswa', null, 500);
        }
    }

    public function getJurusan(): void
    {
        try {
            $data = $this->model->getAllJurusan();
            $this->send(true, 'Data jurusan berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data jurusan', null, 500);
        }
    }

    public function getKelas(): void
    {
        try {
            $data = $this->model->getAllKelas();
            $this->send(true, 'Data kelas berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data kelas', null, 500);
        }
    }

    public function getNilaiAkademik(): void
    {
        try {
            $data = $this->model->getNilaiAkademik(
                $this->siswaId(),
                $_GET['semester']     ?? null,
                $_GET['tahun_ajaran'] ?? null
            );
            $this->send(true, 'Data nilai berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data nilai', null, 500);
        }
    }

    public function getPresensi(): void
    {
        try {
            $data = $this->model->getPresensiData(
                $this->siswaId(),
                $_GET['bulan'] ?? null,
                $_GET['tahun'] ?? null
            );
            $this->send(true, 'Data presensi berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data presensi', null, 500);
        }
    }

    public function getPembayaranSPP(): void
    {
        try {
            $data = $this->model->getPembayaranSPP($this->siswaId());
            $this->send(true, 'Data SPP berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat data SPP', null, 500);
        }
    }

    public function getPengumuman(): void
    {
        try {
            $limit  = (int)($_GET['limit']  ?? 10);
            $offset = (int)($_GET['offset'] ?? 0);
            $data   = $this->model->getPengumuman($limit, $offset);
            $this->send(true, 'Data pengumuman berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat pengumuman', null, 500);
        }
    }

    public function getKegiatanSekolah(): void
    {
        try {
            $limit  = (int)($_GET['limit']  ?? 20);
            $offset = (int)($_GET['offset'] ?? 0);
            $data   = $this->model->getKegiatanSekolah($limit, $offset);
            $this->send(true, 'Data kegiatan berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat kegiatan', null, 500);
        }
    }

    public function getKalenderAkademik(): void
    {
        try {
            $bulan = $_GET['bulan'] ?? date('m');
            $tahun = $_GET['tahun'] ?? date('Y');
            $data  = $this->model->getKalenderAkademik($bulan, $tahun);
            $this->send(true, 'Data kalender berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat kalender', null, 500);
        }
    }

    public function getBeasiswa(): void
    {
        try {
            $data = $this->model->getBeasiswa($_GET['status'] ?? 'aktif');
            $this->send(true, 'Data beasiswa berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat beasiswa', null, 500);
        }
    }

    public function getRapor(): void
    {
        try {
            $data = $this->model->getRapor($this->siswaId());
            $this->send(true, 'Data rapor berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat rapor', null, 500);
        }
    }

    public function getJadwalPelajaran(): void
    {
        try {
            $kelasId = (int)($_GET['kelas_id'] ?? 1);
            $data    = $this->model->getJadwalPelajaran($kelasId);
            $this->send(true, 'Data jadwal berhasil diambil', $data);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            $this->send(false, 'Gagal memuat jadwal', null, 500);
        }
    }

    public function exportNilaiPDF(): void
    {
        $this->send(true, 'Fitur export PDF dalam pengembangan', null);
    }
}
?>
