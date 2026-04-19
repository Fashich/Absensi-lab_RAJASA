import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    
    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Selamat Datang</h2>
        <p>Silakan login untuk mengakses sistem</p>
      </div>

      {error && (
        <div className="login-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-user"></i>
            Username
          </label>
          <input
            type="text"
            name="username"
            className="form-input"
            placeholder="Masukkan username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-lock"></i>
            Password
          </label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="Masukkan password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Ingat saya</span>
          </label>
          <button type="button" className="forgot-password" onClick={(e) => {
            e.preventDefault();
            // Handle forgot password functionality here
          }}>Lupa password?</button>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-login"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loading size="small" text="" />
              <span>Memuat...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <i className="fas fa-arrow-right"></i>
            </>
          )}
        </button>
      </form>

      {/* Tombol untuk wali murid */}
      <div className="wali-murid-button">
        <button 
          type="button" 
          className="btn btn-secondary btn-wali-murid"
          onClick={() => window.location.href = '/wali-murid/beranda/dashboard'}
        >
          <span>Masuk sebagai Wali Murid</span>
        </button>
      </div>

      {/* Bagian tambahan untuk tautan signup */}
      <div className="login-signup-link">
        <p>Belum punya akun? <a href="/signup">Daftar di sini</a></p>
      </div>

      <div className="login-demo">
        <p>Akun Demo:</p>
        <div className="demo-accounts">
          <div className="demo-account">
            <span className="demo-role">Admin Operator</span>
            <code>admin / admin123</code>
          </div>
          <div className="demo-account">
            <span className="demo-role">Admin Jurusan</span>
            <code>admintkj / admin123</code>
          </div>
        </div>
      </div>

      <div className="login-footer">
        <p>© 2024 SMK Rajasa Surabaya. All rights reserved.</p>
        <p>Tim Magang TKJ</p>
      </div>
    </div>
  );
};

export default Login;