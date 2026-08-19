import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  time: { type: String, default: '' },
  title: { type: String, required: true },
  foods: { type: [String], default: [] },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'Monday', 'Tuesday', ...
  dayShort: { type: String, required: true }, // 'Mon', 'Tue', ...
  meals: { type: [mealItemSchema], default: [] },
  totals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  days: { type: [dayPlanSchema], default: [] },
  recommendation: { type: String, default: '' },
  disclaimer: { type: String, default: '' },
  goals: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 70 }
  },
  sourceMeals: { type: [String], default: [] },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('MealPlan', mealPlanSchema);
