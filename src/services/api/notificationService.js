import apiClient from '../utils/apiClient';
import { API_BASE_URL } from '../../constants/api';

const NOTIFICATION_BASE = '/notifications';

function toWsUrl(token) {
  const base = API_BASE_URL.replace(/^http/, 'ws');
  const hostPart = base.replace(/\/api\/v1\/?$/, '');
  return `${hostPart}/ws/notifications?token=${encodeURIComponent(token)}`;
}

const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get(`${NOTIFICATION_BASE}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get(`${NOTIFICATION_BASE}/unread-count`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.post(`${NOTIFICATION_BASE}/read-all`);
    return response.data;
  },

  markRead: async (id) => {
    const response = await apiClient.post(`${NOTIFICATION_BASE}/${id}/read`);
    return response.data;
  },
};

class NotificationSocket {
  constructor() {
    this.socket = null;
    this.handlers = {};
    this.shouldReconnect = false;
    this.reconnectAttempts = 0;
  }

  connect(token) {
    this.close();
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    const ws = new WebSocket(toWsUrl(token));
    this.socket = ws;
    this.token = token;

    ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('open');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, data } = message || {};
        if (type) this.emit(type, data);
      } catch {
        // ignore non-JSON frames
      }
    };

    ws.onclose = () => {
      this.emit('close');
      if (this.shouldReconnect) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
        this.reconnectAttempts += 1;
        setTimeout(() => {
          if (this.shouldReconnect) this.connect(this.token);
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will trigger reconnect
    };
  }

  on(type, handler) {
    this.handlers[type] = handler;
  }

  emit(type, data) {
    if (this.handlers[type]) this.handlers[type](data);
  }

  close() {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }
}

export const notificationSocket = new NotificationSocket();

export default notificationService;
