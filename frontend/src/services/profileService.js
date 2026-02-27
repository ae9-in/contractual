import api from './api';

export const getProfile = () => api.get('/profile');
export const updateProfile = (payload) => api.put('/profile', payload);

export const updateProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('profilePhoto', file);
  return api.put('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
