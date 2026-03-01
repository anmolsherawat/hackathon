import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { engine } from '@/logic/interaction-engine';
import type { Drug } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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

  const performSearch = () => {
    if (query.trim().length === 0) return;
    const existingDrug = allDrugs.find(d => d.name.toLowerCase() === query.trim().toLowerCase());
    if (existingDrug) {
      onAddDrug(existingDrug);
    } else {
      const customDrug: Drug = {
        id: `custom-${query.trim().toLowerCase()}`,
        name: query.trim(),
        class: 'Custom / API Search',
        description: 'Searching external databases...',
        standard_dosage: 'N/A'
      };
      onAddDrug(customDrug);
    }
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim().length > 0) {
      performSearch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div className="relative group flex gap-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="text"
            placeholder="Search medications (e.g. Aspirin, Lisinopril)..."
            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            variant="default" 
            className="h-12"
            onClick={performSearch}
          >
            Search
          </Button>
        </div>
        
        {filteredDrugs.length > 0 && (
          <Card className="absolute z-50 mt-2 w-full shadow-2xl border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredDrugs.map(drug => (
                <button
                  key={drug.id}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between rounded-lg transition-colors group"
                  onClick={() => {
                    onAddDrug(drug);
                    setQuery('');
                  }}
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{drug.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{drug.class}</div>
                  </div>
                  <div className="bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedDrugs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No medications added yet.</p>
        ) : (
          selectedDrugs.map(drug => (
            <Badge 
              key={drug.id} 
              variant="secondary"
              className="pl-3 pr-1 py-1.5 gap-2 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 transition-colors rounded-lg group"
            >
              <span className="font-bold tracking-tight">{drug.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveDrug(drug.id)}
                className="h-5 w-5 p-0 rounded-md hover:bg-blue-200 hover:text-blue-800 transition-all"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};
