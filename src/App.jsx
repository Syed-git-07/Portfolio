import React from 'react';
import { useOs } from './context/osContext';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';
import './App.css';

function App() {
  const { systemState } = useOs();

  return (
    <div className="App">
      {systemState === 'boot' && <BootScreen />}
      {systemState === 'login' && <LoginScreen />}
      {systemState === 'desktop' && <Desktop />}
    </div>
  );
}

export default App;
