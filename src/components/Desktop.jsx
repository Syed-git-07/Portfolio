import React from 'react';
import { useOs } from '../context/osContext';
import './Desktop.css';
import Taskbar from './Taskbar';
import Window from './Window';

const Desktop = () => {
  const { windows, openWindow } = useOs();

  return (
    <div className="desktop">
      {/* Desktop Icons will go here */}
      <div className="desktop-icons-grid">
        <div className="desktop-icon" onDoubleClick={() => openWindow('about', 'About Me', 'AboutApp')}>
          <div className="icon-img">📝</div>
          <span>About</span>
        </div>
        <div className="desktop-icon" onDoubleClick={() => openWindow('projects', 'My Projects', 'ProjectsApp')}>
          <div className="icon-img">📁</div>
          <span>Projects</span>
        </div>
        <div className="desktop-icon" onDoubleClick={() => openWindow('skills', 'Skills', 'SkillsApp')}>
          <div className="icon-img">🛠️</div>
          <span>Skills</span>
        </div>
        <div className="desktop-icon" onDoubleClick={() => openWindow('certifications', 'Certifications', 'CertificationsApp')}>
          <div className="icon-img">📜</div>
          <span>Certs</span>
        </div>
        <div className="desktop-icon" onDoubleClick={() => openWindow('achievements', 'Achievements', 'AchievementsApp')}>
          <div className="icon-img">🏆</div>
          <span>Awards</span>
        </div>
        <div className="desktop-icon" onDoubleClick={() => openWindow('contact', 'Contact Me', 'ContactApp')}>
          <div className="icon-img">📧</div>
          <span>Contact</span>
        </div>
      </div>

      {/* Windows */}
      {windows.map(w => (
        <Window key={w.id} app={w} />
      ))}
      
      <Taskbar />
    </div>
  );
};

export default Desktop;

