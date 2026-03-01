import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { ErrorBoundary } from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Emergency State Reset: Clear poisoned storage on first load
if (typeof window !== 'undefined' && !sessionStorage.getItem('mediguard_reset_v1')) {
  console.log("Emergency: Clearing poisoned state...");
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('mediguard_reset_v1', 'true');
}

// Clerk configuration
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Authentication will be disabled.")
}

console.log("MediGuard: Bootstrapping main.tsx");

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

createRoot(container).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ClerkProvider>
  </StrictMode>,
)
