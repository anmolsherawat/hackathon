# Drug Interaction Checker 💊

A lightweight, offline-first application for analyzing potential drug-to-drug interactions, contraindications, and dosage conflicts using graph-based logic.

## 1. Problem Statement
**Problem Title**: Medication Errors and Unknown Drug-to-Drug Interactions (DDI)
**Problem Description**: Every year, millions of patients experience adverse drug events (ADEs) due to improper medication combinations. Healthcare providers and patients often lack quick, offline access to reliable interaction data, especially in emergency or low-connectivity settings.
**Target Users**: Healthcare Professionals, Pharmacists, Patients, and Emergency Responders.
**Existing Gaps**: 
- Most existing tools require a constant internet connection.
- Many interfaces are cluttered and not optimized for quick visual risk assessment.
- Lack of simple graph-based visualization to see multi-drug relationship clusters.

## 2. Problem Understanding & Approach
**Root Cause Analysis**: The complexity of pharmacology makes it difficult for humans to memorize every possible pairwise interaction as the number of prescribed medications increases.
**Solution Strategy**: Build an offline-first, graph-powered engine that instantly identifies and visualizes conflicts between a list of user-inputted medications.

## 3. Proposed Solution
**Solution Overview**: A web-based application that works 100% offline.
**Core Idea**: Treat drugs as **Nodes** and interactions as **Edges** in a graph network.
**Key Features**:
- Instant pairwise interaction analysis.
- Severity categorization (Low, Moderate, Severe, Contraindicated).
- Visual relationship mapping using React Flow.
- Offline-first architecture using a local JSON knowledge base.

## 4. System Architecture
**High-Level Flow**:
User → Frontend (React) → Graph Logic Engine → Local JSON Database → Interaction Response → Visualization

**Architecture Description**:
The application is a Single Page Application (SPA). The logic resides entirely on the client side. When a user adds a drug, the Graph Engine queries the local database and calculates all possible edges between existing nodes.

**Architecture Diagram**:
(Add system architecture diagram image here)

## 5. Database Design
**ER Diagram**:
(Add ER diagram image here)

**ER Diagram Description**:
- **Drug Entity**: Contains ID, Name, Class, and Standard Dosage.
- **Interaction Entity**: Contains Source ID, Target ID, Severity Level, Description, and Mechanism. (Many-to-Many relationship between Drugs).

## 6. Dataset Selected
**Dataset Name**: Curated Common Medication Interaction Set
**Source**: Manual curation from public medical references (Aspirin, Warfarin, Ibuprofen, etc.).
**Data Type**: Structured JSON.
**Selection Reason**: Focus on high-frequency medications to demonstrate core graph logic during the hackathon.
**Preprocessing Steps**: Normalized drug names and categorized interaction descriptions into standardized severity levels.

## 7. Model Selected
**Model Name**: Rule-Based Graph Logic Engine
**Selection Reasoning**: For a hackathon DDI tool, deterministic rule-based logic is safer and more reliable than probabilistic ML models for initial verification.
**Alternatives Considered**: NLP-based extraction from medical papers (discarded for offline speed).
**Evaluation Metrics**: Precision and Recall of identified interactions against the local database.

## 8. Technology Stack
- **Frontend**: React.js, Vite, TypeScript
- **Backend**: Client-side Node.js logic
- **ML/AI**: N/A (Rule-based Logic)
- **Database**: Local JSON
- **Deployment**: Vercel / Netlify

## 9. API Documentation & Testing
**API Endpoints List**:
- **Endpoint 1**: `getAllDrugs()` - Retrieves list of available medications.
- **Endpoint 2**: `getInteractions(drugIds[])` - Returns array of interaction objects for given IDs.
- **Endpoint 3**: `getGraphData(drugIds[])` - Formats nodes and edges for React Flow.

**API Testing Screenshots**:
(Add Postman / Thunder Client screenshots here)

## 10. Module-wise Development & Deliverables
- **Checkpoint 1: Research & Planning**
  - Deliverables: database.json schema, UI Mockups.
- **Checkpoint 2: Backend Development**
  - Deliverables: Interaction Logic Engine, Type Definitions.
- **Checkpoint 3: Frontend Development**
  - Deliverables: Search Component, Interaction List View.
- **Checkpoint 4: Model Training**
  - Deliverables: N/A (Database Curation).
- **Checkpoint 5: Model Integration**
  - Deliverables: React Flow Graph Visualization.
- **Checkpoint 6: Deployment**
  - Deliverables: Live Web URL.

## 11. End-to-End Workflow
1. User searches for medications.
2. Selected medications are added to the active list.
3. Graph Engine computes interactions in real-time.
4. UI updates the visual network and displays risk cards.

## 12. Demo & Video
- **Live Demo Link**: 
- **Demo Video Link**: 
- **GitHub Repository**: https://github.com/anmolsherawat/hackathon

## 13. Hackathon Deliverables Summary
- Complete offline-ready web app.
- Interactive graph visualization.
- Curated interaction database.

## 14. Team Roles & Responsibilities
| Member Name | Role | Responsibilities |
|-------------|------|------------------|
| Anmol Sherawat | Lead Developer | Full-Stack, Graph Logic, UI/UX |

## 15. Future Scope & Scalability
**Short-Term**: Add more medications (100+) and dosage-specific warnings.
**Long-Term**: Integrate OCR for scanning prescription labels and exporting reports to PDF.

## 16. Known Limitations
- Current database is limited to sample medications.
- Does not account for patient-specific factors like age or weight yet.

## 17. Impact
Reduces medication errors by providing instant, visual, and offline access to critical safety information, potentially saving lives in emergency and remote healthcare scenarios.
