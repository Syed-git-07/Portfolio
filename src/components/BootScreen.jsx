import React, { useEffect, useState, useCallback } from 'react';
import { useOs } from '../context/osContext';
import { OS_NAME, OS_EDITION, OS_VERSION } from '../constants/branding';
import './BootScreen.css';

const BootScreen = () => {
  const { setSystemState } = useOs();
  const [phase, setPhase] = useState('bios');
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting Syed Sufyan OS...');

  const bootSequence = [
    'American Megatrends BIOS v2.4',
    'Copyright (C) 2024 Syed Sufyan M. All Rights Reserved.',
    '',
    `System: ${OS_NAME} ${OS_VERSION} — ${OS_EDITION}`,
    'CPU: Intel(R) Core(TM) i7 Processor @ 3.60GHz',
    'Memory Test: 16384MB OK',
    '',
    'Detecting Primary Master ... SSD Portfolio Drive',
    'Detecting Primary Slave  ... None',
    'Detecting Secondary Master ... CD-ROM Drive',
    '',
    'Initializing USB Controllers .. Done.',
    'Loading boot sector from Portfolio Drive...',
    '',
    `Boot Loader: ${OS_NAME} Boot Manager v1.0`,
    'Handoff to operating system...',
    '',
  ];

  const statusMessages = [
    { at: 0, text: 'Starting Syed Sufyan OS...' },
    { at: 20, text: 'Loading kernel modules...' },
    { at: 40, text: 'Initializing portfolio engine...' },
    { at: 60, text: 'Mounting project filesystem...' },
    { at: 80, text: 'Preparing desktop environment...' },
    { at: 95, text: 'Welcome!' },
  ];

  const proceedToLogin = useCallback(() => {
    setSystemState('login');
  }, [setSystemState]);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setLines((prev) => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('splash'), 400);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== 'splash') return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2, 100);
        const msg = [...statusMessages].reverse().find((m) => next >= m.at);
        if (msg) setStatusText(msg.text);
        return next;
      });
    }, 60);

    return () => clearInterval(progressInterval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'splash' && progress >= 100) {
      const timer = setTimeout(() => setPhase('ready'), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, progress]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (phase === 'ready') proceedToLogin();
      else if (phase === 'splash') setPhase('ready');
      else if (phase === 'bios') setPhase('splash');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, proceedToLogin]);

  const handleClick = () => {
    if (phase === 'ready') proceedToLogin();
    else if (phase === 'splash') setPhase('ready');
    else if (phase === 'bios') setPhase('splash');
  };

  if (phase === 'bios') {
    return (
      <div className="boot-screen boot-bios" onClick={handleClick}>
        <div className="boot-content">
          {lines.map((line, index) => (
            <div key={index} className="boot-line">{line}</div>
          ))}
          <div className="boot-cursor">_</div>
        </div>
        <div className="boot-skip-hint">Press any key to skip...</div>
      </div>
    );
  }

  return (
    <div className="boot-screen boot-splash" onClick={handleClick}>
      <div className="boot-splash-inner">
        <div className="boot-logo-block">
          <div className="windows-flag-large">
            <span className="flag-tile red" />
            <span className="flag-tile green" />
            <span className="flag-tile blue" />
            <span className="flag-tile yellow" />
          </div>
          <div className="boot-brand">
            <h1 className="boot-os-name">{OS_NAME}</h1>
            <p className="boot-edition">{OS_EDITION} · v{OS_VERSION}</p>
          </div>
        </div>

        <div className="boot-progress-wrap">
          <div className="boot-progress-track">
            <div
              className="boot-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="boot-status">{statusText}</p>
        </div>

        {phase === 'ready' && (
          <div className="boot-ready-prompt">
            Press Enter or click to continue
          </div>
        )}
      </div>

      <div className="boot-footer">
        Copyright © 2024 Syed Sufyan M
      </div>
    </div>
  );
};

export default BootScreen;
