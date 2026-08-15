const TRACKER_KEY = "nutrilens_tracked_meals";

export function getTrackedMeals() {
  try {
    return JSON.parse(localStorage.getItem(TRACKER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addTrackedMeal(meal) {
  const meals = [...getTrackedMeals(), { ...meal, id: meal.id || `tracked-${Date.now()}` }];
  localStorage.setItem(TRACKER_KEY, JSON.stringify(meals));
  window.dispatchEvent(new Event("nutrilens-tracker-updated"));
  return meals;
}
