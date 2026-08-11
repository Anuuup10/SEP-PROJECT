import mongoose from 'mongoose';

const nutritionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 }
    },
    imageUrl: { type: String },
    healthScore: { type: Number, default: 75 },
    insights: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('NutritionLog', nutritionLogSchema);
