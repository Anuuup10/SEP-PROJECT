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
      possibleAllergens: { type: 'array', items: { type: 'string' } }
    }, required: ['name', 'category', 'portionQuantity', 'portionUnit', 'cookingMethod', 'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium', 'saturatedFat', 'confidence', 'estimated', 'assumptions', 'possibleAllergens'] } },
    overallConfidence: { type: 'number' }, insight: { type: 'string' },
    assumptions: { type: 'array', items: { type: 'string' } }, disclaimer: { type: 'string' }
  },
  required: ['isFood', 'mealName', 'items', 'overallConfidence', 'insight', 'assumptions', 'disclaimer']
};

const prompt = `Analyze the food image for nutrition tracking.

Identify only clearly visible food items. Do not invent hidden ingredients.
Estimate the edible portion visible in the image. Use grams when possible;
otherwise use a clear unit such as ml, piece, slice, bowl, or tablespoon.

Nutrition values must describe the estimated visible portion, not an arbitrary
serving size. Use kcal for calories, grams for protein/carbohydrates/fat/fiber/
sugar/saturatedFat, and milligrams for sodium. Set estimated to true for all
image-based estimates. Use an empty items array when the image is not food or
no food can be identified. Do not provide medical advice or claim exact
accuracy. Mention uncertainty and assumptions. Return only JSON matching the
supplied schema.`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const nonNegative = (value) => (Number.isFinite(value) && value >= 0 ? value : 0);

const normalizeItem = (item) => ({
  name: String(item.name || 'Unidentified food'), category: String(item.category || 'food'),
  portion: `${nonNegative(item.portionQuantity)}${item.portionUnit || 'g'}`,
  portionQuantity: nonNegative(item.portionQuantity), portionUnit: String(item.portionUnit || 'g'),
  cookingMethod: String(item.cookingMethod || 'unknown'), calories: nonNegative(item.calories),
  protein: nonNegative(item.protein), carbohydrates: nonNegative(item.carbohydrates),
  carbs: nonNegative(item.carbohydrates), fat: nonNegative(item.fat), fiber: nonNegative(item.fiber),
  sugar: nonNegative(item.sugar), sodium: nonNegative(item.sodium), saturatedFat: nonNegative(item.saturatedFat),
  confidence: clamp(Number(item.confidence) || 0, 0, 1), estimated: Boolean(item.estimated),
  assumptions: Array.isArray(item.assumptions) ? item.assumptions.map(String) : [],
  possibleAllergens: Array.isArray(item.possibleAllergens) ? item.possibleAllergens.map(String) : []
});

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

export const analyzeFoodImage = async (imageBuffer, mimeType) => {
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
      { text: prompt },
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
