import React, { useState, useEffect } from 'react';
import { exportAPI, presensiAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './LaporanBulanan.css';

const LaporanBulanan = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalHadir: 0,
    totalTerlambat: 0,
    totalAlpha: 0,
    totalSakit: 0,
    totalIzin: 0
  });
  const [filters, setFilters] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    jurusan_id: ''
  });
  const [availableMonths, setAvailableMonths] = useState([]);

  // Daftar bulan dalam bahasa Indonesia
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Ambil data laporan
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Dapatkan data laporan bulanan
      const params = {
        type: 'monthly',
        month: filters.bulan,
        year: filters.tahun,
        jurusan_id: filters.jurusan_id
      };
      
      const response = await presensiAPI.getAll(params);
      
      if (response.data.success) {
        setReportData(response.data.data || []);
        
        // Hitung statistik
        const newStats = {
          totalHadir: 0,
          totalTerlambat: 0,
          totalAlpha: 0,
          totalSakit: 0,
          totalIzin: 0
        };
        
        response.data.data.forEach(item => {
          if (item.status === 'hadir') newStats.totalHadir++;
          else if (item.status === 'terlambat') newStats.totalTerlambat++;
          else if (item.status === 'alpha') newStats.totalAlpha++;
          else if (item.status === 'sakit') newStats.totalSakit++;
          else if (item.status === 'izin') newStats.totalIzin++;
        });
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    exportAPI.presensiCSV({
      type: 'monthly',
      month: filters.bulan,
      year: filters.tahun,
      jurusan_id: filters.jurusan_id
    });
  };

  return (
    <div className="laporan-bulanan">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Bulanan</h1>
          <p className="page-subtitle">Rekap data presensi bulanan per jurusan</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <i className="fas fa-calendar-alt"></i>
            <select 
              name="bulan" 
              value={filters.bulan} 
              onChange={handleFilterChange}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <i className="fas fa-calendar"></i>
            <input
              type="number"
              name="tahun"
              value={filters.tahun}
              onChange={handleFilterChange}
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>
          
          <div className="filter-group">
            <i className="fas fa-building"></i>
            <select 
              name="jurusan_id" 
              value={filters.jurusan_id} 
              onChange={handleFilterChange}
            >
              <option value="">Semua Jurusan</option>
              <option value="1">Teknik Komputer dan Jaringan (TKJ)</option>
              <option value="2">Rekayasa Perangkat Lunak (RPL)</option>
              <option value="3">Multimedia (MM)</option>
              <option value="4">Otomatisasi dan Tata Kelola Perkantoran (OTKP)</option>
              <option value="5">Akuntansi dan Keuangan Lembaga (AKL)</option>
            </select>
          </div>
          
          <div className="filter-group">
            <button className="btn btn-primary" onClick={handleExport}>
              <i className="fas fa-file-export"></i>
              Ekspor ke CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card bg-blue">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalHadir}</h3>
            <p>Hadir</p>
          </div>
        </div>
        
        <div className="stat-card bg-yellow">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalTerlambat}</h3>
            <p>Terlambat</p>
          </div>
        </div>
        
        <div className="stat-card bg-red">
          <div className="stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalAlpha}</h3>
            <p>Alpha</p>
          </div>
        </div>
        
        <div className="stat-card bg-green">
          <div className="stat-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalSakit}</h3>
            <p>Sakit</p>
          </div>
        </div>
        
        <div className="stat-card bg-purple">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalIzin}</h3>
            <p>Izin</p>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="table-card">
        {loading ? (
          <Loading />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NISN</th>
                  <th>Nama</th>
                  <th>Jurusan</th>
                  <th>Ruangan</th>
                  <th>Tanggal</th>
                  <th>Waktu Masuk</th>
                  <th>Waktu Keluar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.nisn}</td>
                      <td>{item.nama_lengkap}</td>
                      <td>{item.kode_jurusan}</td>
                      <td>{item.kode_ruangan}</td>
                      <td>{item.tanggal}</td>
                      <td>{item.waktu_masuk}</td>
                      <td>{item.waktu_keluar || '-'}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'hadir' ? 'badge-success' :
                          item.status === 'terlambat' ? 'badge-warning' :
                          item.status === 'alpha' ? 'badge-error' :
                          item.status === 'sakit' ? 'badge-info' :
                          item.status === 'izin' ? 'badge-info' : 'badge-default'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <div className="empty-table">
                        <i className="fas fa-inbox"></i>
                        <p>Data tidak ditemukan untuk periode yang dipilih</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanBulanan;