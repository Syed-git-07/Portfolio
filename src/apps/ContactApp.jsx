import React from 'react';

const ContactApp = () => {
  return (
    <div className="app-content">
      <h3 className="app-heading">📧 Contact Me</h3>
      <p className="app-subtext">Reach out through any of the channels below.</p>

      <div className="app-list" style={{ marginBottom: 14 }}>
        <a href="mailto:syedsufyanpersonal@gmail.com" className="os-panel-inset app-contact-row">
          <span className="item-icon-lg">✉️</span>
          <div>
            <div className="app-contact-label">Email</div>
            <div>syedsufyanpersonal@gmail.com</div>
          </div>
        </a>

        <a href="tel:+919384134978" className="os-panel-inset app-contact-row">
          <span className="item-icon-lg">📞</span>
          <div>
            <div className="app-contact-label">Phone</div>
            <div>+91 93841 34978</div>
          </div>
        </a>

        <div className="os-panel-inset app-contact-row" style={{ cursor: 'default' }}>
          <span className="item-icon-lg">📍</span>
          <div>
            <div className="app-contact-label">Location</div>
            <div>Tirunelveli, Tamil Nadu</div>
          </div>
        </div>
      </div>

      <form className="os-panel app-form" action="https://formspree.io/f/mkoapvlr" method="POST">
        <div className="app-skill-header">Send Message</div>
        <div className="app-form-row">
          <label>Name:</label>
          <input type="text" name="name" required />
        </div>
        <div className="app-form-row">
          <label>Email:</label>
          <input type="email" name="email" required />
        </div>
        <div className="app-form-row">
          <label style={{ alignSelf: 'flex-start', marginTop: 3 }}>Message:</label>
          <textarea name="message" required />
        </div>
        <div className="app-form-actions">
          <button type="submit" className="os-btn" style={{ fontWeight: 'bold' }}>Send Mail</button>
        </div>
      </form>
    </div>
  );
};

export default ContactApp;
