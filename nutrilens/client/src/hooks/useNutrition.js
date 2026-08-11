import { useState } from 'react';
import { scanFoodApi, getHistoryApi } from '../services/api';

export const useNutrition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scanFood = async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await scanFoodApi(formData);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze food image');
      setLoading(false);
      throw err;
    }
  };

  const getHistory = async () => {
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
  };

  return { scanFood, getHistory, loading, error };
};
