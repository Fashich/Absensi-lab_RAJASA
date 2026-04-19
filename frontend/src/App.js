import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import NetworkStatusNotifier from "./components/common/NetworkStatusNotifier";
import Loading from "./components/common/Loading";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Admin pages
import Dashboard from "./pages/dashboard/Dashboard";
import SiswaList from "./pages/manajemen/SiswaList";
import SiswaForm from "./pages/manajemen/SiswaForm";
import JurusanList from "./pages/manajemen/JurusanList";
import RuanganList from "./pages/manajemen/RuanganList";
import PresensiList from "./pages/presensi/PresensiList";
import RealtimeMonitor from "./pages/presensi/RealtimeMonitor";
import LaporanHarian from "./pages/laporan/LaporanHarian";
import LaporanBulanan from "./pages/laporan/LaporanBulanan";
import LogAkses from "./pages/laporan/LogAkses";
import LogNotifikasi from "./pages/laporan/LogNotifikasi";
import AdminList from "./pages/admin/AdminList";
import AdminForm from "./pages/admin/AdminForm";
import Pengaturan from "./pages/admin/Pengaturan";
import Profil from "./pages/profil/Profil";
import ProtectedRoute from "./components/common/ProtectedRoute";

// ── Wali Murid ──────────────────────────────────────────────────
import ParentDashboard from "./pages/ParentDashboard";
import DashboardBeranda from "./pages/wali-murid/DashboardBeranda";
import DataSiswa from "./pages/wali-murid/DataSiswa";

