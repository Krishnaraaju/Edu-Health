/**
 * Onboarding.jsx - User onboarding page
 * Captures preferences with privacy consent flow
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const TOPICS = [
    { id: 'health', icon: '🏥', labelKey: 'topics.health' },
    { id: 'education', icon: '📚', labelKey: 'topics.education' },
    { id: 'nutrition', icon: '🥗', labelKey: 'topics.nutrition' },
    { id: 'mental-health', icon: '🧠', labelKey: 'topics.mentalHealth' },
    { id: 'fitness', icon: '💪', labelKey: 'topics.fitness' },
    { id: 'vaccination', icon: '💉', labelKey: 'topics.vaccination' },
    { id: 'first-aid', icon: '🩹', labelKey: 'topics.firstAid' }
];

const LANGUAGES = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'hi', label: 'हिंदी', flag: '🇮🇳' }
];

export default function Onboarding() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { updatePreferences, updateProfile } = useAuth();

    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        topics: ['health', 'education'],
        languages: [i18n.language],
        voiceEnabled: false
    });
    const [consent, setConsent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 4;

    const toggleTopic = (topicId) => {
        setPreferences(prev => ({
            ...prev,
            topics: prev.topics.includes(topicId)
                ? prev.topics.filter(t => t !== topicId)
                : [...prev.topics, topicId]
        }));
    };

    const toggleLanguage = (langId) => {
        setPreferences(prev => ({
            ...prev,
            languages: prev.languages.includes(langId)
                ? prev.languages.filter(l => l !== langId)
                : [...prev.languages, langId]
        }));
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const handleComplete = async () => {
        setIsSubmitting(true);

        // Update preferences
        await updatePreferences(preferences);

        // Update consent if given
        if (consent) {
            await updateProfile({ consentGiven: true });
        }

        navigate('/dashboard');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-xl">
                <div className="glass-card p-8 animate-fade-in">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>{t('onboarding.step', { current: step, total: totalSteps })}</span>
                            <button
                                onClick={handleSkip}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                {t('onboarding.skip')}
                            </button>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Step 1: Topics */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('onboarding.topicsTitle')}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t('onboarding.topicsSubtitle')}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {TOPICS.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => toggleTopic(topic.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${preferences.topics.includes(topic.id)
                                                ? 'border-cyan-500 bg-cyan-500/20'
                                                : 'border-white/20 bg-white/5 hover:border-white/40'
                                            }`}
                                    >
                                        <span className="text-2xl">{topic.icon}</span>
                                        <p className="mt-2 font-medium text-white">
                                            {t(topic.labelKey)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Languages */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('onboarding.languagesTitle')}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t('onboarding.languagesSubtitle')}
                            </p>

                            <div className="space-y-3">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => toggleLanguage(lang.id)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${preferences.languages.includes(lang.id)
                                                ? 'border-cyan-500 bg-cyan-500/20'
                                                : 'border-white/20 bg-white/5 hover:border-white/40'
                                            }`}
                                    >
                                        <span className="text-3xl">{lang.flag}</span>
                                        <span className="font-medium text-white text-lg">{lang.label}</span>
                                        {preferences.languages.includes(lang.id) && (
                                            <span className="ml-auto text-cyan-400">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Voice */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('onboarding.voiceTitle')}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t('onboarding.voiceSubtitle')}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setPreferences(p => ({ ...p, voiceEnabled: true }))}
                                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${preferences.voiceEnabled
                                            ? 'border-cyan-500 bg-cyan-500/20'
                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">🎤</span>
                                        <div>
                                            <p className="font-medium text-white text-lg">
                                                {t('onboarding.voiceEnable')}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {t('onboarding.voiceEnableDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPreferences(p => ({ ...p, voiceEnabled: false }))}
                                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${!preferences.voiceEnabled
                                            ? 'border-cyan-500 bg-cyan-500/20'
                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">⌨️</span>
                                        <div>
                                            <p className="font-medium text-white text-lg">
                                                {t('onboarding.voiceDisable')}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {t('onboarding.voiceDisableDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Privacy Consent */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {t('onboarding.privacyTitle')}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t('onboarding.privacySubtitle')}
                            </p>

                            <div className="bg-white/5 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                                <h3 className="font-semibold text-white mb-2">
                                    {t('privacy.dataUsageTitle')}
                                </h3>
                                <ul className="text-sm text-gray-300 space-y-2">
                                    <li>• {t('privacy.dataUsage1')}</li>
                                    <li>• {t('privacy.dataUsage2')}</li>
                                    <li>• {t('privacy.dataUsage3')}</li>
                                    <li>• {t('privacy.dataUsage4')}</li>
                                </ul>
                                <h3 className="font-semibold text-white mt-4 mb-2">
                                    {t('privacy.retentionTitle')}
                                </h3>
                                <p className="text-sm text-gray-300">
                                    {t('privacy.retentionDesc')}
                                </p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                                />
                                <span className="text-gray-300 text-sm">
                                    {t('privacy.consentText')}
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.back')}
                        </button>

                        {step < totalSteps ? (
                            <button onClick={handleNext} className="btn-primary">
                                {t('common.next')}
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="btn-primary"
                            >
                                {isSubmitting ? t('common.loading') : t('onboarding.complete')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
