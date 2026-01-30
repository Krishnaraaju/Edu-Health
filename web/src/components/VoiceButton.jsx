/**
 * VoiceButton.jsx - Voice input button component
 * Animated microphone button for speech input
 */

export default function VoiceButton({ isListening, onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-full transition-all ${isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                } ${className}`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
            {isListening ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h12v12H6z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            )}
        </button>
    );
}
