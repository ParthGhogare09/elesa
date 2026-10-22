# PlacePro Evaluate — Frontend Application

Modern React + Vite frontend for managing and evaluating collegiate mock placement drives across Round 1 (Group Discussion) and Round 2 (HR Interviews).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build
npm run build
```

## Demo Mode vs Live API Mode
PlacePro Evaluate contains a full in-browser stateful simulation engine with 100 realistic candidates, 4 GD panels, 20 cohorts (5 students each), and sample scoring.

To toggle between Demo Mode and Live Express REST Backend:
- Click the **Demo Mode Active** pill in the top navigation header or set `VITE_ENABLE_DEMO_MODE=false` in `.env`.
