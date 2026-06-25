import React, { createContext, useState, useContext } from 'react';

const OsContext = createContext();

export const useOs = () => useContext(OsContext);

export const OsProvider = ({ children }) => {
  // System State
  const [systemState, setSystemState] = useState('boot'); // 'boot', 'login', 'desktop'

  // Windows State
  // Example window object: { id: 'about', title: 'About', component: 'AboutApp', isOpen: true, isMinimized: false, zIndex: 1 }
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [highestZIndex, setHighestZIndex] = useState(1);

  const openWindow = (appId, title, component) => {
    const existingWindow = windows.find(w => w.id === appId);
    
    if (existingWindow) {
      // If already open, focus it and ensure it's not minimized
      setWindows(windows.map(w => 
        w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
      ));
      setActiveWindowId(appId);
      setHighestZIndex(highestZIndex + 1);
    } else {
      // Open new window
      const newWindow = {
        id: appId,
        title,
        component,
        isOpen: true,
        isMinimized: false,
        zIndex: highestZIndex + 1,
      };
      setWindows([...windows, newWindow]);
      setActiveWindowId(appId);
      setHighestZIndex(highestZIndex + 1);
    }
  };

  const closeWindow = (appId) => {
    setWindows(windows.filter(w => w.id !== appId));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (appId) => {
    setWindows(windows.map(w => 
      w.id === appId ? { ...w, isMinimized: true } : w
    ));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (appId) => {
    setWindows(windows.map(w => 
      w.id === appId ? { ...w, zIndex: highestZIndex + 1, isMinimized: false } : w
    ));
    setActiveWindowId(appId);
    setHighestZIndex(highestZIndex + 1);
  };

  const value = {
    systemState,
    setSystemState,
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow
  };

  return (
    <OsContext.Provider value={value}>
      {children}
    </OsContext.Provider>
  );
};
