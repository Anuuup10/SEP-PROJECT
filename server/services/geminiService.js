import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const nutritionSchema = {
  type: 'object',
  properties: {
    isFood: { type: 'boolean' },
    mealName: { type: 'string' },
    items: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, category: { type: 'string' },
      portionQuantity: { type: 'number' }, portionUnit: { type: 'string' },
      cookingMethod: { type: 'string' }, calories: { type: 'number' },
      protein: { type: 'number' }, carbohydrates: { type: 'number' },
      fat: { type: 'number' }, fiber: { type: 'number' }, sugar: { type: 'number' },
      sodium: { type: 'number' }, saturatedFat: { type: 'number' },
      confidence: { type: 'number' }, estimated: { type: 'boolean' },
      assumptions: { type: 'array', items: { type: 'string' } },
      possibleAllergens: { type: 'array', items: { type: 'string' } },
      healthStatus: { type: 'string', enum: ['safe', 'caution', 'high-risk', 'none', 'review'] },
      healthReason: { type: 'string' }
    }, required: ['name', 'category', 'portionQuantity', 'portionUnit', 'cookingMethod', 'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat', 'confidence', 'estimated', 'assumptions', 'possibleAllergens', 'healthStatus', 'healthReason'] } },
    overallConfidence: { type: 'number' }, insight: { type: 'string' },
    assumptions: { type: 'array', items: { type: 'string' } }, disclaimer: { type: 'string' }
  },
  required: ['isFood', 'mealName', 'items', 'overallConfidence', 'insight', 'assumptions', 'disclaimer']
};

const buildPrompt = (conditions = []) => {
  const conditionText = conditions.length ? conditions.join(', ') : 'None';
  return `You are KhanaLens, an AI food and nutrition analysis assistant.

Analyze the provided food image and identify all clearly visible food and drink items, including Nepali, South Asian, and international foods.

For each item:
- Identify the food name
- Estimate the portion size
- Estimate calories, protein, carbs, fat, fiber, sugar, sodium, and saturated fat based on the visible food and estimated portion
- Consider visible ingredients and likely cooking methods
- Provide a confidence score
- Never invent hidden ingredients or claim estimates are exact
- When uncertain, use a lower confidence score rather than guessing

For mixed meals, separate each food item and provide meal totals.

User health conditions: ${conditionText}

For relevant items, return "none", "caution", or "review" based on the provided context. These are general nutrition flags, not medical advice. Never diagnose or claim a food is medically safe or unsafe.

Give a short 1–2 sentence nutrition insight.

If no food is detected, return isFood: false and an empty items array.

Return ONLY valid JSON matching the provided schema.`;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const nonNegative = (value) => (Number.isFinite(value) && value >= 0 ? value : 0);

const normalizeItem = (item) => {
  const rawStatus = String(item.healthStatus || 'none').toLowerCase();
  const healthStatus = rawStatus === 'high-risk'
    ? 'high-risk'
    : rawStatus === 'caution' || rawStatus === 'review'
    ? 'caution'
    : 'safe';

  return {
    name: String(item.name || 'Unidentified food'),
    category: String(item.category || 'food'),
    portion: `${nonNegative(item.portionQuantity)}${item.portionUnit || 'g'}`,
    portionQuantity: nonNegative(item.portionQuantity),
    portionUnit: String(item.portionUnit || 'g'),
    cookingMethod: String(item.cookingMethod || 'unknown'),
    calories: nonNegative(item.calories),
    protein: nonNegative(item.protein),
    carbohydrates: nonNegative(item.carbohydrates),
    carbs: nonNegative(item.carbohydrates),
    fat: nonNegative(item.fat),
    fiber: nonNegative(item.fiber),
    sugar: nonNegative(item.sugar),
    sodium: nonNegative(item.sodium),
    saturatedFat: nonNegative(item.saturatedFat),
    confidence: clamp(Number(item.confidence) || 0, 0, 1),
    estimated: Boolean(item.estimated),
    assumptions: Array.isArray(item.assumptions) ? item.assumptions.map(String) : [],
    possibleAllergens: Array.isArray(item.possibleAllergens) ? item.possibleAllergens.map(String) : [],
    healthStatus,
    healthReason: String(item.healthReason || '')
  };
};

const normalizeResult = (result) => {
  const items = Array.isArray(result.items) ? result.items.map(normalizeItem) : [];
  const totals = items.reduce((sum, item) => {
    for (const field of ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat']) sum[field] += item[field];
    return sum;
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, saturatedFat: 0 });
  const isFood = Boolean(result.isFood) && items.length > 0;
  const mealName = String(result.mealName || (isFood ? 'Analyzed meal' : 'No food detected'));
  const detectedItems = items.map((item, index) => ({ id: `item_${index + 1}`, ...item, kcal: item.calories }));
  return {
    isFood, mealName, items: items.map((item, index) => ({ id: `item_${index + 1}`, ...item })), totals,
    overallConfidence: clamp(Number(result.overallConfidence) || 0, 0, 1),
    insight: String(result.insight || ''),
    assumptions: Array.isArray(result.assumptions) ? result.assumptions.map(String) : [],
    disclaimer: String(result.disclaimer || 'Nutrition values are estimates based on the image.'),
    // Compatibility aliases for the current frontend during migration.
    foodName: mealName, itemCount: items.length, detectedItems, totalKcal: totals.calories,
    protein: totals.protein, carbs: totals.carbohydrates, fats: totals.fat,
    macros: { protein: totals.protein, carbs: totals.carbohydrates, fat: totals.fat }
  };
};

export const analyzeFoodImage = async (imageBuffer, mimeType, conditions = []) => {
  if (!config.geminiApiKey) {
    const error = new Error('Gemini API key is not configured');
    error.statusCode = 503;
    throw error;
  }
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: config.geminiModel, generationConfig: {
      responseMimeType: 'application/json', responseSchema: nutritionSchema, temperature: 0.1
    } });
    const result = await model.generateContent([
      { text: buildPrompt(conditions) },
      { inlineData: { data: imageBuffer.toString('base64'), mimeType } }
    ]);
    return normalizeResult(JSON.parse(result.response.text()));
  } catch (error) {
    console.error('[Gemini AI Error]', error.message);
    if (error instanceof SyntaxError) {
      error.statusCode = 502;
      error.message = 'Gemini returned an invalid analysis response';
    }
    if (!error.statusCode) error.statusCode = 502;
    throw error;
  }
};

