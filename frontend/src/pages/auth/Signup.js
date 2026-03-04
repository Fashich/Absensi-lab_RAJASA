import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    email: '',
    no_telp: '',
    role: 'admin_jurusan',
    jurusan_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/signup.php', formData);

      if (response.data.success) {
        // Login user setelah signup berhasil
        login(response.data.data.user, response.data.data.token);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Gagal mendaftar');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <h2>Buat Akun Baru</h2>
          <p>Masukkan data untuk mendaftar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nama_lengkap">Nama Lengkap</label>
            <input
              type="text"
              id="nama_lengkap"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Opsional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="no_telp">No. Telepon (Opsional)</label>
            <input
              type="tel"
              id="no_telp"
              name="no_telp"
              value={formData.no_telp}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Peran</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="admin_jurusan">Admin Jurusan</option>
              <option value="admin_operator">Admin Operator</option>
            </select>
          </div>

          {formData.role === 'admin_jurusan' && (
            <div className="form-group">
              <label htmlFor="jurusan_id">Jurusan</label>
              <select
                id="jurusan_id"
                name="jurusan_id"
                value={formData.jurusan_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Pilih Jurusan</option>
                <option value="1">Teknik Komputer dan Jaringan (TKJ)</option>
                <option value="2">Teknik Elektronika Industri (Listrik)</option>
                <option value="3">Teknik Mesin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;