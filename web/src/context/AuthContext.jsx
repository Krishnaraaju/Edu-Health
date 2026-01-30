/**
 * AuthContext.jsx - Authentication context provider
 * Manages user authentication state across the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import localforage from 'localforage';

// Create context
const AuthContext = createContext(null);

// Storage keys
const USER_KEY = 'user';
const PREFERENCES_KEY = 'preferences';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from storage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const isAuth = await authAPI.isAuthenticated();
                if (isAuth) {
                    // Try to get cached user first
                    const cachedUser = await localforage.getItem(USER_KEY);
                    if (cachedUser) {
                        setUser(cachedUser);
                    }

                    // Then fetch fresh data
                    try {
                        const response = await authAPI.getProfile();
                        if (response.success) {
                            setUser(response.data.user);
                            await localforage.setItem(USER_KEY, response.data.user);
                        }
                    } catch (err) {
                        // Use cached user if fetch fails (offline)
                        console.log('Using cached user data');
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Register new user
    const register = useCallback(async (name, email, password) => {
        setError(null);
        try {
            const response = await authAPI.register({ name, email, password });
            if (response.success) {
                setUser(response.data.user);
                await localforage.setItem(USER_KEY, response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    // Login user
    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const response = await authAPI.login({ email, password });
            if (response.success) {
                setUser(response.data.user);
                await localforage.setItem(USER_KEY, response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    // Logout user
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
            await localforage.removeItem(USER_KEY);
        }
    }, []);

    // Update user preferences
    const updatePreferences = useCallback(async (preferences) => {
        try {
            const response = await authAPI.updatePreferences(preferences);
            if (response.success) {
                const updatedUser = { ...user, preferences: response.data.preferences };
                setUser(updatedUser);
                await localforage.setItem(USER_KEY, updatedUser);
                await localforage.setItem(PREFERENCES_KEY, response.data.preferences);
                return { success: true };
            }
            return { success: false };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [user]);

    // Update profile
    const updateProfile = useCallback(async (data) => {
        try {
            const response = await authAPI.updateProfile(data);
            if (response.success) {
                setUser(response.data.user);
                await localforage.setItem(USER_KEY, response.data.user);
                return { success: true };
            }
            return { success: false };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    // Get preferences (with fallback to local storage)
    const getPreferences = useCallback(async () => {
        if (user?.preferences) {
            return user.preferences;
        }
        const cached = await localforage.getItem(PREFERENCES_KEY);
        return cached || { topics: ['health', 'education'], languages: ['en'], voiceEnabled: false };
    }, [user]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updatePreferences,
        updateProfile,
        getPreferences
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
