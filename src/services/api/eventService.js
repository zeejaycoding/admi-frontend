import apiClient from '../utils/apiClient';

const eventService = {
  getAllEvents: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  searchEvents: async (searchTerm, module, page = 0, size = 25) => {
    const params = { searchTerm, page, size };
    if (module) params.module = module;
    const response = await apiClient.get('/events/search', { params });
    return response.data;
  },

  createEvent: async (eventData, thumbnailFile) => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    const response = await apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEvent: async (id, updateData, thumbnailFile) => {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    const response = await apiClient.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  getEventAnalytics: async () => {
    const response = await apiClient.get('/events/analytics');
    return response.data;
  },
};

export default eventService;
