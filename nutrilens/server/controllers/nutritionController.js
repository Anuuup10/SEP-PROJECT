import NutritionLog from '../models/NutritionLog.js';
import { analyzeFoodImage } from '../services/geminiService.js';
import { calculateDailySummary } from '../services/nutritionService.js';

export const scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const result = await analyzeFoodImage(req.file.buffer, req.file.mimetype);

    const log = await NutritionLog.create({
      user: req.user.id,
      foodName: result.foodName,
      calories: result.calories,
      macros: result.macros,
      healthScore: result.healthScore,
      insights: result.insights
    });

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

export const getNutritionHistory = async (req, res, next) => {
  try {
    const logs = await NutritionLog.find({ user: req.user.id }).sort({ createdAt: -1 });
    const summary = await calculateDailySummary(req.user.id);

    res.status(200).json({
      success: true,
      summary,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
