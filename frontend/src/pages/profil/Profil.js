import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import axios from 'axios';
import './Profil.css';

const Profil = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
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
      
      // Set image preview if user has existing profile picture
      if (user.foto_profile) {
        setImagePreview(`${process.env.REACT_APP_API_BASE_URL}/uploads/foto_profil/${user.foto_profile}`);
      } else {
        setImagePreview(null);
      }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const validateAndSetImage = (file) => {
    // Validate file type
    if (!file.type.match('image/jpeg|image/jpg|image/png|image/gif')) {
      setError('Hanya file JPG, PNG, dan GIF yang diperbolehkan');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file tidak boleh lebih dari 5MB');
      return;
    }
    
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update profile
      const profileData = {
        nama_lengkap: formData.nama_lengkap,
        username: formData.username
      };

      // Upload image if selected
      if (profileImage) {
        const imageData = new FormData();
        imageData.append('foto_profil', profileImage);
        // First upload the image
        const imageResponse = await authAPI.uploadFotoProfil(imageData);
        
        if (imageResponse.data.success) {
          profileData.foto_profile = imageResponse.data.filename;
        } else {
          setError(imageResponse.data.message || 'Gagal mengunggah foto profil');
          return;
        }
      }

      console.log("Sending profile data:", profileData); // Debug logging
      
      const response = await authAPI.updateProfile(profileData);
      console.log("Full API response:", response); // Debug logging
      
      // Check if response contains expected data structure
      if (response && response.data && response.data.success) {
        // The response structure from backend should be: { success: true, message: "...", data: { user: {...}, token: "..." } }
        if (response.data.data) {
          // Update user profile in context with new data and token
          if (response.data.data.user) {
            updateUserProfile(response.data.data.user);
          }
          
          // Update token in localStorage and API defaults
          if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
          } else {
            // If token is not in response, get it from localStorage
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
            }
          }
          
          setMessage('Profil berhasil diperbarui');
          setTimeout(() => {
            setMessage('');
            setIsEditing(false);
            setProfileImage(null);
          }, 3000);
        } else {
          // Fallback: if the response has user and token at the top level (not nested in data)
          console.warn("Response structure unexpected, trying fallback approach...");
          
          if (response.data.user) {
            // Update user profile in context
            updateUserProfile(response.data.user);
            
            // Try to get token from response or localStorage
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            } else {
              const currentToken = localStorage.getItem('token');
              if (currentToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
              }
            }
            
            setMessage('Profil berhasil diperbarui');
            setTimeout(() => {
              setMessage('');
              setIsEditing(false);
              setProfileImage(null);
            }, 3000);
          } else {
            console.error("Response structure:", response.data);
            setError('Struktur respons API tidak sesuai. Hubungi administrator.');
          }
        }
      } else {
        // Handle error response
        const errorMessage = response.data?.message || response.data?.error || 'Gagal memperbarui profil';
        setError(errorMessage);
        console.error("Update profile failed:", errorMessage);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response) {
        console.error("Response error data:", err.response.data); // Additional logging
        // Server responded with error status
        if (err.response.status === 422) {
          // Validation error
          setError(err.response.data.message || 'Data tidak valid');
        } else if (err.response.status >= 500) {
          // Server error
          setError('Server sedang bermasalah, silakan coba lagi nanti');
        } else {
          // Other client errors
          setError(err.response.data?.message || err.response.data?.error || 'Terjadi kesalahan saat memperbarui profil');
        }
      } else if (err.request) {
        // Network error
        console.error("Request error:", err.request); // Additional logging
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda');
      } else {
        // Other errors
        console.error("General error:", err.message); // Additional logging
        setError(err.message || 'Terjadi kesalahan saat memperbarui profil');
      }
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
            <div 
              className={`profil-avatar-upload ${isDragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="profil-avatar-img" />
              ) : (
                <div className="profil-avatar-initial">
                  {user?.nama_lengkap?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              
              {isEditing && (
                <>
                  <label className="upload-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }} 
                    />
                    <span className="upload-button">
                      <i className="fas fa-camera"></i>
                    </span>
                  </label>
                  
                  <div className="drag-drop-overlay">
                    <span>Drop gambarmu di sini</span>
                  </div>
                </>
              )}
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
                      setProfileImage(null);
                      // Reset image preview to the current user's photo if exists
                      if (user?.foto_profile) {
                        setImagePreview(`${process.env.REACT_APP_API_BASE_URL}/uploads/foto_profil/${user.foto_profile}`);
                      } else {
                        setImagePreview(null);
                      }
                      
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