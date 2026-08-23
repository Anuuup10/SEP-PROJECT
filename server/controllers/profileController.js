import { getProfile as getFirestoreProfile, saveProfile as saveFirestoreProfile } from '../services/firestoreService.js';

export const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getFirestoreProfile(req.user.id) });
  } catch (error) { next(error); }
};

export const saveProfile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = String(body.name || req.user.name || '').trim();
    const email = String(req.user.email || body.email || '').trim();
    const completed = Boolean(name && body.age && body.gender && body.height && body.currentWeight);
    const avatar = body.avatar === 'sushi' ? 'sushi' : 'taco';
    const goals = {
      calorieGoal: Number(body.calorieGoal) || 2000,
      proteinGoal: Number(body.proteinGoal) || 120,
      carbsGoal: Number(body.carbsGoal) || 250,
      fatGoal: Number(body.fatGoal) || 70
    };
    const profile = await saveFirestoreProfile(req.user.id, { ...body, ...goals, avatar, completed }, req.user);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};
