import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { ErrorBoundary } from './App.tsx'

// Emergency State Reset: Clear poisoned storage on first load
if (typeof window !== 'undefined' && !sessionStorage.getItem('mediguard_reset_v1')) {
  console.log("Emergency: Clearing poisoned state...");
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('mediguard_reset_v1', 'true');
}

console.log("MediGuard: Bootstrapping main.tsx");

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
