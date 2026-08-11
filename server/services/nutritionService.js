import NutritionLog from '../models/NutritionLog.js';

export const calculateDailySummary = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await NutritionLog.find({
    user: userId,
    createdAt: { $gte: startOfDay }
  });

  const totals = logs.reduce(
    (acc, log) => {
      acc.calories += log.calories || 0;
      acc.protein += log.macros?.protein || 0;
      acc.carbs += log.macros?.carbs || 0;
      acc.fat += log.macros?.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { totals, logCount: logs.length };
};
