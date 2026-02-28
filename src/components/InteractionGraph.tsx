import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { engine } from '../logic/interaction-engine';
import type { Drug } from '../types';

interface InteractionGraphProps {
  selectedDrugs: Drug[];
}

export const InteractionGraph: React.FC<InteractionGraphProps> = ({ selectedDrugs }) => {
  const selectedIds = useMemo(() => selectedDrugs.map(d => d.id), [selectedDrugs]);
  const { nodes, edges } = useMemo(() => engine.getGraphData(selectedIds), [selectedIds]);

  if (selectedDrugs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <p className="text-slate-400 font-medium">Add medications to visualize interactions</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-sm border overflow-hidden relative">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges as Edge[]}
        fitView
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg border shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Severity Key</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-risk-contraindicated rounded-full" />
              <span className="text-xs text-slate-600">Contraindicated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-risk-severe rounded-full" />
              <span className="text-xs text-slate-600">Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-risk-moderate rounded-full" />
              <span className="text-xs text-slate-600">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-risk-low rounded-full" />
              <span className="text-xs text-slate-600">Low</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
