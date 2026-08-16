import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  scanId: { type: String, required: true },
  mealName: { type: String, required: true },
  image: { type: String },
  items: { type: [mongoose.Schema.Types.Mixed], default: [] },
  totals: { type: mongoose.Schema.Types.Mixed, required: true },
  overallConfidence: { type: Number, min: 0, max: 1 },
  insight: { type: String },
  assumptions: { type: [String], default: [] },
  disclaimer: { type: String },
  createdAt: { type: Date, default: Date.now },
  savedAt: { type: Date, default: Date.now }
}, { minimize: false });

mealSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Meal', mealSchema);
