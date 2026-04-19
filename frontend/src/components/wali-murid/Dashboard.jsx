import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaGraduationCap, FaChartBar, FaCalendarAlt, 
  FaUser, FaFolderOpen, FaBook, FaMoneyBillWave, 
  FaTrophy, FaClipboardList, FaBell, FaEnvelope, 
  FaBars, FaTimes, FaSignOutAlt, FaSchool 
} from 'react-icons/fa';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMainMenu, setActiveMainMenu] = useState('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract student ID from URL params or state
  const extractStudentId = () => {
    const pathParts = location.pathname.split('/');
    const studentIdIndex = pathParts.indexOf('wali-murid') + 2;
    return pathParts[studentIdIndex] || '1'; // Default to '1' if not found
  };
  
  const studentId = extractStudentId();

  // Menu configuration based on active main menu
  const getMenuItems = () => {
    switch(activeMainMenu) {
      case 'beranda':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: `/wali-murid/beranda/dashboard/${studentId}` },
          { id: 'data-siswa', label: 'Data Siswa', icon: <FaUser />, path: `/wali-murid/beranda/data-siswa/${studentId}` },
          { id: 'jurusan', label: 'Jurusan', icon: <FaGraduationCap />, path: `/wali-murid/beranda/jurusan/${studentId}` },
          { id: 'kelas', label: 'Kelas', icon: <FaFolderOpen />, path: `/wali-murid/beranda/kelas/${studentId}` },
          { id: 'laporan-siswa', label: 'Laporan Siswa', icon: <FaChartBar />, path: `/wali-murid/beranda/laporan-siswa/${studentId}` },
          { id: 'status-siswa', label: 'Status Siswa', icon: <FaClipboardList />, path: `/wali-murid/beranda/status-siswa/${studentId}` },
          { id: 'kegiatan-akademik', label: 'Kegiatan Akademik', icon: <FaBook />, path: `/wali-murid/beranda/kegiatan-akademik/${studentId}` },
          { id: 'laporan-kehadiran', label: 'Laporan Kehadiran', icon: <FaCalendarAlt />, path: `/wali-murid/beranda/laporan-kehadiran/${studentId}` },
          { id: 'pengumuman-sekolah', label: 'Pengumuman Sekolah', icon: <FaBell />, path: `/wali-murid/beranda/pengumuman-sekolah/${studentId}` },
          { id: 'prestasi-siswa', label: 'Prestasi Siswa', icon: <FaTrophy />, path: `/wali-murid/beranda/prestasi-siswa/${studentId}` },
        ];
      case 'akademik':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: `/wali-murid/akademik/dashboard/${studentId}` },
          { id: 'pembelajaran-siswa', label: 'Pembelajaran Siswa', icon: <FaBook />, path: `/wali-murid/akademik/pembelajaran-siswa/${studentId}` },
          { id: 'nilai-akademik', label: 'Nilai Akademik', icon: <FaGraduationCap />, path: `/wali-murid/akademik/nilai-akademik/${studentId}` },
          { id: 'jadwal-akademik', label: 'Jadwal Akademik', icon: <FaCalendarAlt />, path: `/wali-murid/akademik/jadwal-akademik/${studentId}` },
          { id: 'laporan-akademik', label: 'Laporan Akademik', icon: <FaFolderOpen />, path: `/wali-murid/akademik/laporan-akademik/${studentId}` },
          { id: 'penilaian-praktek', label: 'Penilaian Praktek', icon: <FaClipboardList />, path: `/wali-murid/akademik/penilaian-praktek/${studentId}` },
          { id: 'jadwal-praktek', label: 'Jadwal Praktek', icon: <FaCalendarAlt />, path: `/wali-murid/akademik/jadwal-praktek/${studentId}` },
          { id: 'ranking-siswa', label: 'Ranking Siswa', icon: <FaChartBar />, path: `/wali-murid/akademik/ranking-siswa/${studentId}` },
          { id: 'jurusan', label: 'Jurusan', icon: <FaGraduationCap />, path: `/wali-murid/akademik/jurusan/${studentId}` },
          { id: 'kelas', label: 'Kelas', icon: <FaFolderOpen />, path: `/wali-murid/akademik/kelas/${studentId}` },
          { id: 'kalender-akademik', label: 'Kalender Akademik', icon: <FaCalendarAlt />, path: `/wali-murid/akademik/kalender-akademik/${studentId}` },
          { id: 'beasiswa', label: 'Beasiswa', icon: <FaMoneyBillWave />, path: `/wali-murid/akademik/beasiswa/${studentId}` },
        ];
      case 'rekapan':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: `/wali-murid/rekapan/dashboard/${studentId}` },
          { id: 'presensi-siswa', label: 'Presensi Siswa', icon: <FaCalendarAlt />, path: `/wali-murid/rekapan/presensi-siswa/${studentId}` },
          { id: 'skoring-siswa', label: 'Skoring Siswa', icon: <FaChartBar />, path: `/wali-murid/rekapan/skoring-siswa/${studentId}` },
          { id: 'rapor-siswa', label: 'Rapor Siswa', icon: <FaFolderOpen />, path: `/wali-murid/rekapan/rapor-siswa/${studentId}` },
          { id: 'catatan-harian', label: 'Catatan Harian', icon: <FaClipboardList />, path: `/wali-murid/rekapan/catatan-harian/${studentId}` },
          { id: 'penilaian-siswa', label: 'Penilaian Siswa', icon: <FaClipboardList />, path: `/wali-murid/rekapan/penilaian-siswa/${studentId}` },
        ];
      case 'layanan':
      case 'kalender':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: `/wali-murid/layanan/dashboard/${studentId}` },
          { id: 'pembayaran-spp', label: 'Pembayaran SPP', icon: <FaMoneyBillWave />, path: `/wali-murid/layanan/pembayaran-spp/${studentId}` },
          { id: 'informasi-sekolah', label: 'Informasi Sekolah', icon: <FaSchool />, path: `/wali-murid/layanan/informasi-sekolah/${studentId}` },
          { id: 'daftar-ulang-sekolah', label: 'Daftar Ulang Sekolah', icon: <FaUser />, path: `/wali-murid/layanan/daftar-ulang-sekolah/${studentId}` },
          { id: 'layanan-akademik', label: 'Layanan Akademik', icon: <FaBook />, path: `/wali-murid/layanan/layanan-akademik/${studentId}` },
          { id: 'lainnya', label: 'Lainnya', icon: <FaEnvelope />, path: `/wali-murid/layanan/lainnya/${studentId}` },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  // Determine active submenu item based on current path
  const getActiveSubmenuId = () => {
    const currentPath = location.pathname;
    const item = menuItems.find(item => currentPath.includes(item.id));
    return item ? item.id : 'dashboard';
  };

  const activeSubmenuId = getActiveSubmenuId();

  // Auto-set main menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/wali-murid/beranda')) {
      setActiveMainMenu('beranda');
    } else if (path.includes('/wali-murid/akademik')) {
      setActiveMainMenu('akademik');
    } else if (path.includes('/wali-murid/rekapan')) {
      setActiveMainMenu('rekapan');
    } else if (path.includes('/wali-murid/layanan') || path.includes('/wali-murid/kalender')) {
      setActiveMainMenu('layanan');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Navigate back to parent access page
    navigate('/wali-murid');
  };

  return (
    <div className="wali-murid-dashboard">
      {/* Mobile menu toggle button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          className="bg-blue-600 text-white p-2 rounded-md shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-slate-800 text-white transition-all duration-300 z-40
          ${mobileMenuOpen ? 'translate-x-0 w-64' : sidebarCollapsed ? 'w-20' : 'w-72'}
          ${window.innerWidth < 768 ? 'h-[calc(100vh-5rem)]' : 'h-screen'}`}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          {!sidebarCollapsed && !mobileMenuOpen && (
            <div>
              <h1 className="text-xl font-bold">Portal Wali Murid</h1>
              <p className="text-sm text-slate-300">SMK RAJASA SURABAYA</p>
            </div>
          )}
          <button 
            className="text-white ml-auto"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {/* Main menu navigation */}
        <nav className="mt-4">
          <ul>
            {[
              { id: 'beranda', label: 'Beranda', icon: <FaHome /> },
              { id: 'akademik', label: 'Akademik', icon: <FaGraduationCap /> },
              { id: 'rekapan', label: 'Rekapan Siswa', icon: <FaChartBar /> },
              { id: 'layanan', label: 'Layanan Sekolah', icon: <FaSchool /> },
              { id: 'kalender', label: 'Kalender Akademik', icon: <FaCalendarAlt /> },
            ].map(menu => (
              <li key={menu.id}>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
                    activeMainMenu === menu.id 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-700 text-slate-200'
                  }`}
                  onClick={() => {
                    setActiveMainMenu(menu.id);
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                >
                  <span className="text-lg">{menu.icon}</span>
                  {!sidebarCollapsed && !mobileMenuOpen && <span>{menu.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Submenu based on main menu selection */}
        <nav className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <h3 className="px-4 py-2 text-xs uppercase tracking-wider text-slate-400">
            {!sidebarCollapsed && !mobileMenuOpen && 'Menu ' + 
              (activeMainMenu === 'beranda' ? 'Beranda' : 
               activeMainMenu === 'akademik' ? 'Akademik' : 
               activeMainMenu === 'rekapan' ? 'Rekapan' : 
               'Layanan')}
          </h3>
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition-colors ${
                    activeSubmenuId === item.id 
                      ? 'bg-blue-700 text-white' 
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                >
                  <span>{item.icon}</span>
                  {!sidebarCollapsed && !mobileMenuOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <button
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-900/30 rounded-md transition-colors"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3" />
            {!sidebarCollapsed && !mobileMenuOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 
          mobileMenuOpen ? 'ml-0' : 
          'ml-72'
        } ${window.innerWidth < 768 ? 'pt-16' : 'pt-4'}`}
      >
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;