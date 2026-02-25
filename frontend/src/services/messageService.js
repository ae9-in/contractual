import api from './api';

export const getProjectMessages = (projectId) => api.get(`/messages/projects/${projectId}`);
export const sendProjectMessage = (projectId, payload) => api.post(`/messages/projects/${projectId}`, payload);
