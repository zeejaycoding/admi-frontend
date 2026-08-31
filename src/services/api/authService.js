import apiClient from '../utils/apiClient';

const authService = {
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  async refreshToken(refreshToken) {
    const { data } = await apiClient.post('/auth/refresh-token', { refreshToken });
    return data;
  },

  async forgotPassword(payload) {
    const { data } = await apiClient.post('/auth/forgot-password', payload);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  },

  async verifyEmail(token) {
    const { data } = await apiClient.get(`/auth/verify-email`, { params: { token } });
    return data;
  },

  async resendVerification(email) {
    const { data } = await apiClient.post(`/auth/resend-verification`, null, { params: { email } });
    return data;
  },

  async validateToken() {
    const { data } = await apiClient.get('/auth/validate-token');
    return data;
  },

  async logout() {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },
};

export default authService;


