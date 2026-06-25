import React, { useState } from 'react';
import { useOs } from '../context/osContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const { setSystemState } = useOs();
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedUser === 'guest') {
      setSystemState('desktop');
    } else if (selectedUser === 'admin') {
      if (password === 'admin') { // simple password for now
        setSystemState('desktop');
      } else {
        setError(true);
        setPassword('');
      }
    }
  };

  return (
    <div className="login-screen">
      <div className="login-dialog os-panel">
        <div className="login-header">
          <span className="login-title">Welcome to OS Portfolio</span>
        </div>
        <div className="login-body">
          <div className="users-list">
            <div 
              className={`user-card ${selectedUser === 'guest' ? 'selected' : ''}`}
              onClick={() => { setSelectedUser('guest'); setError(false); }}
            >
              <div className="user-icon">👤</div>
              <div className="user-name">Guest</div>
            </div>
            <div 
              className={`user-card ${selectedUser === 'admin' ? 'selected' : ''}`}
              onClick={() => { setSelectedUser('admin'); setError(false); }}
            >
              <div className="user-icon admin-icon">🔑</div>
              <div className="user-name">Administrator</div>
            </div>
          </div>

          <div className="login-controls">
            {selectedUser === 'admin' && (
              <form onSubmit={handleLogin} className="password-form">
                <label>Password:</label>
                <input 
                  type="password" 
                  className="os-input os-panel-inset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {error && <div className="error-msg">Incorrect password.</div>}
              </form>
            )}
            
            <div className="login-actions">
              <button 
                className="os-btn" 
                onClick={handleLogin}
                disabled={!selectedUser}
              >
                OK
              </button>
              <button 
                className="os-btn"
                onClick={() => setSystemState('boot')}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
