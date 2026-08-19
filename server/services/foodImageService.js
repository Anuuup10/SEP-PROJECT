const MEAL_DB_SEARCH_URL = 'https://www.themealdb.com/api/json/v1/1/search.php';

const searchMealDb = async (query) => {
  if (!query) return null;
  const url = `${MEAL_DB_SEARCH_URL}?s=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
  if (!response.ok) return null;
  const data = await response.json();
  return data.meals?.[0]?.strMealThumb || null;
};

export const findFoodImageUrl = async ({ mealName, items = [] }) => {
  const queries = [
    mealName,
    ...items.map((item) => typeof item === 'string' ? item : item?.name || item?.food || item?.title).filter(Boolean),
  ]
    .map((value) => String(value).trim())
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .slice(0, 4);

  for (const query of queries) {
    try {
      const imageUrl = await searchMealDb(query);
      if (imageUrl) return imageUrl;
    } catch {
      // Image lookup is optional; meal saving must continue if the provider is unavailable.
    }
  }
  return null;
};
