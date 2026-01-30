/**
 * Dashboard.jsx - Main dashboard with personalized feed
 * Shows content based on user preferences
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { feedAPI, contentAPI } from '../services/api';
import ContentCard from '../components/ContentCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [feed, setFeed] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('forYou');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const [feedRes, trendingRes] = await Promise.all([
                feedAPI.getFeed({ limit: 10 }),
                feedAPI.getTrending({ limit: 5 })
            ]);

            if (feedRes.success) {
                setFeed(feedRes.data);
            }
            if (trendingRes.success) {
                setTrending(trendingRes.data);
            }
        } catch (err) {
            setError(t('errors.loadFailed'));
            console.error('Failed to load content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (contentId) => {
        try {
            await contentAPI.likeContent(contentId);
            // Update local state
            setFeed(prev => prev.map(item =>
                item._id === contentId
                    ? { ...item, metrics: { ...item.metrics, likes: item.metrics.likes + 1 } }
                    : item
            ));
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || t('common.user') })}
                </h1>
                <p className="text-gray-400">
                    {t('dashboard.subtitle')}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Link
                    to="/chat"
                    className="glass-card p-4 hover:scale-105 transition-transform text-center"
                >
                    <span className="text-3xl mb-2 block">💬</span>
                    <span className="text-white font-medium">{t('dashboard.askQuestion')}</span>
                </Link>
                <Link
                    to="/content?type=health"
                    className="glass-card p-4 hover:scale-105 transition-transform text-center"
                >
                    <span className="text-3xl mb-2 block">🏥</span>
                    <span className="text-white font-medium">{t('dashboard.healthTips')}</span>
                </Link>
                <Link
                    to="/content?type=education"
                    className="glass-card p-4 hover:scale-105 transition-transform text-center"
                >
                    <span className="text-3xl mb-2 block">📚</span>
                    <span className="text-white font-medium">{t('dashboard.education')}</span>
                </Link>
                <Link
                    to="/settings"
                    className="glass-card p-4 hover:scale-105 transition-transform text-center"
                >
                    <span className="text-3xl mb-2 block">⚙️</span>
                    <span className="text-white font-medium">{t('dashboard.settings')}</span>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('forYou')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'forYou'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    {t('dashboard.forYou')}
                </button>
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'trending'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    {t('dashboard.trending')}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={loadContent} className="btn-primary">
                        {t('common.retry')}
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'forYou' ? feed : trending).map((content) => (
                        <ContentCard
                            key={content._id}
                            content={content}
                            onLike={() => handleLike(content._id)}
                        />
                    ))}

                    {(activeTab === 'forYou' ? feed : trending).length === 0 && (
                        <div className="col-span-full glass-card p-8 text-center">
                            <p className="text-gray-400">{t('dashboard.noContent')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Load More */}
            {!loading && feed.length > 0 && (
                <div className="text-center mt-8">
                    <button className="btn-secondary">
                        {t('common.loadMore')}
                    </button>
                </div>
            )}
        </div>
    );
}
