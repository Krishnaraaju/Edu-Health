/**
 * api.js - API service for mobile app
 * Handles HTTP requests with auth token management
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change for production
const API_BASE_URL = __DEV__
    ? 'http://10.0.2.2:5000/api'  // Android emulator
    : 'https://your-api-url.com/api';

// For iOS simulator, use: 'http://localhost:5000/api'
// For physical device, use your machine's IP: 'http://192.168.x.x:5000/api'

const KEYS = {
    TOKEN: '@healthcare/token',
    REFRESH_TOKEN: '@healthcare/refreshToken'
};

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem(KEYS.TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken } = response.data.data;
                    await AsyncStorage.setItem(KEYS.TOKEN, accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Clear tokens on refresh failure
                await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.REFRESH_TOKEN]);
            }
        }

        return Promise.reject(error);
    }
);

// API methods
export const feedAPI = {
    getFeed: (params = {}) => api.get('/feed', { params }),
    getTrending: (params = {}) => api.get('/feed/trending', { params })
};

export const contentAPI = {
    getContentById: (id) => api.get(`/content/${id}`),
    likeContent: (id) => api.post(`/content/${id}/like`)
};

export const chatAPI = {
    sendMessage: (message, conversationId = null) =>
        api.post('/chat', { message, conversationId }),
    getConversations: () => api.get('/chat'),
    getConversation: (id) => api.get(`/chat/${id}`)
};

export default api;
