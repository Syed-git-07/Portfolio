import React from 'react';

const AchievementsApp = () => {
  const achievements = [
    { title: '1st Prize — Project Presentation', details: 'KPR Institute of Engineering and Technology', icon: '🏆' },
    { title: '1st Prize — Technical Quiz', details: 'KPR Institute of Engineering and Technology', icon: '🏆' },
    { title: '2nd Prize — Capture The Flag (CTF)', details: 'KPR Institute of Engineering and Technology', icon: '🥈' },
    { title: '3rd Prize — Enigma Event', details: 'SSN College of Engineering', icon: '🥉' },
    { title: 'Notable Participant — FOSSEE Geospatial Mapathon', details: 'IIT Bombay', icon: '🗺️' }
  ];

  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid var(--os-shadow)', paddingBottom: '3px' }}>Achievements</h3>
      <p style={{ marginBottom: '15px' }}>Recognitions and competition awards:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {achievements.map((ach, idx) => (
          <div 
            key={idx} 
            className="os-panel" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '8px 12px', 
              backgroundColor: '#e0e0e0' 
            }}
          >
            <span style={{ fontSize: '24px' }}>{ach.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>{ach.title}</div>
              <div style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>{ach.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsApp;
