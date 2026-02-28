import React, { useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { engine } from '../logic/interaction-engine';
import type { Drug, Interaction, Severity } from '../types';

interface InteractionListProps {
  selectedDrugs: Drug[];
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const styles = {
    'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Moderate': 'bg-amber-100 text-amber-800 border-amber-200',
    'Severe': 'bg-orange-100 text-orange-800 border-orange-200',
    'Contraindicated': 'bg-red-100 text-red-800 border-red-200'
  };

  const Icon = {
    'Low': Info,
    'Moderate': AlertCircle,
    'Severe': AlertTriangle,
    'Contraindicated': ShieldAlert
  }[severity];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[severity]}`}>
      <Icon className="h-3.5 w-3.5" />
      {severity}
    </div>
  );
};

export const InteractionList: React.FC<InteractionListProps> = ({ selectedDrugs }) => {
  const selectedIds = useMemo(() => selectedDrugs.map(d => d.id), [selectedDrugs]);
  const interactions = useMemo(() => engine.getInteractions(selectedIds), [selectedIds]);

  if (selectedDrugs.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
        <Info className="h-10 w-10 text-slate-300 mb-3" />
        <h3 className="text-slate-900 font-semibold mb-1">Add more medications</h3>
        <p className="text-slate-500 text-sm">Select at least two drugs to check for potential interactions.</p>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-emerald-100 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <ShieldAlert className="h-6 w-6 text-emerald-500" />
        </div>
        <h3 className="text-slate-900 font-semibold mb-1">No Known Interactions Found</h3>
        <p className="text-slate-500 text-sm">Always consult with a healthcare professional before changing your medication regimen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Potential Risks Found ({interactions.length})
      </h3>
      
      {interactions.map((inter, index) => {
        const drug1 = engine.getDrugById(inter.source);
        const drug2 = engine.getDrugById(inter.target);

        return (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">{drug1?.name}</span>
                <span className="text-slate-400 text-sm">+</span>
                <span className="font-bold text-slate-800">{drug2?.name}</span>
              </div>
              <SeverityBadge severity={inter.severity} />
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              {inter.description}
            </p>
            
            {inter.mechanism && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 italic">
                  <span className="font-semibold not-italic">Mechanism: </span>
                  {inter.mechanism}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
