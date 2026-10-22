import express from 'express';
import { getPanels, updatePanel } from '../controllers/panelController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPanels);
router.patch('/:id', authorize('admin'), updatePanel);

export default router;
