import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHeader, setActiveHeader] = useState('beranda');
  const [showAddress, setShowAddress] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Deteksi header aktif dari URL
  useEffect(() => {
    const parts = location.pathname.split('/');
    const section = parts[2]; // /wali-murid/{section}/...
    if (section && ['beranda', 'akademik', 'rekapan', 'kalender'].includes(section)) {
      setActiveHeader(section);
    }
  }, [location.pathname]);

  const headerMenus = [
    { id: 'beranda',   label: 'Beranda',          icon: '🏠' },
    { id: 'akademik',  label: 'Akademik',          icon: '📚' },
    { id: 'rekapan',   label: 'Rekapan Siswa',     icon: '👥' },
    { id: 'kalender',  label: 'Kalender Akademik', icon: '📅' },
  ];

  const sidebarMenus = {
    beranda: [
      { id: 'dashboard',          label: 'Dashboard',           path: '/wali-murid/beranda/dashboard',          icon: '📊' },
      { id: 'data-siswa',         label: 'Data Siswa',          path: '/wali-murid/beranda/data-siswa',         icon: '👤' },
      { id: 'jurusan',            label: 'Jurusan',             path: '/wali-murid/beranda/jurusan',            icon: '🏫' },
      { id: 'kelas',              label: 'Kelas',               path: '/wali-murid/beranda/kelas',              icon: '🚪' },
      { id: 'laporan-siswa',      label: 'Laporan Siswa',       path: '/wali-murid/beranda/laporan-siswa',      icon: '📋' },
      { id: 'status-siswa',       label: 'Status Siswa',        path: '/wali-murid/beranda/status-siswa',       icon: '✅' },
      { id: 'kegiatan-akademik',  label: 'Kegiatan Akademik',   path: '/wali-murid/beranda/kegiatan-akademik',  icon: '🎯' },
      { id: 'laporan-kehadiran',  label: 'Laporan Kehadiran',   path: '/wali-murid/beranda/laporan-kehadiran',  icon: '📈' },
      { id: 'pengumuman-sekolah', label: 'Pengumuman Sekolah',  path: '/wali-murid/beranda/pengumuman-sekolah', icon: '📢' },
      { id: 'prestasi-siswa',     label: 'Prestasi Siswa',      path: '/wali-murid/beranda/prestasi-siswa',     icon: '🏆' },
      { id: 'ekskul',             label: 'Ekstrakurikuler',     path: '/wali-murid/beranda/ekskul',             icon: '⚽' },
    ],
    akademik: [
      { id: 'dashboard',            label: 'Dashboard',              path: '/wali-murid/akademik/dashboard',            icon: '📊' },
      { id: 'pembelajaran-siswa',   label: 'Pembelajaran Siswa',     path: '/wali-murid/akademik/pembelajaran-siswa',   icon: '📖' },
      { id: 'nilai-akademik',       label: 'Nilai Akademik',         path: '/wali-murid/akademik/nilai-akademik',       icon: '📝' },
      { id: 'jadwal-akademik',      label: 'Jadwal Akademik',        path: '/wali-murid/akademik/jadwal-akademik',      icon: '🗓️' },
      { id: 'laporan-akademik',     label: 'Laporan Akademik',       path: '/wali-murid/akademik/laporan-akademik',     icon: '📋' },
      { id: 'penilaian-praktek',    label: 'Penilaian Praktek Siswa',path: '/wali-murid/akademik/penilaian-praktek',    icon: '🔬' },
      { id: 'jadwal-praktek',       label: 'Jadwal Praktek',         path: '/wali-murid/akademik/jadwal-praktek',       icon: '⏰' },
      { id: 'ranking-siswa',        label: 'Ranking Siswa',          path: '/wali-murid/akademik/ranking-siswa',        icon: '🏅' },
      { id: 'jurusan-kelas',        label: 'Jurusan dan Kelas',      path: '/wali-murid/akademik/jurusan-kelas',        icon: '🏫' },
      { id: 'kalender-akademik',    label: 'Kalender Akademik',      path: '/wali-murid/akademik/kalender-akademik',    icon: '📅' },
      { id: 'beasiswa',             label: 'Beasiswa',               path: '/wali-murid/akademik/beasiswa',             icon: '💰' },
      { id: 'remedial',             label: 'Remedial',               path: '/wali-murid/akademik/remedial',             icon: '📌' },
    ],
    rekapan: [
      { id: 'dashboard',       label: 'Dashboard',        path: '/wali-murid/rekapan/dashboard',       icon: '📊' },
      { id: 'presensi-siswa',  label: 'Presensi Siswa',   path: '/wali-murid/rekapan/presensi-siswa',  icon: '✅' },
      { id: 'skoring-siswa',   label: 'Skoring Siswa',    path: '/wali-murid/rekapan/skoring-siswa',   icon: '⭐' },
      { id: 'rapor-siswa',     label: 'Rapor Siswa',      path: '/wali-murid/rekapan/rapor-siswa',     icon: '📄' },
      { id: 'catatan-harian',  label: 'Catatan Harian',   path: '/wali-murid/rekapan/catatan-harian',  icon: '📓' },
      { id: 'penilaian-siswa', label: 'Penilaian Siswa',  path: '/wali-murid/rekapan/penilaian-siswa', icon: '📝' },
      { id: 'peringatan',      label: 'Peringatan Siswa', path: '/wali-murid/rekapan/peringatan',      icon: '⚠️' },
    ],
    kalender: [
      { id: 'dashboard',        label: 'Dashboard',           path: '/wali-murid/kalender/dashboard',        icon: '📊' },
      { id: 'pembayaran-spp',   label: 'Pembayaran SPP',      path: '/wali-murid/kalender/pembayaran-spp',   icon: '💳' },
      { id: 'informasi-sekolah',label: 'Informasi Sekolah',   path: '/wali-murid/kalender/informasi-sekolah',icon: '🏫' },
      { id: 'daftar-ulang',     label: 'Daftar Ulang Sekolah',path: '/wali-murid/kalender/daftar-ulang',     icon: '📋' },
      { id: 'layanan-akademik', label: 'Layanan Akademik',    path: '/wali-murid/kalender/layanan-akademik', icon: '🎓' },
      { id: 'lainnya',          label: 'Lainnya',             path: '/wali-murid/kalender/lainnya',          icon: '➕' },
    ],
  };

  const handleHeaderClick = (menuId) => {
    setActiveHeader(menuId);
    navigate(`/wali-murid/${menuId}/dashboard`);
  };

  const handleSidebarClick = (path) => {
    navigate(path);
  };

  const currentSidebar = sidebarMenus[activeHeader] || sidebarMenus.beranda;

  return (
    <div className={`wm-layout ${darkMode ? 'wm-dark' : 'wm-light'}`}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="wm-sidebar">
        {/* Logo + Nama Sekolah */}
        <div className="wm-sidebar-brand">
          <img
            src="/images/logo/rajasa-logo.png"
            alt="SMK Rajasa"
            className="wm-logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="wm-school-info">
            <span className="wm-school-name">SMK RAJASA SURABAYA</span>
            <span className="wm-address-short">
              Jl. Genteng Kali No.27, Genteng, Kec. Genteng.{' '}
              <button
                className="wm-address-toggle"
                onClick={() => setShowAddress(!showAddress)}
              >
                {showAddress ? 'Click to hide...' : 'Click to show more...'}
              </button>
            </span>
            {showAddress && (
              <span className="wm-address-full">
                Jl. Genteng Kali No.27, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275, Indonesia
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="wm-sidebar-nav">
          {currentSidebar.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                className={`wm-sidebar-item ${isActive ? 'wm-sidebar-item--active' : ''}`}
                onClick={() => handleSidebarClick(item.path)}
              >
                <span className="wm-sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────── */}
      <div className="wm-main">

        {/* TOP HEADER */}
        <header className="wm-header">
          {/* Header Navigation */}
          <nav className="wm-header-nav">
            {headerMenus.map((menu) => (
              <button
                key={menu.id}
                className={`wm-header-btn ${activeHeader === menu.id ? 'wm-header-btn--active' : ''}`}
                onClick={() => handleHeaderClick(menu.id)}
              >
                <span className="wm-header-icon">{menu.icon}</span>
                <span>{menu.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="wm-header-right">
            {/* Dark mode toggle */}
            <button
              className="wm-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark/light mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notification */}
            <button className="wm-icon-btn wm-notif-btn" title="Notifikasi">
              🔔
              <span className="wm-notif-badge">3</span>
            </button>

            {/* User Profile */}
            <div className="wm-user-profile">
              <div className="wm-avatar">W</div>
              <div className="wm-user-info">
                <span className="wm-user-name">Orang Tua</span>
                <span className="wm-user-role">Wali Murid</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="wm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;