import React from 'react';

const SkillsApp = () => {
  const skillCategories = [
    {
      title: 'Programming Languages',
      skills: ['Java', 'JavaScript', 'Python', 'C', 'C++', 'SQL'],
      icon: '💻'
    },
    {
      title: 'Web Technologies',
      skills: ['HTML5', 'CSS3', 'Responsive Design', 'REST APIs'],
      icon: '🌐'
    },
    {
      title: 'Frameworks & Tools',
      skills: ['Spring Boot', 'MySQL', 'Git & GitHub', 'VS Code', 'Postman'],
      icon: '🛠️'
    },
    {
      title: 'Soft Skills & Communication',
      skills: ['Problem Solving', 'Team Collaboration', 'English', 'Tamil', 'Analytical Thinking'],
      icon: '💬'
    },
    {
      title: 'Currently Learning',
      skills: ['Data Structures', 'Algorithms', 'Machine Learning', 'Deep Learning', 'Cloud Basics'],
      icon: '📚'
    }
  ];

  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid var(--os-shadow)', paddingBottom: '3px' }}>Technical & Soft Skills</h3>
      <p style={{ marginBottom: '15px' }}>Double-click category items to inspect or configure system variables:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {skillCategories.map((cat, idx) => (
          <div key={idx} className="os-panel" style={{ padding: '10px', backgroundColor: '#e0e0e0' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--os-shadow)', paddingBottom: '3px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {cat.skills.map((skill, i) => (
                <span 
                  key={i} 
                  className="os-panel-inset" 
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '3px 8px', 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsApp;
