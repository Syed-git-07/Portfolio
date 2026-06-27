import React, { useState, useEffect, useRef } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL } from '../constants/branding';
import UserAvatar from './UserAvatar';
import './Taskbar.css';

const Taskbar = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, setSystemState, openWindow, currentUser, resetSession } = useOs();
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

  const handleShutDown = () => {
    resetSession();
    setSystemState('boot');
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
    <div className="taskbar">
      <div className="start-area" ref={startRef}>
        <button
          className={`taskbar-start-btn ${startOpen ? 'active' : ''}`}
          onClick={toggleStart}
          aria-label="Start"
        >
          <div className="taskbar-win-logo">
            <span className="flag-tile red" />
            <span className="flag-tile green" />
            <span className="flag-tile blue" />
            <span className="flag-tile yellow" />
          </div>
        </button>

        {startOpen && (
          <div className="start-menu">
            <div className="start-menu-user">
              <UserAvatar
                src={currentUser.avatar}
                name={currentUser.name}
                isGuest={currentUser.isGuest}
                size="md"
              />
              <div className="start-menu-user-info">
                <span className="start-user-name">{currentUser.name}</span>
                <span className="start-user-role">
                  {currentUser.isGuest ? 'Guest account' : 'Administrator'}
                </span>
              </div>
            </div>

            <div className="start-menu-search">
              <span className="search-icon">🔍</span>
              <span>Type here to search</span>
            </div>

            <div className="start-menu-section-label">Pinned</div>
            <div className="start-menu-pinned">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="start-pinned-item"
                  onClick={() => launchApp(item.id, item.title, item.component)}
                >
                  <span className="pinned-icon">{item.icon}</span>
                  <span className="pinned-label">{item.title}</span>
                </button>
              ))}
            </div>

            <div className="start-menu-footer">
              <button type="button" className="start-footer-btn" onClick={handleShutDown}>
                <span>⏻</span> Shut down
              </button>
              <span className="start-footer-os">{OS_FULL}</span>
            </div>
          </div>
        )}
      </div>

      <div className="taskbar-windows">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`taskbar-window-btn ${activeWindowId === w.id && !w.isMinimized ? 'active' : ''}`}
            onClick={() => handleWindowClick(w.id)}
          >
            {w.title}
          </button>
        ))}
      </div>

      <div className="taskbar-tray">
        <span className="tray-icon" title="Wi-Fi">📶</span>
        <span className="tray-icon" title="Volume">🔊</span>
        <div className="tray-clock-block">
          <span className="tray-clock">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="tray-date">
            {time.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
