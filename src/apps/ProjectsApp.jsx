import React from 'react';

const ProjectsApp = () => {
  const projects = [
    {
      name: 'Timetable Scheduler System',
      tag: 'Full-Stack · Featured',
      desc: 'Developed a smart timetable scheduling application that automates the generation of class schedules while intelligently resolving conflicts among teachers, rooms, and subjects. The system uses constraint-based logic to ensure optimal resource allocation, preventing clashes and producing ready-to-use timetables efficiently.',
      tech: ['Spring Boot', 'Java', 'MySQL', 'HTML5', 'CSS3', 'JavaScript'],
      link: 'https://github.com/Syed-git-07/timetable_scheduler_system'
    },
    {
      name: 'YouTube Clone',
      tag: 'Frontend',
      desc: "Built a fully responsive video streaming web application inspired by YouTube's UI/UX. Features include a dynamic video grid, sidebar navigation, search functionality, dark mode support, and pixel-perfect layouts for both mobile and desktop viewports.",
      tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design', 'Flexbox & Grid'],
      link: 'https://github.com/Syed-git-07/Youtube_clone'
    }
  ];

  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid var(--os-shadow)', paddingBottom: '3px' }}>My Projects</h3>
      <p style={{ marginBottom: '15px' }}>Double-click any item to open source in a new window, or click the links below:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {projects.map((proj, idx) => (
          <div 
            key={idx} 
            className="os-panel" 
            style={{ 
              padding: '10px', 
              backgroundColor: '#e0e0e0', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>📂 {proj.name}</span>
              <span className="os-panel-inset" style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#d4d0c8', fontWeight: 'bold' }}>
                {proj.tag}
              </span>
            </div>
            
            <p style={{ margin: '0', lineHeight: '1.4', backgroundColor: 'white', padding: '8px' }} className="os-panel-inset">
              {proj.desc}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
              {proj.tech.map((t, i) => (
                <span key={i} style={{ backgroundColor: '#c0c0c0', padding: '2px 6px', fontSize: '10px', border: '1px solid #808080' }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a 
                href={proj.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="os-btn"
                style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
              >
                💾 View Source Code
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsApp;
