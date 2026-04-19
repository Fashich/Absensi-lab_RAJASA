import React, { useState } from 'react';
import { FaMoneyCheckAlt, FaCalendarAlt, FaReceipt, FaCheck, FaTimes, FaSearch, FaFilter, FaPrint, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import './PembayaranSPP.css';

const PembayaranSPP = () => {
  // Mock data untuk pembayaran SPP
  const [pembayaranList] = useState([
    {
      id: 1,
      bulan: 'Januari',
      tahun: '2026',
      jumlah: 300000,
      status_pembayaran: 'Lunas',
      tanggal_bayar: '2026-01-15',
      metode_pembayaran: 'Transfer Bank'
    },
    {
      id: 2,
      bulan: 'Februari',
      tahun: '2026',
      jumlah: 300000,
      status_pembayaran: 'Lunas',
      tanggal_bayar: '2026-02-12',
      metode_pembayaran: 'Tunai'
    },
    {
      id: 3,
      bulan: 'Maret',
      tahun: '2026',
      jumlah: 300000,
      status_pembayaran: 'Lunas',
      tanggal_bayar: '2026-03-10',
      metode_pembayaran: 'Transfer Bank'
    },
    {
      id: 4,
      bulan: 'April',
      tahun: '2026',
      jumlah: 300000,
      status_pembayaran: 'Belum Bayar',
      tanggal_bayar: '-',
      metode_pembayaran: '-'
    },
    {
      id: 5,
      bulan: 'Mei',
      tahun: '2026',
      jumlah: 300000,
      status_pembayaran: 'Belum Bayar',
      tanggal_bayar: '-',
      metode_pembayaran: '-'
    }
  ]);

  // Format rupiah
  const formatRupiah = (nominal) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(nominal);
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusClass = status === 'Lunas' 
      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
      : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="pembayaran-spp-page">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Pembayaran SPP</h2>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              <FaSearch />
              <span>Cari</span>
            </button>
            <button className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              <FaFilter />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
              <FaPrint />
              <span>Cetak</span>
            </button>
            <button className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
              <FaFilePdf />
              <span>PDF</span>
            </button>
            <button className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
              <FaFileExcel />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bulan/Tahun</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal Bayar</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metode Pembayaran</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {pembayaranList.map((pembayaran) => (
                <tr key={pembayaran.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{pembayaran.bulan}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{pembayaran.tahun}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatRupiah(pembayaran.jumlah)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={pembayaran.status_pembayaran} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pembayaran.tanggal_bayar !== '-' ? (
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        {pembayaran.tanggal_bayar}
                      </div>
                    ) : (
                      pembayaran.tanggal_bayar
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pembayaran.metode_pembayaran}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pembayaran.status_pembayaran === 'Belum Bayar' ? (
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <FaReceipt className="mr-1" /> Lakukan Pembayaran
                      </button>
                    ) : (
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        <FaReceipt className="mr-1" /> Lihat Bukti
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ringkasan Pembayaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <div className="text-sm text-blue-800 dark:text-blue-300">Total Tagihan</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(pembayaranList.reduce((sum, p) => sum + p.jumlah, 0))}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
            <div className="text-sm text-green-800 dark:text-green-300">Total Dibayar</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(
                pembayaranList
                  .filter(p => p.status_pembayaran === 'Lunas')
                  .reduce((sum, p) => sum + p.jumlah, 0)
              )}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
            <div className="text-sm text-red-800 dark:text-red-300">Belum Dibayar</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(
                pembayaranList
                  .filter(p => p.status_pembayaran !== 'Lunas')
                  .reduce((sum, p) => sum + p.jumlah, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PembayaranSPP;