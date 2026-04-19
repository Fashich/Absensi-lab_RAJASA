<?php
/**
 * WaliMuridModel.php - disesuaikan schema database asli (tabel students)
 */
class WaliMuridModel
{
    private \PDO $db;
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    private function q(string $sql, array $p = []): \PDOStatement {
        $s = $this->db->prepare($sql);
        $s->execute($p);
        return $s;
    }
    public function getDashboardData(int $siswa_id): array {
        $siswaInfo = $this->q(
            "SELECT s.*, j.nama_jurusan, j.kode_jurusan, k.nama_kelas, k.tingkat, k.wali_kelas, k.tahun_ajaran
             FROM students s
             LEFT JOIN jurusan j ON s.jurusan_id = j.id
             LEFT JOIN kelas k ON s.kelas_id = k.id
             WHERE s.id = :id LIMIT 1", [':id'=>$siswa_id]
        )->fetch();
        $bulanIni = date('Y-m');
        $presensiStats = $this->q(
            "SELECT COALESCE(SUM(status_kehadiran='Hadir'),0) AS hadir,
                    COALESCE(SUM(status_kehadiran='Sakit'),0) AS sakit,
                    COALESCE(SUM(status_kehadiran='Izin'),0) AS izin,
                    COALESCE(SUM(status_kehadiran='Alpha'),0) AS alpha,
                    COALESCE(SUM(status_kehadiran='Terlambat'),0) AS terlambat,
                    COUNT(*) AS total
             FROM presensi WHERE siswa_id=:id AND DATE_FORMAT(tanggal,'%Y-%m')=:bln",
            [':id'=>$siswa_id,':bln'=>$bulanIni]
        )->fetch() ?: ['hadir'=>0,'sakit'=>0,'izin'=>0,'alpha'=>0,'terlambat'=>0,'total'=>0];
        $nilaiStats = $this->q(
            "SELECT ROUND(AVG(nilai_harian),1) AS avg_harian, ROUND(AVG(nilai_uts),1) AS avg_uts,
                    ROUND(AVG(nilai_uas),1) AS avg_uas, ROUND(AVG(nilai_praktek),1) AS avg_praktek,
                    ROUND(AVG((COALESCE(nilai_harian,0)*0.3+COALESCE(nilai_uts,0)*0.3+COALESCE(nilai_uas,0)*0.3+COALESCE(nilai_praktek,0)*0.1)),1) AS avg_akhir
             FROM nilai_akademik WHERE siswa_id=:id", [':id'=>$siswa_id]
        )->fetch();
        $sppStatus = $this->q(
            "SELECT status_pembayaran, jumlah FROM pembayaran_spp WHERE siswa_id=:id AND tahun=:th AND bulan=:bln LIMIT 1",
            [':id'=>$siswa_id,':th'=>date('Y'),':bln'=>date('F')]
        )->fetch();
        $pengumuman = $this->q(
            "SELECT id, judul, kategori, prioritas, tanggal_terbit FROM pengumuman ORDER BY tanggal_terbit DESC LIMIT 5"
        )->fetchAll();
        $kegiatan = $this->q(
            "SELECT nama_kegiatan, tanggal_mulai, tanggal_selesai, lokasi FROM kegiatan_sekolah WHERE tanggal_mulai >= CURDATE() ORDER BY tanggal_mulai ASC LIMIT 5"
        )->fetchAll();
        return [
            'siswa_info'=>$siswaInfo,'presensi_stats'=>$presensiStats,'nilai_stats'=>$nilaiStats,
            'spp_status'=>$sppStatus,'pengumuman'=>$pengumuman,'kegiatan'=>$kegiatan,
            'total_siswa'=>(int)$this->q("SELECT COUNT(*) FROM students WHERE status_aktif='Aktif'")->fetchColumn(),
            'total_jurusan'=>(int)$this->q("SELECT COUNT(*) FROM jurusan")->fetchColumn(),
        ];
    }
    public function getSiswaData(int $siswa_id): ?array {
        $r = $this->q(
            "SELECT s.*, j.nama_jurusan, j.kode_jurusan, k.nama_kelas, k.tingkat, k.wali_kelas, k.tahun_ajaran
             FROM students s LEFT JOIN jurusan j ON s.jurusan_id=j.id LEFT JOIN kelas k ON s.kelas_id=k.id
             WHERE s.id=:id LIMIT 1", [':id'=>$siswa_id]
        )->fetch();
        return $r ?: null;
    }
    public function getAllSiswa(string $search='', int $page=1, int $limit=15): array {
        $offset = ($page-1)*$limit; $like = "%$search%";
        $total = (int)$this->q(
            "SELECT COUNT(*) FROM students s LEFT JOIN jurusan j ON s.jurusan_id=j.id WHERE s.status_aktif='Aktif' AND (s.nama_lengkap LIKE :q OR s.nisn LIKE :q OR j.nama_jurusan LIKE :q)",
            [':q'=>$like]
        )->fetchColumn();
        $stmt = $this->db->prepare(
            "SELECT s.id,s.nisn,s.nama_lengkap,s.status_aktif,s.nama_ortu,s.no_hp_ortu,s.foto_siswa,s.alamat,j.nama_jurusan,j.kode_jurusan,k.nama_kelas,k.tingkat,k.wali_kelas
             FROM students s LEFT JOIN jurusan j ON s.jurusan_id=j.id LEFT JOIN kelas k ON s.kelas_id=k.id
             WHERE s.status_aktif='Aktif' AND (s.nama_lengkap LIKE :q OR s.nisn LIKE :q OR j.nama_jurusan LIKE :q)
             ORDER BY s.nama_lengkap ASC LIMIT :lim OFFSET :off"
        );
        $stmt->bindValue(':q',$like); $stmt->bindValue(':lim',$limit,\PDO::PARAM_INT); $stmt->bindValue(':off',$offset,\PDO::PARAM_INT);
        $stmt->execute();
        return ['data'=>$stmt->fetchAll(),'total'=>$total,'page'=>$page,'total_page'=>(int)ceil($total/$limit),'per_page'=>$limit];
    }
    public function getAllJurusan(): array {
        return $this->q(
            "SELECT j.*, (SELECT COUNT(*) FROM students s WHERE s.jurusan_id=j.id AND s.status_aktif='Aktif') AS total_siswa FROM jurusan j ORDER BY j.nama_jurusan ASC"
        )->fetchAll();
    }
    public function getAllKelas(): array {
        return $this->q(
            "SELECT k.*, j.nama_jurusan, j.kode_jurusan, (SELECT COUNT(*) FROM students s WHERE s.kelas_id=k.id AND s.status_aktif='Aktif') AS total_siswa
             FROM kelas k LEFT JOIN jurusan j ON k.jurusan_id=j.id ORDER BY k.tingkat ASC, k.nama_kelas ASC"
        )->fetchAll();
    }
    public function getNilaiAkademik(int $siswa_id, ?string $semester=null, ?string $tahun_ajaran=null): array {
        $where='WHERE n.siswa_id=:id'; $p=[':id'=>$siswa_id];
        if($semester){$where.=' AND n.semester=:sem';$p[':sem']=$semester;}
        if($tahun_ajaran){$where.=' AND n.tahun_ajaran=:th';$p[':th']=$tahun_ajaran;}
        $rows = $this->q(
            "SELECT n.*, m.nama_mapel, m.kode_mapel, m.km,
                    ROUND((COALESCE(n.nilai_harian,0)*0.3+COALESCE(n.nilai_uts,0)*0.3+COALESCE(n.nilai_uas,0)*0.3+COALESCE(n.nilai_praktek,0)*0.1),2) AS nilai_akhir
             FROM nilai_akademik n LEFT JOIN mata_pelajaran m ON n.mata_pelajaran_id=m.id $where ORDER BY m.nama_mapel ASC", $p
        )->fetchAll();
        $stats=['avg_harian'=>0,'avg_uts'=>0,'avg_uas'=>0,'avg_akhir'=>0,'total_mapel'=>count($rows)];
        if($rows){
            $stats['avg_harian']=round(array_sum(array_column($rows,'nilai_harian'))/count($rows),1);
            $stats['avg_uts']=round(array_sum(array_column($rows,'nilai_uts'))/count($rows),1);
            $stats['avg_uas']=round(array_sum(array_column($rows,'nilai_uas'))/count($rows),1);
            $stats['avg_akhir']=round(array_sum(array_column($rows,'nilai_akhir'))/count($rows),1);
        }
        return ['data'=>$rows,'stats'=>$stats];
    }
    public function getPresensiData(int $siswa_id, ?string $bulan=null, ?string $tahun=null): array {
        $where='WHERE p.siswa_id=:id'; $p=[':id'=>$siswa_id];
        $thn=$tahun??date('Y'); $where.=' AND YEAR(p.tanggal)=:thn'; $p[':thn']=$thn;
        if($bulan){$where.=' AND MONTH(p.tanggal)=:bln';$p[':bln']=$bulan;}
        $rows=$this->q("SELECT * FROM presensi p $where ORDER BY p.tanggal DESC",$p)->fetchAll();
        $stats=['hadir'=>0,'sakit'=>0,'izin'=>0,'alpha'=>0,'terlambat'=>0,'total'=>count($rows)];
        foreach($rows as $r){$key=strtolower($r['status_kehadiran']);if(isset($stats[$key]))$stats[$key]++;}
        $persen=$stats['total']>0?round(($stats['hadir']+$stats['terlambat'])/$stats['total']*100,1):0;
        return['data'=>$rows,'statistik'=>$stats,'persentase_hadir'=>$persen];
    }
    public function getPembayaranSPP(int $siswa_id): array {
        $rows=$this->q("SELECT * FROM pembayaran_spp WHERE siswa_id=:id ORDER BY tahun DESC, bulan DESC",[':id'=>$siswa_id])->fetchAll();
        $stats=['total_bulan'=>count($rows),'lunas'=>0,'belum_bayar'=>0,'total_tagihan'=>0,'total_terbayar'=>0];
        foreach($rows as $r){
            if($r['status_pembayaran']==='Lunas'){$stats['lunas']++;$stats['total_terbayar']+=$r['jumlah'];}
            else{$stats['belum_bayar']++;}
            $stats['total_tagihan']+=$r['jumlah'];
        }
        return['data'=>$rows,'statistik'=>$stats];
    }
    public function getPengumuman(int $limit=10, int $offset=0): array {
        $total=(int)$this->q("SELECT COUNT(*) FROM pengumuman")->fetchColumn();
        $stmt=$this->db->prepare("SELECT id,judul,isi_pengumuman,kategori,tanggal_terbit,prioritas FROM pengumuman ORDER BY FIELD(prioritas,'Darurat','Tinggi','Sedang','Rendah'),tanggal_terbit DESC LIMIT :lim OFFSET :off");
        $stmt->bindValue(':lim',$limit,\PDO::PARAM_INT); $stmt->bindValue(':off',$offset,\PDO::PARAM_INT); $stmt->execute();
        return['data'=>$stmt->fetchAll(),'total'=>$total];
    }
    public function getKegiatanSekolah(int $limit=20, int $offset=0): array {
        $stmt=$this->db->prepare("SELECT * FROM kegiatan_sekolah ORDER BY tanggal_mulai DESC LIMIT :lim OFFSET :off");
        $stmt->bindValue(':lim',$limit,\PDO::PARAM_INT); $stmt->bindValue(':off',$offset,\PDO::PARAM_INT); $stmt->execute();
        return $stmt->fetchAll();
    }
    public function getKalenderAkademik(string $bulan, string $tahun): array {
        return $this->q("SELECT * FROM calendar_akademik WHERE MONTH(tanggal)=:bln AND YEAR(tanggal)=:thn ORDER BY tanggal ASC",[':bln'=>$bulan,':thn'=>$tahun])->fetchAll();
    }
    public function getBeasiswa(string $status='aktif'): array {
        return $this->q("SELECT * FROM beasiswa WHERE status=:s AND tanggal_penutupan>=CURDATE() ORDER BY tanggal_penutupan ASC",[':s'=>$status])->fetchAll();
    }
    public function getRapor(int $siswa_id): array {
        return $this->q("SELECT * FROM rapor WHERE siswa_id=:id ORDER BY tahun_ajaran DESC, semester ASC",[':id'=>$siswa_id])->fetchAll();
    }
    public function getJadwalPelajaran(int $kelas_id): array {
        return $this->q(
            "SELECT jp.*, mp.nama_mapel, mp.kode_mapel FROM jadwal_pelajaran jp LEFT JOIN mata_pelajaran mp ON jp.mata_pelajaran_id=mp.id WHERE jp.kelas_id=:kid ORDER BY FIELD(jp.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'),jp.jam_mulai ASC",
            [':kid'=>$kelas_id]
        )->fetchAll();
    }
}
?>
