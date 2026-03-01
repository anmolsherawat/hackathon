import type { Interaction, Severity, Drug } from '../types';

/**
 * Fetches potential interaction data from the openFDA API as a fallback.
 * Note: openFDA doesn't have a direct "pairwise interaction" endpoint for free users,
 * but we can fetch "Adverse Events" or "Drug Label" sections to find warnings.
 * For this hackathon, we'll fetch drug label warnings.
 */
export async function fetchMissingDrugData(drug1: string, drug2: string): Promise<Interaction | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for offline-first

    const query = `https://api.fda.gov/drug/label.json?search=drug_interactions:"${drug1}"+AND+drug_interactions:"${drug2}"&limit=1`;
    
    const response = await fetch(query, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return null;

    // Extract interaction info from the label section, prioritizing Boxed Warnings
    const boxedWarning = result.boxed_warning?.[0];
    const interactionText = boxedWarning || result.drug_interactions?.[0] || result.warnings?.[0] || 'Interaction information found in FDA labels.';
    
    return {
      source: drug1,
      target: drug2,
      severity: 'Moderate' as Severity, // Defaulting to Moderate for API fallback unless specified
      description: interactionText 
        ? interactionText.slice(0, 300) + '...' 
        : 'Interaction information found in FDA labels.',
      mechanism: boxedWarning ? 'FDA BOXED WARNING: Data retrieved from official labeling.' : 'Data retrieved from official FDA Labeling.',
      confidence: 90,
      sourceLabel: 'OpenFDA'
    };
  } catch (error) {
    console.error('API Fallback Error:', error);
    return null;
  }
}

/**
 * Fetches basic metadata for a single drug from OpenFDA.
 */
export async function fetchDrugMetadata(drugName: string): Promise<Partial<Drug> | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    console.log("Fetching API for:", drugName);
    const query = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"&limit=1`;
    
    const response = await fetch(query, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return null;

    return {
      class: result.openfda?.pharm_class_epc?.[0] || 'Unknown Class',
      description: result.indications_and_usage?.[0] 
        ? result.indications_and_usage[0].slice(0, 200) + '...' 
        : 'No description available.',
      indication: result.indications_and_usage?.[0] 
        ? result.indications_and_usage[0].slice(0, 300) + '...' 
        : undefined,
      boxed_warning: result.boxed_warning?.[0] 
        ? result.boxed_warning[0].slice(0, 500) + '...' 
        : undefined
    };
  } catch (error) {
    console.error('API Metadata Error:', error);
    return null;
  }
}

/**
 * Checks if a drug exists in the FDA database to validate missing drugs.
 */
export async function validateDrugExists(drugName: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`);
    return response.ok;
  } catch {
    return false;
  }
}
