import { analyzeFoodImage } from '../services/geminiService.js';
import { randomUUID } from 'node:crypto';
import { listMeals, saveMeal, saveScan } from '../services/mongoService.js';

export const scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const result = await analyzeFoodImage(req.file.buffer, req.file.mimetype);

    if (!result.isFood) {
      return res.status(422).json({ success: false, message: 'No recognizable food was detected in the image', data: result });
    }

    result.scanId = randomUUID();
    const imageDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    if (Buffer.byteLength(imageDataUrl, 'utf8') > 900 * 1024) {
      return res.status(413).json({ success: false, message: 'The image thumbnail is too large. Please use a smaller image.' });
    }
    result.image = imageDataUrl;
    result.imageUrl = imageDataUrl;
    await saveScan({ userId: req.user.id, analysis: result });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getNutritionHistory = async (req, res, next) => {
  try {
    const logs = await listMeals(req.user.id);
    const totals = logs.reduce((sum, meal) => {
      sum.calories += meal.totals?.calories || 0;
      sum.protein += meal.totals?.protein || 0;
      sum.carbs += meal.totals?.carbohydrates || 0;
      sum.fat += meal.totals?.fat || 0;
      return sum;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const dayKeys = new Set(logs.map((meal) => new Date(meal.createdAt).toISOString().slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);
    while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    res.status(200).json({
      success: true,
      summary: { totals, logCount: logs.length, streak },
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

export const saveNutritionMeal = async (req, res, next) => {
  try {
    if (!req.body?.scanId) return res.status(400).json({ success: false, message: 'scanId is required' });
    const meal = await saveMeal({ userId: req.user.id, scanId: req.body.scanId });
    if (!meal) return res.status(404).json({ success: false, message: 'Scan not found for this user' });
    res.status(201).json({ success: true, data: meal });
  } catch (error) { next(error); }
};
