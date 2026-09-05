import apiClient from '../utils/apiClient';

const userService = {
  // Get current user profile
  async getCurrentUser() {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },

  // Update user profile
  async updateProfile(payload) {
    const { data } = await apiClient.put('/users/profile', payload);
    return data;
  },

  // Change password
  async changePassword(payload) {
    const { data } = await apiClient.post('/users/change-password', payload);
    return data;
  },

  // Get user dashboard
  async getUserDashboard() {
    const { data } = await apiClient.get('/users/dashboard');
    return data;
  },

  // Get all users (Admin)
  async getAllUsers(params = {}) {
    const { data } = await apiClient.get('/users/all', { params });
    return data;
  },

  // Search users (Admin)
  async searchUsers(params = {}) {
    const { data } = await apiClient.get('/users/all', { params });
    return data;
  },

  // Get user profile by ID (Admin)
  async getUserById(userId) {
    const { data } = await apiClient.get(`/users/profile/${userId}`);
    return data;
  },

  // Assign role (Super Admin)
  async assignRole(payload) {
    const { data } = await apiClient.post('/users/roles/assign', payload);
    return data;
  },

  // Remove role (Super Admin)
  async removeRole(userId, roleName) {
    const { data } = await apiClient.delete(`/users/${userId}/roles/${roleName}`);
    return data;
  },

  // Get user roles (Admin)
  async getUserRoles(userId) {
    const { data } = await apiClient.get(`/users/${userId}/roles`);
    return data;
  },

  // Activate user (Super Admin)
  async activateUser(userId) {
    const { data } = await apiClient.post(`/users/${userId}/activate`);
    return data;
  },

  // Deactivate user (Super Admin)
  async deactivateUser(userId) {
    const { data } = await apiClient.post(`/users/${userId}/deactivate`);
    return data;
  },

  // Get user statistics (Admin)
  async getUserStatistics() {
    const { data } = await apiClient.get('/users/stats');
    return data;
  },

  // Get available roles for assignment (Admin)
  async getAvailableRoles() {
    const res = await apiClient.get('/roles');
    const nameToRole = {};
    (res.data?.data || []).forEach((r) => { nameToRole[r.name] = r; });
    const order = [
      'SUPER_ADMIN',
      'ADMIN',
      'NATIONAL_LEADER',
      'COORDINATOR',
      'USER',
      'STUDENT',
      'CUSTOMER',
    ];
    const roles = order
      .filter((name) => nameToRole[name])
      .map((name) => ({ roleName: name, label: name }));
    (res.data?.data || []).forEach((r) => {
      if (!order.includes(r.name)) roles.push({ roleName: r.name, label: r.name });
    });
    return { ...res.data, data: roles };
  },

  // Create user (Admin)
  async createUser(payload) {
    const { data } = await apiClient.post('/users/create', payload);
    return data;
  },

  // Reset user password (Admin)
  async resetUserPassword(payload) {
    const { data } = await apiClient.post(`/users/${payload.userId}/reset-password`, {
      newPassword: payload.newPassword,
    });
    return data;
  },

  // Tag a personnel record for admin review
  async tagForReview(userId, reason) {
    const { data } = await apiClient.post(`/users/${userId}/tag-for-review`, { reason });
    return data;
  },

  // Clear the review tag from a personnel record
  async clearReviewTag(userId) {
    const { data } = await apiClient.delete(`/users/${userId}/tag-for-review`);
    return data;
  },

  // Get a personnel member's travel/child/marriage/report records
  async getPersonnelRecords(userId) {
    const { data } = await apiClient.get(`/users/${userId}/personnel-records`);
    return data;
  },
};

export default userService;
