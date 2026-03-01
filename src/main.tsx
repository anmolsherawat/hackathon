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
const RAW_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const IS_VALID_PK = RAW_KEY?.startsWith('pk_')
const PUBLISHABLE_KEY = IS_VALID_PK ? RAW_KEY : undefined

if (!IS_VALID_PK && RAW_KEY) {
  console.error("MediGuard Security Alert: A Secret Key (sk_...) was detected in VITE_CLERK_PUBLISHABLE_KEY. For security, Clerk will be disabled until a Publishable Key (pk_...) is provided.")
} else if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Authentication will be disabled.")
}

console.log("MediGuard: Bootstrapping main.tsx");

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

createRoot(container).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ClerkProvider>
    ) : (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )}
  </StrictMode>,
)
