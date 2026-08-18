import { getProgress } from '../services/mongoService.js';

export const getNutritionProgress = async (req, res, next) => {
  try {
    const period = ['week', 'two-weeks', 'month'].includes(req.query.period) ? req.query.period : 'week';
    res.json({ success: true, data: await getProgress({ userId: req.user.id, period }) });
  } catch (error) { next(error); }
};
