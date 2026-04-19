import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaChartLine, FaCalendarAlt, FaBell, FaBook, FaMoneyBillWave } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80')] bg-cover bg-center mix-blur-overlay opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
              <FaGraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-white">Sistem Informasi SMK Rajasa</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><Link to="/login" className="text-blue-200 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/wali-murid" className="text-blue-200 hover:text-white transition-colors">Wali Murid</Link></li>
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="mt-20 text-center">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Sistem Informasi <span className="text-cyan-400">SMK Rajasa</span> Surabaya
          </h1>
          <p className="mt-6 text-xl text-blue-200 max-w-3xl mx-auto">
            Platform terpadu untuk manajemen akademik, administrasi, dan komunikasi antara sekolah, guru, siswa, dan orang tua
          </p>
          
          <div className="mt-12 flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-600 transition-all transform hover:-translate-y-1"
            >
              Masuk Sebagai Administrator
            </Link>
            <Link 
              to="/wali-murid" 
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-700 hover:to-teal-600 transition-all transform hover:-translate-y-1"
            >
              Akses Informasi Siswa
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-16">Fitur-Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FaChalkboardTeacher className="h-10 w-10 text-cyan-400" />}
              title="Manajemen Guru"
              description="Kelola data guru, jadwal mengajar, dan evaluasi kinerja secara efektif"
            />
            <FeatureCard 
              icon={<FaUsers className="h-10 w-10 text-cyan-400" />}
              title="Manajemen Siswa"
              description="Kelola data siswa, prestasi, dan catatan pelanggaran"
            />
            <FeatureCard 
              icon={<FaChartLine className="h-10 w-10 text-cyan-400" />}
              title="Laporan Akademik"
              description="Lacak perkembangan akademik siswa secara real-time"
            />
            <FeatureCard 
              icon={<FaCalendarAlt className="h-10 w-10 text-cyan-400" />}
              title="Kalender Akademik"
              description="Akses jadwal pelajaran, ujian, dan kegiatan sekolah"
            />
            <FeatureCard 
              icon={<FaBell className="h-10 w-10 text-cyan-400" />}
              title="Notifikasi"
              description="Pemberitahuan otomatis untuk orang tua dan siswa"
            />
            <FeatureCard 
              icon={<FaBook className="h-10 w-10 text-cyan-400" />}
              title="Nilai & Pembelajaran"
              description="Monitoring nilai dan materi pembelajaran"
            />
            <FeatureCard 
              icon={<FaMoneyBillWave className="h-10 w-10 text-cyan-400" />}
              title="Pembayaran SPP"
              description="Pelacakan pembayaran dan status keuangan"
            />
            <FeatureCard 
              icon={<FaGraduationCap className="h-10 w-10 text-cyan-400" />}
              title="Absensi Digital"
              description="Pemantauan kehadiran siswa secara real-time"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 py-8 border-t border-blue-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <FaGraduationCap className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-2 text-lg font-semibold text-white">SMK Rajasa Surabaya</h3>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-blue-300">© 2026 Sistem Informasi SMK Rajasa. Hak Cipta Dilindungi.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link to="/privacy" className="text-blue-200 hover:text-white">Privacy</Link>
              <Link to="/terms" className="text-blue-200 hover:text-white">Terms</Link>
              <Link to="/contact" className="text-blue-200 hover:text-white">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
    <div className="flex justify-center">{icon}</div>
    <h3 className="mt-4 text-xl font-semibold text-white text-center">{title}</h3>
    <p className="mt-2 text-blue-200 text-center">{description}</p>
  </div>
);

export default LandingPage;