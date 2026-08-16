import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number, gender: String, height: Number, currentWeight: Number, targetWeight: Number,
  activity: String, conditions: { type: [String], default: [] }, units: String,
  calorieGoal: Number, proteinGoal: Number, carbsGoal: Number, fatGoal: Number,
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);
