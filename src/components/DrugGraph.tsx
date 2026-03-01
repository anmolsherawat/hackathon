import React, { useMemo, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { engine } from '@/logic/interaction-engine';
import { generateClinicalSummary, generateDrugSummary } from '@/logic/ai-summary';
import type { InteractionState } from '@/hooks/useInteractionLogic';
import type { Drug, Interaction, Severity } from '@/types';
import { AlertCircle, Loader2, Sparkles, Activity, Pill, ShieldCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface DrugGraphProps {
  selectedDrugs: Drug[];
  interactionState: InteractionState;
  onInteractionSelected?: (interaction: Interaction) => void;
}

export const DrugGraph: React.FC<DrugGraphProps> = ({ selectedDrugs, interactionState, onInteractionSelected }) => {
  const { interactions, isLoading } = interactionState;
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Dynamic Node Mapping: Arrange nodes in a circular layout
  const nodes: Node[] = useMemo(() => {
    if (!selectedDrugs || selectedDrugs.length === 0) return [];
    
    const centerX = 400;
    const centerY = 300;
    const baseRadius = 220;

    return selectedDrugs.map((drug, index) => {
      // Auto-Layout: If drug has interactions, move it slightly toward the center
      const drugInteractions = interactions.filter(inter => inter.source === drug.id || inter.target === drug.id);
      const hasInteractions = drugInteractions.length > 0;
      const radius = hasInteractions ? baseRadius * 0.85 : baseRadius;

      const angle = (index / selectedDrugs.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Node highlighting based on severity
      const highestSeverity = drugInteractions.reduce((acc, curr) => {
        if (curr.severity === 'Contraindicated') return 'Contraindicated';
        if (curr.severity === 'Severe' && acc !== 'Contraindicated') return 'Severe';
        return acc;
      }, '' as Severity | '');

      const getBorderColor = (severity: Severity | '') => {
        if (severity === 'Contraindicated') return '#ef4444'; // Red
        if (severity === 'Severe') return '#f97316'; // Orange
        return '#e2e8f0'; // Default
      };

      return {
        id: drug.id,
        data: { label: drug.name, drug },
        position: { x, y },
        style: {
          background: '#fff',
          color: '#0f172a',
          border: highestSeverity ? `4px solid ${getBorderColor(highestSeverity)}` : '2px solid #e2e8f0',
          borderRadius: '16px',
          padding: '12px 20px',
          fontWeight: '700',
          fontSize: '13px',
          boxShadow: highestSeverity ? `0 20px 25px -5px rgba(0, 0, 0, 0.1)` : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          width: 140,
          textAlign: 'center' as const,
        },
      };
    });
  }, [selectedDrugs, interactions]);

  // Dynamic Edge Mapping: Connect drugs based on interactions
  const edges: Edge[] = useMemo(() => {
    if (!interactions || interactions.length === 0) return [];

    return interactions.map((inter, index) => {
      const severityColor = (severity: string) => {
        switch (severity) {
          case 'Contraindicated': return '#ef4444'; // Red-500
          case 'Severe': return '#f97316'; // Orange-500
          case 'Moderate': return '#f59e0b'; // Amber-500
          case 'Low': return '#10b981'; // Emerald-500
          default: return '#94a3b8'; // Slate-400
        }
      };

      const isContraindicated = inter.severity === 'Contraindicated';
      const isSevere = inter.severity === 'Severe';

      return {
        id: `e-${inter.source}-${inter.target}-${index}`,
        source: inter.source,
        target: inter.target,
        label: inter.severity,
        animated: isContraindicated || isSevere,
        data: { interaction: inter },
        className: (isSevere || isContraindicated) ? 'glowing-edge' : '',
        style: {
          stroke: severityColor(inter.severity),
          strokeWidth: isContraindicated ? 8 : (isSevere ? 5 : 2),
          strokeDasharray: isSevere ? '10 5' : 'none',
          cursor: 'pointer',
          filter: (isSevere || isContraindicated) ? `drop-shadow(0 0 8px ${severityColor(inter.severity)})` : 'none',
        },
        labelStyle: { 
          fill: severityColor(inter.severity), 
          fontWeight: 800,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9, stroke: '#e2e8f0', strokeWidth: 1 },
      };
    });
  }, [interactions]);

  const onEdgeClick = async (_: React.MouseEvent, edge: Edge) => {
    const interaction = edge.data?.interaction as Interaction;
    if (interaction) {
      setSelectedDrug(null);
      setSelectedInteraction(interaction);
      if (onInteractionSelected) onInteractionSelected(interaction);
      setIsSheetOpen(true);
      setAiSummary(null);
      setIsAiLoading(true);

      const drug1Name = engine.getDrugById(interaction.source)?.name || interaction.source;
      const drug2Name = engine.getDrugById(interaction.target)?.name || interaction.target;

      try {
        const summary = await generateClinicalSummary(
          drug1Name,
          drug2Name,
          interaction.description
        );
        setAiSummary(summary);
      } catch {
        setAiSummary("Clinical intelligence offline. Please review medical data manually.");
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const onNodeClick = async (_: React.MouseEvent, node: Node) => {
    const drug = node.data.drug as Drug;
    if (drug) {
      setSelectedInteraction(null);
      setSelectedDrug(drug);
      setIsSheetOpen(true);
      setAiSummary(null);
      setIsAiLoading(true);

      try {
        const summary = await generateDrugSummary(drug.name, drug.description);
        setAiSummary(summary);
      } catch {
        setAiSummary("Clinical intelligence offline. Please review medical data manually.");
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes || []}
        edges={edges || []}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        fitView
        className="bg-slate-50/50"
      >
        <Background color="#e2e8f0" gap={24} size={1} />
        <Controls className="bg-white border-slate-200 shadow-md rounded-lg" />
        
        <Panel position="bottom-right" className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xl m-4">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3">Clinical Severity</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
              <span className="text-[10px] font-bold text-slate-600">Contraindicated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
              <span className="text-[10px] font-bold text-slate-600">Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-[10px] font-bold text-slate-600">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-bold text-slate-600">Low Risk</span>
            </div>
          </div>
        </Panel>

        {isLoading && (
          <Panel position="top-center" className="mt-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-bold tracking-wider uppercase">Querying FDA API...</span>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* AI Clinical Summary Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l-slate-200 shadow-2xl overflow-y-auto">
          <SheetHeader className="space-y-4 mb-8">
            <div className="flex items-center gap-2 text-blue-600">
              {selectedDrug ? <Pill className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {selectedDrug ? 'Drug Information' : 'Clinical Alert'}
              </span>
            </div>
            <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">
              {selectedDrug ? selectedDrug.name : selectedInteraction && (
                <>
                  {engine.getDrugById(selectedInteraction.source)?.name || selectedInteraction.source}
                  <span className="text-slate-300 mx-2">+</span>
                  {engine.getDrugById(selectedInteraction.target)?.name || selectedInteraction.target}
                </>
              )}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              {selectedInteraction && (
                <Badge 
                  className={`font-black uppercase tracking-widest px-3 py-1 ${
                    selectedInteraction.severity === 'Contraindicated' ? 'bg-red-500' :
                    selectedInteraction.severity === 'Severe' ? 'bg-orange-500' :
                    selectedInteraction.severity === 'Moderate' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                >
                  {selectedInteraction.severity}
                </Badge>
              )}
              {selectedDrug && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-black uppercase tracking-widest px-3 py-1">
                  {selectedDrug.class}
                </Badge>
              )}
              <span className="text-xs font-bold text-slate-400">
                {selectedDrug ? 'Therapeutic Class' : 'Interaction Analysis'}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            {/* AI Summary Section */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clinical AI Summary</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold border-blue-200 text-blue-600">Gemini 1.5 Flash</Badge>
              </div>
              
              <AnimatePresence mode="wait">
                {isAiLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-slate-400 gap-4"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Processing medical datasets...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-slate-700 leading-relaxed prose prose-slate prose-sm max-w-none"
                  >
                    {aiSummary ? (
                      <div dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="italic text-slate-400">AI analysis engine standby.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Raw Data Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Evidence Base</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  {selectedDrug ? selectedDrug.description : selectedInteraction?.description}
                </p>
                
                {selectedInteraction?.clinical_action && (
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Recommended Clinical Action</span>
                    </div>
                    <p className="text-sm text-blue-900 font-bold leading-relaxed">
                      {selectedInteraction.clinical_action}
                    </p>
                  </div>
                )}
                
                {selectedInteraction?.mechanism && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Biochemical Mechanism</span>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    {selectedInteraction.mechanism}
                  </p>
                </div>
              )}

              {selectedDrug?.standard_dosage && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Standard Dosage Reference</span>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    {selectedDrug.standard_dosage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
