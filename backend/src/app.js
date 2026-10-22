import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import panelRoutes from './routes/panelRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import gdRoutes from './routes/gdRoutes.js';
import qualificationRoutes from './routes/qualificationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

// Centralized error handling
app.use(errorHandler);

export default app;
