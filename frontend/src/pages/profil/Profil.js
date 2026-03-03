import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Profil.css';

const Profil = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        username: user.username || '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update profile
      const response = await authAPI.updateProfile({
        nama_lengkap: formData.nama_lengkap,
        username: formData.username
      });
      
      if (response.data.success) {
        updateUserProfile(response.data.user);
        setMessage('Profil berhasil diperbarui');
        setTimeout(() => {
          setMessage('');
          setIsEditing(false);
        }, 3000);
      } else {
        setError(response.data.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    
    try {
      const response = await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response.data.success) {
        setMessage('Password berhasil diubah');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_new_password: ''
        });
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setError(response.data.message || 'Gagal mengganti password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengganti password');
    }
  };

  return (
    <div className="profil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Kelola informasi akun Anda</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="profil-container">
        <div className="profil-card">
          <div className="profil-header">
            <div className="profil-avatar">
              {user?.nama_lengkap?.charAt(0).toUpperCase()}
            </div>
            <div className="profil-basic-info">
              <h2>{formData.nama_lengkap}</h2>
              <p className="profil-role">
                {user?.role === 'admin_operator' ? 'Admin Operator' : 'Admin Jurusan'}
              </p>
              <p className="profil-username">@{formData.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profil-form">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit"></i>
                  Edit Profil
                </button>
              ) : (
                <>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i>
                    Simpan
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        nama_lengkap: user?.nama_lengkap || '',
                        username: user?.username || '',
                        role: user?.role || ''
                      });
                    }}
                  >
                    Batal
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        <div className="password-card">
          <h3 className="card-title">Ubah Password</h3>
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label>Password Saat Ini</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password Baru</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <input
                type="password"
                name="confirm_new_password"
                value={passwordData.confirm_new_password}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="fas fa-key"></i>
              Ganti Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profil;