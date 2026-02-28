import type { Drug, Interaction, Database } from '../types';
import databaseData from '../../database.json';

const db = databaseData as Database;

export class InteractionEngine {
  private drugs: Map<string, Drug>;
  private interactions: Interaction[];

  constructor() {
    this.drugs = new Map(db.drugs.map(d => [d.id, d]));
    this.interactions = db.interactions;
  }

  getAllDrugs(): Drug[] {
    return db.drugs;
  }

  getDrugById(id: string): Drug | undefined {
    return this.drugs.get(id);
  }

  /**
   * Processes a list of drug IDs and returns all pairwise interactions.
   * Logic: For each pair of drugs, check if an interaction exists in the database.
   */
  getInteractions(selectedDrugIds: string[]): Interaction[] {
    const activeInteractions: Interaction[] = [];
    
    // Check all pairwise combinations
    for (let i = 0; i < selectedDrugIds.length; i++) {
      for (let j = i + 1; j < selectedDrugIds.length; j++) {
        const id1 = selectedDrugIds[i];
        const id2 = selectedDrugIds[j];

        const interaction = this.interactions.find(
          inter => (inter.source === id1 && inter.target === id2) || 
                   (inter.source === id2 && inter.target === id1)
        );

        if (interaction) {
          activeInteractions.push(interaction);
        }
      }
    }

    return activeInteractions;
  }

  /**
   * Helper to format data for React Flow
   */
  getGraphData(selectedDrugIds: string[]) {
    const nodes = selectedDrugIds.map((id, index) => {
      const drug = this.getDrugById(id);
      return {
        id,
        data: { label: drug?.name || 'Unknown', drug },
        position: { x: Math.cos(index) * 200 + 300, y: Math.sin(index) * 200 + 300 },
        type: 'default',
      };
    });

    const interactions = this.getInteractions(selectedDrugIds);
    const edges = interactions.map((inter, index) => ({
      id: `e-${index}`,
      source: inter.source,
      target: inter.target,
      label: inter.severity,
      animated: inter.severity === 'Severe' || inter.severity === 'Contraindicated',
      style: { 
        stroke: this.getSeverityColor(inter.severity),
        strokeWidth: inter.severity === 'Severe' || inter.severity === 'Contraindicated' ? 3 : 1
      },
    }));

    return { nodes, edges };
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'Low': return '#10b981';
      case 'Moderate': return '#f59e0b';
      case 'Severe': return '#f97316';
      case 'Contraindicated': return '#ef4444';
      default: return '#94a3b8';
    }
  }
}

export const engine = new InteractionEngine();
