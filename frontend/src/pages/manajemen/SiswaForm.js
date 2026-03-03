import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { siswaAPI, jurusanAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './SiswaForm.css';

const SiswaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [jurusan, setJurusan] = useState([]);
  
  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    id_jurusan: '',
    foto_path: ''
  });

  const fetchSiswa = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await siswaAPI.getById(id);
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          nisn: data.nisn,
          nis: data.nis,
          nama_lengkap: data.nama_lengkap,
          jenis_kelamin: data.jenis_kelamin,
          tempat_lahir: data.tempat_lahir || '',
          tanggal_lahir: data.tanggal_lahir || '',
          alamat: data.alamat || '',
          id_jurusan: data.id_jurusan,
          foto_path: data.foto_path || ''
        });
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Gagal memuat data siswa');
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJurusan();
    if (isEdit) {
      setFetchLoading(true);
      fetchSiswa();
    } else {
      setFetchLoading(false);
    }
  }, [id, isEdit, fetchSiswa]);

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
    
    // Validasi
    if (!formData.nisn || !formData.nis || !formData.nama_lengkap || !formData.id_jurusan) {
      toast.error('Mohon lengkapi data wajib');
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      if (isEdit) {
        response = await siswaAPI.update({ id, ...formData });
      } else {
        response = await siswaAPI.create(formData);
      }
      
      if (response.data.success) {
        toast.success(isEdit ? 'Siswa berhasil diupdate' : 'Siswa berhasil ditambahkan');
        navigate('/manajemen/siswa');
      }
    } catch (error) {
      console.error('Error saving siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="siswa-form">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Siswa' : 'Tambah Siswa'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update data siswa yang sudah ada' : 'Tambahkan data siswa baru'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Data Pribadi</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>NISN <span className="required">*</span></label>
              <input
                type="text"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
                placeholder="Masukkan NISN"
                maxLength="10"
              />
            </div>
            
            <div className="form-group">
              <label>NIS <span className="required">*</span></label>
              <input
                type="text"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
                placeholder="Masukkan NIS"
              />
            </div>
            
            <div className="form-group form-group-full">
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
              <label>Jenis Kelamin <span className="required">*</span></label>
              <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Tempat Lahir</label>
              <input
                type="text"
                name="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />
            </div>
            
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group form-group-full">
              <label>Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap"
                rows="3"
              ></textarea>
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
          </div>
        </div>

        <div className="form-section">
          <h3>Data Akademik</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Jurusan <span className="required">*</span></label>
              <select name="jurusan_id" value={formData.jurusan_id} onChange={handleChange}>
                <option value="">Pilih Jurusan</option>
                {jurusan.map((j) => (
                  <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Kelas <span className="required">*</span></label>
              <select name="kelas" value={formData.kelas} onChange={handleChange}>
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Rombel <span className="required">*</span></label>
              <input
                type="text"
                name="rombel"
                value={formData.rombel}
                onChange={handleChange}
                placeholder="Contoh: TKJ-1"
              />
            </div>
            
            <div className="form-group">
              <label>RFID UID</label>
              <input
                type="text"
                name="rfid_uid"
                value={formData.rfid_uid}
                onChange={handleChange}
                placeholder="Scan kartu RFID"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Data Orang Tua</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Orang Tua</label>
              <input
                type="text"
                name="nama_ortu"
                value={formData.nama_ortu}
                onChange={handleChange}
                placeholder="Masukkan nama orang tua"
              />
            </div>
            
            <div className="form-group">
              <label>No. Telepon Ortu</label>
              <input
                type="tel"
                name="no_telp_ortu"
                value={formData.no_telp_ortu}
                onChange={handleChange}
                placeholder="Masukkan no telepon ortu"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Status Siswa</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="lulus">Lulus</option>
                <option value="keluar">Keluar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/manajemen/siswa')}>
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
                <span>{isEdit ? 'Update' : 'Simpan'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiswaForm;
