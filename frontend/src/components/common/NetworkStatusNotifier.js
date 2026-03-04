import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './NetworkStatusNotifier.css';

const NetworkStatusNotifier = () => {
  const onlineToastId = useRef(null);
  const offlineToastId = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiConnected, setApiConnected] = useState(true);
  const connectionCheckInterval = useRef(null);

  // Fungsi untuk mengecek koneksi API
  const checkApiConnection = useCallback(async () => {
    try {
      await api.get('/api/auth/check_connection.php'); // endpoint dummy untuk cek koneksi
      if (!apiConnected) {
        setApiConnected(true);
      }
    } catch (error) {
      if (apiConnected) {
        setApiConnected(false);
        // Hanya tampilkan notifikasi jika browser menganggap online tapi API tidak merespon
        if (isOnline) {
          if (offlineToastId.current) {
            toast.dismiss(offlineToastId.current);
          }
          
          offlineToastId.current = toast.warn('Server tidak merespon, periksa koneksi jaringan', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    }
  }, [apiConnected, isOnline]);

  useEffect(() => {
    // Cek koneksi API setiap 10 detik
    connectionCheckInterval.current = setInterval(checkApiConnection, 10000);

    // Panggil sekali saat komponen dimount
    checkApiConnection();

    const handleOnline = () => {
      setIsOnline(true);

      // Jika sebelumnya ada notifikasi offline yang aktif, hapus dulu
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
        offlineToastId.current = null;
      }

      // Tampilkan notifikasi online
      onlineToastId.current = toast.success('Koneksi internet pulih', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Coba koneksi ke API
      setTimeout(() => {
        checkApiConnection();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);

      // Jika sebelumnya ada notifikasi online yang aktif, hapus dulu
      if (onlineToastId.current) {
        toast.dismiss(onlineToastId.current);
        onlineToastId.current = null;
      }

      // Tampilkan notifikasi offline
      if (!offlineToastId.current) {
        offlineToastId.current = toast.error('Koneksi internet terputus', {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    // Tambahkan event listener
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Inisialisasi status awal
    if (navigator.onLine) {
      // Tidak menampilkan notifikasi online saat inisialisasi kecuali sebelumnya offline
    } else {
      setIsOnline(false);
      // Tampilkan notifikasi offline jika saat inisialisasi sedang offline
      if (!offlineToastId.current) {
        offlineToastId.current = toast.error('Koneksi internet terputus', {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }

      // Hapus notifikasi yang sedang aktif
      if (onlineToastId.current) {
        toast.dismiss(onlineToastId.current);
      }
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
      }
    };
  }, [checkApiConnection]);

  return null; // Komponen ini tidak merender apa pun
};

export default NetworkStatusNotifier;