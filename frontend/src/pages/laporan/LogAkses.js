import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './LogAkses.css';

const LogAkses = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogAkses({
        page: currentPage,
        limit: 10
      });
      
      if (response.data.success) {
        setLogs(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, fetchLogs]);

  const getStatusBadge = (status) => {
    const badges = {
      id_tidak_terdaftar: { class: 'badge-error', label: 'ID Tidak Terdaftar' },
      kartu_diblokir: { class: 'badge-warning', label: 'Kartu Diblokir' },
      ruangan_tidak_cocok: { class: 'badge-warning', label: 'Ruangan Tidak Cocok' },
      foto_buram: { class: 'badge-info', label: 'Foto Buram' },
      lainnya: { class: 'badge-info', label: 'Lainnya' }
    };
    
    const badge = badges[status] || { class: 'badge-info', label: status };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="log-akses">
      <div className="page-header">
        <div>
          <h1 className="page-title">Log Akses Tidak Valid</h1>
          <p className="page-subtitle">Catatan percobaan akses yang gagal</p>
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
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>RFID UID</th>
                    <th>Ruangan</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>{log.tanggal}</td>
                        <td>{log.waktu}</td>
                        <td><code>{log.rfid_uid || '-'}</code></td>
                        <td>{log.kode_ruangan}</td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>{log.keterangan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="empty-table">
                          <i className="fas fa-shield-alt"></i>
                          <p>Tidak ada log akses tidak valid</p>
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

export default LogAkses;
