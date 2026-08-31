import apiClient from '../utils/apiClient';
import { API_BASE_URL } from '../../constants/api';

const CHAT_BASE = '/coordinator-chat';

function toWsUrl(token) {
  const base = API_BASE_URL.replace(/^http/, 'ws');
  const hostPart = base.replace(/\/api\/v1\/?$/, '');
  return `${hostPart}/ws/coordinator-chat?token=${encodeURIComponent(token)}`;
}

const coordinatorChatService = {
  getStats: async () => {
    const response = await apiClient.get(`${CHAT_BASE}/stats`);
    return response.data;
  },

  searchCoordinators: async ({ country, search } = {}) => {
    const response = await apiClient.get(`${CHAT_BASE}/coordinators`, {
      params: { country: country || undefined, search: search || undefined },
    });
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get(`${CHAT_BASE}/conversations`);
    return response.data;
  },

  startConversation: async (coordinatorId) => {
    const response = await apiClient.post(`${CHAT_BASE}/conversations`, { coordinatorId });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await apiClient.get(`${CHAT_BASE}/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await apiClient.post(`${CHAT_BASE}/messages`, { conversationId, content });
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await apiClient.post(`${CHAT_BASE}/conversations/${conversationId}/read`);
    return response.data;
  },

  initiateCall: async (conversationId, callType) => {
    const response = await apiClient.post(`${CHAT_BASE}/calls`, { conversationId, callType });
    return response.data;
  },

  updateCallStatus: async (callId, status) => {
    const response = await apiClient.post(`${CHAT_BASE}/calls/${callId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getCalls: async () => {
    const response = await apiClient.get(`${CHAT_BASE}/calls`);
    return response.data;
  },
};

class CoordinatorChatSocket {
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

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }

  sendMessage(conversationId, content) {
    this.send('send_message', { conversationId, content });
  }

  markRead(conversationId) {
    this.send('mark_read', { conversationId });
  }

  typing(conversationId, typing) {
    this.send('typing', { conversationId, typing });
  }

  call(action, payload) {
    this.send('call', { action, ...payload });
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

export const coordinatorChatSocket = new CoordinatorChatSocket();

export default coordinatorChatService;
