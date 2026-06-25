import React from 'react';

const AboutApp = () => {
  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
        <img 
          src="/assets/profile.png" 
          alt="Syed Sufyan M" 
          style={{ 
            width: '120px', 
            height: '140px', 
            border: '2px solid', 
            borderColor: 'var(--os-shadow) var(--os-highlight) var(--os-highlight) var(--os-shadow)',
            objectFit: 'cover',
            backgroundColor: '#e0e0e0'
          }} 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ display: 'none', width: '120px', height: '140px', border: '2px solid var(--os-shadow)', alignItems: 'center', justifyContent: 'center', backgroundColor: '#808080', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
          SS
        </div>
        
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Syed Sufyan M</h2>
          <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '13px' }}><strong>Aspiring Software Developer & CSE Student</strong></p>
          <p style={{ margin: '0 0 5px 0' }}><strong>National Engineering College, Kovilpatti</strong></p>
          <p style={{ margin: '0 0 15px 0' }}><strong>CGPA:</strong> 8.5 (Upto 3rd Semester)</p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a href="/assets/Syed_Sufyan_RESUME.pdf" target="_blank" className="os-btn" style={{ textDecoration: 'none', color: 'black', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              📄 Resume
            </a>
            <a href="https://github.com/Syed-git-07" target="_blank" rel="noopener noreferrer" className="os-btn" style={{ textDecoration: 'none', color: 'black' }}>
              💻 GitHub
            </a>
            <a href="https://www.linkedin.com/in/syed-sufyan-297904323" target="_blank" rel="noopener noreferrer" className="os-btn" style={{ textDecoration: 'none', color: 'black' }}>
              🔗 LinkedIn
            </a>
            <a href="https://leetcode.com/u/Mightbe_Syed/" target="_blank" rel="noopener noreferrer" className="os-btn" style={{ textDecoration: 'none', color: 'black' }}>
              🧠 LeetCode
            </a>
          </div>
        </div>
      </div>

      <div className="os-panel-inset" style={{ padding: '12px', backgroundColor: 'white', marginBottom: '20px', lineHeight: '1.4' }}>
        <p style={{ margin: '0 0 8px 0' }}>
          I am a 3rd-year Computer Science and Engineering student passionate about software development, computational intelligence, and building efficient, user-centric web applications.
        </p>
        <p style={{ margin: '0' }}>
          I enjoy learning new programming paradigms, solving algorithmic puzzles, and continuously challenging myself with complex logic. Let's build something amazing!
        </p>
      </div>

      <h3 style={{ margin: '0 0 10px 0', borderBottom: '2px solid var(--os-shadow)', paddingBottom: '3px' }}>Education Timeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '5px' }}>
        <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid var(--os-title-active)' }}>
          <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', backgroundColor: 'var(--os-title-active)', borderRadius: '50%' }}></div>
          <div style={{ fontWeight: 'bold' }}>B.E. Computer Science & Engineering (2024 — 2028)</div>
          <div style={{ color: '#444' }}>National Engineering College, Kovilpatti</div>
          <div style={{ fontSize: '11px', color: '#777' }}>CGPA: 8.5 (Upto 3rd semester)</div>
        </div>
        
        <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid var(--os-shadow)' }}>
          <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', backgroundColor: 'var(--os-shadow)', borderRadius: '50%' }}></div>
          <div style={{ fontWeight: 'bold' }}>Higher Secondary Certificate (HSC) (2023 — 2024)</div>
          <div style={{ color: '#444' }}>Bell Matric Hr. Sec. School, Tirunelveli</div>
          <div style={{ fontSize: '11px', color: '#777' }}>Score: 90%</div>
        </div>

        <div style={{ position: 'relative', paddingLeft: '15px', borderLeft: '2px solid var(--os-shadow)' }}>
          <div style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', backgroundColor: 'var(--os-shadow)', borderRadius: '50%' }}></div>
          <div style={{ fontWeight: 'bold' }}>Secondary School Leaving Certificate (SSLC) (2021 — 2022)</div>
          <div style={{ color: '#444' }}>Seventh Day Adventist School, Srivaikundam</div>
          <div style={{ fontSize: '11px', color: '#777' }}>Score: 89%</div>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
