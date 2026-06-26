import React from 'react';

const ProjectsApp = () => {
  const projects = [
    {
      name: 'Timetable Scheduler System',
      tag: 'Full-Stack · Featured',
      desc: 'Developed a smart timetable scheduling application that automates the generation of class schedules while intelligently resolving conflicts among teachers, rooms, and subjects. The system uses constraint-based logic to ensure optimal resource allocation, preventing clashes and producing ready-to-use timetables efficiently.',
      tech: ['Spring Boot', 'Java', 'MySQL', 'HTML5', 'CSS3', 'JavaScript'],
      link: 'https://github.com/Syed-git-07/timetable_scheduler_system',
    },
    {
      name: 'YouTube Clone',
      tag: 'Frontend',
      desc: "Built a fully responsive video streaming web application inspired by YouTube's UI/UX. Features include a dynamic video grid, sidebar navigation, search functionality, dark mode support, and pixel-perfect layouts for both mobile and desktop viewports.",
      tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design', 'Flexbox & Grid'],
      link: 'https://github.com/Syed-git-07/Youtube_clone',
    },
  ];

  return (
    <div className="app-content">
      <h3 className="app-heading">📁 My Projects</h3>
      <p className="app-subtext">Double-click any item to open source in a new window, or click the links below.</p>

      <div className="app-list">
        {projects.map((proj, idx) => (
          <div key={idx} className="os-panel app-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: 13 }}>{proj.name}</span>
              <span className="os-panel-inset app-badge">{proj.tag}</span>
            </div>

            <p className="os-panel-inset app-card-inset" style={{ margin: 0 }}>{proj.desc}</p>

            <div className="app-skill-tags">
              {proj.tech.map((t, i) => (
                <span key={i} className="app-tag">{t}</span>
              ))}
            </div>

            <div className="app-form-actions">
              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="os-btn" style={{ fontWeight: 'bold' }}>
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
