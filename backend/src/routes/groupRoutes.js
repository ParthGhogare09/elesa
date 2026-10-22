import express from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
} from '../controllers/groupController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', authorize('admin'), createGroup);
router.patch('/:id', authorize('admin'), updateGroup);

export default router;
