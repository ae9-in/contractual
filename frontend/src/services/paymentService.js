import api from './api';

export const getPaymentGatewayConfig = () => api.get('/payments/config');
