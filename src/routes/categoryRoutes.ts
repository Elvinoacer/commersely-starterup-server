import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to check if user is SUPER_ADMIN


router.post('/',authenticateJwt,  createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', authenticateJwt, updateCategory);
router.delete('/:id', authenticateJwt, deleteCategory);

export default router;