import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/apps.css'
import App from './App.jsx'
import { OsProvider } from './context/osContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OsProvider>
      <App />
    </OsProvider>
  </StrictMode>,
)
