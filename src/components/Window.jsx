import React, { useState, useRef, useEffect } from 'react';
import { useOs } from '../context/osContext';
import AboutApp from '../apps/AboutApp';
import ProjectsApp from '../apps/ProjectsApp';
import ContactApp from '../apps/ContactApp';
import SkillsApp from '../apps/SkillsApp';
import CertificationsApp from '../apps/CertificationsApp';
import AchievementsApp from '../apps/AchievementsApp';
import './Window.css';

const Window = ({ app }) => {
  const { id, title, component, isMinimized, zIndex } = app;
  const { closeWindow, minimizeWindow, focusWindow } = useOs();
  
  const [position, setPosition] = useState({ x: 100 + zIndex * 10, y: 50 + zIndex * 10 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only drag on title bar if not maximized
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
          y: Math.max(0, windowStartPos.current.y + dy) // prevent going above screen
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

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

  return (
    <div 
      className={`window os-panel ${isMaximized ? 'maximized' : ''}`} 
      style={{ 
        left: isMaximized ? 0 : position.x, 
        top: isMaximized ? 0 : position.y, 
        zIndex: zIndex,
        width: isMaximized ? '100vw' : '480px',
        height: isMaximized ? 'calc(100vh - 30px)' : '420px',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`window-titlebar ${zIndex > 1 ? 'active' : ''}`}>
        <div className="window-title" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>💻</span>
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <button className="os-btn window-btn" onClick={() => minimizeWindow(id)}>_</button>
          <button className="os-btn window-btn" onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? '❐' : '☐'}
          </button>
          <button className="os-btn window-btn" onClick={() => closeWindow(id)}>X</button>
        </div>
      </div>
      <div className="window-content" style={{ height: 'calc(100% - 22px)', overflowY: 'auto' }}>
        {component === 'AboutApp' && <AboutApp />}
        {component === 'ProjectsApp' && <ProjectsApp />}
        {component === 'ContactApp' && <ContactApp />}
        {component === 'SkillsApp' && <SkillsApp />}
        {component === 'CertificationsApp' && <CertificationsApp />}
        {component === 'AchievementsApp' && <AchievementsApp />}
        {component !== 'AboutApp' && component !== 'ProjectsApp' && component !== 'ContactApp' && component !== 'SkillsApp' && component !== 'CertificationsApp' && component !== 'AchievementsApp' && <div>App Content: {title}</div>}
      </div>
    </div>
  );
};

export default Window;

