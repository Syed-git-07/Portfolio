import React, { useEffect, useState, useCallback } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL, GUEST_NAME, USER_NAME } from '../constants/branding';
import UserAvatar from './UserAvatar';
import '../styles/wallpaper.css';
import './LoginScreen.css';

const SIGN_IN_STEPS = [
  { at: 0, text: 'Signing in...' },
  { at: 25, text: 'Loading user profile...' },
  { at: 50, text: 'Preparing desktop...' },
  { at: 75, text: 'Starting portfolio apps...' },
  { at: 92, text: 'Welcome!' },
];

const LoginScreen = () => {
  const { setSystemState, signInAsGuest, signInAsOwner } = useOs();
  const [phase, setPhase] = useState('lock');
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Signing in...');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = useCallback(() => {
    if (phase === 'lock') setPhase('users');
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (phase === 'lock') handleUnlock();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleUnlock]);

  useEffect(() => {
    if (phase !== 'signing-in') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1.8, 100);
        const msg = [...SIGN_IN_STEPS].reverse().find((s) => next >= s.at);
        if (msg) setStatusText(msg.text);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'signing-in' && progress >= 100) {
      const timer = setTimeout(() => setSystemState('desktop'), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, progress, setSystemState]);

  const handleUserSelect = (userType) => {
    setSelectedUser(userType);
    if (userType === 'guest') signInAsGuest();
    else signInAsOwner();
    setPhase('signing-in');
    setProgress(0);
    setStatusText('Signing in...');
  };

  const formatTime = () =>
    time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const formatDate = () =>
    time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const signingInName = selectedUser === 'owner' ? USER_NAME : GUEST_NAME;
  const signingInGuest = selectedUser !== 'owner';

  return (
    <div
      className={`login-screen wallpaper-win11 ${phase}`}
      onClick={phase === 'lock' ? handleUnlock : undefined}
    >
      <div className="login-overlay" />

      {phase === 'lock' && (
        <div className="login-lock-content">
          <div className="login-clock-block">
            <div className="login-time">{formatTime()}</div>
            <div className="login-date">{formatDate()}</div>
          </div>
          <div className="login-unlock-hint">
            Click or press any key to sign in
          </div>
        </div>
      )}

      {phase === 'users' && (
        <div className="login-users-content" onClick={(e) => e.stopPropagation()}>
          <div className="login-users-header">
            <div className="login-os-badge">
              <div className="login-os-flag">
                <span className="flag-tile red" />
                <span className="flag-tile green" />
                <span className="flag-tile blue" />
                <span className="flag-tile yellow" />
              </div>
              <span>{OS_FULL}</span>
            </div>
          </div>

          <div className="login-user-tiles">
            <button
              type="button"
              className="login-user-tile"
              onClick={() => handleUserSelect('guest')}
            >
              <UserAvatar isGuest size="xl" />
              <span className="login-user-name">{GUEST_NAME}</span>
            </button>

            <button
              type="button"
              className="login-user-tile login-user-tile--owner"
              onClick={() => handleUserSelect('owner')}
            >
              <UserAvatar src="/assets/profile.png" name={USER_NAME} size="xl" />
              <span className="login-user-name">{USER_NAME}</span>
            </button>
          </div>

          <button
            type="button"
            className="login-restart-btn"
            onClick={() => setSystemState('boot')}
          >
            Restart
          </button>
        </div>
      )}

      {phase === 'signing-in' && (
        <div className="login-signing-content">
          <UserAvatar
            src={signingInGuest ? null : '/assets/profile.png'}
            name={signingInName}
            isGuest={signingInGuest}
            size="xl"
            className="login-signing-avatar"
          />
          <p className="login-signing-name">{signingInName}</p>
          <p className="login-signing-status">{statusText}</p>

          <div className="login-signing-spinner">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="signing-dot" style={{ '--i': i }} />
            ))}
          </div>

          <div className="login-progress-wrap">
            <div className="login-progress-track">
              <div
                className="login-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="login-footer">
        <span className="login-footer-os">{OS_FULL}</span>
      </div>
    </div>
  );
};

export default LoginScreen;
