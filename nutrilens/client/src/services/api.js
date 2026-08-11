import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('nutrilens_token');
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

export default API;
