import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages - Auth
import Login from './pages/auth/Login';

// Pages - Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Pages - Manajemen
import SiswaList from './pages/manajemen/SiswaList';
import SiswaForm from './pages/manajemen/SiswaForm';
import JurusanList from './pages/manajemen/JurusanList';
import RuanganList from './pages/manajemen/RuanganList';

// Pages - Presensi
import PresensiList from './pages/presensi/PresensiList';
import RealtimeMonitor from './pages/presensi/RealtimeMonitor';

// Pages - Laporan
import LaporanHarian from './pages/laporan/LaporanHarian';
import LaporanBulanan from './pages/laporan/LaporanBulanan';
import LogAkses from './pages/laporan/LogAkses';

// Pages - Admin
import AdminList from './pages/admin/AdminList';
import AdminForm from './pages/admin/AdminForm';
import Pengaturan from './pages/admin/Pengaturan';

// Pages - Profil
import Profil from './pages/profil/Profil';

// Components
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Manajemen */}
        <Route path="/manajemen/siswa" element={<SiswaList />} />
        <Route path="/manajemen/siswa/tambah" element={<SiswaForm />} />
        <Route path="/manajemen/siswa/edit/:id" element={<SiswaForm />} />
        <Route path="/manajemen/jurusan" element={<JurusanList />} />
        <Route path="/manajemen/ruangan" element={<RuanganList />} />
        
        {/* Presensi */}
        <Route path="/presensi" element={<PresensiList />} />
        <Route path="/presensi/realtime" element={<RealtimeMonitor />} />
        
        {/* Laporan */}
        <Route path="/laporan/harian" element={<LaporanHarian />} />
        <Route path="/laporan/bulanan" element={<LaporanBulanan />} />
        <Route path="/laporan/log-akses" element={<LogAkses />} />
        
        {/* Profil */}
        <Route path="/profil" element={<Profil />} />
        
        {/* Admin - Hanya untuk admin_operator */}
        <Route path="/admin/pengguna" element={<AdminList />} />
        <Route path="/admin/pengguna/tambah" element={<AdminForm />} />
        <Route path="/admin/pengaturan" element={<Pengaturan />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;