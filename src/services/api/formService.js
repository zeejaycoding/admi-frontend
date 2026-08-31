import apiClient from '../utils/apiClient';

/**
 * Form Service
 *
 * API endpoints for form management
 * Backend: /api/v1/forms
 */

const FORM_ENDPOINTS = {
  // Public endpoints
  GET_PUBLISHED: '/forms',
  GET_PUBLISHED_PAGINATED: '/forms/paginated',
  GET_FOR_SUBMISSION: '/forms',
  GET_BY_FORM_CODE: '/forms/code',
  GET_BY_EVENT_CODE: '/forms/event',

  // Admin endpoints
  CREATE: '/forms/admin',
  UPDATE: '/forms/admin',
  DELETE: '/forms/admin',
  PUBLISH: '/forms/admin',
  GET_ALL: '/forms/admin/all',
  SEARCH: '/forms/admin/search',
  GET_BY_ID: '/forms/admin',
  GET_ANALYTICS: '/forms/admin',
  GET_TOP: '/forms/admin/top',
  GET_GLOBAL_ANALYTICS: '/forms/admin/analytics/global',
};

const formService = {
  /**
   * Get all published forms
   * @returns {Promise} List of published forms
   */
  getPublishedForms: async () => {
    const response = await apiClient.get(FORM_ENDPOINTS.GET_PUBLISHED);
    return response.data;
  },

  /**
   * Get published forms (paginated)
   * @param {Object} params - Query parameters (page, size, sortBy, sortDir)
   * @returns {Promise} Paginated published forms
   */
  getPublishedFormsPaginated: async (params = {}) => {
    const response = await apiClient.get(FORM_ENDPOINTS.GET_PUBLISHED_PAGINATED, { params });
    return response.data;
  },

  /**
   * Get form for submission (validates auth and eligibility)
   * @param {number} formId - Form ID
   * @returns {Promise} Form details
   */
  getFormForSubmission: async (formId) => {
    const response = await apiClient.get(`${FORM_ENDPOINTS.GET_FOR_SUBMISSION}/${formId}/submit`);
    return response.data;
  },

  /**
   * Get form by form code (for page-based forms like PARTNERSHIP)
   * @param {string} formCode - Form code
   * @returns {Promise} Form details
   */
  getFormByFormCode: async (formCode) => {
    const response = await apiClient.get(`${FORM_ENDPOINTS.GET_BY_FORM_CODE}/${formCode}`);
    return response.data;
  },

  /**
   * Get form by event code (for program/event-based forms)
   * @param {string} eventCode - Event code
   * @returns {Promise} Form details
   */
  getFormByEventCode: async (eventCode) => {
    const response = await apiClient.get(`${FORM_ENDPOINTS.GET_BY_EVENT_CODE}/${eventCode}`);
    return response.data;
  },

  /**
   * Create new form
   * @param {Object} formData - Form details including schema
   * @returns {Promise} Created form
   */
  createForm: async (formData) => {
    const response = await apiClient.post(FORM_ENDPOINTS.CREATE, formData);
    return response.data;
  },

  /**
   * Update form
   * @param {number} formId - Form ID
   * @param {Object} updateData - Updated form data
   * @returns {Promise} Updated form
   */
  updateForm: async (formId, updateData) => {
    const response = await apiClient.put(`${FORM_ENDPOINTS.UPDATE}/${formId}`, updateData);
    return response.data;
  },

  /**
   * Delete form (soft delete)
   * @param {number} formId - Form ID
   * @returns {Promise} Success message
   */
  deleteForm: async (formId) => {
    const response = await apiClient.delete(`${FORM_ENDPOINTS.DELETE}/${formId}`);
    return response.data;
  },

  /**
   * Publish or unpublish form
   * @param {number} formId - Form ID
   * @param {boolean} publish - True to publish, false to unpublish
   * @returns {Promise} Updated form
   */
  publishForm: async (formId, publish) => {
    const response = await apiClient.post(
      `${FORM_ENDPOINTS.PUBLISH}/${formId}/publish`,
      null,
      { params: { publish } }
    );
    return response.data;
  },

  /**
   * Get all forms (including unpublished) - Admin only
   * @param {Object} params - Query parameters (page, size, sortBy, sortDir)
   * @returns {Promise} Paginated forms
   */
  getAllForms: async (params = {}) => {
    const response = await apiClient.get(FORM_ENDPOINTS.GET_ALL, { params });
    return response.data;
  },

  /**
   * Search forms
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters (page, size)
   * @returns {Promise} Search results
   */
  searchForms: async (query, params = {}) => {
    const response = await apiClient.get(FORM_ENDPOINTS.SEARCH, {
      params: { query, ...params }
    });
    return response.data;
  },

  /**
   * Get form by ID
   * @param {number} formId - Form ID
   * @returns {Promise} Form details
   */
  getFormById: async (formId) => {
    const response = await apiClient.get(`${FORM_ENDPOINTS.GET_BY_ID}/${formId}`);
    return response.data;
  },

  /**
   * Get form analytics
   * @param {number} formId - Form ID
   * @returns {Promise} Form analytics data
   */
  getFormAnalytics: async (formId) => {
    const response = await apiClient.get(`${FORM_ENDPOINTS.GET_ANALYTICS}/${formId}/analytics`);
    return response.data;
  },

  /**
   * Get top forms by submissions
   * @param {number} limit - Number of forms to fetch
   * @returns {Promise} Top forms
   */
  getTopForms: async (limit = 5) => {
    const response = await apiClient.get(FORM_ENDPOINTS.GET_TOP, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get global form analytics
   * @returns {Promise} Global analytics data
   */
  getGlobalAnalytics: async () => {
    const response = await apiClient.get(FORM_ENDPOINTS.GET_GLOBAL_ANALYTICS);
    return response.data;
  },
};

export default formService;
