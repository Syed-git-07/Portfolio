import React, { createContext, useState, useContext } from 'react';
import { GUEST_NAME, USER_NAME } from '../constants/branding';

const OsContext = createContext();

export const useOs = () => useContext(OsContext);

const defaultGuestUser = {
  name: GUEST_NAME,
  isGuest: true,
  isAdmin: false,
  avatar: null,
};

export const OsProvider = ({ children }) => {
  const [systemState, setSystemState] = useState('boot');
  const [currentUser, setCurrentUser] = useState(defaultGuestUser);
  const [adminPin, setAdminPin] = useState('1234'); // Default PIN

  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [highestZIndex, setHighestZIndex] = useState(1);

  // New features for realistic OS simulation
  const [wallpaperClass, setWallpaperClass] = useState('wallpaper-win11');
  const [systemLogs, setSystemLogs] = useState([
    `[${new Date().toLocaleTimeString()}] System boot initiated.`,
    `[${new Date().toLocaleTimeString()}] Kernel version 11.0.26 loaded.`,
    `[${new Date().toLocaleTimeString()}] Security policies initialized.`,
  ]);
  const [elevatedApps, setElevatedApps] = useState([]);
  const [uacApp, setUacApp] = useState(null);

  const addSystemLog = (text) => {
    const timeStr = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [...prev, `[${timeStr}] ${text}`]);
  };

  const signInAsGuest = () => {
    setCurrentUser(defaultGuestUser);
    setElevatedApps([]);
    addSystemLog('Session started: Logged in as Guest user (Restricted).');
  };

  const signInAsOwner = () => {
    setCurrentUser({
      name: USER_NAME,
      isGuest: false,
      isAdmin: true,
      avatar: '/assets/profile.png',
    });
    setElevatedApps([]);
    addSystemLog('Session started: Logged in as Administrator.');
  };

  const resetSession = () => {
    setCurrentUser(defaultGuestUser);
    setWindows([]);
    setActiveWindowId(null);
    setHighestZIndex(1);
    setElevatedApps([]);
    addSystemLog('Session ended: Current user logged out.');
  };

  const elevateApp = (appId) => {
    if (!elevatedApps.includes(appId)) {
      setElevatedApps((prev) => [...prev, appId]);
      addSystemLog(`Privilege escalation: Granted Admin rights to ${appId}.`);
    }
  };

  const verifyPinOrPassword = (input) => {
    // Accepts PIN '1234', case-insensitive password 'admin', or the custom set PIN
    return (
      input === adminPin ||
      input.toLowerCase() === 'admin' ||
      (adminPin === '1234' && input === '1234')
    );
  };

  const openWindow = (appId, title, component, props = {}) => {
    const existingWindow = windows.find(w => w.id === appId);

    if (existingWindow) {
      setWindows(windows.map(w =>
        w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1, props: { ...w.props, ...props } } : w
      ));
      setActiveWindowId(appId);
      setHighestZIndex(highestZIndex + 1);
    } else {
      const newWindow = {
        id: appId,
        title,
        component,
        props,
        isOpen: true,
        isMinimized: false,
        zIndex: highestZIndex + 1,
      };
      setWindows([...windows, newWindow]);
      setActiveWindowId(appId);
      setHighestZIndex(highestZIndex + 1);
      addSystemLog(`Process started: Launched window '${title}' (${appId}).`);
    }
  };

  const closeWindow = (appId) => {
    const target = windows.find(w => w.id === appId);
    setWindows(windows.filter(w => w.id !== appId));
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
    if (target) {
      addSystemLog(`Process ended: Closed window '${target.title}' (${appId}).`);
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
    currentUser,
    signInAsGuest,
    signInAsOwner,
    resetSession,
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    // New parameters
    adminPin,
    setAdminPin,
    wallpaperClass,
    setWallpaperClass,
    systemLogs,
    addSystemLog,
    elevatedApps,
    elevateApp,
    verifyPinOrPassword,
    uacApp,
    setUacApp,
  };

  return (
    <OsContext.Provider value={value}>
      {children}
    </OsContext.Provider>
  );
};
