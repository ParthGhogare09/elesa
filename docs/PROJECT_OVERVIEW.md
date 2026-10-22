# PlacePro Evaluate — Project Overview

**Application Name**: PlacePro Evaluate  
**Tagline**: *Evaluate Fairly. Recognize Potential.*  
**System Type**: Collegiate Mock Placement Group Discussion (GD) & HR Interview Evaluation Platform

---

## 1. Executive Summary
PlacePro Evaluate is purpose-built to streamline and govern the evaluation and merit selection process during campus mock placement events.

The system focuses **strictly on evaluation workflows**:
- **Round 1 (Group Discussion)**:
  - Participants organized into balanced cohorts of **4 to 6 students**.
  - Four dedicated GD Panels: **Panel A, Panel B, Panel C, and Panel D**.
  - Evaluators score individual candidates against a 6-criterion rubric (**60 Marks total**).
  - Every evaluated candidate receives individual qualitative remarks.
  - **Strict Business Rule**: Each judge can recommend a **maximum of three (3) candidates per group** for Round 2.
  - Advisory shortlists undergo administrative review and qualification approval.
- **Round 2 (HR Interview)**:
  - Only candidates approved as **Qualified** by the Administrator can participate.
  - Two HR Interviewers evaluate candidates across a 5-criterion rubric (**50 Marks total**).
  - Evaluators record qualitative strengths, growth areas, observations, and hiring recommendations.
  - Supports **Workflow A** (single HR interviewer allocation) and **Workflow B** (dual independent evaluation with mean scoring).
- **Merit Leaderboard & Final Selection**:
  - Configurable composite merit equation (Default: **40% GD + 60% HR**).
  - Pre-defined tie-breaking logic (Higher final score &rarr; Higher HR interview score &rarr; Higher GD score).
  - Pre-publication readiness checklist and frozen rankings upon publication.
  - Full CSV exports for all stages.

---

## 2. Portals and User Roles

| Portal | Role | Key Capabilities |
| :--- | :--- | :--- |
| **Placement Admin Hub** | `admin` | Full control over panels, groups (4-6), judges, candidate directory, qualification decisions, HR allocations, weight configs, leaderboard, and audits. |
| **GD Judge Portal** | `judge` | Dedicated workspace to evaluate assigned panels/groups. Fast live scoring (6 criteria, 60 marks), remarks, and enforced 3-candidate shortlist ceiling. |
| **HR Interview Portal** | `hr` | Interview workspace for qualified candidates (5 criteria, 50 marks), strengths, improvement areas, remarks, and hiring recommendations. |

---

## 3. Technology Architecture
- **Frontend**: React 19, Vite, Tailwind CSS (White & Blue Palette), React Router DOM, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, Helmet security headers, CORS, Morgan, Socket.IO.
- **Dual Operating Modes**:
  - **Demo Mode**: Instant stateful in-browser exploration without database setup.
  - **Live API Mode**: Connected to MongoDB Express REST backend.
