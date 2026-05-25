import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const findProblems = (keyword, domain) =>
  api.post('/find', { keyword, domain: domain === 'All' ? undefined : domain });

export const finalizeProblems = (keyword, problemIds) =>
  api.post('/finalize', { keyword, problemIds });

export const getHistory = () => api.get('/find/history');

export const getSearchById = (id) => api.get(`/find/history/${id}`);

export const deleteHistory = (id) => api.delete(`/find/history/${id}`);

export const getTrends = () => api.get('/find/trends');

export const login = (email, password) => api.post('/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getProfile = () => api.get('/auth/profile');

export const updateProfile = (name, email) => api.put('/auth/profile', { name, email });

export const supportChat = (message, chatHistory) =>
  api.post('/support/chat', { message, chatHistory });

export const submitComplaint = (message) => api.post('/support/complaint', { message });

export default api;
