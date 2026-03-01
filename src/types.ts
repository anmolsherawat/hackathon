export interface Drug {
  id: string;
  name: string;
  class: string;
  standard_dosage: string;
  description: string;
  indication?: string;
  boxed_warning?: string;
}

export type Severity = 'Low' | 'Moderate' | 'Severe' | 'Contraindicated';

export interface Interaction {
  source: string;
  target: string;
  severity: Severity;
  description: string;
  mechanism?: string;
  clinical_action?: string;
  confidence?: number;
  sourceLabel?: 'Local DB' | 'OpenFDA' | 'AI-Augmented';
}

export interface Database {
  drugs: Drug[];
  interactions: Interaction[];
}
