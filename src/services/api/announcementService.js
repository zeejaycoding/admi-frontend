import apiClient from '../utils/apiClient';

/**
 * Announcement Service
 *
 * API endpoints for regional announcements and communications
 * Backend: /api/v1/announcements
 */

const ANNOUNCEMENT_ENDPOINTS = {
  GET_ALL: '/announcements',
  GET_RECIPIENT: '/announcements/recipient',
  GET_BY_ID: '/announcements',
  CREATE: '/announcements',
  DELETE: '/announcements',
};

const announcementService = {
  getAllAnnouncements: async () => {
    const response = await apiClient.get(ANNOUNCEMENT_ENDPOINTS.GET_ALL);
    return response.data;
  },

  getRecipientAnnouncements: async () => {
    const response = await apiClient.get(ANNOUNCEMENT_ENDPOINTS.GET_RECIPIENT);
    return response.data;
  },

  getAnnouncementById: async (id) => {
    const response = await apiClient.get(`${ANNOUNCEMENT_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await apiClient.post(ANNOUNCEMENT_ENDPOINTS.CREATE, announcementData);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await apiClient.delete(`${ANNOUNCEMENT_ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },
};

export default announcementService;
