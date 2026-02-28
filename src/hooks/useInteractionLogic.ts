import { useState, useEffect, useRef } from 'react';
import { engine } from '../logic/interaction-engine';
import { fetchMissingDrugData, fetchDrugMetadata } from '../logic/api-fallback';
import type { Interaction, Drug } from '../types';

export interface InteractionState {
  interactions: Interaction[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  onDrugUpdate?: (drugName: string, updates: Partial<Drug>) => void;
}

/**
 * Custom hook with Hybrid Fallback (Offline-First + Online API).
 */
export const useInteractionLogic = (
  selectedDrugNames: string[], 
  onDrugUpdate?: (drugName: string, updates: Partial<Drug>) => void
): InteractionState => {
  const [state, setState] = useState<InteractionState>({
    interactions: [],
    isLoading: false,
    error: null,
    isOffline: !navigator.onLine,
  });

  // Track processed custom drug names to avoid repeated metadata fetches
  const fetchedMetadataRef = useRef<Set<string>>(new Set());
  // Track processed pairwise checks to avoid duplicate OpenFDA calls
  const fetchedPairsRef = useRef<Set<string>>(new Set());

  // Handle online/offline state changes
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process interactions whenever drug names change
  useEffect(() => {
    let isMounted = true;
    console.log("useInteractionLogic: processInteractions triggered", selectedDrugNames);

    async function processInteractions() {
      // 1. Fetch metadata for any custom drugs first (even if only 1 drug selected)
      if (navigator.onLine && onDrugUpdate) {
        const customDrugs = selectedDrugNames.filter(name => !engine.getDrugByName(name));
        for (const drugName of customDrugs) {
          if (fetchedMetadataRef.current.has(drugName)) continue;
          
          try {
            const metadata = await fetchDrugMetadata(drugName);
            if (isMounted) {
              fetchedMetadataRef.current.add(drugName);
              if (metadata) {
                onDrugUpdate(drugName, {
                  ...metadata,
                  class: metadata.class || 'API Verified'
                });
              } else {
                onDrugUpdate(drugName, {
                  description: 'Drug not found in external database.'
                });
              }
            }
          } catch (e) {
            console.error("Metadata fetch failed", e);
          }
        }
      }

      if (selectedDrugNames.length < 2) {
        setState(prev => ({ ...prev, interactions: [], isLoading: false, error: null }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. Get Local (Offline) Interactions
        const localInteractions = engine.getInteractionsByNames(selectedDrugNames);
        
        // 2. Identify all possible pairs for checking
        const allPairs: [string, string][] = [];
        for (let i = 0; i < selectedDrugNames.length; i++) {
          for (let j = i + 1; j < selectedDrugNames.length; j++) {
            allPairs.push([selectedDrugNames[i], selectedDrugNames[j]]);
          }
        }

        // 3. Filter pairs that are NOT already covered by local data and NOT already fetched
        const missingFromLocal = allPairs.filter(([name1, name2]) => {
          const pairKey = [name1, name2].sort().join('|');
          if (fetchedPairsRef.current.has(pairKey)) return false;

          const drug1 = engine.getDrugByName(name1);
          const drug2 = engine.getDrugByName(name2);
          
          if (!drug1 || !drug2) return true;

          return !localInteractions.some(inter => 
            (inter.source === drug1.id && inter.target === drug2.id) ||
            (inter.source === drug2.id && inter.target === drug1.id)
          );
        });

        // 4. Trigger API fallback for missing pairs
        const apiInteractions: Interaction[] = [];
        let apiError: string | null = null;

        if (missingFromLocal.length > 0) {
          if (navigator.onLine) {
            const results = await Promise.all(
              missingFromLocal.map(async ([d1, d2]) => {
                const pairKey = [d1, d2].sort().join('|');
                console.log(`[MediGuard] Fetching OpenFDA API for: ${d1} + ${d2}`);
                try {
                  const res = await fetchMissingDrugData(d1, d2);
                  fetchedPairsRef.current.add(pairKey);
                  return res;
                } catch (e) {
                  console.error(`API fetch failed for ${pairKey}`, e);
                  return null;
                }
              })
            );
            results.forEach(res => {
              if (res) apiInteractions.push(res);
            });
          } else {
            apiError = "Extended clinical search unavailable. Please connect to Wi-Fi to check unknown medications.";
          }
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            interactions: [...localInteractions, ...apiInteractions],
            isLoading: false,
            error: apiError
          }));
        }
      } catch (e) {
        console.error("Interaction processing failed", e);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false, error: "Critical engine failure. Reverting to safe mode." }));
        }
      }
    }

    processInteractions();

    return () => { isMounted = false; };
  }, [selectedDrugNames]);

  return state;
};
