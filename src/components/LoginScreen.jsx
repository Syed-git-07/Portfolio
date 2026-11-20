import React, { useEffect, useState, useCallback } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL, GUEST_NAME, USER_NAME } from '../constants/branding';
import UserAvatar from './UserAvatar';
import GuestChatApp from '../apps/GuestChatApp';
import '../styles/wallpaper.css';
import './LoginScreen.css';

const GUEST_SIGN_IN_STEPS = [
  { at: 0, text: 'Signing in as Guest...' },
  { at: 30, text: 'Applying safety sandboxes...' },
  { at: 65, text: 'Loading restricted user workspace...' },
  { at: 90, text: 'Welcome!' },
];

const OWNER_SIGN_IN_STEPS = [
  { at: 0, text: 'Verifying credentials...' },
  { at: 20, text: 'Privilege authentication successful...' },
  { at: 45, text: 'Loading administrator workspace...' },
  { at: 70, text: 'Mounting secure drives...' },
  { at: 90, text: 'Welcome back, Admin!' },
];

const LoginScreen = () => {
  const { setSystemState, signInAsGuest, signInAsOwner, verifyPinOrPassword, addSystemLog } = useOs();
  const [phase, setPhase] = useState('lock');
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Signing in...');
  const [time, setTime] = useState(new Date());
  const [showPublicChat, setShowPublicChat] = useState(false);

  // Password challenge inputs
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    const steps = selectedUser === 'owner' ? OWNER_SIGN_IN_STEPS : GUEST_SIGN_IN_STEPS;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2.0, 100);
        const msg = [...steps].reverse().find((s) => next >= s.at);
        if (msg) setStatusText(msg.text);
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [phase, selectedUser]);

  useEffect(() => {
    if (phase === 'signing-in' && progress >= 100) {
      const timer = setTimeout(() => setSystemState('desktop'), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, progress, setSystemState]);

  const handleUserSelect = (userType) => {
    setSelectedUser(userType);
    if (userType === 'guest') {
      signInAsGuest();
      setPhase('signing-in');
      setProgress(0);
      setStatusText('Signing in...');
    } else {
      setPhase('password');
      setPasswordInput('');
      setPasswordError(false);
      setShowPassword(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (verifyPinOrPassword(passwordInput)) {
      signInAsOwner();
      setPhase('signing-in');
      setProgress(0);
      setStatusText('Verifying credentials...');
    } else {
      setPasswordError(true);
      addSystemLog('Authentication alert: Administrator login attempt rejected.');
      setTimeout(() => {
        setPasswordError(false);
      }, 500);
      setPasswordInput('');
    }
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

      {phase === 'password' && (
        <div className="login-password-content" onClick={(e) => e.stopPropagation()}>
          <UserAvatar src="/assets/profile.png" name={USER_NAME} size="xl" />
          <p className="login-signing-name">{USER_NAME}</p>
          
          <form 
            onSubmit={handlePasswordSubmit} 
            className={`login-password-form ${passwordError ? 'wiggle' : ''}`}
          >
            <div className="login-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter PIN or Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="login-password-input"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide PIN' : 'Show PIN'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button type="submit" className="login-submit-btn">➡️</button>
          </form>

          {passwordError && <p className="login-error-msg">Incorrect PIN or Password!</p>}
          <p className="login-hint-msg">(Hint: PIN is 1234 or Password is admin)</p>

          <button
            type="button"
            className="login-back-btn"
            onClick={() => setPhase('users')}
          >
            Cancel
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

      {/* Public Guest Chat Widget */}
      {phase !== 'signing-in' && (
        <div className="login-chat-widget-container" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className={`login-chat-toggle-btn ${showPublicChat ? 'active' : ''}`}
            onClick={() => setShowPublicChat(!showPublicChat)}
            title="Public Guest Chat"
          >
            {showPublicChat ? '✕' : '💬'}
          </button>

          {showPublicChat && (
            <div className="login-chat-sidebar">
              <GuestChatApp embedMode={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
