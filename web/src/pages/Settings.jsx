/**
 * Settings.jsx - User settings page
 * Manage preferences, language, and privacy settings
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { user, updatePreferences, updateProfile, logout } = useAuth();

    const [preferences, setPreferences] = useState(user?.preferences || {
        topics: [],
        languages: ['en'],
        voiceEnabled: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const topics = [
        { id: 'health', label: t('topics.health') },
        { id: 'education', label: t('topics.education') },
        { id: 'nutrition', label: t('topics.nutrition') },
        { id: 'mental-health', label: t('topics.mentalHealth') },
        { id: 'fitness', label: t('topics.fitness') },
        { id: 'vaccination', label: t('topics.vaccination') }
    ];

    const handleTopicToggle = (topicId) => {
        setPreferences(prev => ({
            ...prev,
            topics: prev.topics.includes(topicId)
                ? prev.topics.filter(t => t !== topicId)
                : [...prev.topics, topicId]
        }));
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setPreferences(prev => ({
            ...prev,
            languages: [lang, ...prev.languages.filter(l => l !== lang)]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updatePreferences(preferences);
        setMessage(result.success ? t('settings.saved') : t('settings.saveFailed'));
        setIsSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message === t('settings.saved')
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message}
                </div>
            )}

            {/* Profile Section */}
            <section className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {t('settings.profile')}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            {t('auth.name')}
                        </label>
                        <p className="text-white">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            {t('auth.email')}
                        </label>
                        <p className="text-white">{user?.email}</p>
                    </div>
                </div>
            </section>

            {/* Language Section */}
            <section className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {t('settings.language')}
                </h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${i18n.language === 'en'
                                ? 'border-cyan-500 bg-cyan-500/20'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                    >
                        <span className="text-2xl">🇬🇧</span>
                        <span className="text-white">English</span>
                    </button>
                    <button
                        onClick={() => handleLanguageChange('hi')}
                        className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${i18n.language === 'hi'
                                ? 'border-cyan-500 bg-cyan-500/20'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                    >
                        <span className="text-2xl">🇮🇳</span>
                        <span className="text-white">हिंदी</span>
                    </button>
                </div>
            </section>

            {/* Topics Section */}
            <section className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {t('settings.topics')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {topics.map((topic) => (
                        <button
                            key={topic.id}
                            onClick={() => handleTopicToggle(topic.id)}
                            className={`p-3 rounded-lg border transition-all text-sm ${preferences.topics?.includes(topic.id)
                                    ? 'border-cyan-500 bg-cyan-500/20 text-white'
                                    : 'border-white/20 text-gray-400 hover:border-white/40'
                                }`}
                        >
                            {topic.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Voice Section */}
            <section className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {t('settings.voice')}
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={preferences.voiceEnabled}
                        onChange={(e) => setPreferences(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300">
                        {t('settings.enableVoice')}
                    </span>
                </label>
            </section>

            {/* Save Button */}
            <div className="flex justify-between">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary px-8 disabled:opacity-50"
                >
                    {isSaving ? t('common.loading') : t('settings.save')}
                </button>

                <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 transition-colors"
                >
                    {t('auth.logout')}
                </button>
            </div>
        </div>
    );
}
