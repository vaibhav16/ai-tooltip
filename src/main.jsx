import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { TooltipProvider } from './components/TooltipProvider';
import GlobalSmartTooltip from './components/GlobalSmartTooltip';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <GlobalSmartTooltip />
    </TooltipProvider>
  </StrictMode>,
)
