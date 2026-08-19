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
