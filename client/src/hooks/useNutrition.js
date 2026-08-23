import { useCallback, useState } from 'react';
import { scanFoodApi, getHistoryApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const useNutrition = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scanFood = useCallback(async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
    // Nepali scanning is temporarily disabled for summary debugging.
    formData.append('language', 'en');
      const res = await scanFoodApi(formData);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze food image');
      setLoading(false);
      throw err;
    }
  }, [language]);

  const getHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistoryApi();
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      setLoading(false);
      throw err;
    }
  }, []);

  return { scanFood, getHistory, loading, error };
};
