# Drug Interaction Checker 💊

A lightweight, offline-first application for analyzing potential drug-to-drug interactions, contraindications, and dosage conflicts. Built for the **HACKATHON**, this tool uses a graph-based logic engine to visualize risks between medications.

## 🚀 Key Features

- **100% Offline First**: Operates entirely without external API calls, ensuring privacy and reliability in clinical settings.
- **Graph-Based Analysis**: Models medications as nodes and interactions as edges, allowing for complex multi-drug relationship mapping.
- **Instant Risk Assessment**: Categorizes interactions into **Low**, **Moderate**, **Severe**, and **Contraindicated** with detailed mechanism explanations.
- **Interactive Visualization**: Uses [XYFlow (React Flow)](https://reactflow.dev/) to provide a visual network of potential medication risks.
- **Clinical UI**: Clean, intuitive interface designed for rapid data entry and clear risk communication.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TypeScript
- **Styling**: TailwindCSS (v4)
- **Visualization**: React Flow (XYFlow)
- **Icons**: Lucide React
- **Logic Engine**: Custom TypeScript Graph Logic
- **Database**: Local JSON Structured Data

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/anmolsherawat/hackathon.git
   cd hackathon
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Sample Interactions Included
- **Severe**: Aspirin + Warfarin (Major bleeding risk)
- **Severe**: Lisinopril + Spironolactone (Hyperkalemia)
- **Moderate**: Simvastatin + Warfarin (Metabolic interference)

## ⚖️ Disclaimer
This application is for **hackathon demonstration purposes only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medication-related questions.

---
Built with ❤️ for the Hackathon.
