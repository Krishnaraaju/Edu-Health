/**
 * api.js - API service for backend communication
 * Handles authentication tokens and request/response interceptors
 */

import axios from 'axios';
import localforage from 'localforage';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await localforage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't tried refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await localforage.getItem(REFRESH_TOKEN_KEY);
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken } = response.data.data;
                    await localforage.setItem(TOKEN_KEY, accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens
                await localforage.removeItem(TOKEN_KEY);
                await localforage.removeItem(REFRESH_TOKEN_KEY);
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ==================
// Auth API
// ==================

export const authAPI = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        if (response.data.success) {
            await localforage.setItem(TOKEN_KEY, response.data.data.accessToken);
            await localforage.setItem(REFRESH_TOKEN_KEY, response.data.data.refreshToken);
        }
        return response.data;
    },

    login: async (data) => {
        const response = await api.post('/auth/login', data);
        if (response.data.success) {
            await localforage.setItem(TOKEN_KEY, response.data.data.accessToken);
            await localforage.setItem(REFRESH_TOKEN_KEY, response.data.data.refreshToken);
        }
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            await localforage.removeItem(TOKEN_KEY);
            await localforage.removeItem(REFRESH_TOKEN_KEY);
        }
    },

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },

    updatePreferences: async (preferences) => {
        const response = await api.put('/auth/preferences', { preferences });
        return response.data;
    },

    isAuthenticated: async () => {
        const token = await localforage.getItem(TOKEN_KEY);
        return !!token;
    }
};

// ==================
// Content API
// ==================

export const contentAPI = {
    getContent: async (params = {}) => {
        const response = await api.get('/content', { params });
        return response.data;
    },

    getContentById: async (id) => {
        const response = await api.get(`/content/${id}`);
        return response.data;
    },

    createContent: async (data) => {
        const response = await api.post('/content', data);
        return response.data;
    },

    updateContent: async (id, data) => {
        const response = await api.put(`/content/${id}`, data);
        return response.data;
    },

    deleteContent: async (id) => {
        const response = await api.delete(`/content/${id}`);
        return response.data;
    },

    likeContent: async (id) => {
        const response = await api.post(`/content/${id}/like`);
        return response.data;
    }
};

// ==================
// Feed API
// ==================

export const feedAPI = {
    getFeed: async (params = {}) => {
        const response = await api.get('/feed', { params });
        return response.data;
    },

    getTrending: async (params = {}) => {
        const response = await api.get('/feed/trending', { params });
        return response.data;
    },

    getRecent: async (params = {}) => {
        const response = await api.get('/feed/recent', { params });
        return response.data;
    }
};

// ==================
// Chat API
// ==================

export const chatAPI = {
    sendMessage: async (message, conversationId = null) => {
        const response = await api.post('/chat', {
            message,
            conversationId
        });
        return response.data;
    },

    getConversations: async () => {
        const response = await api.get('/chat');
        return response.data;
    },

    getConversation: async (id) => {
        const response = await api.get(`/chat/${id}`);
        return response.data;
    },

    deleteConversation: async (id) => {
        const response = await api.delete(`/chat/${id}`);
        return response.data;
    },

    checkEmergency: async (message) => {
        const response = await api.post('/chat/emergency', { message });
        return response.data;
    }
};

// ==================
// Moderation API
// ==================

export const moderationAPI = {
    checkText: async (text) => {
        const response = await api.post('/moderate', { text });
        return response.data;
    },

    submitReport: async (data) => {
        const response = await api.post('/moderate/report', data);
        return response.data;
    }
};

export default api;
