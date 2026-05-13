import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { VoterProvider } from './store/VoterContext.jsx'
import { TeamProvider } from './store/TeamContext.jsx'
import './index.css' // Importando nosso CSS global

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VoterProvider>
        <TeamProvider>
          <App />
        </TeamProvider>
      </VoterProvider>
    </BrowserRouter>
  </StrictMode>,
)
