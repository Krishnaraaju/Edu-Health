/**
 * I18nContext.js - Internationalization context for mobile
 * Provides translation function and language switching
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const I18nContext = createContext(null);

const LANG_KEY = '@healthcare/language';

// Translations
const translations = {
    en: {
        app: { name: 'Health Assistant' },
        common: {
            loading: 'Loading...',
            error: 'Error',
            retry: 'Retry',
            back: 'Back',
            next: 'Next',
            save: 'Save',
            cancel: 'Cancel'
        },
        auth: {
            login: 'Login',
            logout: 'Logout',
            register: 'Sign Up',
            email: 'Email',
            password: 'Password',
            name: 'Full Name',
            welcomeBack: 'Welcome Back',
            loginSubtitle: 'Sign in to continue',
            createAccount: 'Create Account',
            registerSubtitle: 'Start your health journey',
            noAccount: "Don't have an account?",
            hasAccount: 'Already have an account?',
            loginError: 'Invalid email or password',
            registerError: 'Registration failed'
        },
        onboarding: {
            topicsTitle: 'What interests you?',
            topicsSubtitle: 'Select topics to personalize your feed',
            languageTitle: 'Preferred language',
            languageSubtitle: 'Choose your language',
            voiceTitle: 'Voice features',
            voiceSubtitle: 'Enable text-to-speech',
            voiceEnable: 'Enable Voice',
            voiceDisable: 'Text Only',
            complete: 'Get Started'
        },
        dashboard: {
            welcome: 'Hello, {{name}}!',
            subtitle: 'Your personalized content',
            forYou: 'For You',
            trending: 'Trending',
            noContent: 'No content yet'
        },
        chat: {
            title: 'Health Assistant',
            subtitle: 'Ask me anything',
            welcomeMessage: "Hello! How can I help you today?",
            inputPlaceholder: 'Type your question...',
            send: 'Send',
            thinking: 'Thinking...',
            newChat: 'New Chat',
            disclaimer: 'For informational purposes only.'
        },
        settings: {
            title: 'Settings',
            language: 'Language',
            voice: 'Voice',
            enableVoice: 'Enable text-to-speech',
            saved: 'Settings saved!'
        },
        topics: {
            health: 'Health',
            education: 'Education',
            nutrition: 'Nutrition',
            mentalHealth: 'Mental Health',
            fitness: 'Fitness',
            vaccination: 'Vaccination'
        }
    },
    hi: {
        app: { name: 'स्वास्थ्य सहायक' },
        common: {
            loading: 'लोड हो रहा है...',
            error: 'त्रुटि',
            retry: 'पुनः प्रयास',
            back: 'वापस',
            next: 'आगे',
            save: 'सेव करें',
            cancel: 'रद्द करें'
        },
        auth: {
            login: 'लॉगिन',
            logout: 'लॉगआउट',
            register: 'साइन अप',
            email: 'ईमेल',
            password: 'पासवर्ड',
            name: 'पूरा नाम',
            welcomeBack: 'वापस आपका स्वागत है',
            loginSubtitle: 'जारी रखने के लिए लॉगिन करें',
            createAccount: 'खाता बनाएं',
            registerSubtitle: 'अपनी स्वास्थ्य यात्रा शुरू करें',
            noAccount: 'खाता नहीं है?',
            hasAccount: 'पहले से खाता है?',
            loginError: 'अमान्य ईमेल या पासवर्ड',
            registerError: 'पंजीकरण विफल'
        },
        onboarding: {
            topicsTitle: 'आपकी रुचि क्या है?',
            topicsSubtitle: 'विषय चुनें',
            languageTitle: 'पसंदीदा भाषा',
            languageSubtitle: 'अपनी भाषा चुनें',
            voiceTitle: 'आवाज सुविधाएं',
            voiceSubtitle: 'टेक्स्ट-टू-स्पीच सक्षम करें',
            voiceEnable: 'आवाज सक्षम करें',
            voiceDisable: 'केवल टेक्स्ट',
            complete: 'शुरू करें'
        },
        dashboard: {
            welcome: 'नमस्ते, {{name}}!',
            subtitle: 'आपकी व्यक्तिगत सामग्री',
            forYou: 'आपके लिए',
            trending: 'ट्रेंडिंग',
            noContent: 'अभी कोई सामग्री नहीं'
        },
        chat: {
            title: 'स्वास्थ्य सहायक',
            subtitle: 'कुछ भी पूछें',
            welcomeMessage: 'नमस्ते! मैं आपकी कैसे मदद कर सकता/सकती हूं?',
            inputPlaceholder: 'अपना प्रश्न लिखें...',
            send: 'भेजें',
            thinking: 'सोच रहा हूं...',
            newChat: 'नई चैट',
            disclaimer: 'केवल जानकारी के लिए।'
        },
        settings: {
            title: 'सेटिंग्स',
            language: 'भाषा',
            voice: 'आवाज',
            enableVoice: 'टेक्स्ट-टू-स्पीच सक्षम',
            saved: 'सेटिंग्स सेव!'
        },
        topics: {
            health: 'स्वास्थ्य',
            education: 'शिक्षा',
            nutrition: 'पोषण',
            mentalHealth: 'मानसिक स्वास्थ्य',
            fitness: 'फिटनेस',
            vaccination: 'टीकाकरण'
        }
    }
};

export function I18nProvider({ children }) {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem(LANG_KEY);
            if (savedLang) {
                setLanguage(savedLang);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const changeLanguage = async (lang) => {
        setLanguage(lang);
        await AsyncStorage.setItem(LANG_KEY, lang);
    };

    // Translation function with interpolation
    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
            if (!value) break;
        }

        if (!value) {
            // Fallback to English
            value = translations.en;
            for (const k of keys) {
                value = value?.[k];
                if (!value) break;
            }
        }

        if (!value) return key;

        // Interpolation
        return value.replace(/\{\{(\w+)\}\}/g, (_, name) => params[name] || '');
    };

    const value = {
        language,
        changeLanguage,
        t,
        isHindi: language === 'hi'
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}

export default I18nContext;
