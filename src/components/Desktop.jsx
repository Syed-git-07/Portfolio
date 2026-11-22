import React, { useState, useEffect } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL } from '../constants/branding';
import '../styles/wallpaper.css';
import './Desktop.css';
import Taskbar from './Taskbar';
import Window from './Window';

const DESKTOP_ICONS = [
  { id: 'about', title: 'About Me', component: 'AboutApp', icon: '📝', label: 'About Me' },
  { id: 'projects', title: 'My Projects', component: 'ProjectsApp', icon: '📁', label: 'Projects' },
  { id: 'skills', title: 'Skills', component: 'SkillsApp', icon: '🛠️', label: 'Skills' },
  { id: 'certifications', title: 'Certifications', component: 'CertificationsApp', icon: '📜', label: 'Certs' },
  { id: 'achievements', title: 'Achievements', component: 'AchievementsApp', icon: '🏆', label: 'Awards' },
  { id: 'contact', title: 'Contact Me', component: 'ContactApp', icon: '📧', label: 'Contact' },
  { id: 'guestchat', title: 'Public Guest Chat', component: 'GuestChatApp', icon: '💬', label: 'Public Chat' },
  { id: 'terminal', title: 'System Terminal', component: 'TerminalApp', icon: '🐚', label: 'Terminal', isSecure: true },
  { id: 'admin', title: 'Admin Control Panel', component: 'AdminPanelApp', icon: '⚙️', label: 'Control Panel', isSecure: true },
];

const Desktop = () => {
  const {
    windows,
    openWindow,
    currentUser,
    wallpaperClass,
    elevatedApps,
    elevateApp,
    verifyPinOrPassword,
    addSystemLog,
    uacApp,
    setUacApp,
  } = useOs();

  const [selectedIcon, setSelectedIcon] = useState(null);
  const [uacPin, setUacPin] = useState('');
  const [uacError, setUacError] = useState(false);

  // Reset UAC input fields whenever a new UAC prompt is triggered (from any source)
  useEffect(() => {
    if (uacApp) {
      setUacPin('');
      setUacError(false);
    }
  }, [uacApp]);

  const displayName = currentUser.isGuest
    ? currentUser.name
    : currentUser.name.split(' ')[0];

  const handleIconClick = (id) => setSelectedIcon(id);

  const handleIconDoubleClick = (icon) => {
    if (icon.isSecure && currentUser.isGuest && !elevatedApps.includes(icon.id)) {
      setUacApp(icon);
      setUacPin('');
      setUacError(false);
    } else {
      openWindow(icon.id, icon.title, icon.component);
      setSelectedIcon(icon.id);
    }
  };

  const handleDesktopClick = (e) => {
    if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icons-grid')) {
      setSelectedIcon(null);
    }
  };

  const handleUacSubmit = (e) => {
    e.preventDefault();
    if (verifyPinOrPassword(uacPin)) {
      elevateApp(uacApp.id);
      addSystemLog(`Elevation granted for '${uacApp.title}'.`);
      // If there's an onElevate callback (e.g. contact reveal), call it instead of opening a window
      if (typeof uacApp.onElevate === 'function') {
        uacApp.onElevate();
      } else if (uacApp.component) {
        openWindow(uacApp.id, uacApp.title, uacApp.component);
        setSelectedIcon(uacApp.id);
      }
      setUacApp(null);
      setUacPin('');
    } else {
      setUacError(true);
      addSystemLog(`Elevation rejected: Invalid PIN/Password entered for app '${uacApp.title}'.`);
      setTimeout(() => setUacError(false), 2000);
      setUacPin('');
    }
  };

  return (
    <div className={`desktop ${wallpaperClass}`} onClick={handleDesktopClick}>
      <div className="desktop-watermark">
        <span>{OS_FULL}</span>
      </div>

      {currentUser.isGuest && (
        <div className="desktop-guest-watermark">
          <div>{OS_FULL}</div>
          <div>Evaluation Copy (Guest Account Mode)</div>
          <div>Restricted Privilege Execution Enabled</div>
        </div>
      )}

      <div className="desktop-welcome">
        <p className="welcome-greeting">
          Hello, <strong>{displayName}</strong>!
        </p>
        <p className="welcome-hint">
          {currentUser.isGuest
            ? 'Restricted Access: Double-click icons to explore. Administrative tools will prompt for UAC validation.'
            : 'Root Access: Double-click icons to explore. Full control panel options unlocked.'}
        </p>
      </div>

      <div className="desktop-icons-grid">
        {DESKTOP_ICONS.map((icon) => {
          const isRestricted = icon.isSecure && currentUser.isGuest && !elevatedApps.includes(icon.id);
          return (
            <div
              key={icon.id}
              className={`desktop-icon ${selectedIcon === icon.id ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleIconClick(icon.id); }}
              onDoubleClick={(e) => { e.stopPropagation(); handleIconDoubleClick(icon); }}
            >
              <div className="icon-img-wrap" style={{ position: 'relative' }}>
                <span className="icon-img">{icon.icon}</span>
                {isRestricted && (
                  <span
                    className="icon-lock-badge"
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      fontSize: '11px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      borderRadius: '50%',
                      padding: '2px',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    🔒
                  </span>
                )}
              </div>
              <span className="icon-label">{icon.label}</span>
            </div>
          );
        })}
      </div>

      {windows.map((w) => (
        <Window key={w.id} app={w} />
      ))}

      {/* User Account Control Modal */}
      {uacApp && (
        <div className="uac-modal" onClick={() => setUacApp(null)}>
          <div className="uac-dialog os-panel" onClick={(e) => e.stopPropagation()}>
            <div className="uac-header">
              <span className="uac-shield">🛡️</span>
              <span className="uac-header-title">User Account Control</span>
            </div>
            <div className="uac-body">
              <div className="uac-prompt">
                <div className="uac-warning-icon">⚠️</div>
                <div className="uac-prompt-details">
                  <p className="uac-bold-text">Do you want to allow this application to make changes to your device?</p>
                  <p className="uac-normal-text">Program name: <strong>{uacApp.title}</strong></p>
                  <p className="uac-normal-text">Verified publisher: <strong>Syed Sufyan</strong></p>
                  <p className="uac-normal-text">Security Status: <span style={{ color: '#0078d4', fontWeight: 'bold' }}>Elevated Authorization Required</span></p>
                </div>
              </div>

              <form onSubmit={handleUacSubmit} className="uac-auth-form">
                <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 'bold', color: '#444' }}>
                  Enter Administrator PIN or Password to authorize:
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="password"
                    value={uacPin}
                    onChange={(e) => setUacPin(e.target.value)}
                    placeholder="PIN or Password"
                    autoFocus
                    className="uac-input"
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      border: '2px solid',
                      borderColor: '#808080 #fff #fff #808080',
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                    }}
                  />
                  <button type="submit" className="os-btn" style={{ fontWeight: 'bold', padding: '4px 14px' }}>Yes</button>
                  <button type="button" className="os-btn" onClick={() => setUacApp(null)} style={{ padding: '4px 14px' }}>Cancel</button>
                </div>
                {uacError && (
                  <p style={{ color: '#ff3330', fontWeight: 'bold', margin: '8px 0 0', fontSize: '11px' }}>
                    Access Denied: Incorrect PIN or Password.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <Taskbar />
    </div>
  );
};

export default Desktop;