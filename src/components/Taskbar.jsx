import React, { useState, useEffect, useRef } from 'react';
import { useOs } from '../context/osContext';
import { OS_NAME, USER_NAME } from '../constants/branding';
import './Taskbar.css';

const Taskbar = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, setSystemState, openWindow } = useOs();
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const startRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startOpen && startRef.current && !startRef.current.contains(e.target)) {
        setStartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [startOpen]);

  const toggleStart = () => setStartOpen(!startOpen);

  const handleWindowClick = (id) => {
    if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  const launchApp = (id, title, component) => {
    openWindow(id, title, component);
    setStartOpen(false);
  };

  const menuItems = [
    { id: 'about', title: 'About Me', component: 'AboutApp', icon: '📝' },
    { id: 'projects', title: 'My Projects', component: 'ProjectsApp', icon: '📁' },
    { id: 'skills', title: 'Skills', component: 'SkillsApp', icon: '🛠️' },
    { id: 'certifications', title: 'Certifications', component: 'CertificationsApp', icon: '📜' },
    { id: 'achievements', title: 'Achievements', component: 'AchievementsApp', icon: '🏆' },
    { id: 'contact', title: 'Contact Me', component: 'ContactApp', icon: '📧' },
  ];

  return (
    <div className="taskbar os-panel">
      <div className="start-area" ref={startRef}>
        <button
          className={`os-btn start-btn ${startOpen ? 'active' : ''}`}
          onClick={toggleStart}
        >
          <img src="/windows-flag.svg" alt="" className="start-icon" />
          <b>Start</b>
        </button>

        {startOpen && (
          <div className="start-menu os-panel">
            <div className="start-menu-sidebar">
              <span><b>{OS_NAME.split(' ')[0]}</b></span>
              <span className="start-sidebar-sub">{OS_NAME.split(' ').slice(1).join(' ')}</span>
            </div>
            <div className="start-menu-body">
              <div className="start-menu-header">
                <span className="start-user-icon">👤</span>
                <span className="start-user-name">{USER_NAME}</span>
              </div>
              <div className="start-menu-items">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="start-menu-item"
                    onClick={() => launchApp(item.id, item.title, item.component)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    {item.title}
                  </div>
                ))}
              </div>
              <div className="start-menu-footer">
                <div
                  className="start-menu-item shutdown-item"
                  onClick={() => { setSystemState('boot'); setStartOpen(false); }}
                >
                  <span className="item-icon">🛑</span>
                  Shut Down...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="taskbar-windows">
        {windows.map((w) => (
          <button
            key={w.id}
            className={`os-btn taskbar-window-btn ${activeWindowId === w.id && !w.isMinimized ? 'active' : ''}`}
            onClick={() => handleWindowClick(w.id)}
          >
            <span className="taskbar-win-icon">💻</span>
            {w.title}
          </button>
        ))}
      </div>

      <div className="taskbar-tray os-panel-inset">
        <span className="tray-icon" title="Volume">🔊</span>
        <span className="tray-icon" title="Network">🌐</span>
        <span className="tray-clock">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default Taskbar;
