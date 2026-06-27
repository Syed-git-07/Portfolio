import React from 'react';
import './UserAvatar.css';

const UserAvatar = ({ src, name, isGuest = false, size = 'md', className = '' }) => {
  const sizeClass = `user-avatar--${size}`;

  if (src && !isGuest) {
    return (
      <div className={`user-avatar ${sizeClass} ${className}`}>
        <img src={src} alt={name || 'User'} className="user-avatar__img" />
      </div>
    );
  }

  return (
    <div className={`user-avatar ${sizeClass} user-avatar--guest ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
        <circle cx="24" cy="18" r="8" fill="rgba(255,255,255,0.85)" />
        <path
          d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16"
          fill="rgba(255,255,255,0.85)"
        />
      </svg>
    </div>
  );
};

export default UserAvatar;
