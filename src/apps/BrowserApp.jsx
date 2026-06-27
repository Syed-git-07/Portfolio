import React from 'react';

const BrowserApp = ({ url }) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="os-panel-inset" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', backgroundColor: '#e0e0e0', borderBottom: '1px solid #999', gap: '8px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>🌐</span>
        <input 
          type="text" 
          value={url} 
          readOnly 
          className="app-input" 
          style={{ flex: 1, margin: 0, padding: '4px 8px', fontSize: '12px' }}
        />
      </div>
      <iframe
        src={url}
        title="Browser Window"
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default BrowserApp;
