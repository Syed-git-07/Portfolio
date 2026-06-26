import React, { useState } from 'react';
import { useOs } from '../context/osContext';
import { OS_NAME, USER_NAME } from '../constants/branding';
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
];

const Desktop = () => {
  const { windows, openWindow } = useOs();
  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleIconClick = (id) => setSelectedIcon(id);
  const handleIconDoubleClick = (icon) => {
    openWindow(icon.id, icon.title, icon.component);
    setSelectedIcon(icon.id);
  };

  const handleDesktopClick = (e) => {
    if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icons-grid')) {
      setSelectedIcon(null);
    }
  };

  return (
    <div className="desktop wallpaper-clouds" onClick={handleDesktopClick}>
      <div className="desktop-watermark">
        <span>{OS_NAME}</span>
      </div>

      <div className="desktop-welcome os-panel">
        <div className="welcome-titlebar">Welcome</div>
        <p>Hello, <strong>{USER_NAME.split(' ')[0]}</strong>! Double-click icons to explore my portfolio.</p>
      </div>

      <div className="desktop-icons-grid">
        {DESKTOP_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`desktop-icon ${selectedIcon === icon.id ? 'selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleIconClick(icon.id); }}
            onDoubleClick={(e) => { e.stopPropagation(); handleIconDoubleClick(icon); }}
          >
            <div className="icon-img-wrap">
              <span className="icon-img">{icon.icon}</span>
            </div>
            <span className="icon-label">{icon.label}</span>
          </div>
        ))}
      </div>

      {windows.map((w) => (
        <Window key={w.id} app={w} />
      ))}

      <Taskbar />
    </div>
  );
};

export default Desktop;
