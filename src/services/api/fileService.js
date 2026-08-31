import apiClient from '../utils/apiClient';
import { API_BASE_URL } from '../../constants/api';

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

// Resolve backend-relative URLs (e.g. "/uploads/...") to absolute URLs the browser can load.
export function resolveFileUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
}

const fileService = {
  // Upload a profile picture for the authenticated user
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/files/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Delete the authenticated user's profile picture
  async deleteProfileImage() {
    const { data } = await apiClient.delete('/files/profile-image');
    return data;
  },

  // Get the authenticated user's profile image URL
  async getProfileImageUrl(userId) {
    const { data } = await apiClient.get('/files/profile-image/url', { params: { userId } });
    return data;
  },

  resolveUrl: resolveFileUrl,
};

export default fileService;
