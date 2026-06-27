import React, { useState, useRef, useEffect } from 'react';
import { useOs } from '../context/osContext';
import AboutApp from '../apps/AboutApp';
import ProjectsApp from '../apps/ProjectsApp';
import ContactApp from '../apps/ContactApp';
import SkillsApp from '../apps/SkillsApp';
import CertificationsApp from '../apps/CertificationsApp';
import AchievementsApp from '../apps/AchievementsApp';
import BrowserApp from '../apps/BrowserApp';
import './Window.css';

const APP_ICONS = {
  AboutApp: '📝',
  ProjectsApp: '📁',
  SkillsApp: '🛠️',
  CertificationsApp: '📜',
  AchievementsApp: '🏆',
  ContactApp: '📧',
  BrowserApp: '🌐',
};

const Window = ({ app }) => {
  const { id, title, component, isMinimized, zIndex, props = {} } = app;
  const { closeWindow, minimizeWindow, focusWindow, activeWindowId } = useOs();

  const [position, setPosition] = useState({ x: 80 + zIndex * 12, y: 40 + zIndex * 12 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });

  const isActive = activeWindowId === id;

  const handleMouseDown = (e) => {
    if (!isMaximized && e.target.closest('.window-titlebar') && !e.target.closest('.window-controls')) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      windowStartPos.current = { ...position };
    }
    focusWindow(id);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition({
          x: windowStartPos.current.x + dx,
          y: Math.max(0, windowStartPos.current.y + dy),
        });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isMinimized) return null;

  const renderApp = () => {
    switch (component) {
      case 'AboutApp': return <AboutApp />;
      case 'ProjectsApp': return <ProjectsApp />;
      case 'ContactApp': return <ContactApp />;
      case 'SkillsApp': return <SkillsApp />;
      case 'CertificationsApp': return <CertificationsApp />;
      case 'AchievementsApp': return <AchievementsApp />;
      case 'BrowserApp': return <BrowserApp {...props} />;
      default: return <div className="app-content">App Content: {title}</div>;
    }
  };

  return (
    <div
      className={`window os-panel ${isMaximized ? 'maximized' : ''} ${isActive ? 'focused' : ''}`}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        zIndex,
        width: isMaximized ? '100vw' : '500px',
        height: isMaximized ? 'calc(100vh - 30px)' : '440px',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`window-titlebar ${isActive ? 'active' : ''}`}>
        <div className="window-title">
          <span className="window-app-icon">{APP_ICONS[component] || '💻'}</span>
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <button className="os-btn window-btn" onClick={() => minimizeWindow(id)} title="Minimize">_</button>
          <button className="os-btn window-btn" onClick={() => setIsMaximized(!isMaximized)} title="Maximize">
            {isMaximized ? '❐' : '☐'}
          </button>
          <button className="os-btn window-btn window-btn-close" onClick={() => closeWindow(id)} title="Close">✕</button>
        </div>
      </div>
      <div className="window-content">
        {renderApp()}
      </div>
    </div>
  );
};

export default Window;
