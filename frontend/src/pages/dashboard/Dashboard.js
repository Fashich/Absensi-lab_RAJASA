import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [presensiTerbaru, setPresensiTerbaru] = useState([]);
  const [statistikJurusan, setStatistikJurusan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      
      if (response.data.success) {
        setStats(response.data.data.stats);
        setPresensiTerbaru(response.data.data.presensi_terbaru);
        setStatistikJurusan(response.data.data.statistik_jurusan);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
  };

  const getStatusBadge = (status) => {
    const badges = {
      hadir: { class: 'badge-success', label: 'Hadir' },
      terlambat: { class: 'badge-warning', label: 'Terlambat' },
      sakit: { class: 'badge-info', label: 'Sakit' },
      izin: { class: 'badge-info', label: 'Izin' },
      alpha: { class: 'badge-error', label: 'Alpha' }
    };
    
    const badge = badges[status] || { class: 'badge-info', label: status };
    
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{formatTanggal(new Date())}</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_siswa || 0}</h3>
            <p>Total Siswa</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_hadir_hari_ini || 0}</h3>
            <p>Hadir Hari Ini</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-warning">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_tidak_hadir_hari_ini || 0}</h3>
            <p>Tidak Hadir</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-error">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_log_akses_hari_ini || 0}</h3>
            <p>Log Akses Invalid</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-secondary">
            <i className="fas fa-door-open"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_ruangan_aktif || 0}</h3>
            <p>Ruangan Aktif</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Presensi Terbaru */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-clock"></i>
              Presensi Terbaru
            </h3>
            <a href="/presensi" className="view-all">Lihat Semua</a>
          </div>
          <div className="card-body">
            {presensiTerbaru.length > 0 ? (
              <div className="recent-list">
                {presensiTerbaru.map((item, index) => (
                  <div key={index} className="recent-item">
                    <div className="recent-avatar">
                      {item.nama_lengkap.charAt(0)}
                    </div>
                    <div className="recent-info">
                      <h4>{item.nama_lengkap}</h4>
                      <p>{item.kelas} {item.rombel} • {item.nama_jurusan}</p>
                    </div>
                    <div className="recent-meta">
                      {getStatusBadge(item.status)}
                      <span className="recent-time">{item.waktu_masuk}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Belum ada presensi hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistik Per Jurusan */}
        {statistikJurusan.length > 0 && (
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <i className="fas fa-chart-pie"></i>
                Statistik Per Jurusan
              </h3>
            </div>
            <div className="card-body">
              <div className="jurusan-stats">
                {statistikJurusan.map((jurusan, index) => (
                  <div key={index} className="jurusan-stat-item">
                    <div className="jurusan-info">
                      <span className="jurusan-kode">{jurusan.kode_jurusan}</span>
                      <span className="jurusan-nama">{jurusan.nama_jurusan}</span>
                    </div>
                    <div className="jurusan-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${jurusan.total_siswa > 0 ? (jurusan.hadir_hari_ini / jurusan.total_siswa) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {jurusan.hadir_hari_ini}/{jurusan.total_siswa}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="actions-grid">
          <a href="/manajemen/siswa/tambah" className="action-card">
            <div className="action-icon bg-primary">
              <i className="fas fa-user-plus"></i>
            </div>
            <span>Tambah Siswa</span>
          </a>
          <a href="/presensi" className="action-card">
            <div className="action-icon bg-success">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <span>Lihat Presensi</span>
          </a>
          <a href="/laporan/harian" className="action-card">
            <div className="action-icon bg-warning">
              <i className="fas fa-file-export"></i>
            </div>
            <span>Export Laporan</span>
          </a>
          <a href="/laporan/log-akses" className="action-card">
            <div className="action-icon bg-error">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span>Log Akses</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
