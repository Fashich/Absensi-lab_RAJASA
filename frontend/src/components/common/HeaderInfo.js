import React, { useState, useEffect } from 'react';
import './HeaderInfo.css';

const HeaderInfo = ({ isSidebarCollapsed }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine ? 'online' : 'offline');
  const [apiStatus, setApiStatus] = useState('checking');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check API connectivity periodically
  useEffect(() => {
    let intervalId;

    const checkApiStatus = async () => {
      try {
        // Ubah jalur API agar sesuai dengan konfigurasi proxy
        const response = await fetch('http://localhost/project_magang/backend/api/auth/check_connection.php', {
          method: 'GET',
          cache: 'no-cache'
        });

        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    // Initial check
    checkApiStatus();

    // Then check every 10 seconds
    intervalId = setInterval(checkApiStatus, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Determine overall status
  const overallStatus = networkStatus === 'offline' ? 'offline' :
                      apiStatus === 'connected' ? 'online' : 'limited-connectivity';

  return (
    <div className={`header-info ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="header-left">

        {/* Network Status Indicator */}
        <div className="network-status-indicator">
          <div className={`status-dot ${overallStatus}`}></div>
          <span className="status-text">{overallStatus === 'online' ? 'Online' :
                                          overallStatus === 'offline' ? 'Offline' :
                                          'Limited Connection'}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="date-time-info">
          <div className="date">
            <i className="fas fa-calendar-alt"></i>
            <span>{currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="time">
            <i className="fas fa-clock"></i>
            <span>{currentTime.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderInfo;