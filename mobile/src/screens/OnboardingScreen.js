/**
 * OnboardingScreen.js - Onboarding flow for mobile app
 * Topic selection, language, and voice preferences
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const TOPICS = [
    { id: 'health', icon: '🏥', label: 'Health' },
    { id: 'education', icon: '📚', label: 'Education' },
    { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
    { id: 'mental-health', icon: '🧠', label: 'Mental Health' },
    { id: 'fitness', icon: '💪', label: 'Fitness' },
    { id: 'vaccination', icon: '💉', label: 'Vaccination' }
];

export default function OnboardingScreen() {
    const { updatePreferences, completeOnboarding } = useAuth();
    const { t, language, changeLanguage } = useI18n();

    const [step, setStep] = useState(1);
    const [selectedTopics, setSelectedTopics] = useState(['health']);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const totalSteps = 3;

    const toggleTopic = (topicId) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(t => t !== topicId)
                : [...prev, topicId]
        );
    };

    const handleComplete = async () => {
        setLoading(true);

        await updatePreferences({
            topics: selectedTopics,
            languages: [language],
            voiceEnabled
        });

        await completeOnboarding();
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress */}
            <View style={styles.progressContainer}>
                <Text style={styles.stepText}>
                    Step {step} of {totalSteps}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(step / totalSteps) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 1: Topics */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>{t('onboarding.topicsTitle')}</Text>
                        <Text style={styles.subtitle}>{t('onboarding.topicsSubtitle')}</Text>

                        <View style={styles.topicsGrid}>
                            {TOPICS.map((topic) => (
                                <TouchableOpacity
                                    key={topic.id}
                                    style={[
                                        styles.topicCard,
                                        selectedTopics.includes(topic.id) && styles.topicCardSelected
                                    ]}
                                    onPress={() => toggleTopic(topic.id)}
                                >
                                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                                    <Text style={styles.topicLabel}>{topic.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Step 2: Language */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>{t('onboarding.languageTitle')}</Text>
                        <Text style={styles.subtitle}>{t('onboarding.languageSubtitle')}</Text>

                        <View style={styles.languageOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.languageCard,
                                    language === 'en' && styles.languageCardSelected
                                ]}
                                onPress={() => changeLanguage('en')}
                            >
                                <Text style={styles.languageFlag}>🇬🇧</Text>
                                <Text style={styles.languageText}>English</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.languageCard,
                                    language === 'hi' && styles.languageCardSelected
                                ]}
                                onPress={() => changeLanguage('hi')}
                            >
                                <Text style={styles.languageFlag}>🇮🇳</Text>
                                <Text style={styles.languageText}>हिंदी</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 3: Voice */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>{t('onboarding.voiceTitle')}</Text>
                        <Text style={styles.subtitle}>{t('onboarding.voiceSubtitle')}</Text>

                        <View style={styles.voiceOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.voiceCard,
                                    voiceEnabled && styles.voiceCardSelected
                                ]}
                                onPress={() => setVoiceEnabled(true)}
                            >
                                <Text style={styles.voiceIcon}>🎤</Text>
                                <Text style={styles.voiceTitle}>{t('onboarding.voiceEnable')}</Text>
                                <Text style={styles.voiceDesc}>Speak and listen</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.voiceCard,
                                    !voiceEnabled && styles.voiceCardSelected
                                ]}
                                onPress={() => setVoiceEnabled(false)}
                            >
                                <Text style={styles.voiceIcon}>⌨️</Text>
                                <Text style={styles.voiceTitle}>{t('onboarding.voiceDisable')}</Text>
                                <Text style={styles.voiceDesc}>Type and read</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[styles.navButton, step === 1 && styles.navButtonDisabled]}
                    onPress={() => setStep(s => s - 1)}
                    disabled={step === 1}
                >
                    <Text style={styles.navButtonText}>{t('common.back')}</Text>
                </TouchableOpacity>

                {step < totalSteps ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => setStep(s => s + 1)}
                    >
                        <Text style={styles.primaryButtonText}>{t('common.next')}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                        onPress={handleComplete}
                        disabled={loading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loading ? t('common.loading') : t('onboarding.complete')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    progressContainer: {
        padding: 20
    },
    stepText: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 8
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#22d3ee',
        borderRadius: 2
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 20
    },
    stepContent: {
        flex: 1
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 24
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    topicCard: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start'
    },
    topicCardSelected: {
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)'
    },
    topicIcon: {
        fontSize: 28,
        marginBottom: 8
    },
    topicLabel: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '500'
    },
    languageOptions: {
        gap: 16
    },
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 20,
        gap: 16
    },
    languageCardSelected: {
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)'
    },
    languageFlag: {
        fontSize: 36
    },
    languageText: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '600'
    },
    voiceOptions: {
        gap: 16
    },
    voiceCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center'
    },
    voiceCardSelected: {
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)'
    },
    voiceIcon: {
        fontSize: 40,
        marginBottom: 12
    },
    voiceTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4
    },
    voiceDesc: {
        color: '#94a3b8',
        fontSize: 14
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        gap: 16
    },
    navButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
    },
    navButtonDisabled: {
        opacity: 0.5
    },
    navButtonText: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '600'
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#0891b2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
    },
    primaryButtonDisabled: {
        opacity: 0.6
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});
