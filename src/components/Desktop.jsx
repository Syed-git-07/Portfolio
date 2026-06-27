import React, { useState } from 'react';
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
];

const Desktop = () => {
  const { windows, openWindow, currentUser } = useOs();
  const [selectedIcon, setSelectedIcon] = useState(null);

  const displayName = currentUser.isGuest
    ? currentUser.name
    : currentUser.name.split(' ')[0];

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
    <div className="desktop wallpaper-win11" onClick={handleDesktopClick}>
      <div className="desktop-watermark">
        <span>{OS_FULL}</span>
      </div>

      <div className="desktop-welcome">
        <p className="welcome-greeting">
          Hello, <strong>{displayName}</strong>!
        </p>
        <p className="welcome-hint">
          {currentUser.isGuest
            ? 'You are browsing as a guest. Double-click icons to explore the portfolio.'
            : 'Welcome back. Double-click icons to explore my portfolio.'}
        </p>
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
