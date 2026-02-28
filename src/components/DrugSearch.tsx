import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { engine } from '../logic/interaction-engine';
import type { Drug } from '../types';

interface DrugSearchProps {
  selectedDrugs: Drug[];
  onAddDrug: (drug: Drug) => void;
  onRemoveDrug: (drugId: string) => void;
}

export const DrugSearch: React.FC<DrugSearchProps> = ({ 
  selectedDrugs, 
  onAddDrug, 
  onRemoveDrug 
}) => {
  const [query, setQuery] = useState('');
  const allDrugs = engine.getAllDrugs();

  const filteredDrugs = query.length > 0 
    ? allDrugs.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase()) && 
        !selectedDrugs.some(sd => sd.id === d.id)
      )
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-clinical-500 focus:border-clinical-500 sm:text-sm"
          placeholder="Search for a medication..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {filteredDrugs.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredDrugs.map(drug => (
              <button
                key={drug.id}
                className="w-full text-left px-4 py-2 hover:bg-clinical-50 flex items-center justify-between"
                onClick={() => {
                  onAddDrug(drug);
                  setQuery('');
                }}
              >
                <div>
                  <div className="font-medium text-gray-900">{drug.name}</div>
                  <div className="text-xs text-gray-500">{drug.class}</div>
                </div>
                <Plus className="h-4 w-4 text-clinical-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedDrugs.map(drug => (
          <div 
            key={drug.id} 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-clinical-100 text-clinical-800"
          >
            {drug.name}
            <button
              onClick={() => onRemoveDrug(drug.id)}
              className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full text-clinical-400 hover:bg-clinical-200 hover:text-clinical-600 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
