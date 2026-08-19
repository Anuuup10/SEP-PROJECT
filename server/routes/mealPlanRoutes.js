import express from 'express';
import { getMealPlan, createMealPlan } from '../controllers/mealPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getMealPlan);
router.post('/', protect, createMealPlan);

export default router;

