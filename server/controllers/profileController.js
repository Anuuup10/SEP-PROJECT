import UserProfile from '../models/UserProfile.js';

const shape = (profile) => profile ? { ...profile, completed: Boolean(profile.name && profile.age && profile.gender && profile.height && profile.currentWeight), id: profile._id.toString(), _id: undefined } : null;

export const getProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.id }).lean();
    res.json({ success: true, data: shape(profile) });
  } catch (error) { next(error); }
};

export const saveProfile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = String(body.name || req.user.name || '').trim();
    const email = String(req.user.email || body.email || '').trim();
    const completed = Boolean(name && body.age && body.gender && body.height && body.currentWeight);
    const goals = {
      calorieGoal: Number(body.calorieGoal) || 2000,
      proteinGoal: Number(body.proteinGoal) || 120,
      carbsGoal: Number(body.carbsGoal) || 250,
      fatGoal: Number(body.fatGoal) || 70
    };
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { ...body, ...goals, userId: req.user.id, name, email, completed } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, data: shape(profile) });
  } catch (error) { next(error); }
};
