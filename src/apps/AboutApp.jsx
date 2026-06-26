import React from 'react';

const AboutApp = () => {
  return (
    <div className="app-content">
      <div className="app-profile-row">
        <img
          src="/assets/profile.png"
          alt="Syed Sufyan M"
          className="app-profile-photo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="app-profile-fallback">SS</div>

        <div>
          <h2 className="app-profile-name">Syed Sufyan M</h2>
          <p className="app-profile-role"><strong>Aspiring Software Developer & CSE Student</strong></p>
          <p className="app-profile-detail"><strong>National Engineering College, Kovilpatti</strong></p>
          <p className="app-profile-detail" style={{ marginBottom: 14 }}><strong>CGPA:</strong> 8.5 (Upto 3rd Semester)</p>

          <div className="app-link-row">
            <a href="/assets/Syed_Sufyan_RESUME.pdf" target="_blank" rel="noopener noreferrer" className="os-btn">
              📄 Resume
            </a>
            <a href="https://github.com/Syed-git-07" target="_blank" rel="noopener noreferrer" className="os-btn">
              💻 GitHub
            </a>
            <a href="https://www.linkedin.com/in/syed-sufyan-297904323" target="_blank" rel="noopener noreferrer" className="os-btn">
              🔗 LinkedIn
            </a>
            <a href="https://leetcode.com/u/Mightbe_Syed/" target="_blank" rel="noopener noreferrer" className="os-btn">
              🧠 LeetCode
            </a>
          </div>
        </div>
      </div>

      <div className="os-panel-inset app-card-inset" style={{ marginBottom: 18 }}>
        <p style={{ margin: '0 0 8px' }}>
          I am a 3rd-year Computer Science and Engineering student passionate about software development, computational intelligence, and building efficient, user-centric web applications.
        </p>
        <p style={{ margin: 0 }}>
          I enjoy learning new programming paradigms, solving algorithmic puzzles, and continuously challenging myself with complex logic. Let's build something amazing!
        </p>
      </div>

      <h3 className="app-heading">Education Timeline</h3>
      <div className="app-timeline">
        <div className="app-timeline-item">
          <div className="app-timeline-dot" />
          <div className="app-timeline-title">B.E. Computer Science & Engineering (2024 — 2028)</div>
          <div className="app-timeline-sub">National Engineering College, Kovilpatti</div>
          <div className="app-timeline-meta">CGPA: 8.5 (Upto 3rd semester)</div>
        </div>

        <div className="app-timeline-item inactive">
          <div className="app-timeline-dot" />
          <div className="app-timeline-title">Higher Secondary Certificate (HSC) (2023 — 2024)</div>
          <div className="app-timeline-sub">Bell Matric Hr. Sec. School, Tirunelveli</div>
          <div className="app-timeline-meta">Score: 90%</div>
        </div>

        <div className="app-timeline-item inactive">
          <div className="app-timeline-dot" />
          <div className="app-timeline-title">Secondary School Leaving Certificate (SSLC) (2021 — 2022)</div>
          <div className="app-timeline-sub">Seventh Day Adventist School, Srivaikundam</div>
          <div className="app-timeline-meta">Score: 89%</div>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
