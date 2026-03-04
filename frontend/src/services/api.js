import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL untuk API
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/project_magang/backend';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          window.location.href = '/login';
          break;

        case 403:
          toast.error('Anda tidak memiliki akses untuk melakukan tindakan ini');
          break;

        case 404:
          toast.error('Data tidak ditemukan');
          break;

        case 409:
          toast.error(response.data.message || 'Data sudah ada');
          break;

        case 500:
          toast.error('Terjadi kesalahan pada server. Silakan coba lagi.');
          break;

        default:
          toast.error(response.data.message || 'Terjadi kesalahan');
      }
    } else {
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/api/auth/login.php', { username, password }),
  logout: () => api.post('/api/auth/logout.php'),
  updateProfile: (data) => api.put('/api/auth/update_profile.php', data),
  changePassword: (data) => api.post('/api/auth/change_password.php', data),
  uploadFotoProfil: (data) => api.post('/api/auth/upload_foto_profil.php', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
};

// Siswa API
export const siswaAPI = {
  getAll: (params = {}) => api.get('/api/siswa/get_all.php', { params }),
  getById: (id) => api.get(`/api/siswa/get_by_id.php?id=${id}`),
  create: (data) => api.post('/api/siswa/create.php', data),
  update: (data) => api.put('/api/siswa/update.php', data),
  delete: (id) => api.delete(`/api/siswa/delete.php?id=${id}`),
};

// Jurusan API
export const jurusanAPI = {
  getAll: () => api.get('/api/jurusan/get_all.php'),
  create: (data) => api.post('/api/jurusan/create.php', data),
  update: (data) => api.put('/api/jurusan/update.php', data),
};

// Ruangan API
export const ruanganAPI = {
  getAll: (params = {}) => api.get('/api/ruangan/get_all.php', { params }),
  create: (data) => api.post('/api/ruangan/create.php', data),
  update: (data) => api.put('/api/ruangan/update.php', data),
};

// Presensi API
export const presensiAPI = {
  getAll: (params = {}) => api.get('/api/presensi/get_all.php', { params }),
  scanMasuk: (data) => api.post('/api/presensi/scan_masuk.php', data),
  scanKeluar: (data) => api.post('/api/presensi/scan_keluar.php', data),
  createManual: (data) => api.post('/api/presensi/create_manual.php', data),
  getMonthlyReport: (params = {}) => api.get('/api/presensi/get_monthly_report.php', { params }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard_stats.php'),
  getAll: () => api.get('/api/admin/get_all.php'),
  create: (data) => api.post('/api/admin/create.php', data),
  getLogAkses: (params = {}) => api.get('/api/admin/log_akses.php', { params }),
  getActivityLogs: (params = {}) => api.get('/api/admin/activity_logs.php', { params }), // New endpoint
  getNotifikasi: () => api.get('/api/admin/notifikasi.php'),
  getNotificationHistory: () => api.get('/api/admin/notifikasi.php?history=true&limit=50'),
  markNotifikasiRead: (id = null) => api.put('/api/admin/notifikasi.php', { id }),
  markAllNotifikasiRead: () => api.put('/api/admin/notifikasi.php', { mark_all: true }),
  deleteNotifikasi: (id) => api.delete(`/api/admin/notifikasi.php?id=${id}`),
  clearAllNotifikasi: () => api.delete('/api/admin/notifikasi.php?clear=all'),
};

// Export API
export const exportAPI = {
  presensiCSV: (params) => {
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_URL}/api/export/presensi_csv.php?${queryString}`, '_blank');
  },
};

export default api;