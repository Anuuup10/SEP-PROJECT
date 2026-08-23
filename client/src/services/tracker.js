export function getTrackedMeals() { return []; }

export function addTrackedMeal(meal, userId) {
  return { ...meal, id: meal.id || `tracked-${Date.now()}` };
}
