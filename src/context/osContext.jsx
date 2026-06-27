import React, { createContext, useState, useContext } from 'react';
import { GUEST_NAME, USER_NAME } from '../constants/branding';

const OsContext = createContext();

export const useOs = () => useContext(OsContext);

const defaultGuestUser = {
  name: GUEST_NAME,
  isGuest: true,
  avatar: null,
};

export const OsProvider = ({ children }) => {
  const [systemState, setSystemState] = useState('boot');
  const [currentUser, setCurrentUser] = useState(defaultGuestUser);

  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [highestZIndex, setHighestZIndex] = useState(1);

  const signInAsGuest = () => {
    setCurrentUser(defaultGuestUser);
  };

  const signInAsOwner = () => {
    setCurrentUser({
      name: USER_NAME,
      isGuest: false,
      avatar: '/assets/profile.png',
    });
  };

  const resetSession = () => {
    setCurrentUser(defaultGuestUser);
    setWindows([]);
    setActiveWindowId(null);
    setHighestZIndex(1);
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
  };

  return (
    <OsContext.Provider value={value}>
      {children}
    </OsContext.Provider>
  );
};
