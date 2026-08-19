import express from 'express';
import multer from 'multer';

import {
  scanFood,
  getNutritionHistory,
} from '../controllers/nutritionController.js';

const router = express.Router();

// Store uploaded images in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// Scan food image
router.post(
  '/scan',
  upload.single('image'),
  scanFood
);

// Get nutrition history
router.get(
  '/history',
  getNutritionHistory
);

export default router;