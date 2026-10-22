# PlacePro Evaluate — Group Discussion & Interview Evaluation System

**Tagline**: *Evaluate Fairly. Recognize Potential.*

PlacePro Evaluate is an enterprise-grade collegiate mock placement evaluation and merit selection system. It manages candidate evaluation across two rigorous stages: **Round 1 (Group Discussion across 4 Panels)** and **Round 2 (Dual HR Interviews)**, culminating in an administrator-governed composite merit leaderboard.

---

## 🌟 Key System Capabilities

### 1. Dual Evaluation Architecture
- **Round 1: Group Discussion (GD)**:
  - Participants structured into cohorts of **4 to 6 students**.
  - **4 Default GD Panels**: Panel A, Panel B, Panel C, and Panel D.
  - Individual evaluation rubrics across 6 criteria (**60 Marks total**): Communication, Clarity of Thought, Confidence, Logical Reasoning, Teamwork & Listening, Initiative & Leadership.
  - Individual qualitative observations entered per candidate.
  - **Strict Business Rule**: Maximum of **3 candidates recommended per group** per judge for Round 2.
- **Round 2: HR Interviews**:
  - Strict eligibility: Only administrator-approved **Qualified** candidates from Round 1 enter Round 2.
  - Two HR Interviewers (HR 1 & HR 2) evaluate candidates across 5 criteria (**50 Marks total**): Communication, Confidence & Professionalism, Problem-Solving, Technical Awareness, Attitude & Motivation.
  - Detailed qualitative strengths, areas for growth, and hiring recommendations (`Strongly Recommended`, `Recommended`, `On Hold`, `Not Recommended`).
  - Supports **Workflow A** (single HR split) and **Workflow B** (dual independent evaluation with mean scoring).
- **Composite Merit Scoring**:
  - Weighted composite formula: `(GD% × 40%) + (HR% × 60%)`.
  - Tie-breaking rules: Higher final score &rarr; Higher HR interview score &rarr; Higher GD score.
  - Pre-publication readiness checklist and immutable published result freeze.

### 2. Turnkey Demo Mode vs Production MongoDB Backend
- **Instant Browser Demo Mode**: Full interactive simulation loaded with **100 realistic candidates, 4 panels, 20 cohorts of 5 students, judges, and pre-seeded scoring**. Supports full in-browser CRUD, group wizard, live scoring, qualification decisions, and CSV exports via `localStorage` without database dependencies.
- **Production MongoDB Backend**: Express.js REST API with Helmet security, bcrypt, JWT authentication, Mongoose data models, Socket.IO live updates, and seed script.

---

## 📁 Project Structure

```
placepro-evaluate/
├── frontend/
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Button, Card, Badge, Input, Select, StatCard, Modal
│   │   │   ├── layout/       # AppLayout, Sidebar, Header, PageHeader
│   │   │   └── tables/       # DataTable with search, filters, pagination
│   │   ├── data/             # mockData.js (100 students, panels, groups, rubrics)
│   │   ├── services/         # demoService.js (stateful simulation), apiClient.js
│   │   ├── context/          # AuthContext.jsx (role switching, demo toggle)
│   │   ├── features/
│   │   │   ├── admin/        # Dashboard, Students, Panels, Groups, Judges,
│   │   │   │                 # GD Review, Qualification, Interviews, Leaderboard, Reports
│   │   │   ├── judge/        # JudgeDashboard, GroupEvaluationWorkspace, Shortlist
│   │   │   └── hr/           # HRDashboard, HREvaluationWorkspace, History
│   │   ├── pages/            # LoginPage, NotFoundPage, UnauthorizedPage
│   │   ├── routes/           # AppRoutes.jsx (role-guarded routing)
│   │   ├── styles/           # Tailwind CSS & Inter typography
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB Mongoose connection
│   │   ├── models/           # 12 Mongoose Schemas (User, Student, Group, Eval, etc.)
│   │   ├── controllers/      # Auth, Student, Panel, Group, GD, Qual, HR, Results
│   │   ├── routes/           # Express REST endpoints
│   │   ├── middleware/       # JWT Authentication & Role Authorization
│   │   ├── seed.js           # 100-student database populator
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # HTTP + Socket.IO server entry
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACTS.md
│   ├── WORKFLOW.md
│   └── DESIGN_SYSTEM.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 How to Run the Application

### 1. Frontend Development Server

```bash
cd frontend
npm run dev
```
The application will launch on `http://localhost:5173`.
By default, **Demo Mode is active**, allowing complete exploration without running MongoDB!

### 2. Backend API Server & Database Setup

Make sure your MongoDB server is running (default `mongodb://127.0.0.1:27017`):

```bash
cd backend

# Populate MongoDB with 100 students, panels, groups, and evaluations:
npm run seed

# Start the Express server:
npm run dev
```
The API server will run on `http://localhost:5000`.

---

## 🔑 Demo Login Portals

Use the 1-Click Role Switcher on the login screen or in the top navigation bar:

| Role | Demo Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@placepro.demo` | `password123` | Complete drive control, groups, panels, qualification, final weights, leaderboard, and publication. |
| **GD Judge** | `judge@placepro.demo` | `password123` | Live GD group evaluation (6 rubrics out of 60) and 3-candidate shortlist limit. |
| **HR Interviewer** | `hr@placepro.demo` | `password123` | Round 2 interview scoring (5 rubrics out of 50), qualitative observations, and recommendations. |

---

## 🎨 Visual Identity
- **Primary Theme**: Clean white-and-blue interface (`#2563EB` primary, `#F8FAFC` background, `#FFFFFF` cards).
- **Typography**: `Inter` sans-serif font.
- **Accents**: Subtle badges, crisp tabular alignments, soft shadows, and responsive touch controls.
