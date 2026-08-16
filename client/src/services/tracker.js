const TRACKER_KEY = "nutrilens_tracked_meals";
const keyForUser = (userId) => `${TRACKER_KEY}:${userId || "anonymous"}`;

export function getTrackedMeals(userId) {
  try {
    return JSON.parse(localStorage.getItem(keyForUser(userId)) || "[]");
  } catch {
    return [];
  }
}

export function addTrackedMeal(meal, userId) {
  if (!userId) return [];
  const meals = [...getTrackedMeals(userId), { ...meal, id: meal.id || `tracked-${Date.now()}` }];
  localStorage.setItem(keyForUser(userId), JSON.stringify(meals));
  window.dispatchEvent(new Event("nutrilens-tracker-updated"));
  return meals;
}