export const getRollingDaysList = () => {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      name: dayName,
      short: dayShort,
      isToday: i === 0,
      order: i + 1
    });
  }
  return days;
};

const sevenDayMealPlanSchema = {
  type: 'object',
  properties: {
    recommendation: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string' },
          dayShort: { type: 'string' },
          meals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                time: { type: 'string' },
                title: { type: 'string' },
                foods: { type: 'array', items: { type: 'string' } },
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' }
              },
              required: ['type', 'time', 'title', 'foods', 'calories', 'protein', 'carbs', 'fat']
            }
          },
          totals: {
            type: 'object',
            properties: {
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' }
            },
            required: ['calories', 'protein', 'carbs', 'fat']
          }
        },
        required: ['day', 'meals', 'totals']
      }
    },
    disclaimer: { type: 'string' }
  },
  required: ['recommendation', 'days', 'disclaimer']
};

const DAY_FALLBACKS = [
  // Day 1 (~95% target)
  {
    targetFactor: 0.95,
    meals: [
      { type: 'Breakfast', time: '7:45 AM', fallback: 'Rolled Oats with Banana, Chia Seeds & Almonds', foods: ['Rolled Oats', 'Banana', 'Chia Seeds', 'Almonds', 'Skim Milk'], calRatio: 0.27 },
      { type: 'Lunch', time: '1:00 PM', fallback: 'Brown Rice, Yellow Dal, Grilled Chicken Breast & Cucumber Salad', foods: ['Brown Rice', 'Yellow Lentils (Dal)', 'Grilled Chicken Breast', 'Cucumber & Tomato Salad'], calRatio: 0.36 },
      { type: 'Evening Snack', time: '4:30 PM', fallback: 'Roasted Makhana & Green Tea', foods: ['Roasted Makhana (Foxnuts)', 'Green Tea'], calRatio: 0.11 },
      { type: 'Dinner', time: '8:00 PM', fallback: 'Whole Wheat Roti, Palak Paneer & Sprout Salad', foods: ['Whole Wheat Roti (2)', 'Palak Paneer', 'Moong Sprout Salad'], calRatio: 0.26 }
    ]
  },
  // Day 2 (~98% target)
  {
    targetFactor: 0.98,
    meals: [
      { type: 'Breakfast', time: '8:00 AM', fallback: 'Boiled Eggs (2) with Whole Grain Toast & Avocado', foods: ['Boiled Eggs', 'Whole Grain Toast', 'Avocado Slices', 'Black Coffee'], calRatio: 0.28 },
      { type: 'Lunch', time: '1:15 PM', fallback: 'Quinoa Bowl with Chickpea Curry, Steamed Broccoli & Curd', foods: ['Quinoa', 'Chickpea Curry (Chole)', 'Steamed Broccoli', 'Low-fat Curd'], calRatio: 0.38 },
      { type: 'Evening Snack', time: '4:45 PM', fallback: 'Handful of Walnuts & Fresh Papaya Slices', foods: ['Walnuts', 'Fresh Papaya'], calRatio: 0.12 },
      { type: 'Dinner', time: '8:15 PM', fallback: 'Grilled Fish or Tofu with Sauteed Zucchini & Millet', foods: ['Grilled Fish/Tofu', 'Sauteed Zucchini & Bell Peppers', 'Foxtail Millet'], calRatio: 0.26 }
    ]
  },
  // Day 3 (~91% target)
  {
    targetFactor: 0.91,
    meals: [
      { type: 'Breakfast', time: '7:30 AM', fallback: 'Greek Yogurt Parfait with Fresh Berries & Pumpkin Seeds', foods: ['Greek Yogurt', 'Blueberries & Strawberries', 'Pumpkin Seeds', 'Honey drizzle'], calRatio: 0.25 },
      { type: 'Lunch', time: '12:45 PM', fallback: 'Lentil Soup with Multigrain Roti & Mint Raita', foods: ['Mixed Lentil Soup', 'Multigrain Roti (2)', 'Mixed Vegetable Sabzi', 'Mint Raita'], calRatio: 0.35 },
      { type: 'Evening Snack', time: '4:15 PM', fallback: 'Boiled Chana Chaat with Tomatoes & Lemon', foods: ['Boiled Black Chana', 'Chopped Onions & Tomatoes', 'Lemon Juice'], calRatio: 0.10 },
      { type: 'Dinner', time: '7:45 PM', fallback: 'Stir-Fried Chicken or Paneer with Brown Rice', foods: ['Stir-Fried Chicken/Paneer', 'Brown Rice', 'Clear Vegetable Broth'], calRatio: 0.25 }
    ]
  },
  // Day 4 (~100% target)
  {
    targetFactor: 1.00,
    meals: [
      { type: 'Breakfast', time: '8:00 AM', fallback: 'Vegetable Upma / Poha with Peanuts & Boiled Egg Whites', foods: ['Vegetable Poha/Upma', 'Roasted Peanuts', 'Boiled Egg Whites (2)'], calRatio: 0.28 },
      { type: 'Lunch', time: '1:00 PM', fallback: 'Steamed Rice with Rajma (Kidney Beans) & Green Salad', foods: ['Steamed Rice', 'Rajma Curry', 'Cucumber Onion Salad', 'Fresh Curd'], calRatio: 0.39 },
      { type: 'Evening Snack', time: '4:30 PM', fallback: 'Apple Slices with 1 tbsp Peanut Butter', foods: ['Crisp Apple Slices', 'Natural Peanut Butter'], calRatio: 0.12 },
      { type: 'Dinner', time: '8:00 PM', fallback: 'Methi Roti with Soya Chunks Curry & Roasted Baingan', foods: ['Methi Roti (2)', 'Soya Chunks Curry', 'Roasted Baingan Bharta'], calRatio: 0.27 }
    ]
  },
  // Day 5 (~94% target)
  {
    targetFactor: 0.94,
    meals: [
      { type: 'Breakfast', time: '7:45 AM', fallback: 'Scrambled Eggs or Tofu with Spinach & Toast', foods: ['Scrambled Eggs / Tofu', 'Sauteed Baby Spinach', 'Whole Grain Toast'], calRatio: 0.26 },
      { type: 'Lunch', time: '1:15 PM', fallback: 'Whole Grain Wrap with Grilled Paneer & Hummus', foods: ['Whole Grain Tortilla Wrap', 'Grilled Paneer / Chicken', 'Hummus & Crunchy Greens'], calRatio: 0.37 },
      { type: 'Evening Snack', time: '4:45 PM', fallback: 'Spiced Buttermilk (Chhaas) & Roasted Seeds', foods: ['Spiced Buttermilk (Chhaas)', 'Roasted Sunflower & Flax Seeds'], calRatio: 0.11 },
      { type: 'Dinner', time: '8:15 PM', fallback: 'Moong Dal Khichdi with Steamed Veggies & Ghee', foods: ['Moong Dal Khichdi', 'Steamed French Beans & Carrots', '1 tsp Pure Desi Ghee'], calRatio: 0.26 }
    ]
  },
  // Day 6 (~99% target)
  {
    targetFactor: 0.99,
    meals: [
      { type: 'Breakfast', time: '8:30 AM', fallback: 'Protein Banana Pancakes with Crushed Pecans', foods: ['Banana Oat Protein Pancakes', 'Crushed Pecans / Walnuts', 'Fresh Strawberries'], calRatio: 0.29 },
      { type: 'Lunch', time: '1:30 PM', fallback: 'Chicken or Egg Biryani with Cucumber Raita', foods: ['Light Chicken/Egg Biryani (Basmati Rice)', 'Cucumber Tomato Raita', 'Boiled Egg'], calRatio: 0.40 },
      { type: 'Evening Snack', time: '5:00 PM', fallback: 'Dark Chocolate (1 square) & Mixed Nuts', foods: ['70% Dark Chocolate (1 square)', 'Almonds & Cashews'], calRatio: 0.11 },
      { type: 'Dinner', time: '8:30 PM', fallback: 'Grilled Vegetable & Cottage Cheese Platter with Warm Flatbread', foods: ['Grilled Paneer & Bell Peppers', 'Multigrain Flatbread', 'Green Mint Chutney'], calRatio: 0.26 }
    ]
  },
  // Day 7 (~92% target)
  {
    targetFactor: 0.92,
    meals: [
      { type: 'Breakfast', time: '8:15 AM', fallback: 'Smoothie Bowl with Spinach, Mango & Chia Seeds', foods: ['Spinach Mango Smoothie Bowl', 'Chia Seeds', 'Toasted Coconut Flakes'], calRatio: 0.26 },
      { type: 'Lunch', time: '1:00 PM', fallback: 'Brown Rice with Fish or Tofu Curry & Sauteed Greens', foods: ['Brown Rice', 'Light Fish/Tofu Curry', 'Sauteed Mustard Greens', 'Lemon Wedge'], calRatio: 0.36 },
      { type: 'Evening Snack', time: '4:30 PM', fallback: 'Tender Coconut Water & Roasted Flaxseeds', foods: ['Fresh Tender Coconut Water', 'Roasted Flaxseeds'], calRatio: 0.10 },
      { type: 'Dinner', time: '8:00 PM', fallback: 'Light Vegetable Clear Soup with 2 Rotis & Dal Tadka', foods: ['Mixed Vegetable Clear Soup', 'Whole Wheat Roti (2)', 'Yellow Dal Tadka'], calRatio: 0.25 }
    ]
  }
];

