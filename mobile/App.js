/**
 * App.js - Main entry point for Expo mobile app
 * Sets up navigation and providers
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { I18nProvider } from './src/context/I18nContext';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Main Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Loading Screen
import LoadingScreen from './src/screens/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60
                },
                tabBarActiveTintColor: '#22d3ee',
                tabBarInactiveTintColor: '#94a3b8'
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarLabel: 'Chat',
                    tabBarIcon: ({ color }) => <TabIcon name="💬" color={color} />
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color }) => <TabIcon name="⚙️" color={color} />
                }}
            />
        </Tab.Navigator>
    );
}

// Simple Tab Icon component
function TabIcon({ name, color }) {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>{name}</Text>
        </View>
    );
}

// Navigation based on auth state
function AppNavigator() {
    const { isAuthenticated, loading, hasCompletedOnboarding } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0f172a' },
                animation: 'slide_from_right'
            }}
        >
            {!isAuthenticated ? (
                // Auth Stack
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : !hasCompletedOnboarding ? (
                // Onboarding
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
                // Main App
                <Stack.Screen name="Main" component={MainTabs} />
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <I18nProvider>
                <NavigationContainer
                    theme={{
                        dark: true,
                        colors: {
                            primary: '#22d3ee',
                            background: '#0f172a',
                            card: '#1e293b',
                            text: '#f8fafc',
                            border: 'rgba(255,255,255,0.1)',
                            notification: '#22d3ee'
                        }
                    }}
                >
                    <StatusBar style="light" />
                    <AppNavigator />
                </NavigationContainer>
            </I18nProvider>
        </AuthProvider>
    );
}
