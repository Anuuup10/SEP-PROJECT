import express from 'express';
import multer from 'multer';
import { scanFood, getNutritionHistory, saveNutritionMeal } from '../controllers/nutritionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { config } from '../config/env.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageBytes, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) return callback(new Error('Only JPEG, PNG, WebP, HEIC, and HEIF images are supported'));
    callback(null, true);
  }
});
const router = express.Router();

router.post('/scan', protect, upload.single('image'), scanFood);
router.post('/meals', protect, saveNutritionMeal);
router.get('/history', protect, getNutritionHistory);

export default router;
