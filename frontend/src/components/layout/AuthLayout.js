import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <i className="fas fa-id-card"></i>
            </div>
            <h1 className="auth-title">Sistem Absensi Lab</h1>
            <p className="auth-subtitle">SMK Rajasa Surabaya</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <i className="fas fa-wifi"></i>
              <span>IoT Based</span>
            </div>
            <div className="auth-feature">
              <i className="fas fa-shield-alt"></i>
              <span>Secure</span>
            </div>
            <div className="auth-feature">
              <i className="fas fa-clock"></i>
              <span>Real-time</span>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
