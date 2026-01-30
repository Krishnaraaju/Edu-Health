/**
 * ChatScreen.js - AI Chat screen for mobile app
 * Includes text-to-speech with expo-speech
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { chatAPI } from '../services/api';

export default function ChatScreen() {
    const { user } = useAuth();
    const { t, language } = useI18n();
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Initialize with welcome message
    useEffect(() => {
        setMessages([{
            id: '1',
            role: 'assistant',
            text: t('chat.welcomeMessage'),
            timestamp: new Date()
        }]);
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatAPI.sendMessage(userMessage.text, conversationId);

            if (response.data.success) {
                setConversationId(response.data.data.conversationId);

                const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: response.data.data.response,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, assistantMessage]);

                // Auto-speak if voice is enabled
                if (user?.preferences?.voiceEnabled) {
                    speak(assistantMessage.text);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: 'Sorry, I couldn\'t process your request. Please try again.',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const speak = async (text) => {
        // Stop any ongoing speech
        await Speech.stop();

        // Clean text for speech
        const cleanText = text
            .replace(/[*_#]/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .substring(0, 4000); // Speech limit

        setIsSpeaking(true);

        Speech.speak(cleanText, {
            language: language === 'hi' ? 'hi-IN' : 'en-US',
            rate: 0.9,
            pitch: 1.0,
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false)
        });
    };

    const stopSpeaking = async () => {
        await Speech.stop();
        setIsSpeaking(false);
    };

    const handleNewChat = () => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            text: t('chat.welcomeMessage'),
            timestamp: new Date()
        }]);
        setConversationId(null);
        stopSpeaking();
    };

    const renderMessage = ({ item }) => (
        <View
            style={[
                styles.messageBubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                item.isError && styles.errorBubble
            ]}
        >
            <Text style={[
                styles.messageText,
                item.role === 'user' && styles.userText
            ]}>
                {item.text}
            </Text>

            <View style={styles.messageFooter}>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>

                {item.role === 'assistant' && !item.isError && (
                    <TouchableOpacity
                        onPress={() => isSpeaking ? stopSpeaking() : speak(item.text)}
                        style={styles.speakButton}
                    >
                        <Text style={styles.speakIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('chat.title')}</Text>
                    <Text style={styles.subtitle}>{t('chat.subtitle')}</Text>
                </View>
                <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                    <Text style={styles.newChatText}>{t('chat.newChat')}</Text>
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListFooterComponent={
                    loading ? (
                        <View style={styles.loadingIndicator}>
                            <ActivityIndicator size="small" color="#22d3ee" />
                            <Text style={styles.loadingText}>{t('chat.thinking')}</Text>
                        </View>
                    ) : null
                }
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder={t('chat.inputPlaceholder')}
                        placeholderTextColor="#64748b"
                        multiline
                        maxLength={500}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!input.trim() || loading}
                    >
                        <Text style={styles.sendButtonText}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>{t('chat.disclaimer')}</Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc'
    },
    subtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2
    },
    newChatButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    newChatText: {
        color: '#22d3ee',
        fontSize: 13,
        fontWeight: '600'
    },
    messagesList: {
        padding: 16,
        flexGrow: 1
    },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#0891b2',
        borderBottomRightRadius: 4
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 4
    },
    errorBubble: {
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)'
    },
    messageText: {
        color: '#e2e8f0',
        fontSize: 15,
        lineHeight: 22
    },
    userText: {
        color: '#fff'
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8
    },
    timestamp: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11
    },
    speakButton: {
        padding: 4
    },
    speakIcon: {
        fontSize: 16
    },
    loadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 13
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#f8fafc',
        fontSize: 15,
        maxHeight: 100
    },
    sendButton: {
        backgroundColor: '#0891b2',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sendButtonDisabled: {
        opacity: 0.5
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    disclaimer: {
        color: '#64748b',
        fontSize: 11,
        textAlign: 'center',
        paddingBottom: 12,
        paddingHorizontal: 20
    }
});
