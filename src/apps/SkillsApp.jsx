import React from 'react';

const SkillsApp = () => {
  const skillCategories = [
    { title: 'Programming Languages', skills: ['Java', 'JavaScript', 'Python', 'C', 'C++', 'SQL'], icon: '💻' },
    { title: 'Web Technologies', skills: ['HTML5', 'CSS3', 'Responsive Design', 'REST APIs'], icon: '🌐' },
    { title: 'Frameworks & Tools', skills: ['Spring Boot', 'MySQL', 'Git & GitHub', 'VS Code', 'Postman'], icon: '🛠️' },
    { title: 'Soft Skills & Communication', skills: ['Problem Solving', 'Team Collaboration', 'English', 'Tamil', 'Analytical Thinking'], icon: '💬' },
    { title: 'Currently Learning', skills: ['Data Structures', 'Algorithms', 'Machine Learning', 'Deep Learning', 'Cloud Basics'], icon: '📚' },
  ];

  return (
    <div className="app-content">
      <h3 className="app-heading">🛠️ Technical & Soft Skills</h3>
      <p className="app-subtext">Installed modules and system capabilities on Syed OS Portfolio.</p>

      <div className="app-grid">
        {skillCategories.map((cat, idx) => (
          <div key={idx} className="os-panel app-card">
            <div className="app-skill-header">
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </div>
            <div className="app-skill-tags">
              {cat.skills.map((skill, i) => (
                <span key={i} className="os-panel-inset app-skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsApp;
