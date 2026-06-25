import React from 'react';

const CertificationsApp = () => {
  const certifications = [
    {
      title: 'Introduction to Industry 4.0 & Industrial Internet of Things',
      provider: 'NPTEL — IIT Kharagpur',
      score: '82%',
      badge: 'Silver + Elite',
      file: '/others/NPTEL_IIOT4.0.pdf'
    },
    {
      title: 'Introduction to Internet of Things',
      provider: 'NPTEL — IIT Kharagpur',
      score: '84%',
      badge: 'Silver + Elite',
      file: '/others/NPTEL_Introduction to Internet of Things.pdf'
    },
    {
      title: 'Technical English',
      provider: 'NPTEL — IIT Madras',
      score: '78%',
      badge: 'Silver + Elite',
      file: '/others/NPTEL_Technical English for engineers.pdf'
    },
    {
      title: 'The Joy of Computing using Python',
      provider: 'NPTEL — IIT Ropar',
      score: '73%',
      badge: 'Elite',
      file: '/others/NPTEL_Joyofcomputing_using_python.pdf'
    },
    {
      title: 'Foundations of Deep Learning',
      provider: 'NPTEL — IIT Ropar',
      score: '70%',
      badge: 'Elite',
      file: '/others/NPTEL_Foundations of Deep learning .pdf'
    }
  ];

  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid var(--os-shadow)', paddingBottom: '3px' }}>Certifications</h3>
      <p style={{ marginBottom: '15px' }}>Double-click certificates to open credential PDFs:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {certifications.map((cert, idx) => (
          <a 
            key={idx} 
            href={cert.file} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="os-panel-inset" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '8px 12px', 
              backgroundColor: 'white', 
              textDecoration: 'none', 
              color: 'black' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <span style={{ fontSize: '24px' }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{cert.title}</div>
              <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>{cert.provider} · Score: {cert.score} ({cert.badge})</div>
            </div>
            <div className="os-btn" style={{ padding: '2px 6px', pointerEvents: 'none' }}>
              Open
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CertificationsApp;
