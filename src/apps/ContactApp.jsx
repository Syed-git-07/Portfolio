import React, { useState } from 'react';
import { useOs } from '../context/osContext';

const ContactApp = () => {
  const { currentUser, elevatedApps, setUacApp } = useOs();
  const [revealed, setRevealed] = useState(false);

  const isGuest = currentUser.isGuest;
  const isContactElevated = elevatedApps.includes('contact-reveal');
  const showSensitive = !isGuest || isContactElevated || revealed;

  const handleReveal = () => {
    if (isGuest && !isContactElevated) {
      // Trigger UAC for revealing contact
      setUacApp({
        id: 'contact-reveal',
        title: 'Reveal Sensitive Contact Info',
        component: null, // just a UAC check, no app to open
        onElevate: () => setRevealed(true),
      });
    }
  };

  const email = 'syedsufyanpersonal@gmail.com';
  const phone = '+91 93841 34978';

  const maskedEmail = 'sye*****@gmail.com';
  const maskedPhone = '+91 ***** **978';

  return (
    <div className="app-content">
      <h3 className="app-heading">📧 Contact Me</h3>
      <p className="app-subtext">Reach out through any of the channels below.</p>

      {isGuest && !showSensitive && (
        <div
          style={{
            background: 'rgba(0,0,60,0.06)',
            border: '2px solid',
            borderColor: '#808080 #fff #fff #808080',
            padding: '8px 10px',
            marginBottom: '10px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔒</span>
          <div>
            <span style={{ fontWeight: 'bold' }}>Sensitive contact details are masked for Guest users.</span>
            {' '}
            <button
              onClick={handleReveal}
              style={{
                background: 'none',
                border: 'none',
                color: '#0078d4',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Verify to Reveal
            </button>
          </div>
        </div>
      )}

      <div className="app-list" style={{ marginBottom: 14 }}>
        <a
          href={showSensitive ? `mailto:${email}` : undefined}
          className="os-panel-inset app-contact-row"
          style={!showSensitive ? { cursor: 'default' } : {}}
        >
          <span className="item-icon-lg">✉️</span>
          <div>
            <div className="app-contact-label">Email</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showSensitive ? email : maskedEmail}
              {!showSensitive && <span style={{ fontSize: '10px', color: '#888' }}>🔒</span>}
            </div>
          </div>
        </a>

        <a
          href={showSensitive ? `tel:+919384134978` : undefined}
          className="os-panel-inset app-contact-row"
          style={!showSensitive ? { cursor: 'default' } : {}}
        >
          <span className="item-icon-lg">📞</span>
          <div>
            <div className="app-contact-label">Phone</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showSensitive ? phone : maskedPhone}
              {!showSensitive && <span style={{ fontSize: '10px', color: '#888' }}>🔒</span>}
            </div>
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
