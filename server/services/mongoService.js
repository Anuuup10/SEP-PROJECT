import Scan from '../models/Scan.js';
import Meal from '../models/Meal.js';
import UserProfile from '../models/UserProfile.js';

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
  const meal = await Meal.findOneAndUpdate(
    { userId, scanId },
    { $setOnInsert: { userId, scanId, ...analysis, createdAt: new Date(), savedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return { id: meal._id.toString(), ...analysis, createdAt: (meal.createdAt || new Date()).toISOString() };
};

export const listMeals = async (userId) => {
  const meals = await Meal.find({ userId }).sort({ createdAt: -1 }).lean();
  return meals.map((meal) => ({ ...meal, id: meal._id.toString(), _id: undefined }));
};

const periodDays = { week: 7, 'two-weeks': 14, month: 30 };
const appTimeZone = process.env.APP_TIME_ZONE || 'Asia/Kathmandu';
const dateKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: appTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const addDaysToKey = (key, amount) => { const date = new Date(`${key}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return dateKey(date); };
const dayLabel = (date, days) => days <= 7
  ? new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: appTimeZone }).format(date)
  : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: appTimeZone }).format(date);

const sumItemNutrition = (items = []) => items.reduce((sum, item) => ({
  calories: sum.calories + Number(item.calories ?? item.kcal ?? 0),
  protein: sum.protein + Number(item.protein ?? 0),
  carbs: sum.carbs + Number(item.carbohydrates ?? item.carbs ?? 0),
  fat: sum.fat + Number(item.fat ?? item.fats ?? 0),
  fiber: sum.fiber + Number(item.fiber ?? 0),
  sodium: sum.sodium + Number(item.sodium ?? 0),
}), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

const firstNutritionValue = (...values) => {
  const numbers = values.map((value) => Number(value)).filter(Number.isFinite);
  return numbers.find((value) => value > 0) ?? numbers[0] ?? 0;
};

// Support both the current nested `totals` shape and older saved meals that
// stored compatibility fields at the top level.
const getMealTotals = (meal) => {
  const stored = meal.totals || {};
  const itemTotals = sumItemNutrition(meal.items);
  return {
    calories: firstNutritionValue(stored.calories, meal.totalKcal, meal.totalCalories, meal.calories, itemTotals.calories),
    protein: firstNutritionValue(stored.protein, meal.protein, meal.macros?.protein, itemTotals.protein),
    carbs: firstNutritionValue(stored.carbohydrates, stored.carbs, meal.carbs, meal.macros?.carbs, itemTotals.carbs),
    fat: firstNutritionValue(stored.fat, meal.fat, meal.fats, meal.macros?.fat, itemTotals.fat),
    fiber: firstNutritionValue(stored.fiber, meal.fiber, itemTotals.fiber),
    sodium: firstNutritionValue(stored.sodium, meal.sodium, itemTotals.sodium),
  };
};

export const getProgress = async ({ userId, period = 'week' }) => {
  const daysCount = periodDays[period] || periodDays.week;
  const todayKey = dateKey(new Date());
  const firstDayKey = addDaysToKey(todayKey, -daysCount + 1);
  const start = new Date(`${firstDayKey}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 2);
  const end = new Date(`${todayKey}T23:59:59.999Z`);
  end.setUTCDate(end.getUTCDate() + 2);

  const [meals, profile] = await Promise.all([
    Meal.find({ userId, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: 1 }).lean(),
    UserProfile.findOne({ userId }).lean()
  ]);

  const byDay = new Map();
  for (let index = 0; index < daysCount; index += 1) {
    const key = addDaysToKey(firstDayKey, index);
    const date = new Date(`${key}T12:00:00Z`);
    byDay.set(key, { date: key, label: dayLabel(date, daysCount), calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, meals: [] });
  }
  for (const meal of meals) {
    const day = byDay.get(dateKey(meal.createdAt));
    if (!day) continue;
    const totals = getMealTotals(meal);
    const fiber = totals.fiber;
    day.calories += totals.calories;
    day.protein += totals.protein;
    day.carbs += totals.carbs;
    day.fat += totals.fat;
    day.fiber += fiber;
    day.meals.push({ id: meal._id.toString(), name: meal.mealName, calories: totals.calories, protein: totals.protein, carbs: totals.carbs, fat: totals.fat, fiber, sodium: totals.sodium, totals, items: meal.items?.length || 0, image: meal.image, createdAt: meal.createdAt });
  }

  const days = [...byDay.values()];
  const totals = days.reduce((sum, day) => ({
    calories: sum.calories + day.calories, protein: sum.protein + day.protein,
    carbs: sum.carbs + day.carbs, fat: sum.fat + day.fat, fiber: sum.fiber + day.fiber
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const goals = {
    calories: Number(profile?.calorieGoal || 2000), protein: Number(profile?.proteinGoal || 120),
    carbs: Number(profile?.carbsGoal || 250), fat: Number(profile?.fatGoal || 70), fiber: 30
  };
  const today = days[days.length - 1] || { meals: [], calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const completion = Object.fromEntries(Object.entries(goals).map(([key, goal]) => [key, goal > 0 ? Math.round((today[key] / goal) * 100) : 0]));
  return { period, goals, days, totals, today, completion, streak: await calculateStreak(userId) };
};

export const calculateStreak = async (userId) => {
  const meals = await Meal.find({ userId }, { createdAt: 1 }).sort({ createdAt: -1 }).lean();
  const dates = new Set(meals.map((meal) => dateKey(meal.createdAt)));
  let streak = 0;
  let cursor = dateKey(new Date());
  while (dates.has(cursor)) { streak += 1; cursor = addDaysToKey(cursor, -1); }
  return streak;
};
