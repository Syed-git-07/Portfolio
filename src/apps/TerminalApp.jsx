import React, { useState, useRef, useEffect } from 'react';
import { useOs } from '../context/osContext';
import { OS_FULL, OS_VERSION, USER_NAME } from '../constants/branding';

const TerminalApp = () => {
  const {
    currentUser,
    signInAsOwner,
    verifyPinOrPassword,
    wallpaperClass,
    setWallpaperClass,
    openWindow,
    resetSession,
    setSystemState,
    addSystemLog,
  } = useOs();

  const [history, setHistory] = useState([
    `${OS_FULL} [Version ${OS_VERSION}.0.2026]`,
    `(c) Syed Sufyan. All rights reserved.`,
    ``,
    `Type 'help' to see the list of available commands.`,
    ``,
  ]);
  const [typedCommands, setTypedCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [passwordMode, setPasswordMode] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [passwordMode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = inputValue.trim();
      setInputValue('');

      if (passwordMode) {
        handlePasswordSubmission(command);
        return;
      }

      if (command) {
        setTypedCommands((prev) => [...prev, command]);
      }
      setHistoryIndex(-1);

      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (typedCommands.length === 0) return;
      const nextIndex = historyIndex === -1 ? typedCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputValue(typedCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex === typedCommands.length - 1) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputValue(typedCommands[nextIndex]);
      }
    }
  };

  const handlePasswordSubmission = (input) => {
    setPasswordMode(false);
    if (verifyPinOrPassword(input)) {
      signInAsOwner();
      setHistory((prev) => [
        ...prev,
        `******`,
        `[SUCCESS] Privilege escalation successful! Welcome, Administrator.`,
        ``,
      ]);
      addSystemLog('Terminal command: privilege escalation successful via unlock command.');
    } else {
      setHistory((prev) => [
        ...prev,
        `******`,
        `[ERROR] Access denied. Incorrect Administrator credentials.`,
        ``,
      ]);
      addSystemLog('Terminal command: privilege escalation failed (wrong PIN/Password).');
    }
  };

  const executeCommand = (fullCommand) => {
    const parts = fullCommand.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    const promptText = `${currentUser.isGuest ? 'guest' : 'admin'}@syedos:~$ ${fullCommand}`;
    let output = [];

    switch (cmd) {
      case '':
        output = [promptText];
        break;
      case 'help':
        output = [
          promptText,
          'Available commands:',
          '  help               Show this list of commands',
          '  clear              Clear the terminal screen',
          '  neofetch           Display system telemetry and hardware profile',
          '  about              Open the "About Me" portfolio application',
          '  projects           Open the "My Projects" portfolio application',
          '  contact            Open the "Contact Me" contact form application',
          '  theme [theme]      Get or set wallpaper theme (win11, clouds, dark-gold, cyberpunk)',
          '  history            List command execution history',
          '  sudo [cmd]         Execute a command with superuser privileges',
          '  unlock             Elevate Guest permissions to Administrator mode',
          '  lock / logout      Exit current session and lock the OS',
        ];
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'history':
        output = [promptText, ...typedCommands.map((c, i) => `  ${i + 1}  ${c}`)];
        break;
      case 'neofetch':
        output = [
          promptText,
          `   .---.           OS: ${OS_FULL}`,
          `  /     \\          Kernel: Syed OS 11.0.26-x86_64`,
          `  \\     /          Uptime: ${Math.floor(performance.now() / 60000)} mins`,
          `   '---'           Shell: Bash-simulated 1.4.2`,
          `  /|   |\\          Theme: ${wallpaperClass.replace('wallpaper-', '')}`,
          ` / |   | \\         User: ${currentUser.name}`,
          `/  |   |  \\        CPU: Virtual Xeon @ 3.40GHz (4 Cores)`,
          `                   Memory: 1024MB / 4096MB (Allocated)`,
        ];
        break;
      case 'about':
        output = [promptText, 'Launching "About Me" App...'];
        openWindow('about', 'About Me', 'AboutApp');
        break;
      case 'projects':
        output = [promptText, 'Launching "Projects" App...'];
        openWindow('projects', 'My Projects', 'ProjectsApp');
        break;
      case 'contact':
        output = [promptText, 'Launching "Contact" App...'];
        openWindow('contact', 'Contact Me', 'ContactApp');
        break;
      case 'theme':
        if (!arg) {
          output = [
            promptText,
            `Current wallpaper theme: ${wallpaperClass.replace('wallpaper-', '')}`,
            `Available themes: win11, clouds, dark-gold, cyberpunk`,
            `Usage: theme [theme-name]`,
          ];
        } else {
          const validThemes = {
            win11: 'wallpaper-win11',
            clouds: 'wallpaper-clouds',
            'dark-gold': 'wallpaper-dark-gold',
            darkgold: 'wallpaper-dark-gold',
            cyberpunk: 'wallpaper-cyberpunk',
          };
          if (validThemes[arg.toLowerCase()]) {
            // Check privilege
            if (currentUser.isGuest) {
              output = [
                promptText,
                `[SECURITY WARNING] Changing wallpaper requires Administrator privileges.`,
                `Type 'unlock' to elevate your permissions.`,
              ];
              addSystemLog(`Terminal command: Guest blocked from changing theme to '${arg}'.`);
            } else {
              setWallpaperClass(validThemes[arg.toLowerCase()]);
              output = [promptText, `Wallpaper theme changed to '${arg.toLowerCase()}'.`];
              addSystemLog(`Terminal command: Theme changed to '${arg.toLowerCase()}' by Administrator.`);
            }
          } else {
            output = [promptText, `Unknown theme '${arg}'. Type 'theme' to see valid names.`];
          }
        }
        break;
      case 'sudo':
        if (!arg) {
          output = [promptText, 'Usage: sudo [command]'];
        } else if (arg.startsWith('rm -rf')) {
          output = [
            promptText,
            `💀 WARNING: Executing 'rm -rf /' in sandbox...`,
            `Permission Denied. Syed OS contains defenses against self-destruction! 😉`,
          ];
          addSystemLog('Terminal command: Blocked sudo rm -rf execution.');
        } else {
          output = [
            promptText,
            `[SUDO] Executing '${arg}' with root permissions...`,
            `Action is currently simulated. No system changes made.`,
          ];
        }
        break;
      case 'unlock':
        if (!currentUser.isGuest) {
          output = [promptText, 'You are already logged in as Administrator.'];
        } else {
          output = [
            promptText,
            'Entering Administrator elevation challenge.',
            'Please enter the Administrator passcode/PIN to authorize:',
          ];
          setPasswordMode(true);
        }
        break;
      case 'lock':
      case 'logout':
        resetSession();
        setSystemState('login');
        return;
      default:
        output = [
          promptText,
          `sh: command not found: ${cmd}`,
          `Type 'help' to view available system commands.`,
        ];
        break;
    }

    setHistory((prev) => [...prev, ...output, '']);
  };

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      style={{
        backgroundColor: '#0c0c0c',
        color: '#00ff66',
        padding: '12px',
        fontFamily: '"Consolas", "Courier New", Courier, monospace',
        fontSize: '13px',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        lineHeight: '1.4',
      }}
    >
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {history.map((line, idx) => (
          <div key={idx} style={{ minHeight: '1.2em' }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#00ccff', fontWeight: 'bold' }}>
          {passwordMode ? 'Enter PIN/Password: ' : `${currentUser.isGuest ? 'guest' : 'admin'}@syedos:~$ `}
        </span>
        <input
          ref={inputRef}
          type={passwordMode ? 'password' : 'text'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: passwordMode ? '#ff3366' : '#ffffff',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: 0,
            margin: 0,
          }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default TerminalApp;
