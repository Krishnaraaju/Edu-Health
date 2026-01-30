/**
 * Home.jsx - Landing page component
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    const features = [
        { icon: '🤖', titleKey: 'features.ai.title', descKey: 'features.ai.desc' },
        { icon: '🔒', titleKey: 'features.privacy.title', descKey: 'features.privacy.desc' },
        { icon: '🌐', titleKey: 'features.multilingual.title', descKey: 'features.multilingual.desc' },
        { icon: '📱', titleKey: 'features.offline.title', descKey: 'features.offline.desc' },
        { icon: '🎤', titleKey: 'features.voice.title', descKey: 'features.voice.desc' },
        { icon: '✅', titleKey: 'features.verified.title', descKey: 'features.verified.desc' }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        {t('home.heroSubtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                                    {t('home.goDashboard')}
                                </Link>
                                <Link to="/chat" className="btn-secondary text-lg px-8 py-3">
                                    {t('home.startChat')}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                                    {t('home.getStarted')}
                                </Link>
                                <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                                    {t('auth.login')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 bg-white/5">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        {t('home.featuresTitle')}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="glass-card p-6 hover:scale-105 transition-transform"
                            >
                                <span className="text-4xl mb-4 block">{feature.icon}</span>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {t(feature.titleKey)}
                                </h3>
                                <p className="text-gray-400">
                                    {t(feature.descKey)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center glass-card p-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        {t('home.ctaTitle')}
                    </h2>
                    <p className="text-gray-400 mb-8">
                        {t('home.ctaSubtitle')}
                    </p>
                    <Link
                        to={isAuthenticated ? '/chat' : '/register'}
                        className="btn-primary text-lg px-8 py-3"
                    >
                        {isAuthenticated ? t('home.startChat') : t('home.getStarted')}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏥</span>
                        <span className="text-gray-400">{t('app.name')}</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2024 {t('app.name')}. {t('footer.rights')}
                    </p>
                </div>
            </footer>
        </div>
    );
}