import {
  NilaiAkademik,
  PresensiSiswa,
  PembayaranSPP,
  PengumumanSekolah,
  KalenderAkademik,
  Beasiswa,
  JurusanPage,
  KelasPage,
  KegiatanAkademik,
  RaporSiswa,
  ComingSoonPage,
} from "./pages/wali-murid/WaliMuridPages";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading fullScreen />;

  // Helper for "Coming Soon" routes
  const cs = (title, icon, desc) => (
    <ComingSoonPage title={title} icon={icon} description={desc} />
  );

  return (
    <>
      <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* ── Auth ──────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
            }
          />
        </Route>

        {/* ── Admin Protected ────────────────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manajemen/siswa" element={<SiswaList />} />
          <Route path="/manajemen/siswa/tambah" element={<SiswaForm />} />
          <Route path="/manajemen/siswa/edit/:id" element={<SiswaForm />} />
          <Route path="/manajemen/jurusan" element={<JurusanList />} />
          <Route path="/manajemen/ruangan" element={<RuanganList />} />
          <Route path="/presensi" element={<PresensiList />} />
          <Route path="/presensi/realtime" element={<RealtimeMonitor />} />
          <Route path="/laporan/harian" element={<LaporanHarian />} />
          <Route path="/laporan/bulanan" element={<LaporanBulanan />} />
          <Route path="/laporan/log-akses" element={<LogAkses />} />
          <Route path="/laporan/log-notifikasi" element={<LogNotifikasi />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/admin/pengguna" element={<AdminList />} />
          <Route path="/admin/pengguna/tambah" element={<AdminForm />} />
          <Route path="/admin/pengaturan" element={<Pengaturan />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>

        {/* ── Wali Murid (Public) ────────────────────────────── */}
        <Route path="/wali-murid" element={<ParentDashboard />}>
          {/* Beranda */}
          <Route path="beranda/dashboard" element={<DashboardBeranda />} />
          <Route path="beranda/data-siswa" element={<DataSiswa />} />
          <Route path="beranda/jurusan" element={<JurusanPage />} />
          <Route path="beranda/kelas" element={<KelasPage />} />
          <Route
            path="beranda/laporan-siswa"
            element={cs(
              "Laporan Siswa",
              "📊",
              "Rekap laporan perkembangan siswa akan tersedia segera.",
            )}
          />
          <Route
            path="beranda/status-siswa"
            element={cs(
              "Status Siswa",
              "📋",
              "Status keaktifan dan informasi siswa.",
            )}
          />
          <Route
            path="beranda/kegiatan-akademik"
            element={<KegiatanAkademik />}
          />
          <Route path="beranda/laporan-kehadiran" element={<PresensiSiswa />} />
          <Route
            path="beranda/pengumuman-sekolah"
            element={<PengumumanSekolah />}
          />
          <Route
            path="beranda/prestasi-siswa"
            element={cs(
              "Prestasi Siswa",
              "🏆",
              "Data prestasi akademik dan non-akademik siswa.",
            )}
          />
          <Route
            path="beranda/ekskul"
            element={cs(
              "Ekstrakurikuler",
              "⚽",
              "Informasi kegiatan ekstrakurikuler sekolah.",
            )}
          />

          {/* Akademik */}
          <Route path="akademik/dashboard" element={<NilaiAkademik />} />
          <Route
            path="akademik/pembelajaran-siswa"
            element={cs(
              "Pembelajaran Siswa",
              "📖",
              "Informasi materi dan progress pembelajaran siswa.",
            )}
          />
          <Route path="akademik/nilai-akademik" element={<NilaiAkademik />} />
          <Route
            path="akademik/jadwal-akademik"
            element={cs(
              "Jadwal Akademik",
              "🗓️",
              "Jadwal mata pelajaran dan kegiatan akademik.",
            )}
          />
          <Route
            path="akademik/laporan-akademik"
            element={cs(
              "Laporan Akademik",
              "📋",
              "Laporan perkembangan akademik siswa.",
            )}
          />
          <Route
            path="akademik/penilaian-praktek"
            element={cs(
              "Penilaian Praktek",
              "🔬",
              "Nilai dan rekap kegiatan praktikum siswa.",
            )}
          />
          <Route
            path="akademik/jadwal-praktek"
            element={cs(
              "Jadwal Praktek",
              "⏰",
              "Jadwal kegiatan praktikum di laboratorium.",
            )}
          />
          <Route
            path="akademik/ranking-siswa"
            element={cs(
              "Ranking Siswa",
              "🏅",
              "Peringkat siswa berdasarkan nilai akademik.",
            )}
          />
          <Route path="akademik/jurusan-kelas" element={<JurusanPage />} />
          <Route
            path="akademik/kalender-akademik"
            element={<KalenderAkademik />}
          />
          <Route path="akademik/beasiswa" element={<Beasiswa />} />
          <Route
            path="akademik/remedial"
            element={cs(
              "Remedial",
              "📌",
              "Informasi jadwal dan materi program remedial.",
            )}
          />

          {/* Rekapan */}
          <Route path="rekapan/dashboard" element={<PresensiSiswa />} />
          <Route path="rekapan/presensi-siswa" element={<PresensiSiswa />} />
          <Route
            path="rekapan/skoring-siswa"
            element={cs(
              "Skoring Siswa",
              "⭐",
              "Rekap skor dan penilaian perilaku siswa.",
            )}
          />
          <Route path="rekapan/rapor-siswa" element={<RaporSiswa />} />
          <Route
            path="rekapan/catatan-harian"
            element={cs(
              "Catatan Harian",
              "📓",
              "Catatan perkembangan harian siswa.",
            )}
          />
          <Route path="rekapan/penilaian-siswa" element={<NilaiAkademik />} />
          <Route
            path="rekapan/peringatan"
            element={cs(
              "Peringatan Siswa",
              "⚠️",
              "Rekap peringatan dan catatan perilaku siswa.",
            )}
          />

          {/* Kalender Akademik */}
          <Route path="kalender/dashboard" element={<KalenderAkademik />} />
          <Route path="kalender/pembayaran-spp" element={<PembayaranSPP />} />
          <Route
            path="kalender/informasi-sekolah"
            element={cs(
              "Informasi Sekolah",
              "🏫",
              "Profil dan informasi umum SMK Rajasa Surabaya.",
            )}
          />
          <Route
            path="kalender/daftar-ulang"
            element={cs(
              "Daftar Ulang Sekolah",
              "📋",
              "Informasi dan prosedur daftar ulang siswa.",
            )}
          />
          <Route
            path="kalender/layanan-akademik"
            element={cs(
              "Layanan Akademik",
              "🎓",
              "Layanan administrasi akademik sekolah.",
            )}
          />
          <Route
            path="kalender/lainnya"
            element={cs(
              "Lainnya",
              "➕",
              "Informasi dan layanan tambahan lainnya.",
            )}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <NetworkStatusNotifier />
    </>
  );
}

export default App;
