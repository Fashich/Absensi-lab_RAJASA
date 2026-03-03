import React from 'react';
import './RealtimeMonitor.css';

const RealtimeMonitor = () => {
  return (
    <div className="realtime-monitor">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitor Real-time</h1>
          <p className="page-subtitle">Pantau aktivitas scan masuk secara real-time</p>
        </div>
      </div>

      <div className="monitor-grid">
        <div className="monitor-card">
          <div className="monitor-status">
            <div className="status-indicator online"></div>
            <span>Sistem Online</span>
          </div>
          <div className="monitor-content">
            <i className="fas fa-broadcast-tower"></i>
            <p>Menunggu data dari ESP32-CAM...</p>
          </div>
        </div>

        <div className="recent-scans">
          <h3>Scan Terbaru</h3>
          <div className="scan-list">
            <div className="empty-state">
              <i className="fas fa-wifi"></i>
              <p>Belum ada aktivitas scan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;
