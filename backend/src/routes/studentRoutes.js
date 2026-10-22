import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  importStudents,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('admin'), createStudent);
router.patch('/:id', authorize('admin'), updateStudent);
router.post('/import', authorize('admin'), importStudents);

export default router;
