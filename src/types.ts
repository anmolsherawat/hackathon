export interface Drug {
  id: string;
  name: string;
  class: string;
  standard_dosage: string;
  description: string;
}

export type Severity = 'Low' | 'Moderate' | 'Severe' | 'Contraindicated';

export interface Interaction {
  source: string;
  target: string;
  severity: Severity;
  description: string;
  mechanism?: string;
}

export interface Database {
  drugs: Drug[];
  interactions: Interaction[];
}
