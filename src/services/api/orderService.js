import apiClient from '../utils/apiClient';

/**
 * Order Service
 *
 * API endpoints for order management
 * Backend: /api/v1/orders
 */

const ORDER_ENDPOINTS = {
  ADMIN_ALL: '/orders/admin/all',
  ADMIN_STATUS: '/orders/admin/status',
  ADMIN_SEARCH: '/orders/admin/search',
  ADMIN_ANALYTICS: '/orders/admin/analytics',
};

const orderService = {
  /**
   * Get all orders (admin)
   * @param {Object} params - Query parameters (page, size, sort)
   * @returns {Promise} Response with paginated orders
   */
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get(ORDER_ENDPOINTS.ADMIN_ALL, { params });
    return response.data;
  },

  /**
   * Get orders by status (admin)
   * @param {string} status - Order status (PENDING, PROCESSING, COMPLETED, CANCELLED, FAILED)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Response with paginated orders
   */
  getOrdersByStatus: async (status, params = {}) => {
    const response = await apiClient.get(`${ORDER_ENDPOINTS.ADMIN_STATUS}/${status}`, { params });
    return response.data;
  },

  /**
   * Search orders (admin)
   * @param {string} searchTerm - Search query (order number, customer name, or email)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Response with paginated orders
   */
  searchOrders: async (searchTerm, params = {}) => {
    const response = await apiClient.get(ORDER_ENDPOINTS.ADMIN_SEARCH, {
      params: { searchTerm, ...params }
    });
    return response.data;
  },

  /**
   * Get order analytics (admin)
   * @returns {Promise} Analytics data
   */
  getOrderAnalytics: async () => {
    const response = await apiClient.get(ORDER_ENDPOINTS.ADMIN_ANALYTICS);
    return response.data;
  },
};

export default orderService;
