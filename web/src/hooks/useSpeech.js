/**
 * useSpeech.js - Custom hook for Web Speech API
 * Provides text-to-speech and speech-to-text functionality
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const LANGUAGE_MAP = {
    en: 'en-US',
    hi: 'hi-IN'
};

export function useSpeech({ lang = 'en' } = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);
    const speechSynthesisRef = useRef(null);

    // Check browser support
    useEffect(() => {
        const speechSynthesisSupported = 'speechSynthesis' in window;
        const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

        setIsSupported({
            tts: speechSynthesisSupported,
            stt: speechRecognitionSupported
        });

        speechSynthesisRef.current = speechSynthesisSupported ? window.speechSynthesis : null;

        // Initialize speech recognition
        if (speechRecognitionSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = LANGUAGE_MAP[lang] || 'en-US';

            recognitionRef.current.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                setTranscript(result[0].transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [lang]);

    // Update language when it changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = LANGUAGE_MAP[lang] || 'en-US';
        }
    }, [lang]);

    // Text-to-Speech
    const speak = useCallback((text) => {
        if (!speechSynthesisRef.current || !text) return;

        // Cancel any ongoing speech
        speechSynthesisRef.current.cancel();

        // Clean text (remove markdown, emojis for cleaner speech)
        const cleanText = text
            .replace(/[*_#]/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/⚠️|🚨|📋/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = LANGUAGE_MAP[lang] || 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        // Select voice based on language
        const voices = speechSynthesisRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(LANGUAGE_MAP[lang]?.split('-')[0] || 'en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesisRef.current.speak(utterance);
    }, [lang]);

    const stopSpeaking = useCallback(() => {
        if (speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Speech-to-Text
    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            console.warn('Speech recognition not supported');
            return;
        }

        setTranscript('');
        setIsListening(true);

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return {
        // TTS
        speak,
        stopSpeaking,
        isSpeaking,

        // STT
        startListening,
        stopListening,
        isListening,
        transcript,

        // Support flags
        isSupported
    };
}

export default useSpeech;
