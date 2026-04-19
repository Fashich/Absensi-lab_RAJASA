import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./NetworkStatusNotifier.css";

const NetworkStatusNotifier = () => {
  const onlineToastId = useRef(null);
  const offlineToastId = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiConnected, setApiConnected] = useState(true);
  const connectionCheckInterval = useRef(null);

  // Simpan state terbaru di ref agar bisa dipakai di dalam callback
  // tanpa perlu masuk ke dependency array
  const isOnlineRef = useRef(isOnline);
  const apiConnectedRef = useRef(apiConnected);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);
  useEffect(() => {
    apiConnectedRef.current = apiConnected;
  }, [apiConnected]);

  // Dependency array kosong — fungsi ini tidak perlu dibuat ulang
  const checkApiConnection = useCallback(async () => {
    try {
      await api.get("/api/auth/check_connection.php");
      if (!apiConnectedRef.current) {
        setApiConnected(true);
      }
    } catch (error) {
      if (apiConnectedRef.current) {
        setApiConnected(false);
        if (isOnlineRef.current) {
          if (offlineToastId.current) {
            toast.dismiss(offlineToastId.current);
          }
          offlineToastId.current = toast.warn(
            "Server tidak merespon, periksa koneksi jaringan",
            {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
        }
      }
    }
  }, []); // <-- kosong, aman karena pakai ref

  useEffect(() => {
    // Cek koneksi API setiap 10 detik
    connectionCheckInterval.current = setInterval(checkApiConnection, 10000);
    checkApiConnection();

    const handleOnline = () => {
      setIsOnline(true);
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
        offlineToastId.current = null;
      }
      onlineToastId.current = toast.success("Koneksi internet pulih", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => checkApiConnection(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (onlineToastId.current) {
        toast.dismiss(onlineToastId.current);
        onlineToastId.current = null;
      }
      if (!offlineToastId.current) {
        offlineToastId.current = toast.error("Koneksi internet terputus", {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setIsOnline(false);
      if (!offlineToastId.current) {
        offlineToastId.current = toast.error("Koneksi internet terputus", {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connectionCheckInterval.current)
        clearInterval(connectionCheckInterval.current);
      if (onlineToastId.current) toast.dismiss(onlineToastId.current);
      if (offlineToastId.current) toast.dismiss(offlineToastId.current);
    };
  }, [checkApiConnection]); // checkApiConnection sekarang stabil (tidak berubah)

  return null;
};

export default NetworkStatusNotifier;
