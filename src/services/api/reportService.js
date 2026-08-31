import apiClient from '../utils/apiClient';

/**
 * Report Service
 *
 * API endpoints for report management
 * Backend: /api/v1/reports
 */

const REPORT_ENDPOINTS = {
  GET_ALL: '/reports',
  GET_BY_ID: '/reports',
  CREATE: '/reports',
  UPDATE_STATUS: '/reports',
  DELETE: '/reports',
  ANALYTICS: '/reports/analytics',
};

const reportService = {
  getAllReports: async () => {
    const response = await apiClient.get(REPORT_ENDPOINTS.GET_ALL);
    return response.data;
  },

  getReportById: async (id) => {
    const response = await apiClient.get(`${REPORT_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  createReport: async (reportData, files = []) => {
    const formData = new FormData();
    
    // Append standard fields
    Object.keys(reportData).forEach((key) => {
      if (key === 'expenses') {
        formData.append(key, JSON.stringify(reportData[key]));
      } else if (reportData[key] !== null && reportData[key] !== undefined) {
        formData.append(key, reportData[key]);
      }
    });

    // Append files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.post(REPORT_ENDPOINTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateReportStatus: async (id, status) => {
    const response = await apiClient.put(`${REPORT_ENDPOINTS.UPDATE_STATUS}/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await apiClient.delete(`${REPORT_ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },

  getReportAnalytics: async () => {
    const response = await apiClient.get(REPORT_ENDPOINTS.ANALYTICS);
    return response.data;
  },
};

export default reportService;
