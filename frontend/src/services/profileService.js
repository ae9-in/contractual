import api from './api';

export const getProfile = () => api.get('/profile');
export const updateProfile = (payload) => api.put('/profile', payload);
