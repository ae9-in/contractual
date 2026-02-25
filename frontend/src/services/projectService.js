import api from './api';

export const createProject = (payload) => {
  const formData = new FormData();
  formData.append('title', payload.title || '');
  formData.append('description', payload.description || '');
  formData.append('budget', payload.budget || '');
  formData.append('skillsRequired', payload.skillsRequired || '');
  formData.append('deadline', payload.deadline || '');
  formData.append('referenceLink', payload.referenceLink || '');
  const files = payload.referenceFiles || [];
  files.forEach((file) => formData.append('projectReferenceFiles', file));
  return api.post('/projects', formData);
};
export const getProjects = (params) => api.get('/projects', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const getMyProjects = () => api.get('/projects/mine');
export const applyForProject = (id, payload) => api.post(`/projects/${id}/apply`, payload || {});
export const getProjectApplications = (id) => api.get(`/projects/${id}/applications`);
export const acceptProjectApplication = (id, applicationId) => api.put(`/projects/${id}/applications/${applicationId}/accept`);
export const submitProject = (id, payload) => {
  const formData = new FormData();
  formData.append('submissionText', payload.submissionText || '');
  formData.append('submissionLink', payload.submissionLink || '');
  const files = payload.files || [];
  files.forEach((file) => formData.append('submissionFiles', file));
  return api.put(`/projects/${id}/submit`, formData);
};
export const completeProject = (id) => api.put(`/projects/${id}/complete`);
export const getProjectPayment = (id) => api.get(`/projects/${id}/payment`);
export const fundProjectEscrow = (id) => api.put(`/projects/${id}/fund`);
export const releaseProjectEscrow = (id) => api.put(`/projects/${id}/release`);
export const addProjectTip = (id, payload) => api.put(`/projects/${id}/tip`, payload);
export const createProjectPaymentOrder = (id, payload) => api.post(`/projects/${id}/payment/order`, payload);
export const verifyProjectPaymentOrder = (id, payload) => api.post(`/projects/${id}/payment/verify`, payload);
