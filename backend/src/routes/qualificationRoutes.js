import express from 'express';
import {
  getQualifications,
  updateQualification,
  batchApproveRecommended,
} from '../controllers/qualificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getQualifications);
router.patch('/update', authorize('admin'), updateQualification);
router.post('/batch-approve', authorize('admin'), batchApproveRecommended);

export default router;
