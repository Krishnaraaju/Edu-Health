/**
 * Chat.jsx - AI Chatbot page
 * Handles conversation with LLM including voice input/output
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import MessageBubble from '../components/MessageBubble';
import VoiceButton from '../components/VoiceButton';

export default function Chat() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { speak, stopSpeaking, isSpeaking, startListening, isListening, transcript } = useSpeech({
        lang: user?.preferences?.languages?.[0] || 'en'
    });

    // Initialize with welcome message
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                text: t('chat.welcomeMessage'),
                timestamp: new Date()
            }
        ]);
    }, [t]);

    // Handle voice input transcript
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setError(null);

        // Add user message to UI
        setMessages(prev => [...prev, {
            role: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        setIsLoading(true);

        try {
            const response = await chatAPI.sendMessage(userMessage, conversationId);

            if (response.success) {
                setConversationId(response.data.conversationId);

                const assistantMessage = {
                    role: 'assistant',
                    text: response.data.response,
                    timestamp: new Date(),
                    metadata: response.data.metadata
                };

                setMessages(prev => [...prev, assistantMessage]);

                // Text-to-speech if enabled
                if (user?.preferences?.voiceEnabled) {
                    speak(response.data.response);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.message || t('chat.error'));

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: t('chat.errorMessage'),
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (isListening) {
            // Submit when done listening
            setTimeout(() => {
                if (input.trim()) {
                    handleSubmit();
                }
            }, 500);
        } else {
            startListening();
        }
    };

    const handleNewChat = () => {
        setMessages([{
            role: 'assistant',
            text: t('chat.welcomeMessage'),
            timestamp: new Date()
        }]);
        setConversationId(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {t('chat.title')}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {t('chat.subtitle')}
                    </p>
                </div>
                <button
                    onClick={handleNewChat}
                    className="btn-secondary text-sm"
                >
                    {t('chat.newChat')}
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={index}
                        message={msg}
                        onSpeak={() => speak(msg.text)}
                        onStop={stopSpeaking}
                        isSpeaking={isSpeaking}
                    />
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">{t('chat.thinking')}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="mt-2 text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chat.inputPlaceholder')}
                            className="input-field pr-12"
                            disabled={isLoading}
                        />
                        {user?.preferences?.voiceEnabled && (
                            <VoiceButton
                                isListening={isListening}
                                onClick={handleVoiceInput}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="btn-primary px-6 disabled:opacity-50"
                    >
                        {t('chat.send')}
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center mt-3">
                    {t('chat.disclaimer')}
                </p>
            </form>
        </div>
    );
}
