/**
 * MessageBubble.jsx - Chat message bubble component
 * Displays user and assistant messages with formatting
 */

import { useTranslation } from 'react-i18next';

export default function MessageBubble({ message, onSpeak, onStop, isSpeaking }) {
    const { t } = useTranslation();
    const isUser = message.role === 'user';

    // Simple markdown-like formatting
    const formatText = (text) => {
        if (!text) return '';

        return text
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br />');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                        : message.isError
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-white/10 text-gray-100'
                    }`}
            >
                {/* Message Content */}
                <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
                />

                {/* Metadata footer for assistant messages */}
                {!isUser && !message.isError && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            {/* Disclaimer badge */}
                            {message.metadata?.hasDisclaimer && (
                                <span className="text-xs text-amber-400/80">
                                    ⚕️ {t('chat.healthAdvice')}
                                </span>
                            )}
                        </div>

                        {/* Voice button */}
                        <button
                            onClick={isSpeaking ? onStop : onSpeak}
                            className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                            title={isSpeaking ? t('chat.stopSpeaking') : t('chat.listen')}
                        >
                            {isSpeaking ? '⏹️' : '🔊'}
                        </button>
                    </div>
                )}

                {/* Timestamp */}
                <div className={`text-xs mt-1 ${isUser ? 'text-white/60' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
