import React from 'react';

const CertificationsApp = () => {
  const certifications = [
    { title: 'Introduction to Industry 4.0 & Industrial Internet of Things', provider: 'NPTEL — IIT Kharagpur', score: '82%', badge: 'Silver + Elite', file: '/others/NPTEL_IIOT4.0.pdf' },
    { title: 'Introduction to Internet of Things', provider: 'NPTEL — IIT Kharagpur', score: '84%', badge: 'Silver + Elite', file: '/others/NPTEL_Introduction to Internet of Things.pdf' },
    { title: 'Technical English', provider: 'NPTEL — IIT Madras', score: '78%', badge: 'Silver + Elite', file: '/others/NPTEL_Technical English for engineers.pdf' },
    { title: 'The Joy of Computing using Python', provider: 'NPTEL — IIT Ropar', score: '73%', badge: 'Elite', file: '/others/NPTEL_Joyofcomputing_using_python.pdf' },
    { title: 'Foundations of Deep Learning', provider: 'NPTEL — IIT Ropar', score: '70%', badge: 'Elite', file: '/others/NPTEL_Foundations of Deep learning .pdf' },
  ];

  return (
    <div className="app-content">
      <h3 className="app-heading">📜 Certifications</h3>
      <p className="app-subtext">Click any certificate to open the credential PDF.</p>

      <div className="app-list">
        {certifications.map((cert, idx) => (
          <a key={idx} href={cert.file} target="_blank" rel="noopener noreferrer" className="os-panel-inset app-list-item">
            <span className="item-icon-lg">📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{cert.title}</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                {cert.provider} · Score: {cert.score} ({cert.badge})
              </div>
            </div>
            <span className="os-btn" style={{ padding: '2px 6px', pointerEvents: 'none' }}>Open</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CertificationsApp;
