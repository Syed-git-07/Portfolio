import React, { useEffect, useRef } from 'react';
import { useOs } from '../context/osContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const { setSystemState } = useOs();
  const okButtonRef = useRef(null);

  useEffect(() => {
    // Focus the OK button automatically on mount for quick login with Enter key
    if (okButtonRef.current) {
      okButtonRef.current.focus();
    }
  }, []);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setSystemState('desktop');
  };

  return (
    <div className="login-screen">
      <div className="login-dialog os-panel">
        <div className="login-header">
          <span className="login-title">Log On to Windows Portfolio</span>
          <div className="login-header-icon">💻</div>
        </div>
        <div className="login-body-wrapper">
          <div className="login-sidebar">
            <div className="sidebar-brand-text">
              <span>OS</span>
              <span className="version-tag">98</span>
            </div>
          </div>
          <div className="login-main-form">
            <form onSubmit={handleLogin} className="logon-form">
              <div className="logon-instruction">
                Type a user name and password to log on.
              </div>
              
              <div className="form-row">
                <label htmlFor="username">User name:</label>
                <input 
                  id="username"
                  type="text" 
                  className="os-input os-panel-inset logon-input" 
                  value="Guest" 
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
                * Click OK to log on. No password is required.
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

