import express from 'express';
import {
  getJudgeGroups,
  getGDEvaluations,
  submitGDEvaluation,
  submitGDRecommendations,
  submitGDGroupEvaluation,
  getGDGroupEvaluations,
} from '../controllers/gdController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/judge/groups', authorize('judge', 'admin'), getJudgeGroups);
router.get('/evaluations', getGDEvaluations);
router.post('/evaluations', authorize('judge', 'admin'), submitGDEvaluation);
router.post('/groups/:groupId/recommendations', authorize('judge', 'admin'), submitGDRecommendations);
router.get('/groups/:groupId/group-evaluations', getGDGroupEvaluations);
router.post('/groups/:groupId/group-evaluation', authorize('judge', 'admin'), submitGDGroupEvaluation);

export default router;
