import api from "./api";

// Gunakan siswa_id=1 sebagai default (demo)
// Di implementasi nyata bisa dari localStorage atau context
const SISWA_ID = 1;

const BASE = "/api/wali-murid";

export const waliMuridApi = {
  getDashboard: (siswaId = SISWA_ID) =>
    api.get(`${BASE}/dashboard.php?siswa_id=${siswaId}`),
  getSiswa: (siswaId = SISWA_ID) =>
    api.get(`${BASE}/siswa.php?siswa_id=${siswaId}`),
  getSiswaList: (params = {}) => api.get(`${BASE}/siswa-list.php`, { params }),
  getJurusan: () => api.get(`${BASE}/jurusan.php`),
  getKelas: () => api.get(`${BASE}/kelas.php`),
  getNilai: (params = {}) =>
    api.get(`${BASE}/nilai.php`, { params: { siswa_id: SISWA_ID, ...params } }),
  getPresensi: (params = {}) =>
    api.get(`${BASE}/presensi.php`, {
      params: { siswa_id: SISWA_ID, ...params },
    }),
  getPembayaran: (siswaId = SISWA_ID) =>
    api.get(`${BASE}/pembayaran.php?siswa_id=${siswaId}`),
  getPengumuman: (params = {}) => api.get(`${BASE}/pengumuman.php`, { params }),
  getKegiatan: (params = {}) => api.get(`${BASE}/kegiatan.php`, { params }),
  getKalender: (bulan, tahun) =>
    api.get(`${BASE}/kalender.php?bulan=${bulan}&tahun=${tahun}`),
  getBeasiswa: () => api.get(`${BASE}/beasiswa.php`),
  getRapor: (siswaId = SISWA_ID) =>
    api.get(`${BASE}/rapor.php?siswa_id=${siswaId}`),
  getJadwal: (kelasId) => api.get(`${BASE}/jadwal.php?kelas_id=${kelasId}`),
};

export default waliMuridApi;
