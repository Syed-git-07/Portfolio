import React, { useEffect, useState, useCallback } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL } from '../constants/branding';
import './BootScreen.css';

const BootScreen = () => {
  const { setSystemState } = useOs();
  const [showBrand, setShowBrand] = useState(false);

  const proceedToLogin = useCallback(() => {
    setSystemState('login');
  }, [setSystemState]);

  useEffect(() => {
    const brandTimer = setTimeout(() => setShowBrand(true), 600);
    const loginTimer = setTimeout(() => proceedToLogin(), 3200);

    return () => {
      clearTimeout(brandTimer);
      clearTimeout(loginTimer);
    };
  }, [proceedToLogin]);

  useEffect(() => {
    const handleKeyDown = () => proceedToLogin();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [proceedToLogin]);

  const handleClick = () => proceedToLogin();

  return (
    <div className="boot-screen" onClick={handleClick}>
      <div className="boot-center">
        <div className="boot-logo-ring">
          <div className="windows-flag-boot">
            <span className="flag-tile red" />
            <span className="flag-tile green" />
            <span className="flag-tile blue" />
            <span className="flag-tile yellow" />
          </div>
        </div>

        <div className="boot-spinner">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="boot-dot" style={{ '--i': i }} />
          ))}
        </div>

        <div className={`boot-brand-text ${showBrand ? 'visible' : ''}`}>
          <h1>{OS_FULL}</h1>
        </div>
      </div>

      <div className="boot-skip-hint">Press any key to continue</div>
    </div>
  );
};

export default BootScreen;
