import React from 'react';
import './Loading.css';

const Loading = ({ fullScreen = false, size = 'medium', text = 'Memuat...' }) => {
  const sizeClass = {
    small: 'loading-spinner-sm',
    medium: 'loading-spinner-md',
    large: 'loading-spinner-lg'
  }[size] || 'loading-spinner-md';

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner ${sizeClass}`}></div>
        <p className="loading-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {text && <span className="loading-text-inline">{text}</span>}
    </div>
  );
};

export default Loading;
