import React from 'react';

const AchievementsApp = () => {
  const achievements = [
    { title: '1st Prize — Project Presentation', details: 'KPR Institute of Engineering and Technology', icon: '🏆' },
    { title: '1st Prize — Technical Quiz', details: 'KPR Institute of Engineering and Technology', icon: '🏆' },
    { title: '2nd Prize — Capture The Flag (CTF)', details: 'KPR Institute of Engineering and Technology', icon: '🥈' },
    { title: '3rd Prize — Enigma Event', details: 'SSN College of Engineering', icon: '🥉' },
    { title: 'Notable Participant — FOSSEE Geospatial Mapathon', details: 'IIT Bombay', icon: '🗺️' },
  ];

  return (
    <div className="app-content">
      <h3 className="app-heading">🏆 Achievements</h3>
      <p className="app-subtext">Recognitions and competition awards.</p>

      <div className="app-list">
        {achievements.map((ach, idx) => (
          <div key={idx} className="os-panel app-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <span className="item-icon-lg">{ach.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>{ach.title}</div>
              <div style={{ color: '#444', fontSize: 11, marginTop: 2 }}>{ach.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsApp;
