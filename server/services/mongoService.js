import Scan from '../models/Scan.js';
import Meal from '../models/Meal.js';

export const saveScan = async ({ userId, analysis }) => {
  await Scan.findOneAndUpdate(
    { scanId: analysis.scanId, userId },
    { scanId: analysis.scanId, userId, analysis, createdAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return analysis.scanId;
};

export const saveMeal = async ({ userId, scanId }) => {
  const scan = await Scan.findOne({ scanId, userId }).lean();
  if (!scan) return null;
  const analysis = scan.analysis;
  const meal = await Meal.create({ userId, scanId, ...analysis, savedAt: new Date() });
  return { id: meal._id.toString(), ...analysis, createdAt: meal.createdAt.toISOString() };
};

export const listMeals = async (userId) => {
  const meals = await Meal.find({ userId }).sort({ createdAt: -1 }).lean();
  return meals.map((meal) => ({ ...meal, id: meal._id.toString(), _id: undefined }));
};
