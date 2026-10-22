import express from 'express';
import {
  getLeaderboard,
  recalculateFinalScores,
  publishResults,
} from '../controllers/resultsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/leaderboard', getLeaderboard);
router.post('/recalculate', authorize('admin'), recalculateFinalScores);
router.post('/publish', authorize('admin'), publishResults);

export default router;
