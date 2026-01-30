/**
 * AuthContext.js - Authentication context for mobile app
 * Manages auth state with AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

// Storage keys
const KEYS = {
    TOKEN: '@healthcare/token',
    REFRESH_TOKEN: '@healthcare/refreshToken',
    USER: '@healthcare/user',
    ONBOARDING: '@healthcare/onboardingComplete'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    // Initialize auth state from storage
    useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            const [token, userJson, onboardingComplete] = await Promise.all([
                AsyncStorage.getItem(KEYS.TOKEN),
                AsyncStorage.getItem(KEYS.USER),
                AsyncStorage.getItem(KEYS.ONBOARDING)
            ]);

            if (token && userJson) {
                setUser(JSON.parse(userJson));
                setHasCompletedOnboarding(onboardingComplete === 'true');

                // Fetch fresh user data
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(response.data.data.user));
                    }
                } catch (err) {
                    console.log('Using cached user data');
                }
            }
        } catch (error) {
            console.error('Auth init error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { user, accessToken, refreshToken } = response.data.data;

                await Promise.all([
                    AsyncStorage.setItem(KEYS.TOKEN, accessToken),
                    AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken),
                    AsyncStorage.setItem(KEYS.USER, JSON.stringify(user))
                ]);

                setUser(user);

                // Check if onboarding is complete based on preferences
                const hasPrefs = user.preferences?.topics?.length > 0;
                setHasCompletedOnboarding(hasPrefs);
                if (hasPrefs) {
                    await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
                }

                return { success: true };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });

            if (response.data.success) {
                const { user, accessToken, refreshToken } = response.data.data;

                await Promise.all([
                    AsyncStorage.setItem(KEYS.TOKEN, accessToken),
                    AsyncStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken),
                    AsyncStorage.setItem(KEYS.USER, JSON.stringify(user))
                ]);

                setUser(user);
                setHasCompletedOnboarding(false);

                return { success: true };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout API errors
        }

        await Promise.all([
            AsyncStorage.removeItem(KEYS.TOKEN),
            AsyncStorage.removeItem(KEYS.REFRESH_TOKEN),
            AsyncStorage.removeItem(KEYS.USER)
        ]);

        setUser(null);
        setHasCompletedOnboarding(false);
    };

    const updatePreferences = async (preferences) => {
        try {
            const response = await api.put('/auth/preferences', { preferences });

            if (response.data.success) {
                const updatedUser = { ...user, preferences: response.data.data.preferences };
                setUser(updatedUser);
                await AsyncStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
                return { success: true };
            }

            return { success: false };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
        setHasCompletedOnboarding(true);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        hasCompletedOnboarding,
        login,
        register,
        logout,
        updatePreferences,
        completeOnboarding
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
