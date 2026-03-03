import React, { useState } from 'react';
import './Pengaturan.css';

const Pengaturan = () => {
  const [activeSetting, setActiveSetting] = useState(null);
  
  const settingOptions = [
    {
      id: 'school-info',
      title: 'Informasi Sekolah',
      description: 'Kelola data sekolah dan kontak',
      icon: 'fas fa-school',
      fields: [
        { label: 'Nama Sekolah', name: 'schoolName', type: 'text', placeholder: 'SMK Rajasa Surabaya' },
        { label: 'Alamat', name: 'address', type: 'text', placeholder: 'Jl. Contoh Alamat Sekolah' },
        { label: 'Telepon', name: 'phone', type: 'tel', placeholder: '+62-xxx-xxx-xxxx' },
        { label: 'Email', name: 'email', type: 'email', placeholder: 'info@smkrajasa.sch.id' },
      ]
    },
    {
      id: 'operational-hours',
      title: 'Jam Operasional',
      description: 'Atur jam masuk dan pulang',
      icon: 'fas fa-clock',
      fields: [
        { label: 'Jam Masuk', name: 'startTime', type: 'time', placeholder: '07:30' },
        { label: 'Jam Pulang', name: 'endTime', type: 'time', placeholder: '15:30' },
        { label: 'Durasi Toleransi Terlambat (menit)', name: 'lateTolerance', type: 'number', placeholder: '15' },
      ]
    },
    {
      id: 'esp32-config',
      title: 'Konfigurasi ESP32',
      description: 'Pengaturan perangkat IoT',
      icon: 'fas fa-wifi',
      fields: [
        { label: 'IP Address ESP32', name: 'esp32Ip', type: 'text', placeholder: '192.168.1.100' },
        { label: 'API Key', name: 'apiKey', type: 'password', placeholder: 'Masukkan API Key' },
        { label: 'Port', name: 'port', type: 'number', placeholder: '80' },
      ]
    },
    {
      id: 'notifications',
      title: 'Notifikasi',
      description: 'Kelola pengaturan notifikasi',
      icon: 'fas fa-bell',
      fields: [
        { label: 'Email Notifikasi', name: 'notificationEmail', type: 'email', placeholder: 'admin@smkrajasa.sch.id' },
        { label: 'Interval Pengecekan (detik)', name: 'checkInterval', type: 'number', placeholder: '30' },
        { label: 'Jenis Notifikasi', name: 'notificationTypes', type: 'select', options: ['Email', 'SMS', 'Push'] },
      ]
    }
  ];
  
  const [formData, setFormData] = useState({
    schoolName: 'SMK Rajasa Surabaya',
    address: 'Jl. Contoh Alamat Sekolah',
    phone: '+62-xxx-xxx-xxxx',
    email: 'info@smkrajasa.sch.id',
    startTime: '07:30',
    endTime: '15:30',
    lateTolerance: '15',
    esp32Ip: '192.168.1.100',
    apiKey: '',
    port: '80',
    notificationEmail: 'admin@smkrajasa.sch.id',
    checkInterval: '30',
    notificationTypes: 'Email'
  });

  const handleCardClick = (settingId) => {
    setActiveSetting(activeSetting === settingId ? null : settingId);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = (settingId) => {
    // In a real app, this would save to the backend
    alert(`Pengaturan ${settingId} berhasil disimpan!`);
  };

  return (
    <div className="pengaturan">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Konfigurasi sistem absensi</p>
        </div>
      </div>

      <div className="settings-grid">
        {settingOptions.map((setting) => (
          <div key={setting.id} className="setting-card">
            <div className="setting-icon">
              <i className={setting.icon}></i>
            </div>
            <div className="setting-content">
              <h3>{setting.title}</h3>
              <p>{setting.description}</p>
            </div>
            <i className="fas fa-chevron-right"></i>
            
            {/* Click event added to make card interactive */}
            <div 
              className="setting-card-overlay" 
              onClick={() => handleCardClick(setting.id)}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Modal for editing settings */}
      {activeSetting && (
        <div className="modal-overlay" onClick={() => setActiveSetting(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{settingOptions.find(s => s.id === activeSetting)?.title}</h3>
              <button className="close-btn" onClick={() => setActiveSetting(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <form>
                {settingOptions.find(s => s.id === activeSetting)?.fields.map((field, index) => (
                  <div key={index} className="form-group">
                    <label>{field.label}</label>
                    {field.type === 'select' ? (
                      <select 
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleFieldChange}
                      >
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleFieldChange}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveSetting(null)}>
                Batal
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  handleSaveSettings(activeSetting);
                  setActiveSetting(null);
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;