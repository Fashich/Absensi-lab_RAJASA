import React, { useState, useEffect, useCallback } from 'react';
import { presensiAPI, jurusanAPI, siswaAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './PresensiList.css';

const PresensiList = () => {
  const [presensi, setPresensi] = useState([]);
  const [jurusan, setJurusan] = useState([]);
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jurusan_id: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nisn: '',
    waktu_masuk: new Date().toISOString().substring(0, 16),
    waktu_keluar: '',
    status: 'hadir',
    ruangan_id: ''
  });
  const [errors, setErrors] = useState({});

  const fetchPresensi = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await presensiAPI.getAll(params);
      
      if (response.data.success) {
        setPresensi(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching presensi:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchJurusan();
    fetchSiswa();
    fetchPresensi();
  }, [currentPage, filters, fetchPresensi]);

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

  const fetchSiswa = async () => {
    try {
      const response = await siswaAPI.getAll();
      if (response.data.success) {
        setSiswa(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      hadir: { class: 'badge-success', label: 'Hadir' },
      terlambat: { class: 'badge-warning', label: 'Terlambat' },
      sakit: { class: 'badge-info', label: 'Sakit' },
      izin: { class: 'badge-info', label: 'Izin' },
      alpha: { class: 'badge-error', label: 'Alpha' }
    };
    
    const badge = badges[status] || { class: 'badge-info', label: status };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
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
    
    if (!formData.nisn) {
      newErrors.nisn = 'NISN wajib diisi';
    }
    
    if (!formData.waktu_masuk) {
      newErrors.waktu_masuk = 'Waktu masuk wajib diisi';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status wajib diisi';
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
      // Call the API to create a new attendance record
      const response = await presensiAPI.createManual({
        ...formData,
        // Convert datetime-local format to MySQL datetime format
        waktu_masuk: formData.waktu_masuk.replace('T', ' '),
        waktu_keluar: formData.waktu_keluar ? formData.waktu_keluar.replace('T', ' ') : null
      });
      
      if (response.data.success) {
        // Refresh the list
        fetchPresensi();
        
        // Reset form and close it
        setFormData({
          nisn: '',
          waktu_masuk: new Date().toISOString().substring(0, 16),
          waktu_keluar: '',
          status: 'hadir',
          ruangan_id: ''
        });
        setShowForm(false);
        
        alert('Presensi berhasil ditambahkan!');
      } else {
        throw new Error(response.data.message || 'Gagal menambahkan presensi');
      }
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert(error.response?.data?.message || 'Gagal menambahkan presensi. Silakan coba lagi.');
    }
  };

  return (
    <div className="presensi-list">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Presensi</h1>
          <p className="page-subtitle">Kelola data kehadiran siswa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i>
          Tambah Presensi
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Tambah Presensi Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>NISN *</label>
                <select
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  className={errors.nisn ? 'error' : ''}
                >
                  <option value="">Pilih siswa</option>
                  {siswa.map(s => (
                    <option key={s.id} value={s.nisn}>
                      {s.nisn} - {s.nama_lengkap}
                    </option>
                  ))}
                </select>
                {errors.nisn && <span className="error-message">{errors.nisn}</span>}
              </div>
              
              <div className="form-group">
                <label>Waktu Masuk *</label>
                <input
                  type="datetime-local"
                  name="waktu_masuk"
                  value={formData.waktu_masuk}
                  onChange={handleInputChange}
                  className={errors.waktu_masuk ? 'error' : ''}
                />
                {errors.waktu_masuk && <span className="error-message">{errors.waktu_masuk}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Waktu Keluar</label>
                <input
                  type="datetime-local"
                  name="waktu_keluar"
                  value={formData.waktu_keluar}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={errors.status ? 'error' : ''}
                >
                  <option value="hadir">Hadir</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpha">Alpha</option>
                </select>
                {errors.status && <span className="error-message">{errors.status}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ruangan</label>
                <input
                  type="text"
                  name="ruangan_id"
                  value={formData.ruangan_id}
                  onChange={handleInputChange}
                  placeholder="Contoh: Lab Komputer 1"
                />
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

      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <i className="fas fa-calendar"></i>
            <input
              type="date"
              name="tanggal"
              value={filters.tanggal}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <i className="fas fa-building"></i>
            <select name="jurusan_id" value={filters.jurusan_id} onChange={handleFilterChange}>
              <option value="">Semua Jurusan</option>
              {jurusan.map((j) => (
                <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <i className="fas fa-toggle-on"></i>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NISN</th>
                    <th>Nama</th>
                    <th>Jurusan</th>
                    <th>Ruangan</th>
                    <th>Waktu Masuk</th>
                    <th>Waktu Keluar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {presensi.length > 0 ? (
                    presensi.map((p, index) => (
                      <tr key={p.id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>{p.nisn}</td>
                        <td>{p.nama_lengkap}</td>
                        <td>{p.kode_jurusan}</td>
                        <td>{p.kode_ruangan}</td>
                        <td>{p.waktu_masuk}</td>
                        <td>{p.waktu_keluar || '-'}</td>
                        <td>{getStatusBadge(p.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="empty-table">
                          <i className="fas fa-inbox"></i>
                          <p>Tidak ada data presensi</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.total_pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={!pagination.has_prev_page}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <span className="pagination-info">
                  Halaman {pagination.current_page} dari {pagination.total_pages}
                </span>
                
                <button
                  className="pagination-btn"
                  disabled={!pagination.has_next_page}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PresensiList;