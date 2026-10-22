import express from 'express';
import {
  getHRCandidates,
  assignInterview,
  submitInterviewEvaluation,
  getInterviewEvaluations,
} from '../controllers/interviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/candidates', authorize('hr', 'admin'), getHRCandidates);
router.post('/assign', authorize('admin'), assignInterview);
router.get('/evaluations', getInterviewEvaluations);
router.post('/evaluations', authorize('hr', 'admin'), submitInterviewEvaluation);

export default router;
