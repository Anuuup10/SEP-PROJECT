import { FieldValue } from 'firebase-admin/firestore';
import { firebaseDb } from './firebaseService.js';

const cleanDate = (value) => value?.toDate?.()?.toISOString?.() || (value instanceof Date ? value.toISOString() : value || null);
const number = (value) => Number(value) || 0;
const totalsFor = (meal) => meal?.totals || {};

export const getProfile = async (userId) => {
  const snapshot = await firebaseDb().collection('profiles').doc(userId).get();
  if (!snapshot.exists) return null;
  const profile = snapshot.data();
  return { ...profile, id: snapshot.id, avatar: profile.avatar === 'sushi' ? 'sushi' : 'taco', completed: Boolean(profile.name && profile.age && profile.gender && profile.height && profile.currentWeight) };
};

export const saveProfile = async (userId, body, user) => {
  const current = (await getProfile(userId)) || {};
  const name = String(body.name || user.name || '').trim();
  const profile = {
    ...current, ...body, userId, name, email: String(user.email || body.email || '').trim(),
    avatar: body.avatar === 'sushi' ? 'sushi' : 'taco',
    calorieGoal: number(body.calorieGoal) || 2000, proteinGoal: number(body.proteinGoal) || 120,
    carbsGoal: number(body.carbsGoal) || 250, fatGoal: number(body.fatGoal) || 70,
    completed: Boolean(name && body.age && body.gender && body.height && body.currentWeight),
    updatedAt: FieldValue.serverTimestamp(),
    ...(current.createdAt ? {} : { createdAt: FieldValue.serverTimestamp() })
  };
  await firebaseDb().collection('profiles').doc(userId).set(profile, { merge: true });
  return getProfile(userId);
};

export const getMealPlan = async (userId) => {
  const snapshot = await firebaseDb().collection('mealPlans').doc(userId).get();
  return snapshot.exists ? { ...snapshot.data(), id: snapshot.id, generatedAt: cleanDate(snapshot.data().generatedAt) } : null;
};

export const saveMealPlan = async (userId, plan) => {
  await firebaseDb().collection('mealPlans').doc(userId).set({ ...plan, userId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return getMealPlan(userId);
};

export const saveScan = async ({ userId, analysis }) => {
  const ref = firebaseDb().collection('scans').doc(analysis.scanId);
  await ref.set({ userId, ...analysis, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  return ref.id;
};

export const saveMeal = async ({ userId, scanId }) => {
  const db = firebaseDb();
  const scanSnapshot = await db.collection('scans').doc(scanId).get();
  if (!scanSnapshot.exists || scanSnapshot.data().userId !== userId) return null;
  const existing = await db.collection('meals').where('userId', '==', userId).where('scanId', '==', scanId).limit(1).get();
  const ref = existing.empty ? db.collection('meals').doc(`${userId}_${scanId}`) : existing.docs[0].ref;
  const scan = scanSnapshot.data();
  await ref.set({ ...scan, userId, scanId, tracked: true, createdAt: scan.createdAt || FieldValue.serverTimestamp(), savedAt: FieldValue.serverTimestamp() }, { merge: true });
  const data = (await ref.get()).data();
  return { id: ref.id, ...data, createdAt: cleanDate(data.createdAt) || new Date().toISOString() };
};

export const listMeals = async (userId) => {
  const snapshot = await firebaseDb().collection('meals').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: cleanDate(doc.data().createdAt), savedAt: cleanDate(doc.data().savedAt) }))
    .filter((meal) => meal.tracked !== false)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
};

const appTimeZone = process.env.APP_TIME_ZONE || 'Asia/Kathmandu';
const dateKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: appTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const addDaysToKey = (key, amount) => { const date = new Date(`${key}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return dateKey(date); };
const dayLabel = (date, days) => days <= 7 ? new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: appTimeZone }).format(date) : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: appTimeZone }).format(date);

export const calculateStreak = async (userId) => {
  const dates = new Set((await listMeals(userId)).map((meal) => dateKey(meal.createdAt)));
  let streak = 0; let cursor = dateKey(new Date());
  while (dates.has(cursor)) { streak += 1; cursor = addDaysToKey(cursor, -1); }
  return streak;
};

export const getProgress = async ({ userId, period = 'week' }) => {
  const daysCount = ({ week: 7, 'two-weeks': 14, month: 30 })[period] || 7;
  const todayKey = dateKey(new Date()); const firstDayKey = addDaysToKey(todayKey, -daysCount + 1);
  const meals = (await listMeals(userId)).filter((meal) => { const day = dateKey(meal.createdAt); return day >= firstDayKey && day <= todayKey; });
  const profile = await getProfile(userId); const byDay = new Map();
  for (let index = 0; index < daysCount; index += 1) { const key = addDaysToKey(firstDayKey, index); byDay.set(key, { date: key, label: dayLabel(new Date(`${key}T12:00:00Z`), daysCount), calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, meals: [] }); }
  for (const meal of meals) { const day = byDay.get(dateKey(meal.createdAt)); if (!day) continue; const totals = totalsFor(meal); const fiber = number(totals.fiber ?? (meal.items || []).reduce((sum, item) => sum + number(item.fiber), 0)); const calories = number(totals.calories ?? meal.calories); const protein = number(totals.protein ?? meal.protein); const carbs = number(totals.carbohydrates ?? totals.carbs ?? meal.carbs); const fat = number(totals.fat ?? meal.fat ?? meal.fats); day.calories += calories; day.protein += protein; day.carbs += carbs; day.fat += fat; day.fiber += fiber; day.meals.push({ id: meal.id, name: meal.mealName || meal.foodName, calories, protein, carbs, fat, fiber, sodium: number(totals.sodium), totals, items: meal.items?.length || 0, image: meal.image || meal.imageUrl, createdAt: meal.createdAt }); }
  const days = [...byDay.values()]; const totals = days.reduce((sum, day) => ({ calories: sum.calories + day.calories, protein: sum.protein + day.protein, carbs: sum.carbs + day.carbs, fat: sum.fat + day.fat, fiber: sum.fiber + day.fiber }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const goals = { calories: number(profile?.calorieGoal) || 2000, protein: number(profile?.proteinGoal) || 120, carbs: number(profile?.carbsGoal) || 250, fat: number(profile?.fatGoal) || 70, fiber: 30 };
  // Always use the exact calendar day requested as “today”. This keeps the
  // nutrient totals and the meals list sourced from the same day object.
  const today = byDay.get(todayKey) || { date: todayKey, meals: [], calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const completion = Object.fromEntries(Object.entries(goals).map(([key, goal]) => [key, goal > 0 ? Math.round((today[key] / goal) * 100) : 0]));
  return { period, goals, days, totals, today, completion, streak: await calculateStreak(userId) };
};
