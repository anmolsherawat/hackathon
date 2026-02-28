import { useState } from 'react';
import { Pill, ShieldCheck, Activity, Info } from 'lucide-react';
import { DrugSearch } from './components/DrugSearch';
import { InteractionGraph } from './components/InteractionGraph';
import { InteractionList } from './components/InteractionList';
import type { Drug } from './types';

function App() {
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.some(sd => sd.id === drug.id)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter(sd => sd.id !== drugId));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-clinical-600 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">DrugChecker</h1>
              <p className="text-xs text-slate-500 font-medium">Offline Interaction Analysis Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
              <Activity className="h-3.5 w-3.5" />
              Graph-Powered
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Offline
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Results */}
        <div className="lg:col-span-5 space-y-8 overflow-y-auto">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Search & Add Drugs</h2>
              <span className="text-xs text-slate-400 italic">5-10 common medications available</span>
            </div>
            <DrugSearch 
              selectedDrugs={selectedDrugs} 
              onAddDrug={handleAddDrug} 
              onRemoveDrug={handleRemoveDrug} 
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Interaction Analysis</h2>
              {selectedDrugs.length > 0 && (
                <button 
                  onClick={() => setSelectedDrugs([])}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Clear All
                </button>
              )}
            </div>
            <InteractionList selectedDrugs={selectedDrugs} />
          </section>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px] lg:h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Network Visualization</h2>
            <div className="flex items-center gap-2 group cursor-help relative">
              <Info className="h-4 w-4 text-slate-400" />
              <div className="hidden group-hover:block absolute right-0 top-6 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl z-20">
                Nodes represent drugs. Animated edges indicate high-risk interactions.
              </div>
            </div>
          </div>
          <InteractionGraph selectedDrugs={selectedDrugs} />
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-3 px-6 text-[10px] text-center uppercase tracking-widest border-t border-slate-800">
        Disclaimer: For hackathon demonstration purposes only. Not for clinical use. Always consult a physician.
      </footer>
    </div>
  );
}

export default App;
