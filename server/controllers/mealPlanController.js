import MealPlan from '../models/MealPlan.js';
import UserProfile from '../models/UserProfile.js';
import { listMeals } from '../services/mongoService.js';
import { generateMealPlan } from '../services/geminiService.js';

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days (72 hours)

const calculateCooldown = (generatedAt) => {
  if (!generatedAt) return { canRegenerate: true, remainingMs: 0, nextAvailableAt: null };
  const elapsed = Date.now() - new Date(generatedAt).getTime();
  const remainingMs = Math.max(0, COOLDOWN_MS - elapsed);
  const canRegenerate = remainingMs === 0;
  const nextAvailableAt = new Date(new Date(generatedAt).getTime() + COOLDOWN_MS).toISOString();
  const hoursLeft = Math.ceil(remainingMs / (1000 * 60 * 60));
  const daysLeft = Math.ceil(hoursLeft / 24);

  return {
    canRegenerate,
    remainingMs,
    nextAvailableAt,
    hoursLeft,
    daysLeft
  };
};

export const getMealPlan = async (req, res, next) => {
  try {
    const plan = await MealPlan.findOne({ userId: req.user.id }).lean();
    if (!plan) {
      return res.json({
        success: true,
        data: null,
        cooldown: { canRegenerate: true, remainingMs: 0, nextAvailableAt: null }
      });
    }

    const cooldown = calculateCooldown(plan.generatedAt);
    res.json({
      success: true,
      data: {
        ...plan,
        canRegenerate: cooldown.canRegenerate,
        remainingMs: cooldown.remainingMs,
        nextAvailableAt: cooldown.nextAvailableAt,
        hoursLeft: cooldown.hoursLeft,
        daysLeft: cooldown.daysLeft
      },
      cooldown
    });
  } catch (error) {
    next(error);
  }
};

export const createMealPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existingPlan = await MealPlan.findOne({ userId }).lean();

    if (existingPlan?.generatedAt) {
      const cooldown = calculateCooldown(existingPlan.generatedAt);
      if (!cooldown.canRegenerate) {
        const timeMsg = cooldown.hoursLeft > 24 ? `${cooldown.daysLeft} day(s)` : `${cooldown.hoursLeft} hour(s)`;
        return res.status(429).json({
          success: false,
          message: `You can only regenerate your 7-day meal plan once every 3 days. Available again in ${timeMsg}.`,
          cooldown,
          data: existingPlan
        });
      }
    }

    const [profile, savedMeals] = await Promise.all([
      UserProfile.findOne({ userId }).lean(),
      listMeals(userId)
    ]);

    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const mealTitles = savedMeals
      .filter((meal) => new Date(meal.createdAt || 0).getTime() >= cutoff)
      .map((meal) => meal.mealName)
      .filter(Boolean);

    const goals = {
      calories: Number(profile?.calorieGoal || 2000),
      protein: Number(profile?.proteinGoal || 120),
      carbs: Number(profile?.carbsGoal || 250),
      fat: Number(profile?.fatGoal || 70)
    };

    const generated = await generateMealPlan({
      mealTitles,
      conditions: profile?.conditions || [],
      goals
    });

    const now = new Date();
    const savedPlan = await MealPlan.findOneAndUpdate(
      { userId },
      {
        userId,
        days: generated.days,
        recommendation: generated.recommendation,
        disclaimer: generated.disclaimer,
        goals,
        sourceMeals: [...new Set(mealTitles)],
        generatedAt: now
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const cooldown = calculateCooldown(now);

    res.json({
      success: true,
      data: {
        ...savedPlan,
        canRegenerate: cooldown.canRegenerate,
        remainingMs: cooldown.remainingMs,
        nextAvailableAt: cooldown.nextAvailableAt,
        hoursLeft: cooldown.hoursLeft,
        daysLeft: cooldown.daysLeft
      },
      cooldown
    });
  } catch (error) {
    next(error);
  }
};

