import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './AdminList.css';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  // Function to fetch real activity logs from API
  const fetchActivityLogs = useCallback(async () => {
    try {
      // Fetch from the new API endpoint
      const response = await adminAPI.getActivityLogs({ limit: 5 });
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await adminAPI.getAll();
      if (response.data.success) {
        // Add online status based on last activity
        const adminsWithStatus = response.data.data.map(admin => ({
          ...admin,
          isOnline: admin.last_login ? checkIfOnline(admin.last_login) : false
        }));
        setAdmins(adminsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchActivityLogs();
  }, [fetchAdmins, fetchActivityLogs]);

  const checkIfOnline = (lastLogin) => {
    // Consider user online if last activity was within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastLogin) > fiveMinutesAgo;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin_operator: { class: 'badge-primary', label: 'Admin Operator' },
      admin_jurusan: { class: 'badge-info', label: 'Admin Jurusan' }
    };
    
    const badge = badges[role] || { class: 'badge-info', label: role };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const getStatusBadge = (isOnline) => {
    return (
      <span className={`badge ${isOnline ? 'badge-success' : 'badge-secondary'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="admin-list">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Admin</h1>
          <p className="page-subtitle">Daftar pengguna admin sistem</p>
        </div>
        <Link to="/admin/pengguna/tambah" className="btn btn-primary">
          <i className="fas fa-plus"></i>
          Tambah Admin
        </Link>
      </div>

      <div className="activity-log-section">
        <h3><i className="fas fa-history"></i> Log Aktivitas Terbaru</h3>
        <div className="activity-log-list">
          {activities.length > 0 ? (
            activities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-user">{activity.user || 'System'}</div>
                <div className="activity-desc">{activity.activity_description || activity.activity_type}</div>
                <div className="activity-time">
                  {Math.floor((Date.now() - new Date(activity.created_at).getTime()) / 60000)} menit yang lalu
                </div>
              </div>
            ))
          ) : (
            <p>Belum ada aktivitas terbaru</p>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Role</th>
                <th>Jurusan</th>
                <th>Status Online</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.username}</td>
                    <td>{admin.nama_lengkap}</td>
                    <td>{getRoleBadge(admin.role)}</td>
                    <td>{admin.nama_jurusan || '-'}</td>
                    <td>{getStatusBadge(admin.isOnline)}</td>
                    <td>
                      <span className={`badge ${admin.status === 'aktif' ? 'badge-success' : 'badge-error'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td>{admin.last_login ? new Date(admin.last_login).toLocaleString('id-ID') : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-table">
                      <i className="fas fa-users"></i>
                      <p>Tidak ada data admin</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminList;