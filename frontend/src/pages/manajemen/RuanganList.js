import React, { useState, useEffect } from 'react';
import { ruanganAPI, jurusanAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './RuanganList.css';

const RuanganList = () => {
  const [ruangan, setRuangan] = useState([]);
  const [jurusan, setJurusan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    kode_ruangan: '',
    nama_ruangan: '',
    kapasitas: '',
    jurusan_id: '',
    fasilitas: '',
    status: 'aktif',
    lokasi: '',
    esp32_cam_id: '',
    esp32_cam_ip: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRuangan();
    fetchJurusan();
  }, []);

  const fetchRuangan = async () => {
    try {
      const response = await ruanganAPI.getAll();
      if (response.data.success) {
        setRuangan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ruangan:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
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
    
    if (!formData.kode_ruangan.trim()) {
      newErrors.kode_ruangan = 'Kode ruangan wajib diisi';
    }
    
    if (!formData.nama_ruangan.trim()) {
      newErrors.nama_ruangan = 'Nama ruangan wajib diisi';
    }
    
    if (!formData.kapasitas || formData.kapasitas <= 0) {
      newErrors.kapasitas = 'Kapasitas harus lebih dari 0';
    }
    
    if (!formData.jurusan_id) {
      newErrors.jurusan_id = 'Jurusan wajib dipilih';
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
      setLoading(true);
      const response = await ruanganAPI.create(formData);
      
      if (response.data.success) {
        setMessage('Ruangan berhasil ditambahkan');
        setFormData({
          kode_ruangan: '',
          nama_ruangan: '',
          kapasitas: '',
          jurusan_id: '',
          fasilitas: '',
          status: 'aktif',
          lokasi: '',
          esp32_cam_id: '',
          esp32_cam_ip: ''
        });
        setShowAddForm(false);
        
        // Refresh data
        fetchRuangan();
        
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setErrors({ submit: response.data.message || 'Gagal menambahkan ruangan' });
      }
    } catch (error) {
      console.error('Error adding ruangan:', error);
      setErrors({ submit: error.response?.data?.message || 'Terjadi kesalahan saat menambahkan ruangan' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      aktif: 'status-aktif',
      nonaktif: 'status-nonaktif',
      maintenance: 'status-maintenance'
    };
    return classes[status] || '';
  };

  const getStatusLabel = (status) => {
    const labels = {
      aktif: 'Aktif',
      nonaktif: 'Nonaktif',
      maintenance: 'Maintenance'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="ruangan-list">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Ruangan</h1>
          <p className="page-subtitle">Daftar ruangan/laboratorium komputer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <i className="fas fa-plus"></i>
          Tambah Ruangan
        </button>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="add-form-container">
          <form className="add-ruangan-form" onSubmit={handleSubmit}>
            <h3>Tambah Ruangan Baru</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kode_ruangan">Kode Ruangan *</label>
                <input
                  type="text"
                  id="kode_ruangan"
                  name="kode_ruangan"
                  value={formData.kode_ruangan}
                  onChange={handleInputChange}
                  className={errors.kode_ruangan ? 'error' : ''}
                  placeholder="Ex: LAB-KOM-1"
                />
                {errors.kode_ruangan && <span className="error-message">{errors.kode_ruangan}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nama_ruangan">Nama Ruangan *</label>
                <input
                  type="text"
                  id="nama_ruangan"
                  name="nama_ruangan"
                  value={formData.nama_ruangan}
                  onChange={handleInputChange}
                  className={errors.nama_ruangan ? 'error' : ''}
                  placeholder="Nama lengkap ruangan"
                />
                {errors.nama_ruangan && <span className="error-message">{errors.nama_ruangan}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kapasitas">Kapasitas *</label>
                <input
                  type="number"
                  id="kapasitas"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleInputChange}
                  className={errors.kapasitas ? 'error' : ''}
                  placeholder="Jumlah maksimal siswa"
                />
                {errors.kapasitas && <span className="error-message">{errors.kapasitas}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="jurusan_id">Jurusan *</label>
                <select
                  id="jurusan_id"
                  name="jurusan_id"
                  value={formData.jurusan_id}
                  onChange={handleInputChange}
                  className={errors.jurusan_id ? 'error' : ''}
                >
                  <option value="">Pilih Jurusan</option>
                  {jurusan.map(j => (
                    <option key={j.id} value={j.id}>{j.nama_jurusan} ({j.kode_jurusan})</option>
                  ))}
                </select>
                {errors.jurusan_id && <span className="error-message">{errors.jurusan_id}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fasilitas">Fasilitas</label>
                <textarea
                  id="fasilitas"
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleInputChange}
                  placeholder="Deskripsi fasilitas ruangan"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lokasi">Lokasi</label>
                <input
                  type="text"
                  id="lokasi"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  placeholder="Lokasi ruangan (Ex: Lantai 2)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="esp32_cam_id">ID ESP32-CAM</label>
                <input
                  type="text"
                  id="esp32_cam_id"
                  name="esp32_cam_id"
                  value={formData.esp32_cam_id}
                  onChange={handleInputChange}
                  placeholder="ID perangkat ESP32-CAM"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="esp32_cam_ip">IP ESP32-CAM</label>
                <input
                  type="text"
                  id="esp32_cam_ip"
                  name="esp32_cam_ip"
                  value={formData.esp32_cam_ip}
                  onChange={handleInputChange}
                  placeholder="IP perangkat ESP32-CAM"
                />
              </div>
            </div>
            
            {errors.submit && <div className="error-message full-width">{errors.submit}</div>}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i>
                Simpan Ruangan
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ruangan-grid">
        {ruangan.map((r) => (
          <div key={r.id} className="ruangan-card">
            <div className="ruangan-header">
              <div className={`ruangan-status-badge ${getStatusClass(r.status)}`}>
                {getStatusLabel(r.status)}
              </div>
              <div className="ruangan-kapasitas">
                <i className="fas fa-users"></i>
                <span>{r.kapasitas_terisi || 0}/{r.kapasitas}</span>
              </div>
            </div>
            
            <div className="ruangan-body">
              <h3>{r.nama_ruangan}</h3>
              <p className="ruangan-kode">{r.kode_ruangan}</p>
              <p className="ruangan-lokasi">
                <i className="fas fa-map-marker-alt"></i>
                {r.lokasi || 'Lokasi tidak diset'}
              </p>
              
              <div className="ruangan-jurusan">
                <span className="jurusan-label">{r.kode_jurusan}</span>
                <span>{r.nama_jurusan}</span>
              </div>
            </div>
            
            <div className="ruangan-footer">
              <div className="esp32-info">
                <i className="fas fa-wifi"></i>
                <span>{r.esp32_cam_id || 'Belum dikonfigurasi'}</span>
              </div>
              <div className="esp32-ip">
                {r.esp32_cam_ip || '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuanganList;