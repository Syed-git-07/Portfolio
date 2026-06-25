import React, { useEffect, useState } from 'react';
import { useOs } from '../context/osContext';
import './BootScreen.css';

const BootScreen = () => {
  const { setSystemState } = useOs();
  const [lines, setLines] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);

  const bootSequence = [
    "PhoenixBIOS 4.0 Release 6.0",
    "Copyright 1985-2001 Phoenix Technologies Ltd.",
    "All Rights Reserved",
    "",
    "CPU: Genuine Intel(R) Processor",
    "Memory Test: 32768K OK",
    "",
    "Initializing Plug and Play Cards...",
    "PNP Init Completed",
    "",
    "Detecting Primary Master ... IDE Hard Disk",
    "Detecting Primary Slave  ... None",
    "Detecting Secondary Master ... CD-ROM",
    "Detecting Secondary Slave  ... None",
    "",
    "Initializing USB Controllers .. Done.",
    "IP: 192.168.1.100",
    "System: OS Portfolio v1.0",
    ""
  ];

  const asciiArt = `
   _____ __  __  ______  _____    ____  _____ 
  / ___// / / / / ____/ / __  \\  / __ \\/ ___/
  \\__ \\/ /_/ / / __/   / / / / / / / /\\__ \\ 
 ___/ / __  / / /___  / /_/ / / /_/ /___/ / 
/____/_/ /_/ /_____/ /_____/  \\____//____/  
                                            
  `;

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setLines(prev => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowPrompt(true), 500);
      }
    }, 150); // 150ms delay between lines

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPrompt && e.key === 'Enter') {
        setSystemState('login'); // Move to login screen
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrompt, setSystemState]);

  return (
    <div className="boot-screen" onClick={() => showPrompt && setSystemState('login')}>
      <div className="boot-content">
        {lines.map((line, index) => (
          <div key={index} className="boot-line">{line}</div>
        ))}
        {showPrompt && (
          <>
            <pre className="ascii-art">{asciiArt}</pre>
            <div className="boot-prompt">
              Press [Enter] or click to boot...
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BootScreen;
