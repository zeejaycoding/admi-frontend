import apiClient from '../utils/apiClient';

/**
 * Form Submission Service
 *
 * API endpoints for form submission management
 * Backend: /api/v1/form-submissions
 */

const SUBMISSION_ENDPOINTS = {
  // Public/User endpoints
  SUBMIT_FORM: '/form-submissions',
  MY_SUBMISSIONS: '/form-submissions/my-submissions',
  MY_FORM_SUBMISSIONS: '/form-submissions/my-submissions/form',

  // Admin endpoints
  GET_FORM_SUBMISSIONS: '/form-submissions/admin/form',
  GET_ALL_SUBMISSIONS: '/form-submissions/admin/all',
  GET_UNREVIEWED: '/form-submissions/admin/unreviewed',
  GET_BY_ID: '/form-submissions/admin',
  REVIEW: '/form-submissions/admin',
  DELETE: '/form-submissions/admin',
  EXPORT_CSV: '/form-submissions/admin/form',
};

const formSubmissionService = {
  /**
   * Submit form with optional file uploads
   * @param {number} formId - Form ID
   * @param {Object} submissionData - Form field values (JSON)
   * @param {Object} files - File uploads (optional) - key: fieldId, value: File object
   * @returns {Promise} Submission result
   */
  submitForm: async (formId, submissionData, files = null) => {
    const formData = new FormData();

    // Add submission data as JSON string
    formData.append('submissionData', JSON.stringify(submissionData));

    // Add files if any
    if (files) {
      Object.keys(files).forEach(fieldId => {
        if (files[fieldId]) {
          formData.append(fieldId, files[fieldId]);
        }
      });
    }

    const response = await apiClient.post(
      `${SUBMISSION_ENDPOINTS.SUBMIT_FORM}/${formId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get current user's submissions (all forms)
   * @returns {Promise} List of user's submissions
   */
  getMySubmissions: async () => {
    const response = await apiClient.get(SUBMISSION_ENDPOINTS.MY_SUBMISSIONS);
    return response.data;
  },

  /**
   * Get current user's submissions for a specific form
   * @param {number} formId - Form ID
   * @returns {Promise} List of user's submissions for the form
   */
  getMyFormSubmissions: async (formId) => {
    const response = await apiClient.get(`${SUBMISSION_ENDPOINTS.MY_FORM_SUBMISSIONS}/${formId}`);
    return response.data;
  },

  /**
   * Get all submissions for a form (Admin only)
   * @param {number} formId - Form ID
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Paginated submissions
   */
  getFormSubmissions: async (formId, params = {}) => {
    const response = await apiClient.get(
      `${SUBMISSION_ENDPOINTS.GET_FORM_SUBMISSIONS}/${formId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all submissions across all forms (Admin only)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Paginated submissions
   */
  getAllSubmissions: async (params = {}) => {
    const response = await apiClient.get(SUBMISSION_ENDPOINTS.GET_ALL_SUBMISSIONS, { params });
    return response.data;
  },

  /**
   * Get unreviewed submissions (Admin only)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Paginated unreviewed submissions
   */
  getUnreviewedSubmissions: async (params = {}) => {
    const response = await apiClient.get(SUBMISSION_ENDPOINTS.GET_UNREVIEWED, { params });
    return response.data;
  },

  /**
   * Get submission by ID (Admin only)
   * @param {number} submissionId - Submission ID
   * @returns {Promise} Submission details
   */
  getSubmissionById: async (submissionId) => {
    const response = await apiClient.get(`${SUBMISSION_ENDPOINTS.GET_BY_ID}/${submissionId}`);
    return response.data;
  },

  /**
   * Review submission (Admin only)
   * @param {number} submissionId - Submission ID
   * @param {string} reviewerNotes - Review notes
   * @returns {Promise} Updated submission
   */
  reviewSubmission: async (submissionId, reviewerNotes) => {
    const response = await apiClient.put(
      `${SUBMISSION_ENDPOINTS.REVIEW}/${submissionId}/review`,
      { reviewerNotes }
    );
    return response.data;
  },

  /**
   * Delete submission (Admin only)
   * @param {number} submissionId - Submission ID
   * @returns {Promise} Success message
   */
  deleteSubmission: async (submissionId) => {
    const response = await apiClient.delete(`${SUBMISSION_ENDPOINTS.DELETE}/${submissionId}`);
    return response.data;
  },

  /**
   * Export form submissions to CSV (Admin only)
   * @param {number} formId - Form ID
   * @returns {Promise} Blob data for CSV file
   */
  exportToCSV: async (formId) => {
    const response = await apiClient.get(
      `${SUBMISSION_ENDPOINTS.EXPORT_CSV}/${formId}/export`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Download CSV export (helper method)
   * @param {number} formId - Form ID
   * @param {string} filename - Custom filename (optional)
   */
  downloadCSV: async (formId, filename = null) => {
    const blob = await formSubmissionService.exportToCSV(formId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `form-submissions-${formId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default formSubmissionService;
