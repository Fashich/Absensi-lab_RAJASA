import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './LogNotifikasi.css';

const LogNotifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotificationHistory();
      if (response.data.success) {
        setNotifications(response.data.data.notifikasi || []);
      }
    } catch (err) {
      setError('Gagal memuat histori notifikasi. Silakan coba lagi nanti.');
      console.error('Error fetching notification history:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminAPI.markNotifikasiRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await adminAPI.deleteNotifikasi(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="log-notifikasi-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="log-notifikasi-container">
      <div className="log-notifikasi-header">
        <h2>Riwayat Notifikasi</h2>
        <p>Daftar semua notifikasi yang pernah diterima</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat histori notifikasi...</p>
        </div>
      ) : (
        <div className="log-notifikasi-content">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                  <div className={`notification-icon ${notif.tipe === 'error' ? 'bg-error' :
                                  notif.tipe === 'warning' ? 'bg-warning' :
                                  notif.tipe === 'success' ? 'bg-success' : 'bg-primary'}`}>
                    <i className={`fas ${getNotificationIcon(notif.tipe)}`}></i>
                  </div>
                  <div className="notification-content">
                    <h5>{notif.judul}</h5>
                    <p>{notif.pesan}</p>
                    <div className="notification-meta">
                      <span className="notification-time">{formatDate(notif.created_at)}</span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notif.is_read && (
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => markAsRead(notif.id)}
                      >
                        Tandai Sudah Dibaca
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => deleteNotification(notif.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-bell-slash"></i>
              <h3>Belum Ada Notifikasi</h3>
              <p>Belum ada notifikasi dalam histori Anda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get notification icon based on type
const getNotificationIcon = (type) => {
  switch(type) {
    case 'error':
      return 'fa-exclamation-circle';
    case 'warning':
      return 'fa-exclamation-triangle';
    case 'success':
      return 'fa-check-circle';
    case 'info':
    default:
      return 'fa-info-circle';
  }
};

export default LogNotifikasi;