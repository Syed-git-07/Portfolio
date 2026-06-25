import React from 'react';

const ContactApp = () => {
  return (
    <div style={{ padding: '10px', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'black' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <span style={{ fontSize: '32px' }}>📧</span>
        <h3 style={{ margin: '0' }}>Contact Me</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        <a 
          href="mailto:syedsufyanpersonal@gmail.com" 
          className="os-panel-inset" 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white', textDecoration: 'none', color: 'black' }}
        >
          <span style={{ fontSize: '18px' }}>✉️</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#666' }}>Email</div>
            <div>syedsufyanpersonal@gmail.com</div>
          </div>
        </a>

        <a 
          href="tel:+919384134978" 
          className="os-panel-inset" 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white', textDecoration: 'none', color: 'black' }}
        >
          <span style={{ fontSize: '18px' }}>📞</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#666' }}>Phone</div>
            <div>+91 93841 34978</div>
          </div>
        </a>

        <div 
          className="os-panel-inset" 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'white' }}
        >
          <span style={{ fontSize: '18px' }}>📍</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#666' }}>Location</div>
            <div>Tirunelveli, Tamil Nadu</div>
          </div>
        </div>
      </div>
      
      <form 
        className="os-panel" 
        style={{ padding: '15px', backgroundColor: '#e0e0e0', display: 'flex', flexDirection: 'column', gap: '10px' }}
        action="https://formspree.io/f/mkoapvlr" 
        method="POST"
      >
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--os-shadow)', paddingBottom: '3px', marginBottom: '5px' }}>
          Send Message
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ width: '60px' }}>Name:</label>
          <input type="text" name="name" className="os-panel-inset" style={{ flex: 1, padding: '3px 5px', outline: 'none', border: '1px solid #808080' }} required />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ width: '60px' }}>Email:</label>
          <input type="email" name="email" className="os-panel-inset" style={{ flex: 1, padding: '3px 5px', outline: 'none', border: '1px solid #808080' }} required />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ width: '60px', marginTop: '3px' }}>Message:</label>
          <textarea name="message" className="os-panel-inset" style={{ flex: 1, height: '70px', padding: '3px 5px', outline: 'none', resize: 'none', border: '1px solid #808080' }} required></textarea>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button type="submit" className="os-btn" style={{ fontWeight: 'bold' }}>Send Mail</button>
        </div>
      </form>
    </div>
  );
};

export default ContactApp;
