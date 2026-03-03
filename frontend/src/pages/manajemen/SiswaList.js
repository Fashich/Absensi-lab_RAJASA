import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { siswaAPI, jurusanAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './SiswaList.css';

const SiswaList = () => {
  const [siswa, setSiswa] = useState([]);
  const [jurusan, setJurusan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    jurusan_id: '',
    kelas: '',
    status: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSiswa = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await siswaAPI.getAll(params);
      
      if (response.data.success) {
        setSiswa(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchJurusan();
    fetchSiswa();
  }, [currentPage, filters, fetchSiswa]);

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

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus siswa ${nama}?`)) {
      try {
        const response = await siswaAPI.delete(id);
        if (response.data.success) {
          toast.success('Siswa berhasil dihapus');
          fetchSiswa();
        }
      } catch (error) {
        console.error('Error deleting siswa:', error);
      }
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
      aktif: { class: 'badge-success', label: 'Aktif' },
      nonaktif: { class: 'badge-error', label: 'Nonaktif' },
      lulus: { class: 'badge-info', label: 'Lulus' },
      keluar: { class: 'badge-warning', label: 'Keluar' }
    };
    
    const badge = badges[status] || { class: 'badge-info', label: status };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="siswa-list">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Siswa</h1>
          <p className="page-subtitle">Kelola data siswa SMK Rajasa Surabaya</p>
        </div>
        <Link to="/manajemen/siswa/tambah" className="btn btn-primary">
          <i className="fas fa-plus"></i>
          Tambah Siswa
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <i className="fas fa-search"></i>
            <input
              type="text"
              name="search"
              placeholder="Cari NISN, NIS, atau nama..."
              value={filters.search}
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
            <i className="fas fa-graduation-cap"></i>
            <select name="kelas" value={filters.kelas} onChange={handleFilterChange}>
              <option value="">Semua Kelas</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
          </div>
          
          <div className="filter-group">
            <i className="fas fa-toggle-on"></i>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="lulus">Lulus</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                    <th>NISN/NIS</th>
                    <th>Nama Lengkap</th>
                    <th>Jurusan</th>
                    <th>Kelas</th>
                    <th>RFID</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {siswa.length > 0 ? (
                    siswa.map((s, index) => (
                      <tr key={s.id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>
                          <div className="student-id">
                            <span className="nisn">{s.nisn}</span>
                            <span className="nis">{s.nis}</span>
                          </div>
                        </td>
                        <td>
                          <div className="student-name">
                            <div className="avatar">{s.nama_lengkap.charAt(0)}</div>
                            <span>{s.nama_lengkap}</span>
                          </div>
                        </td>
                        <td>
                          <span className="jurusan-badge">{s.kode_jurusan}</span>
                        </td>
                        <td>{s.kelas} {s.rombel}</td>
                        <td>
                          <code className="rfid-code">{s.rfid_uid || '-'}</code>
                        </td>
                        <td>{getStatusBadge(s.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/manajemen/siswa/edit/${s.id}`}
                              className="btn-action btn-edit"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(s.id, s.nama_lengkap)}
                              title="Hapus"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="empty-table">
                          <i className="fas fa-inbox"></i>
                          <p>Tidak ada data siswa</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

export default SiswaList;
