import apiClient from '../utils/apiClient';

/**
 * Payment Service
 *
 * API endpoints for payment and order management
 * Backend: /api/v1/orders, /api/v1/payments
 */

const PAYMENT_ENDPOINTS = {
  PURCHASE_BOOK: '/orders/purchase-book',
  CHECKOUT_CART: '/orders/checkout-cart',
  WEBHOOK: '/payments/webhook/stripe',
  ADMIN_ALL: '/payments/admin/all',
  ADMIN_STATUS: '/payments/admin/status',
  ADMIN_SEARCH: '/payments/admin/search',
  ADMIN_FAILED: '/payments/admin/failed',
  ADMIN_ANALYTICS: '/payments/admin/analytics',
};

const paymentService = {
  /**
   * Purchase a single book - creates order and Stripe checkout session
   * @param {Object} purchaseData - Purchase data containing bookId, price, and currency
   * @param {number} purchaseData.bookId - Book ID to purchase
   * @param {number} purchaseData.price - Book price
   * @param {string} purchaseData.currency - Currency (default: USD)
   * @returns {Promise} Response with Stripe checkout session URL
   */
  purchaseBook: async ({ bookId, price, currency = 'USD' }) => {
    const response = await apiClient.post(PAYMENT_ENDPOINTS.PURCHASE_BOOK, {
      bookId,
      price,
      currency
    });
    return response.data;
  },

  /**
   * Checkout all items in cart - creates order from cart and Stripe checkout session
   * @param {string} currency - Currency (default: USD)
   * @returns {Promise} Response with Stripe checkout session URL
   */
  checkoutCart: async (currency = 'USD') => {
    const response = await apiClient.post(PAYMENT_ENDPOINTS.CHECKOUT_CART, {
      currency
    });
    return response.data;
  },

  /**
   * Get all payments (admin)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Response with paginated payments
   */
  getAllPayments: async (params = {}) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.ADMIN_ALL, { params });
    return response.data;
  },

  /**
   * Get payments by status (admin)
   * @param {string} status - Payment status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Response with paginated payments
   */
  getPaymentsByStatus: async (status, params = {}) => {
    const response = await apiClient.get(`${PAYMENT_ENDPOINTS.ADMIN_STATUS}/${status}`, { params });
    return response.data;
  },

  /**
   * Search payments (admin)
   * @param {string} searchTerm - Search query (transaction ID, payment method, or gateway)
   * @param {Object} params - Query parameters (page, size)
   * @returns {Promise} Response with paginated payments
   */
  searchPayments: async (searchTerm, params = {}) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.ADMIN_SEARCH, {
      params: { searchTerm, ...params }
    });
    return response.data;
  },

  /**
   * Get failed payments (admin)
   * @returns {Promise} Failed payments list
   */
  getFailedPayments: async () => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.ADMIN_FAILED);
    return response.data;
  },

  /**
   * Get payment analytics (admin)
   * @returns {Promise} Analytics data
   */
  getPaymentAnalytics: async () => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.ADMIN_ANALYTICS);
    return response.data;
  },
};

export default paymentService;
