import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI, jurusanAPI } from '../../services/api';
import './AdminForm.css';

const AdminForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jurusan, setJurusan] = useState([]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    email: '',
    no_telp: '',
    role: 'admin_jurusan',
    jurusan_id: ''
  });

  useEffect(() => {
    fetchJurusan();
  }, []);

  const fetchJurusan = async () => {
    try {
      const response = await jurusanAPI.getAll();
      if (response.data.success) {
        setJurusan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching jurusan:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.nama_lengkap) {
      toast.error('Mohon lengkapi data wajib');
      return;
    }
    
    if (formData.role === 'admin_jurusan' && !formData.jurusan_id) {
      toast.error('Admin jurusan harus memilih jurusan');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await adminAPI.create(formData);
      
      if (response.data.success) {
        toast.success('Admin berhasil ditambahkan');
        navigate('/admin/pengguna');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tambah Admin</h1>
          <p className="page-subtitle">Tambahkan pengguna admin baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Informasi Akun</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Username <span className="required">*</span></label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
              />
            </div>
            
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
              />
            </div>
            
            <div className="form-group">
              <label>Nama Lengkap <span className="required">*</span></label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
              />
            </div>
            
            <div className="form-group">
              <label>No. Telepon</label>
              <input
                type="tel"
                name="no_telp"
                value={formData.no_telp}
                onChange={handleChange}
                placeholder="Masukkan no telepon"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Role & Akses</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="admin_jurusan">Admin Jurusan</option>
                <option value="admin_operator">Admin Operator</option>
              </select>
            </div>
            
            {formData.role === 'admin_jurusan' && (
              <div className="form-group">
                <label>Jurusan <span className="required">*</span></label>
                <select name="jurusan_id" value={formData.jurusan_id} onChange={handleChange}>
                  <option value="">Pilih Jurusan</option>
                  {jurusan.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/pengguna')}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
