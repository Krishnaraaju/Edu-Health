/**
 * ContentCard.jsx - Content card component
 * Displays content preview with metrics and actions
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ContentCard({ content, onLike }) {
    const { t } = useTranslation();

    const typeIcons = {
        health: '🏥',
        education: '📚'
    };

    const truncate = (text, length = 120) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return (
        <article className="glass-card p-5 hover:scale-[1.02] transition-transform">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[content.type] || '📄'}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {t(`content.${content.type}`)}
                    </span>
                </div>
                {content.verified && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        ✓ {t('content.verified')}
                    </span>
                )}
            </div>

            {/* Title */}
            <Link to={`/content/${content._id}`}>
                <h3 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors mb-2">
                    {content.title}
                </h3>
            </Link>

            {/* Preview */}
            <p className="text-gray-400 text-sm mb-4">
                {truncate(content.summary || content.bodyMarkdown?.replace(/[#*_]/g, ''))}
            </p>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                        👁️ {content.metrics?.views || 0}
                    </span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onLike?.();
                        }}
                        className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                    >
                        ❤️ {content.metrics?.likes || 0}
                    </button>
                </div>

                {/* Language Badge */}
                <span className="text-xs text-gray-500">
                    {content.language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
                </span>
            </div>
        </article>
    );
}
