import React, { useState, useEffect } from 'react';
import { jurusanAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './JurusanList.css';

const JurusanList = () => {
  const [jurusan, setJurusan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama_jurusan: '',
    kode_jurusan: '',
    singkatan: '',
    status: 'aktif'
  });
  const [errors, setErrors] = useState({});

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama_jurusan.trim()) {
      newErrors.nama_jurusan = 'Nama jurusan wajib diisi';
    }
    
    if (!formData.kode_jurusan.trim()) {
      newErrors.kode_jurusan = 'Kode jurusan wajib diisi';
    }
    
    if (!formData.singkatan.trim()) {
      newErrors.singkatan = 'Singkatan wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Call the API to create a new department
      const response = await jurusanAPI.create(formData);
      
      if (response.data.success) {
        // Refresh the list
        fetchJurusan();
        
        // Reset form and close it
        setFormData({
          nama_jurusan: '',
          kode_jurusan: '',
          singkatan: '',
          status: 'aktif'
        });
        setShowForm(false);
        
        alert('Jurusan berhasil ditambahkan!');
      } else {
        throw new Error(response.data.message || 'Gagal menambahkan jurusan');
      }
    } catch (error) {
      console.error('Error adding jurusan:', error);
      alert(error.response?.data?.message || 'Gagal menambahkan jurusan. Silakan coba lagi.');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="jurusan-list">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Jurusan</h1>
          <p className="page-subtitle">Daftar jurusan di SMK Rajasa Surabaya</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i>
          Tambah Jurusan
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Tambah Jurusan Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Jurusan *</label>
                <input
                  type="text"
                  name="nama_jurusan"
                  value={formData.nama_jurusan}
                  onChange={handleInputChange}
                  className={errors.nama_jurusan ? 'error' : ''}
                />
                {errors.nama_jurusan && <span className="error-message">{errors.nama_jurusan}</span>}
              </div>
              
              <div className="form-group">
                <label>Kode Jurusan *</label>
                <input
                  type="text"
                  name="kode_jurusan"
                  value={formData.kode_jurusan}
                  onChange={handleInputChange}
                  className={errors.kode_jurusan ? 'error' : ''}
                />
                {errors.kode_jurusan && <span className="error-message">{errors.kode_jurusan}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Singkatan *</label>
                <input
                  type="text"
                  name="singkatan"
                  value={formData.singkatan}
                  onChange={handleInputChange}
                  className={errors.singkatan ? 'error' : ''}
                />
                {errors.singkatan && <span className="error-message">{errors.singkatan}</span>}
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Simpan
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="jurusan-grid">
        {jurusan.map((j) => (
          <div key={j.id} className="jurusan-card">
            <div className="jurusan-icon">
              <span>{j.singkatan}</span>
            </div>
            <div className="jurusan-content">
              <h3>{j.nama_jurusan}</h3>
              <p>Kode: {j.kode_jurusan}</p>
              <div className="jurusan-stats">
                <div className="stat">
                  <i className="fas fa-user-graduate"></i>
                  <span>{j.total_siswa} Siswa</span>
                </div>
                <div className="stat">
                  <i className="fas fa-door-open"></i>
                  <span>{j.total_ruangan} Ruangan</span>
                </div>
              </div>
            </div>
            <div className={`jurusan-status ${j.status}`}>
              {j.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JurusanList;