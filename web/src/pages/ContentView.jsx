/**
 * ContentView.jsx - Single content view page
 * Displays full content with markdown rendering
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ContentView() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadContent();
    }, [id]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const response = await contentAPI.getContentById(id);
            if (response.success) {
                setContent(response.data);
            }
        } catch (err) {
            setError(t('errors.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await contentAPI.likeContent(id);
            setContent(prev => ({
                ...prev,
                metrics: { ...prev.metrics, likes: prev.metrics.likes + 1 }
            }));
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    // Simple markdown to HTML
    const renderMarkdown = (text) => {
        if (!text) return '';
        return text
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
            .replace(/\n/g, '<br />');
    };

    if (loading) {
        return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
    }

    if (error || !content) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="glass-card p-8 text-center">
                    <p className="text-red-400 mb-4">{error || t('errors.notFound')}</p>
                    <button onClick={() => navigate(-1)} className="btn-primary">
                        {t('common.goBack')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <article className="glass-card p-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">
                            {content.type === 'health' ? '🏥' : '📚'}
                        </span>
                        <span className="text-sm text-gray-400 uppercase tracking-wide">
                            {t(`content.${content.type}`)}
                        </span>
                        {content.verified && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                ✓ {t('content.verified')}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                            {content.language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4">
                        {content.title}
                    </h1>

                    {/* Tags */}
                    {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {content.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content.bodyMarkdown) }}
                />

                {/* Source */}
                {content.sourceUrl && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400">
                            {t('content.source')}:{' '}
                            <a
                                href={content.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                {new URL(content.sourceUrl).hostname}
                            </a>
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-6 text-gray-400">
                        <span className="flex items-center gap-1">
                            👁️ {content.metrics?.views || 0} {t('content.views')}
                        </span>
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                        >
                            ❤️ {content.metrics?.likes || 0} {t('content.likes')}
                        </button>
                    </div>

                    <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
                        ← {t('common.goBack')}
                    </button>
                </div>
            </article>
        </div>
    );
}
