import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './AdminList.css';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getAll();
      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin_operator: { class: 'badge-primary', label: 'Admin Operator' },
      admin_jurusan: { class: 'badge-info', label: 'Admin Jurusan' }
    };
    
    const badge = badges[role] || { class: 'badge-info', label: role };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
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
                    <td>
                      <span className={`badge ${admin.status === 'aktif' ? 'badge-success' : 'badge-error'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td>{admin.last_login || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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
