import React, { useEffect, useRef } from 'react';
import { useOs } from '../context/osContext';
import { OS_NAME, OS_VERSION, USER_NAME } from '../constants/branding';
import '../styles/wallpaper.css';
import './LoginScreen.css';

const LoginScreen = () => {
  const { setSystemState } = useOs();
  const okButtonRef = useRef(null);

  useEffect(() => {
    if (okButtonRef.current) {
      okButtonRef.current.focus();
    }
  }, []);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setSystemState('desktop');
  };

  return (
    <div className="login-screen wallpaper-clouds">
      <div className="login-os-watermark">
        <span className="watermark-name">{OS_NAME}</span>
        <span className="watermark-ver">{OS_VERSION}</span>
      </div>

      <div className="login-dialog os-panel">
        <div className="login-header">
          <span className="login-title">Welcome to {OS_NAME}</span>
          <img src="/windows-flag.svg" alt="" className="login-header-flag" />
        </div>
        <div className="login-body-wrapper">
          <div className="login-sidebar">
            <div className="sidebar-brand-text">
              <span>Syed</span>
              <span className="version-tag">{OS_VERSION}</span>
            </div>
          </div>
          <div className="login-main-form">
            <form onSubmit={handleLogin} className="logon-form">
              <div className="logon-instruction">
                Type a user name and password to log on to {OS_NAME}.
              </div>

              <div className="form-row">
                <label htmlFor="username">User name:</label>
                <input
                  id="username"
                  type="text"
                  className="os-input os-panel-inset logon-input"
                  value={USER_NAME}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-row">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  type="password"
                  className="os-input os-panel-inset logon-input password-disabled"
                  value=""
                  placeholder="(None required)"
                  disabled
                  readOnly
                />
              </div>

              <div className="logon-tip">
                * Click OK to enter the desktop. No password required.
              </div>

              <div className="login-actions">
                <button
                  type="submit"
                  ref={okButtonRef}
                  className="os-btn logon-btn default-btn"
                >
                  OK
                </button>
                <button
                  type="button"
                  className="os-btn logon-btn"
                  onClick={() => setSystemState('boot')}
                >
                  Restart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