const buildSevenDayMealPlanPrompt = ({ mealTitles, conditions, goals, rollingDays }) => {
  const daySequenceStr = rollingDays
    .map((d, idx) => `Day ${idx + 1}: ${d.name}${idx === 0 ? ' (Today)' : ''}`)
    .join(', ');

  return `Create a complete and realistic 7-day personalized meal plan starting with TODAY (${rollingDays[0].name}) and continuing for the next 6 days.
Sequence of 7 days: ${daySequenceStr}
Recent meals logged by user: ${mealTitles.join(', ') || 'Healthy home-cooked meals (dal bhat, chicken curry, oats, roti, salads)'}
Health conditions or dietary notes: ${conditions.join(', ') || 'None'}
Daily target reference: ~${goals.calories} kcal, ~${goals.protein}g protein, ~${goals.carbs}g carbs, ~${goals.fat}g fat

CRITICAL INSTRUCTIONS FOR VARIATION:
1. DO NOT make everyday calories or meal items identical! Every day must have distinct, delicious, and realistic recipes.
2. Vary the daily total calories naturally across the 7 days (e.g. Day 1: ~95% of goal, Day 2: ~98% of goal, Day 3: ~91% of goal, Day 4: ~100% of goal, Day 5: ~94% of goal, Day 6: ~99% of goal, Day 7: ~92% of goal).
3. For each day, generate 4 structured meals: Breakfast (e.g. 7:30 AM), Lunch (e.g. 12:30 PM), Evening Snack (e.g. 4:30 PM), Dinner (e.g. 8:00 PM).
4. Each meal must have distinct dish titles, real ingredients in the 'foods' array, and realistic calories/macros (protein, carbs, fat).
5. Accurately compute each day's 'totals' by summing its 4 meals.
6. Return JSON strictly adhering to the schema.`;
};

