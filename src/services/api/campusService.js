import apiClient from '../utils/apiClient';

const CAMPUS_ENDPOINTS = {
  // Public endpoints
  GET_ALL: '/campuses/all',
  SEARCH: '/campuses/search',
  GET_BY_ID: '/campuses',
  GET_REGIONS: '/campuses/regions',
  GET_CURRENCIES: '/campuses/currencies',
  GET_CURRENCY_FOR_REGION: '/campuses/currency',
  GET_STATS: '/campuses/stats',
  PUBLIC_SEARCH: '/campuses/public/search',
  PUBLIC_BY_REGION: '/campuses/public/region',
  PUBLIC_FEATURED: '/campuses/public/featured',
  PUBLIC_DETAILS: '/campuses/public',

  // Admin endpoints
  CREATE: '/campuses',
  UPDATE: '/campuses',
  DELETE: '/campuses',
  UPLOAD_IMAGE: '/campuses',
};

export const campusService = {
  // Public methods
  getAllCampuses: async (params = {}) => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.GET_ALL, { params });
    return response.data;
  },

  searchCampuses: async (params = {}) => {
    // Ensure city parameter is included if provided
    const searchParams = { ...params };
    if (searchParams.city && !searchParams.searchTerm) {
      // If only city is provided, include it in search term for better API compatibility
      searchParams.searchTerm = searchParams.city;
    }
    const response = await apiClient.get(CAMPUS_ENDPOINTS.SEARCH, { params: searchParams });
    return response.data;
  },

  getCampusById: async (id) => {
    const response = await apiClient.get(`${CAMPUS_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  getSupportedRegions: async () => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.GET_REGIONS);
    return response.data;
  },

  getSupportedCurrencies: async () => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.GET_CURRENCIES);
    return response.data;
  },

  getCurrencyForRegion: async (region) => {
    const response = await apiClient.get(`${CAMPUS_ENDPOINTS.GET_CURRENCY_FOR_REGION}/${region}`);
    return response.data;
  },

  // Public search methods
  publicSearchCampuses: async (params = {}) => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.PUBLIC_SEARCH, { params });
    return response.data;
  },

  getCampusesByRegion: async (region) => {
    const response = await apiClient.get(`${CAMPUS_ENDPOINTS.PUBLIC_BY_REGION}/${region}`);
    return response.data;
  },

  getFeaturedCampuses: async () => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.PUBLIC_FEATURED);
    return response.data;
  },

  getPublicCampusDetails: async (id) => {
    const response = await apiClient.get(`${CAMPUS_ENDPOINTS.PUBLIC_DETAILS}/${id}`);
    return response.data;
  },

  // Admin methods
  getCampusStats: async () => {
    const response = await apiClient.get(CAMPUS_ENDPOINTS.GET_STATS);
    return response.data;
  },

  createCampus: async (campusData) => {
    const response = await apiClient.post(CAMPUS_ENDPOINTS.CREATE, campusData);
    return response.data;
  },

  updateCampus: async (id, campusData) => {
    const response = await apiClient.put(`${CAMPUS_ENDPOINTS.UPDATE}/${id}`, campusData);
    return response.data;
  },

  deleteCampus: async (id) => {
    const response = await apiClient.delete(`${CAMPUS_ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },

  uploadCampusImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await apiClient.post(`${CAMPUS_ENDPOINTS.UPLOAD_IMAGE}/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default campusService;
