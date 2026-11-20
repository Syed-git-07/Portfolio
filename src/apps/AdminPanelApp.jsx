import React, { useState, useEffect } from 'react';
import { useOs } from '../context/osContext';

const AdminPanelApp = () => {
  const {
    systemLogs,
    addSystemLog,
    wallpaperClass,
    setWallpaperClass,
    adminPin,
    setAdminPin,
  } = useOs();

  const [activeTab, setActiveTab] = useState('telemetry');
  const [pinInput, setPinInput] = useState(adminPin);
  const [pinStatus, setPinStatus] = useState('');

  // Mock Telemetry state
  const [cpuLoad, setCpuLoad] = useState(12);
  const [memLoad, setMemLoad] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.max(5, Math.min(98, Math.floor(Math.random() * 25) + 10)));
      setMemLoad(Math.max(30, Math.min(95, Math.floor(Math.random() * 8) + 40)));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleWallpaperChange = (className, displayName) => {
    setWallpaperClass(className);
    addSystemLog(`Personalization: Desktop wallpaper updated to '${displayName}'.`);
  };

  const handlePinUpdate = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinStatus('PIN cannot be empty!');
      return;
    }
    setAdminPin(pinInput);
    setPinStatus('PIN updated successfully!');
    addSystemLog(`Security Policy: Administrator PIN changed.`);
    setTimeout(() => setPinStatus(''), 3000);
  };

  const wallpapers = [
    { id: 'wallpaper-win11', name: 'Windows Bloom', icon: '🌀' },
    { id: 'wallpaper-clouds', name: 'Teal Clouds', icon: '☁️' },
    { id: 'wallpaper-dark-gold', name: 'Dark Gold', icon: '✨' },
    { id: 'wallpaper-cyberpunk', name: 'Cyberpunk', icon: '🌌' },
  ];

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', fontFamily: 'inherit', color: '#000' }}>
      {/* Classic OS Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #808080', paddingBottom: '1px', marginBottom: '12px', gap: '2px' }}>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`os-btn ${activeTab === 'telemetry' ? 'active-tab' : ''}`}
          style={{
            borderBottom: activeTab === 'telemetry' ? 'none' : undefined,
            padding: '4px 10px',
            backgroundColor: activeTab === 'telemetry' ? '#c0c0c0' : '#e0e0e0',
            fontWeight: activeTab === 'telemetry' ? 'bold' : 'normal',
            zIndex: activeTab === 'telemetry' ? 2 : 1,
            position: 'relative',
            top: activeTab === 'telemetry' ? '1px' : '0px',
          }}
        >
          📊 Telemetry & Logs
        </button>
        <button
          onClick={() => setActiveTab('personalization')}
          className={`os-btn ${activeTab === 'personalization' ? 'active-tab' : ''}`}
          style={{
            borderBottom: activeTab === 'personalization' ? 'none' : undefined,
            padding: '4px 10px',
            backgroundColor: activeTab === 'personalization' ? '#c0c0c0' : '#e0e0e0',
            fontWeight: activeTab === 'personalization' ? 'bold' : 'normal',
            zIndex: activeTab === 'personalization' ? 2 : 1,
            position: 'relative',
            top: activeTab === 'personalization' ? '1px' : '0px',
          }}
        >
          🎨 Personalization
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`os-btn ${activeTab === 'security' ? 'active-tab' : ''}`}
          style={{
            borderBottom: activeTab === 'security' ? 'none' : undefined,
            padding: '4px 10px',
            backgroundColor: activeTab === 'security' ? '#c0c0c0' : '#e0e0e0',
            fontWeight: activeTab === 'security' ? 'bold' : 'normal',
            zIndex: activeTab === 'security' ? 2 : 1,
            position: 'relative',
            top: activeTab === 'security' ? '1px' : '0px',
          }}
        >
          🔒 Security Rules
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div className="os-panel" style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CPU Activity</div>
                <div style={{ height: '14px', border: '1px solid #808080', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: `${cpuLoad}%`, height: '100%', backgroundColor: cpuLoad > 85 ? '#ff3330' : cpuLoad > 60 ? '#ffb900' : '#107c10', transition: 'width 0.5s' }} />
                  <span style={{ position: 'absolute', right: '4px', top: '0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>{cpuLoad}%</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>RAM Allocation</div>
                <div style={{ height: '14px', border: '1px solid #808080', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: `${memLoad}%`, height: '100%', backgroundColor: '#0078d4', transition: 'width 0.5s' }} />
                  <span style={{ position: 'absolute', right: '4px', top: '0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>{memLoad}%</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔐 System Audit Logs</div>
              <div className="os-panel-inset" style={{ flex: 1, minHeight: '130px', padding: '6px', backgroundColor: '#0c0c0c', color: '#f1f1f1', fontFamily: 'monospace', fontSize: '11px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {[...systemLogs].reverse().map((log, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #222', padding: '2px 0' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personalization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: '0 0 8px', color: '#444' }}>Select a background style to customize the desktop environment.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {wallpapers.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => handleWallpaperChange(wp.id, wp.name)}
                  className="os-panel"
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    outline: 'none',
                    border: '2px solid',
                    borderColor: wallpaperClass === wp.id ? '#000080' : '#ffffff #808080 #808080 #ffffff',
                    backgroundColor: wallpaperClass === wp.id ? '#dcdcdc' : '#e6e6e6',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{wp.icon}</span>
                  <span style={{ fontWeight: wallpaperClass === wp.id ? 'bold' : 'normal', fontSize: '11px' }}>{wp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePinUpdate} className="os-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #808080', paddingBottom: '4px', marginBottom: '4px' }}>Administrator Access Configurations</div>
            <p style={{ fontSize: '11px', color: '#444', margin: '0 0 4px' }}>Update the credential PIN required to login or escalate privileges across applications.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: 'bold' }}>New PIN Code / Passcode:</label>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={12}
                className="app-input"
                style={{
                  padding: '4px 6px',
                  border: '2px solid',
                  borderColor: '#808080 #fff #fff #808080',
                  outline: 'none',
                  fontSize: '12px',
                }}
              />
            </div>

            {pinStatus && (
              <div style={{ fontSize: '11px', color: pinStatus.includes('successfully') ? '#107c10' : '#ff3330', fontWeight: 'bold' }}>
                {pinStatus}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="submit" className="os-btn" style={{ fontWeight: 'bold', padding: '4px 12px' }}>
                Apply Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanelApp;
