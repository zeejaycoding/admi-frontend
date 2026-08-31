import apiClient from '../utils/apiClient';

/**
 * Dashboard Service
 *
 * Aggregates data from multiple backend endpoints for the admin dashboard.
 * NOTE: All paginated endpoints enforce @Max(100) on the size param.
 *       Use size=1 for count-only calls (totalElements is always accurate).
 *       Use dedicated analytics endpoints for revenue to avoid pagination issues.
 */

const dashboardService = {
  /**
   * Get comprehensive dashboard statistics using count-optimised requests.
   */
  getDashboardStats: async () => {
    // Fire all requests in parallel. Use size=1 for pure-count endpoints so we
    // never exceed the @Max(100) constraint. Use analytics endpoints for revenue.
    const [
      usersRes,
      ordersRes,
      booksRes,
      coursesRes,
      campusesRes,
      paymentAnalyticsRes,
    ] = await Promise.allSettled([
      apiClient.get('/users/all',         { params: { page: 0, size: 1 } }),
      apiClient.get('/orders/admin/all',   { params: { page: 0, size: 1 } }),
      apiClient.get('/books',              { params: { page: 0, size: 1 } }),
      apiClient.get('/courses',            { params: { page: 0, size: 1 } }),
      apiClient.get('/campuses/all',       { params: { page: 0, size: 1 } }),
      apiClient.get('/payments/admin/analytics'),
    ]);

    const ok = (res) => res.status === 'fulfilled' ? res.value?.data?.data : null;

    // --- Counts via totalElements (accurate even with size=1) ---
    const usersData    = ok(usersRes);
    const ordersData   = ok(ordersRes);
    const booksData    = ok(booksRes);
    const coursesData  = ok(coursesRes);

    // Campuses: custom wrapper returns { campuses: [], totalElements: N }
    const campusesData = ok(campusesRes);
    const totalCampuses = campusesData?.totalElements ?? 0;

    // --- Revenue from analytics endpoint (server-aggregated, no pagination needed) ---
    const analytics = ok(paymentAnalyticsRes);
    const totalPayments = analytics?.totalPayments ?? 0;

    // paymentsByCurrency is a list of { currency, count } — for revenue per currency
    // we use monthlyRevenue/totalRevenue breakdown. Fall back to parsing if available.
    let ngnRevenue = 0;
    let usdRevenue = 0;

    if (analytics) {
      // paymentsByCurrency gives counts, not amounts. Use totalRevenue breakdown if available.
      // If the analytics returns per-currency revenue it may be in a different field.
      // Try common shapes: revenueByNGN/revenueByUSD, or parse paymentsByCurrency for amounts.
      ngnRevenue = analytics.totalRevenueNGN
        ?? analytics.ngnRevenue
        ?? analytics.revenueByNGN
        ?? 0;
      usdRevenue = analytics.totalRevenueUSD
        ?? analytics.usdRevenue
        ?? analytics.revenueByUSD
        ?? 0;

      // If the above didn't work, check monthlyRevenue for current totals
      if (!ngnRevenue && !usdRevenue && analytics.paymentsByCurrency) {
        // paymentsByCurrency might be [{ currency: 'NGN', totalAmount: N }, ...]
        const byCurrency = analytics.paymentsByCurrency;
        if (Array.isArray(byCurrency)) {
          const ngn = byCurrency.find(c => c.currency === 'NGN' || c[0] === 'NGN');
          const usd = byCurrency.find(c => c.currency === 'USD' || c[0] === 'USD');
          ngnRevenue = ngn?.totalAmount ?? ngn?.amount ?? ngn?.[1] ?? 0;
          usdRevenue = usd?.totalAmount ?? usd?.amount ?? usd?.[1] ?? 0;
        }
      }
    }

    return {
      users: {
        totalUsers: usersData?.totalElements ?? 0,
      },
      orders: {
        totalOrders: ordersData?.totalElements ?? 0,
      },
      payments: {
        totalPayments,
        totalRevenueNGN: ngnRevenue,
        totalRevenueUSD: usdRevenue,
      },
      books: {
        total: booksData?.totalElements ?? 0,
        active: 0, // active count not available without fetching content
      },
      courses: {
        total: coursesData?.totalElements ?? 0,
        active: 0,
      },
      campuses: {
        total: totalCampuses,
        active: 0,
      },
    };
  },

  /**
   * Get recent activity (orders, payments, users) — most recent 5 each.
   * Uses size=5 which is well within @Max(100).
   */
  getRecentActivity: async () => {
    const [recentOrders, recentPayments, recentUsers] = await Promise.all([
      apiClient.get('/orders/admin/all',  { params: { page: 0, size: 5, sort: 'createdAt,desc' } }),
      apiClient.get('/payments/admin/all',{ params: { page: 0, size: 5, sort: 'createdAt,desc' } }),
      apiClient.get('/users/all',         { params: { page: 0, size: 5, sort: 'createdAt,desc' } }),
    ]);

    return {
      orders:   recentOrders.data?.data?.content   || [],
      payments: recentPayments.data?.data?.content || [],
      users:    recentUsers.data?.data?.content    || [],
    };
  },

  /**
   * Get revenue trends over time.
   */
  getRevenueTrends: async (period = 'daily') => {
    try {
      const response = await apiClient.get('/payments/admin/analytics/revenue-trends', {
        params: { period }
      });
      return response.data;
    } catch {
      return { success: true, data: { labels: [], ngnRevenue: [], usdRevenue: [] } };
    }
  },
};

export default dashboardService;
