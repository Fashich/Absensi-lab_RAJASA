<?php
/**
 * WaliMuridModel.php
 * Model untuk portal wali murid — menggunakan PDO dengan query langsung
 */



class WaliMuridModel
{
    private \PDO $db;

    public function __construct()
    {
        $database    = new Database();
        $this->db    = $database->getConnection();
    }

    // ── Dashboard ──────────────────────────────────────────────

    public function getDashboardData(int $siswa_id): array
    {
        // Info siswa
        $siswa = $this->db->prepare(
            "SELECT s.*, j.nama_jurusan, j.kode_jurusan, k.nama_kelas, k.tingkat, k.wali_kelas
             FROM siswa s
             LEFT JOIN jurusan j ON s.jurusan_id = j.id
             LEFT JOIN kelas k ON (CONCAT(s.kelas,' ',s.rombel) = k.nama_kelas OR k.jurusan_id = s.jurusan_id)
             WHERE s.id = :id LIMIT 1"
        );
        $siswa->execute([':id' => $siswa_id]);
        $siswaInfo = $siswa->fetch();

        // Presensi bulan ini
        $bulanIni = date('Y-m');
        $pres = $this->db->prepare(
            "SELECT
                SUM(status_kehadiran='Hadir') AS hadir,
                SUM(status_kehadiran='Sakit') AS sakit,
                SUM(status_kehadiran='Izin')  AS izin,
                SUM(status_kehadiran='Alpha') AS alpha,
                SUM(status_kehadiran='Terlambat') AS terlambat,
                COUNT(*) AS total
             FROM presensi
             WHERE siswa_id = :id AND DATE_FORMAT(tanggal,'%Y-%m') = :bln"
        );
        $pres->execute([':id' => $siswa_id, ':bln' => $bulanIni]);
        $presensiStats = $pres->fetch() ?: ['hadir'=>0,'sakit'=>0,'izin'=>0,'alpha'=>0,'terlambat'=>0,'total'=>0];

        // Rata-rata nilai
        $nilai = $this->db->prepare(
            "SELECT
                AVG(nilai_harian) AS avg_harian,
                AVG(nilai_uts)    AS avg_uts,
                AVG(nilai_uas)    AS avg_uas,
                AVG(nilai_praktek) AS avg_praktek
             FROM nilai_akademik WHERE siswa_id = :id"
        );
        $nilai->execute([':id' => $siswa_id]);
        $nilaiStats = $nilai->fetch();

        // SPP bulan ini
        $spp = $this->db->prepare(
            "SELECT status_pembayaran, jumlah FROM pembayaran_spp
             WHERE siswa_id = :id AND tahun = :th AND bulan = :bln LIMIT 1"
        );
        $spp->execute([':id' => $siswa_id, ':th' => date('Y'), ':bln' => date('F')]);
        $sppStatus = $spp->fetch();

        // Pengumuman terbaru (5)
        $pengumuman = $this->db->query(
            "SELECT id, judul, kategori, prioritas, tanggal_terbit
             FROM pengumuman ORDER BY tanggal_terbit DESC LIMIT 5"
        )->fetchAll();

        // Kegiatan mendatang
        $kegiatan = $this->db->prepare(
            "SELECT nama_kegiatan, tanggal_mulai, tanggal_selesai, lokasi
             FROM kegiatan_sekolah WHERE tanggal_mulai >= CURDATE()
             ORDER BY tanggal_mulai ASC LIMIT 5"
        );
        $kegiatan->execute();
        $kegiatanList = $kegiatan->fetchAll();

        return [
            'siswa_info'     => $siswaInfo,
            'presensi_stats' => $presensiStats,
            'nilai_stats'    => $nilaiStats,
            'spp_status'     => $sppStatus,
            'pengumuman'     => $pengumuman,
            'kegiatan'       => $kegiatanList,
        ];
    }

    // ── Siswa ──────────────────────────────────────────────────

