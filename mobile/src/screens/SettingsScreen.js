/**
 * SettingsScreen.js - Settings screen for mobile app
 * Language, voice, and account settings
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Switch,
    Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export default function SettingsScreen() {
    const { user, logout, updatePreferences } = useAuth();
    const { t, language, changeLanguage } = useI18n();

    const [voiceEnabled, setVoiceEnabled] = useState(
        user?.preferences?.voiceEnabled || false
    );
    const [saving, setSaving] = useState(false);

    const handleVoiceToggle = async (value) => {
        setVoiceEnabled(value);
        setSaving(true);

        await updatePreferences({
            ...user?.preferences,
            voiceEnabled: value
        });

        setSaving(false);
    };

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            'Are you sure you want to logout?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auth.logout'), style: 'destructive', onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <Text style={styles.title}>{t('settings.title')}</Text>

                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <Text style={styles.label}>Name</Text>
                            <Text style={styles.value}>{user?.name}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.profileRow}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
                    <View style={styles.card}>
                        <View style={styles.languageOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    language === 'en' && styles.languageButtonActive
                                ]}
                                onPress={() => changeLanguage('en')}
                            >
                                <Text style={styles.languageFlag}>🇬🇧</Text>
                                <Text style={[
                                    styles.languageText,
                                    language === 'en' && styles.languageTextActive
                                ]}>English</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    language === 'hi' && styles.languageButtonActive
                                ]}
                                onPress={() => changeLanguage('hi')}
                            >
                                <Text style={styles.languageFlag}>🇮🇳</Text>
                                <Text style={[
                                    styles.languageText,
                                    language === 'hi' && styles.languageTextActive
                                ]}>हिंदी</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Voice Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.voice')}</Text>
                    <View style={styles.card}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLabel}>
                                <Text style={styles.toggleTitle}>{t('settings.enableVoice')}</Text>
                                <Text style={styles.toggleDesc}>
                                    Read messages aloud with text-to-speech
                                </Text>
                            </View>
                            <Switch
                                value={voiceEnabled}
                                onValueChange={handleVoiceToggle}
                                trackColor={{ false: '#374151', true: '#22d3ee' }}
                                thumbColor={voiceEnabled ? '#fff' : '#9ca3af'}
                            />
                        </View>
                    </View>
                </View>

                {/* Topics Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Topics of Interest</Text>
                    <View style={styles.card}>
                        <View style={styles.topicsContainer}>
                            {(user?.preferences?.topics || []).map((topic, i) => (
                                <View key={i} style={styles.topicTag}>
                                    <Text style={styles.topicText}>{topic}</Text>
                                </View>
                            ))}
                            {(!user?.preferences?.topics || user.preferences.topics.length === 0) && (
                                <Text style={styles.noTopics}>No topics selected</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>🏥 Health Assistant</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    content: {
        padding: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 24
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
    },
    label: {
        color: '#94a3b8',
        fontSize: 15
    },
    value: {
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    languageOptions: {
        flexDirection: 'row',
        padding: 8,
        gap: 8
    },
    languageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    languageButtonActive: {
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)'
    },
    languageFlag: {
        fontSize: 24
    },
    languageText: {
        color: '#94a3b8',
        fontSize: 15,
        fontWeight: '600'
    },
    languageTextActive: {
        color: '#22d3ee'
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    toggleLabel: {
        flex: 1,
        marginRight: 16
    },
    toggleTitle: {
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: '500'
    },
    toggleDesc: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 2
    },
    topicsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 8
    },
    topicTag: {
        backgroundColor: 'rgba(34,211,238,0.1)',
        borderColor: '#22d3ee',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6
    },
    topicText: {
        color: '#22d3ee',
        fontSize: 13,
        fontWeight: '500'
    },
    noTopics: {
        color: '#64748b',
        fontSize: 14,
        padding: 4
    },
    logoutButton: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)'
    },
    logoutText: {
        color: '#f87171',
        fontSize: 16,
        fontWeight: '600'
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 24
    },
    appName: {
        color: '#64748b',
        fontSize: 14
    },
    version: {
        color: '#475569',
        fontSize: 12,
        marginTop: 4
    }
});
