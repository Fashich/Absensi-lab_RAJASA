import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FaUser, FaCalendarAlt, FaBook, FaMoneyBillWave, 
  FaBell, FaGraduationCap, FaChartLine, FaUsers 
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        // In real implementation, this would be an API call to backend
        // const response = await fetch(`/api/wali-murid/dashboard?siswa_id=${studentId}`);
        // const result = await response.json();
        
        // For demo purposes, using mock data
        setTimeout(() => {
          setStudentData({
            siswa_info: {
              nama_lengkap: 'Ahmad Faisal Hakim',
              nisn: '1234567890',
              nis: '10123456',
              nama_kelas: 'XII RPL 1',
              tingkat: '12',
              nama_jurusan: 'Rekayasa Perangkat Lunak',
              foto_siswa: '/src/assets/images/default-student.jpg'
            },
            presensi_bulanan: {
              total_hari: 22,
              hadir: 20,
              sakit: 1,
              izin: 1,
              alfa: 0
            },
            rata_rata_nilai: {
              rata_rata_nilai: 85.5,
              semester: 'Ganjil',
              tahun_ajaran: '2025/2026'
            },
            status_spp_terbaru: {
              bulan: 'April',
              tahun: 2026,
              status_pembayaran: 'belum_bayar',
              jumlah_tagihan: 300000,
              jumlah_bayar: 0
            }
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (studentId) {
      fetchDashboardData();
    }
  }, [studentId]);

  // Chart data for attendance
  const attendanceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Hadir',
        data: [20, 22, 21, 20, 19, 22],
        backgroundColor: 'rgba(72, 187, 120, 0.8)',
      },
      {
        label: 'Sakit/Izin',
        data: [2, 1, 1, 2, 1, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Alfa',
        data: [0, 0, 1, 0, 1, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  };

  // Chart data for grades
  const gradesChartData = {
    labels: ['Mat', 'Bind', 'Bing', 'ProWeb', 'DB', 'PKK'],
    datasets: [
      {
        label: 'Nilai',
        data: [85, 78, 82, 90, 88, 84],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Student Info Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mr-4">
            <FaUser className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Nama Siswa</h3>
            <p className="font-semibold dark:text-white truncate">
              {studentData?.siswa_info?.nama_lengkap || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Class Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg mr-4">
            <FaUsers className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Kelas</h3>
            <p className="font-semibold dark:text-white">
              {studentData?.siswa_info?.nama_kelas || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Department Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg mr-4">
            <FaGraduationCap className="text-purple-600 dark:text-purple-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Jurusan</h3>
            <p className="font-semibold dark:text-white">
              {studentData?.siswa_info?.nama_jurusan || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Average Grade Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg mr-4">
            <FaChartLine className="text-yellow-600 dark:text-yellow-400 text-2xl" />
          </div>
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Rata-rata Nilai</h3>
            <p className="font-semibold dark:text-white">
              {studentData?.rata_rata_nilai?.rata_rata_nilai || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Rekap Kehadiran (6 Bulan Terakhir)</h3>
          <Bar 
            data={attendanceChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }} 
          />
        </div>

        {/* Grades Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Grafik Nilai Mata Pelajaran</h3>
          <Line 
            data={gradesChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Pengumuman Terbaru</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-l-4 border-blue-500 pl-4 py-1">
                <h4 className="font-medium dark:text-white">Judul Pengumuman {item}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal: 15 Apr 2026</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Status Pembayaran SPP</h3>
          <div className="space-y-4">
            {studentData?.status_spp_terbaru ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-white">
                    {studentData.status_spp_terbaru.bulan} {studentData.status_spp_terbaru.tahun}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    studentData.status_spp_terbaru.status_pembayaran === 'lunas' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                  }`}>
                    {studentData.status_spp_terbaru.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Rp {studentData.status_spp_terbaru.jumlah_tagihan?.toLocaleString('id-ID') || '0'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Memuat data...</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FaBook className="text-blue-600 dark:text-blue-400 text-xl mb-2" />
              <span className="text-sm text-center dark:text-white">Lihat Nilai</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <FaCalendarAlt className="text-green-600 dark:text-green-400 text-xl mb-2" />
              <span className="text-sm text-center dark:text-white">Presensi</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <FaMoneyBillWave className="text-purple-600 dark:text-purple-400 text-xl mb-2" />
              <span className="text-sm text-center dark:text-white">SPP</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <FaBell className="text-yellow-600 dark:text-yellow-400 text-xl mb-2" />
              <span className="text-sm text-center dark:text-white">Pengumuman</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;