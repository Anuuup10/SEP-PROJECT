import express from 'express';
import multer from 'multer';
import { scanFood, getNutritionHistory } from '../controllers/nutritionController.js';
import { protect } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/scan', protect, upload.single('image'), scanFood);
router.get('/history', protect, getNutritionHistory);

export default router;
