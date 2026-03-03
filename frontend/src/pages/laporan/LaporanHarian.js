import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { exportAPI } from '../../services/api';
import './LaporanHarian.css';

const LaporanHarian = () => {
  const [filters, setFilters] = useState({
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date().toISOString().split('T')[0],
    jurusan_id: ''
  });

  const handleExport = () => {
    if (!filters.tanggal_mulai || !filters.tanggal_selesai) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }
    
    exportAPI.presensiCSV({
      tanggal_mulai: filters.tanggal_mulai,
      tanggal_selesai: filters.tanggal_selesai,
      jurusan_id: filters.jurusan_id
    });
    
    toast.success('Export CSV berhasil dimulai');
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="laporan-harian">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Harian</h1>
          <p className="page-subtitle">Export data presensi harian</p>
        </div>
      </div>

      <div className="export-card">
        <h3>Export Data Presensi</h3>
        <div className="export-form">
          <div className="form-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              name="tanggal_mulai"
              value={filters.tanggal_mulai}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Tanggal Selesai</label>
            <input
              type="date"
              name="tanggal_selesai"
              value={filters.tanggal_selesai}
              onChange={handleChange}
            />
          </div>
          
          <button className="btn btn-primary btn-export" onClick={handleExport}>
            <i className="fas fa-file-csv"></i>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaporanHarian;
