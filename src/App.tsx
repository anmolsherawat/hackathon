import React, { useState, useMemo, Suspense } from 'react';
import { Pill, ShieldCheck, Activity, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { DrugSearch } from '@/components/DrugSearch';
import { DrugGraph } from '@/components/DrugGraph';
import { InteractionList } from '@/components/InteractionList';
import { useInteractionLogic } from '@/hooks/useInteractionLogic';
import type { Drug, Interaction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Lazy load Clerk-dependent components to prevent initialization errors if key is missing
const LandingPage = React.lazy(() => import('@/components/LandingPage').then(m => ({ default: m.LandingPage })));
const ClerkAuth = React.lazy(() => import('@clerk/clerk-react').then(m => ({ 
  default: ({ children, hasClerkKey }: { children: React.ReactNode, hasClerkKey: boolean }) => {
    const { SignedIn, SignedOut, UserButton } = m;
    if (!hasClerkKey) return <>{children}</>;
    return (
      <>
        <SignedOut><LandingPage /></SignedOut>
        <SignedIn>{children}</SignedIn>
      </>
    );
  }
})));

const UserButtonWrapper = React.lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.UserButton })));

console.log("App: Import phase complete.");

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    console.log("ErrorBoundary: Initialized");
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("MediGuard Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-200 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600 h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black text-slate-900">MediGuard Halted</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                The clinical engine encountered a critical rendering error. This usually happens due to corrupted state or memory exhaustion.
              </p>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Clear State & Restart
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

interface DashboardProps {
  selectedDrugs: Drug[];
  setSelectedDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  selectedInteraction: Interaction | null;
  setSelectedInteraction: React.Dispatch<React.SetStateAction<Interaction | null>>;
  handleAddDrug: (drug: Drug) => void;
  handleRemoveDrug: (drugId: string) => void;
  interactionState: any;
  hasClerkKey: boolean;
}

const Dashboard = ({ 
  selectedDrugs, 
  setSelectedDrugs, 
  selectedInteraction, 
  setSelectedInteraction,
  handleAddDrug,
  handleRemoveDrug,
  interactionState,
  hasClerkKey
}: DashboardProps) => (
  <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
    {/* Top Navigation Bar */}
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-blue-200 shadow-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MediGuard</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Clinical Intelligence</p>
          </div>
        </div>
        
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            Graph-Powered
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            interactionState.isOffline 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {interactionState.isOffline ? 'Offline-First' : 'Hybrid-Cloud'}
          </div>
          {hasClerkKey && (
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />}>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <UserButtonWrapper afterSignOutUrl="/" />
            </Suspense>
          )}
        </div>
      </div>
    </header>

    {/* Main Dashboard Layout */}
    <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
      
      {/* Left Column: Search & Results (Shadcn Card) */}
      <div className="lg:col-span-5 space-y-8 flex flex-col min-h-0">
        <Card className="p-6 border-slate-200 shadow-md flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medication Management</h2>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Hybrid Search</span>
          </div>
          
          <DrugSearch 
            selectedDrugs={selectedDrugs} 
            onAddDrug={handleAddDrug} 
            onRemoveDrug={handleRemoveDrug} 
          />

          <div className="mt-8 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interaction Analysis</h2>
              {selectedDrugs.length > 0 && (
                <button 
                  onClick={() => setSelectedDrugs([])}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                  Clear Panel
                </button>
              )}
            </div>
            <InteractionList 
              selectedDrugs={selectedDrugs} 
              interactionState={interactionState}
              selectedInteraction={selectedInteraction}
            />
          </div>
        </Card>
      </div>

      {/* Right Column: Visualization (Shadcn Card) */}
      <div className="lg:col-span-7 flex flex-col min-h-[600px] lg:h-full overflow-hidden">
        <Card className="flex-1 border-slate-200 shadow-md flex-col relative overflow-hidden flex">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Network Visualization</h2>
            <div className="flex items-center gap-2 group cursor-help relative">
              <Info className="h-4 w-4 text-slate-400" />
              <div className="hidden group-hover:block absolute right-0 top-6 w-56 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-2xl z-50 leading-relaxed border border-slate-700">
                Interactive nodes represent medications. Click connections for AI-powered clinical summaries and risk breakdowns.
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <DrugGraph 
              selectedDrugs={selectedDrugs} 
              interactionState={interactionState} 
              onInteractionSelected={setSelectedInteraction}
            />
          </div>
        </Card>
      </div>
    </main>

    {/* Footer Disclaimer */}
    <footer className="bg-white text-slate-400 py-3 px-6 text-[9px] text-center font-bold uppercase tracking-[0.2em] border-t border-slate-200 sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      Regulatory Disclaimer: For hackathon demonstration purposes only. Not for clinical diagnostic use. Always consult a board-certified physician.
    </footer>
  </div>
);

function App() {
  console.log("App: Rendering Start");
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);

  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const hasClerkKey = !!clerkKey && clerkKey.startsWith('pk_');

  const handleDrugUpdate = (drugName: string, updates: Partial<Drug>) => {
    setSelectedDrugs(prev => prev.map(drug => 
      drug.name === drugName ? { ...drug, ...updates } : drug
    ));
  };

  const drugNames = useMemo(() => selectedDrugs.map(d => d.name), [selectedDrugs]);
  const interactionState = useInteractionLogic(drugNames, handleDrugUpdate);

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.some(sd => sd.id === drug.id)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter(sd => sd.id !== drugId));
    setSelectedInteraction(null);
  };

  const dashboardProps = {
    selectedDrugs,
    setSelectedDrugs,
    selectedInteraction,
    setSelectedInteraction,
    handleAddDrug,
    handleRemoveDrug,
    interactionState,
    hasClerkKey
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <span className="text-white text-xs font-black uppercase tracking-widest animate-pulse">Initializing Clinical Engine...</span>
      </div>
    }>
      <ClerkAuth hasClerkKey={hasClerkKey}>
        <Dashboard {...dashboardProps} />
      </ClerkAuth>
    </Suspense>
  );
}

// Fallback loader icon
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default App;
