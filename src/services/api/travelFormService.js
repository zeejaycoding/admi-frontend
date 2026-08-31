import apiClient from '../utils/apiClient';

const ENDPOINTS = {
  ALL: '/travel-forms',
  BY_ID: '/travel-forms',
  CREATE: '/travel-forms',
  STATUS: '/travel-forms',
  DELETE: '/travel-forms',
  STATS: '/travel-forms/stats',
};

const travelFormService = {
  getAll: async () => {
    const response = await apiClient.get(ENDPOINTS.ALL);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.BY_ID}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateStatus: async (id, status, rejectionReason) => {
    const response = await apiClient.put(`${ENDPOINTS.STATUS}/${id}/status`, { status, rejectionReason });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get(ENDPOINTS.STATS);
    return response.data;
  },
};

export default travelFormService;
