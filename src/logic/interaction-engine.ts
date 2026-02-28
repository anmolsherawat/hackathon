import type { Drug, Interaction, Database } from '../types';
import databaseData from '../data/database.json';

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

  getDrugByName(name: string): Drug | undefined {
    return db.drugs.find(d => d.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Processes a list of drug names and returns all pairwise interactions.
   */
  getInteractionsByNames(selectedDrugNames: string[]): Interaction[] {
    const selectedDrugIds = selectedDrugNames
      .map(name => this.getDrugByName(name)?.id)
      .filter((id): id is string => !!id);

    return this.getInteractionsByIds(selectedDrugIds);
  }

  getInteractionsByIds(selectedDrugIds: string[]): Interaction[] {
    const activeInteractions: Interaction[] = [];
    
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

  getGraphData(selectedDrugIds: string[]) {
    const nodes = selectedDrugIds.map((id, index) => {
      const drug = this.getDrugById(id);
      return {
        id,
        data: { label: drug?.name || 'Unknown', drug },
        position: { x: Math.cos(index) * 200 + 400, y: Math.sin(index) * 200 + 300 },
        type: 'default',
      };
    });

    const interactions = this.getInteractionsByIds(selectedDrugIds);
    const edges = interactions.map((inter, index) => ({
      id: `e-${index}`,
      source: inter.source,
      target: inter.target,
      label: inter.severity,
      data: { interaction: inter },
      animated: inter.severity === 'Severe' || inter.severity === 'Contraindicated',
      style: { 
        stroke: this.getSeverityColor(inter.severity),
        strokeWidth: inter.severity === 'Severe' || inter.severity === 'Contraindicated' ? 4 : 2,
        cursor: 'pointer'
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
