import React, { useState, useEffect } from 'react';
import { useOs } from '../context/osContext';
import './Taskbar.css';

const Taskbar = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, setSystemState, openWindow } = useOs();
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleStart = () => setStartOpen(!startOpen);

  const handleWindowClick = (id) => {
    if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <div className="taskbar os-panel">
      <button 
        className={`os-btn start-btn ${startOpen ? 'active' : ''}`}
        onClick={toggleStart}
      >
        <img src="/assets/react.svg" alt="logo" className="start-icon" style={{width: '16px', marginRight: '4px'}}/>
        <b>Start</b>
      </button>

      {startOpen && (
        <div className="start-menu os-panel">
          <div className="start-menu-sidebar">
            <span><b>OS</b> Portfolio</span>
          </div>
          <div className="start-menu-items">
            <div className="start-menu-item" onClick={() => { openWindow('about', 'About Me', 'AboutApp'); setStartOpen(false); }}>
              <span className="item-icon">📝</span>
              About Me
            </div>
            <div className="start-menu-item" onClick={() => { openWindow('projects', 'My Projects', 'ProjectsApp'); setStartOpen(false); }}>
              <span className="item-icon">📁</span>
              Projects
            </div>
            <div className="start-menu-item" onClick={() => { openWindow('skills', 'Skills', 'SkillsApp'); setStartOpen(false); }}>
              <span className="item-icon">🛠️</span>
              Skills
            </div>
            <div className="start-menu-item" onClick={() => { openWindow('certifications', 'Certifications', 'CertificationsApp'); setStartOpen(false); }}>
              <span className="item-icon">📜</span>
              Certifications
            </div>
            <div className="start-menu-item" onClick={() => { openWindow('achievements', 'Achievements', 'AchievementsApp'); setStartOpen(false); }}>
              <span className="item-icon">🏆</span>
              Achievements
            </div>
            <div className="start-menu-item" onClick={() => { openWindow('contact', 'Contact Me', 'ContactApp'); setStartOpen(false); }}>
              <span className="item-icon">📧</span>
              Contact
            </div>
            <div className="start-menu-divider"></div>
            <div className="start-menu-item" onClick={() => { setSystemState('boot'); setStartOpen(false); }}>
              <span className="item-icon">🛑</span>
              Shut Down...
            </div>
          </div>
        </div>
      )}

      <div className="taskbar-windows">
        {windows.map(w => (
          <button 
            key={w.id}
            className={`os-btn taskbar-window-btn ${activeWindowId === w.id && !w.isMinimized ? 'active' : ''}`}
            onClick={() => handleWindowClick(w.id)}
          >
            {w.title}
          </button>
        ))}
      </div>

      <div className="taskbar-tray os-panel-inset">
        🔊 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default Taskbar;
