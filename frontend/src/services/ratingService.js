import api from './api';

export const getProjectRatings = (projectId) => api.get(`/ratings/projects/${projectId}`);
export const submitProjectRating = (projectId, payload) => api.post(`/ratings/projects/${projectId}`, payload);
export const getUserRatingSummary = (userId) => api.get(`/ratings/users/${userId}/summary`);
