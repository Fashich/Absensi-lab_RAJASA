import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  // Ambil notifikasi saat komponen dimuat dan secara berkala
  useEffect(() => {
    fetchNotifications();

    // Ambil notifikasi setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifikasi();
      if (response.data.success) {
        setNotifications(response.data.data.notifikasi || []);
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id = null) => {
    try {
      if (id) {
        await adminAPI.markNotifikasiRead(id);
        // Update local state
        setNotifications(prev => prev.map(notif =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        await adminAPI.markAllNotifikasiRead();
        // Update local state
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false); // Close user menu if open
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown') && !event.target.closest('.user-menu')) {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleUserMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false); // Close notifications if open
  };

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    {
      label: 'Manajemen',
      icon: 'fas fa-users-cog',
      submenu: [
        { path: '/manajemen/siswa', icon: 'fas fa-user-graduate', label: 'Data Siswa' },
        { path: '/manajemen/jurusan', icon: 'fas fa-building', label: 'Data Jurusan' },
        { path: '/manajemen/ruangan', icon: 'fas fa-door-open', label: 'Data Ruangan' },
      ]
    },
    {
      label: 'Presensi',
      icon: 'fas fa-clipboard-check',
      submenu: [
        { path: '/presensi', icon: 'fas fa-list', label: 'Data Presensi' },
        { path: '/presensi/realtime', icon: 'fas fa-broadcast-tower', label: 'Monitor Real-time' },
      ]
    },
    {
      label: 'Laporan',
      icon: 'fas fa-chart-bar',
      submenu: [
        { path: '/laporan/harian', icon: 'fas fa-calendar-day', label: 'Laporan Harian' },
        { path: '/laporan/bulanan', icon: 'fas fa-calendar-alt', label: 'Laporan Bulanan' },
        { path: '/laporan/log-akses', icon: 'fas fa-exclamation-triangle', label: 'Log Akses' },
      ]
    },
  ];

  // Menu khusus admin operator
  if (hasRole('admin_operator')) {
    menuItems.push({
      label: 'Admin',
      icon: 'fas fa-user-shield',
      submenu: [
        { path: '/admin/pengguna', icon: 'fas fa-users', label: 'Kelola Admin' },
        { path: '/admin/pengaturan', icon: 'fas fa-cog', label: 'Pengaturan' },
      ]
    });
  }

  return (
    <div className={`main-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <div className="brand-text">
              <h3>Absensi Lab</h3>
              <span>SMK Rajasa</span>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={index} className="nav-item">
              {item.submenu ? (
                <>
                  <div className="nav-group">
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </div>
                  <div className="nav-submenu">
                    {item.submenu.map((sub, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      >
                        <i className={sub.icon}></i>
                        <span>{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="header-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Cari..." />
          </div>

          <div className="header-actions">
            <div className="notification-dropdown">
              <button className="header-btn" onClick={toggleNotifications}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className="dropdown-menu notifications-menu">
                  <div className="dropdown-header">
                    <h4>Notifikasi</h4>
                    <span className="notification-count">{unreadCount} baru</span>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif, index) => (
                        <a
                          key={notif.id || index}
                          href={notif.link || '#'}
                          className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                          onClick={(e) => {
                            if (!notif.is_read) {
                              markAsRead(notif.id);
                              e.preventDefault(); // Prevent navigation if notif has no link
                            }
                          }}
                        >
                          <div className={`notification-icon ${notif.type === 'error' ? 'bg-error' :
                                            notif.type === 'warning' ? 'bg-warning' :
                                            notif.type === 'success' ? 'bg-success' : 'bg-primary'}`}>
                            <i className={`fas ${notif.icon || 'fa-bell'}`}></i>
                          </div>
                          <div className="notification-content">
                            <h5>{notif.title || 'Judul Notifikasi'}</h5>
                            <p>{notif.message || 'Deskripsi notifikasi'}</p>
                            <span className="notification-time">
                              {new Date(notif.created_at || new Date()).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="empty-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <p>Belum ada notifikasi</p>
                      </div>
                    )}
                  </div>
                  <div className="dropdown-footer">
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          markAsRead();
                        }}
                        className="mark-all-read-btn"
                      >
                        Tandai semua sudah dibaca
                      </button>
                    )}
                    <a href="/laporan/log-akses">Lihat Semua</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="user-menu" onClick={toggleUserMenu}>
            <div className="user-avatar">
              {user?.nama_lengkap?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nama_lengkap}</span>
              <span className="user-role">
                {user?.role === 'admin_operator' ? 'Admin Operator' : 'Admin Jurusan'}
              </span>
            </div>
            <div className="user-arrow">
              <i className={`fas ${userMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            
            {userMenuOpen && (
              <div className="dropdown-menu user-menu-dropdown">
                <div className="user-profile-info">
                  <div className="user-avatar-large">
                    {user?.nama_lengkap?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h4>{user?.nama_lengkap}</h4>
                    <p>{user?.role === 'admin_operator' ? 'Admin Operator' : 'Admin Jurusan'}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <NavLink to="/profil" className="dropdown-item">
                  <i className="fas fa-user"></i>
                  Profil Saya
                </NavLink>
                <NavLink to="/admin/pengaturan" className="dropdown-item">
                  <i className="fas fa-cog"></i>
                  Pengaturan
                </NavLink>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;