    public function getSiswaData(int $siswa_id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT s.*,
                    j.nama_jurusan, j.kode_jurusan,
                    k.nama_kelas, k.tingkat, k.wali_kelas, k.tahun_ajaran
             FROM siswa s
             LEFT JOIN jurusan j ON s.jurusan_id = j.id
             LEFT JOIN kelas k ON k.jurusan_id = s.jurusan_id AND k.tingkat = s.kelas
             WHERE s.id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $siswa_id]);
        return $stmt->fetch() ?: null;
    }

    public function getAllSiswa(string $search = '', int $page = 1, int $limit = 15): array
    {
        $offset = ($page - 1) * $limit;
        $like   = "%$search%";

        $total = $this->db->prepare(
            "SELECT COUNT(*) FROM siswa s
             LEFT JOIN jurusan j ON s.jurusan_id = j.id
             WHERE s.status = 'aktif'
               AND (s.nama_lengkap LIKE :q OR s.nisn LIKE :q OR s.nis LIKE :q OR j.nama_jurusan LIKE :q)"
        );
        $total->execute([':q' => $like]);
        $totalRows = (int)$total->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT s.id, s.nisn, s.nis, s.nama_lengkap, s.jenis_kelamin,
                    s.kelas, s.rombel, s.status, s.nama_ortu, s.no_telp_ortu, s.foto,
                    j.nama_jurusan, j.kode_jurusan
             FROM siswa s
             LEFT JOIN jurusan j ON s.jurusan_id = j.id
             WHERE s.status = 'aktif'
               AND (s.nama_lengkap LIKE :q OR s.nisn LIKE :q OR s.nis LIKE :q OR j.nama_jurusan LIKE :q)
             ORDER BY s.nama_lengkap ASC
             LIMIT :lim OFFSET :off"
        );
        $stmt->bindValue(':q',   $like);
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'       => $stmt->fetchAll(),
            'total'      => $totalRows,
            'page'       => $page,
            'total_page' => (int)ceil($totalRows / $limit),
            'per_page'   => $limit,
        ];
    }

    // ── Jurusan ────────────────────────────────────────────────

    public function getAllJurusan(): array
    {
        return $this->db->query(
            "SELECT j.*,
                    COUNT(s.id) AS total_siswa
             FROM jurusan j
             LEFT JOIN siswa s ON s.jurusan_id = j.id AND s.status = 'aktif'
             GROUP BY j.id ORDER BY j.nama_jurusan ASC"
        )->fetchAll();
    }

    // ── Kelas ──────────────────────────────────────────────────

    public function getAllKelas(): array
    {
        return $this->db->query(
            "SELECT k.*, j.nama_jurusan, j.kode_jurusan,
                    COUNT(st.id) AS total_siswa
             FROM kelas k
             LEFT JOIN jurusan j ON k.jurusan_id = j.id
             LEFT JOIN students st ON st.kelas_id = k.id AND st.status_aktif = 'Aktif'
             GROUP BY k.id ORDER BY k.tingkat ASC, k.nama_kelas ASC"
        )->fetchAll();
    }

    // ── Nilai Akademik ─────────────────────────────────────────

    public function getNilaiAkademik(int $siswa_id, ?string $semester = null, ?string $tahun_ajaran = null): array
    {
        $where  = 'WHERE n.siswa_id = :id';
        $params = [':id' => $siswa_id];

        if ($semester) {
            $where          .= ' AND n.semester = :sem';
            $params[':sem']  = $semester;
        }
        if ($tahun_ajaran) {
            $where          .= ' AND n.tahun_ajaran = :tahun';
            $params[':tahun'] = $tahun_ajaran;
        }

        $stmt = $this->db->prepare(
            "SELECT n.*, m.nama_mapel, m.kode_mapel, m.km,
                    ROUND((COALESCE(n.nilai_harian,0)*0.3 + COALESCE(n.nilai_uts,0)*0.3 +
                           COALESCE(n.nilai_uas,0)*0.3    + COALESCE(n.nilai_praktek,0)*0.1), 2) AS nilai_akhir
             FROM nilai_akademik n
             LEFT JOIN mata_pelajaran m ON n.mata_pelajaran_id = m.id
             $where
             ORDER BY m.km ASC, m.nama_mapel ASC"
        );
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Statistik rata-rata
        $stats = ['avg_harian'=>0,'avg_uts'=>0,'avg_uas'=>0,'avg_akhir'=>0];
        if ($rows) {
            $stats['avg_harian'] = round(array_sum(array_column($rows,'nilai_harian')) / count($rows), 1);
            $stats['avg_uts']    = round(array_sum(array_column($rows,'nilai_uts'))    / count($rows), 1);
            $stats['avg_uas']    = round(array_sum(array_column($rows,'nilai_uas'))    / count($rows), 1);
            $stats['avg_akhir']  = round(array_sum(array_column($rows,'nilai_akhir'))  / count($rows), 1);
        }

        return ['data' => $rows, 'stats' => $stats];
    }

    // ── Presensi ───────────────────────────────────────────────

    public function getPresensiData(int $siswa_id, ?string $bulan = null, ?string $tahun = null): array
    {
        $where  = 'WHERE p.siswa_id = :id';
        $params = [':id' => $siswa_id];

        if ($bulan && $tahun) {
            $where           .= ' AND MONTH(p.tanggal) = :bln AND YEAR(p.tanggal) = :thn';
            $params[':bln']   = $bulan;
            $params[':thn']   = $tahun;
        } else {
            $where           .= ' AND YEAR(p.tanggal) = :thn';
            $params[':thn']   = $tahun ?? date('Y');
        }

        $stmt = $this->db->prepare(
            "SELECT p.* FROM presensi p $where ORDER BY p.tanggal DESC"
        );
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $stats = ['hadir'=>0,'sakit'=>0,'izin'=>0,'alpha'=>0,'terlambat'=>0,'total'=>count($rows)];
        foreach ($rows as $r) {
            $key = strtolower($r['status_kehadiran']);
            if (isset($stats[$key])) $stats[$key]++;
        }

        $persen = $stats['total'] > 0
            ? round(($stats['hadir'] + $stats['terlambat']) / $stats['total'] * 100, 1)
            : 0;

        return ['data' => $rows, 'statistik' => $stats, 'persentase_hadir' => $persen];
    }

    // ── Pembayaran SPP ─────────────────────────────────────────

    public function getPembayaranSPP(int $siswa_id): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM pembayaran_spp WHERE siswa_id = :id ORDER BY tahun DESC, bulan DESC"
        );
        $stmt->execute([':id' => $siswa_id]);
        $rows = $stmt->fetchAll();

        $stats = ['total_bulan'=>count($rows), 'lunas'=>0, 'belum_bayar'=>0,
                  'total_tagihan'=>0, 'total_terbayar'=>0];
        foreach ($rows as $r) {
            if ($r['status_pembayaran'] === 'Lunas') {
                $stats['lunas']++;
                $stats['total_terbayar'] += $r['jumlah'];
            } else {
                $stats['belum_bayar']++;
            }
            $stats['total_tagihan'] += $r['jumlah'];
        }

        return ['data' => $rows, 'statistik' => $stats];
    }

    // ── Pengumuman ─────────────────────────────────────────────

    public function getPengumuman(int $limit = 10, int $offset = 0): array
    {
        $total = (int)$this->db->query("SELECT COUNT(*) FROM pengumuman")->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT id, judul, isi_pengumuman, kategori, tanggal_terbit, prioritas
             FROM pengumuman
             ORDER BY
               FIELD(prioritas,'Darurat','Tinggi','Sedang','Rendah'),
               tanggal_terbit DESC
             LIMIT :lim OFFSET :off"
        );
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }

    // ── Kegiatan Sekolah ───────────────────────────────────────

    public function getKegiatanSekolah(int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM kegiatan_sekolah
             ORDER BY tanggal_mulai DESC
             LIMIT :lim OFFSET :off"
        );
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ── Kalender Akademik ──────────────────────────────────────

    public function getKalenderAkademik(string $bulan, string $tahun): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM calendar_akademik
             WHERE MONTH(tanggal) = :bln AND YEAR(tanggal) = :thn
             ORDER BY tanggal ASC"
        );
        $stmt->execute([':bln' => $bulan, ':thn' => $tahun]);
        return $stmt->fetchAll();
    }

    // ── Beasiswa ───────────────────────────────────────────────

    public function getBeasiswa(string $status = 'aktif'): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM beasiswa WHERE status = :s AND tanggal_penutupan >= CURDATE()
             ORDER BY tanggal_penutupan ASC"
        );
        $stmt->execute([':s' => $status]);
        return $stmt->fetchAll();
    }

    // ── Rapor ──────────────────────────────────────────────────

    public function getRapor(int $siswa_id): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM rapor WHERE siswa_id = :id ORDER BY tahun_ajaran DESC, semester ASC"
        );
        $stmt->execute([':id' => $siswa_id]);
        return $stmt->fetchAll();
    }

    // ── Jadwal Pelajaran ───────────────────────────────────────

    public function getJadwalPelajaran(int $kelas_id): array
    {
        $stmt = $this->db->prepare(
            "SELECT jp.*, mp.nama_mapel, mp.kode_mapel, mp.km
             FROM jadwal_pelajaran jp
             LEFT JOIN mata_pelajaran mp ON jp.mata_pelajaran_id = mp.id
             WHERE jp.kelas_id = :kid
             ORDER BY FIELD(jp.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), jp.jam_mulai ASC"
        );
        $stmt->execute([':kid' => $kelas_id]);
        return $stmt->fetchAll();
    }
}
?>
