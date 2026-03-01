import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Loader2, WifiOff, PlusCircle, Activity } from 'lucide-react';
import { engine } from '@/logic/interaction-engine';
import type { InteractionState } from '@/hooks/useInteractionLogic';
import type { Interaction } from '@/types';
import type { Drug, Severity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractionListProps {
  selectedDrugs: Drug[];
  interactionState: InteractionState;
  selectedInteraction?: Interaction | null;
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const styles = {
    'Low': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Moderate': 'bg-amber-50 text-amber-700 border-amber-100',
    'Severe': 'bg-orange-50 text-orange-700 border-orange-100',
    'Contraindicated': 'bg-red-50 text-red-700 border-red-100'
  };

  const Icon = {
    'Low': Info,
    'Moderate': AlertCircle,
    'Severe': AlertTriangle,
    'Contraindicated': ShieldAlert
  }[severity];

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${styles[severity]}`}>
      <Icon className="h-3 w-3" />
      {severity}
    </Badge>
  );
};

export const InteractionList: React.FC<InteractionListProps> = ({ selectedDrugs, interactionState, selectedInteraction }) => {
  const { interactions, isLoading, error, isOffline } = interactionState;

  if (selectedDrugs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200"
      >
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
          <PlusCircle className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-slate-900 font-bold text-sm mb-1 tracking-tight">Expand Medication List</h3>
        <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
          Add medications to run our clinical interaction engine.
        </p>
      </motion.div>
    );
  }

  if (selectedDrugs.length === 1) {
    const drug = selectedDrugs[0];
    const confidence = drug.indication ? 100 : 90; // Local vs API fallback
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            Clinical Profile: {drug.name}
          </h3>
          <Badge variant="outline" className="text-[9px] font-bold border-emerald-200 text-emerald-600">
            {confidence}% Confidence
          </Badge>
        </div>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-black text-slate-800 tracking-tight">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{drug.name}</span>
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Single Agent Analysis</div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-none font-black uppercase tracking-widest text-[10px] px-2 py-1">
                {drug.class}
              </Badge>
            </div>
            
            {drug.indication && (
              <div className="mb-4">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Indication</div>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">{drug.indication}</p>
              </div>
            )}

            <p className="text-slate-600 text-xs leading-relaxed font-medium mb-4">
              {drug.description}
            </p>

            {drug.boxed_warning && drug.boxed_warning.length > 5 && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
                <div className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  FDA Boxed Warning
                </div>
                <p className="text-[11px] text-red-800 font-bold leading-relaxed">{drug.boxed_warning}</p>
              </div>
            )}

            {drug.standard_dosage && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  <span className="font-black not-italic uppercase tracking-tighter mr-1 text-slate-400">Dosage:</span>
                  {drug.standard_dosage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="p-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Add another drug to check interactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          Clinical Risk Profile ({interactions.length})
        </h3>
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Scanning FDA...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-amber-100"
        >
          <WifiOff className="h-5 w-5 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-800 font-bold leading-relaxed">{error}</p>
        </motion.div>
      )}
      
      <div className="space-y-4">
        {selectedInteraction && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Explanation</h4>
              <div className="flex items-center gap-2">
                {selectedInteraction.confidence && (
                  <Badge variant="outline" className="text-[9px] font-bold border-blue-200 text-blue-600 bg-white">
                    {selectedInteraction.confidence}% Confidence
                  </Badge>
                )}
                <SeverityBadge severity={selectedInteraction.severity} />
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {selectedInteraction.description}
            </p>
            {selectedInteraction.clinical_action && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg border border-blue-100 shadow-sm">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Clinical Action Suggestion
                </div>
                <p className="text-xs text-blue-900 font-bold leading-relaxed">
                  {selectedInteraction.clinical_action}
                </p>
              </div>
            )}
            {selectedInteraction.mechanism && (
              <div className="mt-2 text-[10px] text-slate-500 italic leading-relaxed">
                <span className="font-black not-italic uppercase tracking-tighter mr-1 text-slate-400">
                  {isOffline ? 'MECH: Local Database' : 'MECH: Data retrieved from official FDA Labeling'}
                </span>
                {selectedInteraction.mechanism}
              </div>
            )}
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {interactions.length === 0 && !isLoading ? (
            <motion.div 
              key="no-interactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-10 text-center bg-emerald-50/30 rounded-2xl border border-emerald-100/50"
            >
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4 shadow-inner">
                <ShieldAlert className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-sm mb-1 tracking-tight">No Critical Interactions</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed max-w-[240px]">
                No documented contraindications found for this specific combination.
              </p>
            </motion.div>
          ) : (
            interactions.map((inter, index) => {
              const drug1Name = engine.getDrugById(inter.source)?.name || inter.source;
              const drug2Name = engine.getDrugById(inter.target)?.name || inter.target;
              const isSelected = selectedInteraction && (
                (selectedInteraction.source === inter.source && selectedInteraction.target === inter.target) ||
                (selectedInteraction.source === inter.target && selectedInteraction.target === inter.source)
              );

              return (
                <motion.div
                  key={`${inter.source}-${inter.target}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className={`border-slate-200 shadow-sm transition-all group overflow-hidden ${isSelected ? 'border-blue-400 shadow-md' : 'hover:shadow-md hover:border-blue-200'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-800 tracking-tight">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{drug1Name}</span>
                            <span className="text-slate-300 font-normal">+</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{drug2Name}</span>
                          </div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Interacting Agents</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inter.confidence && (
                            <Badge variant="outline" className="text-[9px] font-bold border-blue-200 text-blue-600 bg-white">
                              {inter.confidence}%
                            </Badge>
                          )}
                          <SeverityBadge severity={inter.severity} />
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-xs leading-relaxed font-medium mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                        {inter.description}
                      </p>
                      
                      {inter.mechanism && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            <span className="font-black not-italic uppercase tracking-tighter mr-1 text-slate-400">
                              {isOffline ? 'MECH: Local Database' : 'MECH: Data retrieved from official FDA Labeling'}
                            </span>
                            {inter.mechanism}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