const normalizeSevenDayMealPlan = (plan, goals, rollingDays) => {
  const rawDays = Array.isArray(plan?.days) ? plan.days : [];

  const days = rollingDays.map((dayRef, idx) => {
    const rawDay =
      rawDays.find((d) => d?.day?.toLowerCase() === dayRef.name.toLowerCase()) ||
      rawDays[idx] ||
      {};
    const rawMeals = Array.isArray(rawDay.meals) ? rawDay.meals : [];

    const fallbackConfig = DAY_FALLBACKS[idx % DAY_FALLBACKS.length];
    const dayTargetFactor = fallbackConfig.targetFactor;
    const dayCalTarget = Math.round((goals.calories || 2000) * dayTargetFactor);
    const dayProTarget = Math.round((goals.protein || 120) * dayTargetFactor);
    const dayCarbTarget = Math.round((goals.carbs || 250) * dayTargetFactor);
    const dayFatTarget = Math.round((goals.fat || 70) * dayTargetFactor);

    const meals = fallbackConfig.meals.map((def, mIdx) => {
      const meal =
        rawMeals[mIdx] ||
        rawMeals.find((m) => m?.type?.toLowerCase().includes(def.type.toLowerCase())) ||
        {};

      const cals =
        nonNegative(meal.calories) || Math.round(dayCalTarget * def.calRatio);
      const pro =
        nonNegative(meal.protein) || Math.round(dayProTarget * def.calRatio);
      const carbs =
        nonNegative(meal.carbs) || Math.round(dayCarbTarget * def.calRatio);
      const fat =
        nonNegative(meal.fat) || Math.round(dayFatTarget * def.calRatio);

      return {
        type: String(meal.type || def.type),
        time: String(meal.time || def.time),
        title: String(meal.title || def.fallback),
        foods:
          Array.isArray(meal.foods) && meal.foods.length
            ? meal.foods.map(String).slice(0, 6)
            : def.foods,
        calories: cals,
        protein: pro,
        carbs: carbs,
        fat: fat
      };
    });

    const calculatedTotals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      day: dayRef.name,
      dayShort: dayRef.short,
      isToday: dayRef.isToday,
      meals,
      totals: {
        calories: calculatedTotals.calories,
        protein: calculatedTotals.protein,
        carbs: calculatedTotals.carbs,
        fat: calculatedTotals.fat
      }
    };
  });

  return {
    recommendation: String(
      plan?.recommendation ||
        'A structured 7-day meal plan with varied daily calorie targets and nutrient-dense meals tailored to your goals.'
    ),
    days,
    disclaimer: String(plan?.disclaimer || 'This is an AI-generated dietary guide, not medical advice.')
  };
};

export const generateMealPlan = async ({ mealTitles = [], conditions = [], goals }) => {
  if (!config.geminiApiKey) {
    const error = new Error('Gemini API key is not configured');
    error.statusCode = 503;
    throw error;
  }
  const rollingDays = getRollingDaysList();
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: sevenDayMealPlanSchema,
      temperature: 0.4
    }
  });
  const prompt = buildSevenDayMealPlanPrompt({
    mealTitles: [...new Set(mealTitles)].slice(0, 30),
    conditions,
    goals,
    rollingDays
  });
  const result = await model.generateContent([{ text: prompt }]);
  return normalizeSevenDayMealPlan(JSON.parse(result.response.text()), goals, rollingDays);
};



