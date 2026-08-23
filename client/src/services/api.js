import axios from 'axios';
import { getSessionToken } from './session';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((req) => {
  const token = getSessionToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const scanFoodApi = (formData) => API.post('/nutrition/scan', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getHistoryApi = () => API.get('/nutrition/history');
export const getProgressApi = (period = 'week') => API.get('/nutrition/progress', { params: { period } });
export const saveMealApi = (scanId) => API.post('/nutrition/meals', { scanId });
export const uploadProfilePictureApi = (formData) => API.post('/uploads/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getProfileApi = () => API.get('/profile');
export const saveProfileApi = (profile) => API.put('/profile', profile);
export const getMealPlanApi = () => API.get('/meal-plan');
export const generateMealPlanApi = () => API.post('/meal-plan');

export default API;
