import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import panelRoutes from './routes/panelRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import gdRoutes from './routes/gdRoutes.js';
import qualificationRoutes from './routes/qualificationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Utility Middleware
// Disable helmet's CSP to allow Vite bundled assets and inline scripts when serving frontend
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Flexible CORS supporting local dev and production on Render
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://elesa.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in cloud deployment to prevent CORS breaks
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PlacePro Evaluate API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gd', gdRoutes);
app.use('/api/qualification', qualificationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/results', resultsRoutes);

// Centralized error handling for API routes
app.use('/api', errorHandler);

// Serve frontend static build files (SPA client-side routing fallback)
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];

const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Fallback error handler
app.use(errorHandler);

export default app;
