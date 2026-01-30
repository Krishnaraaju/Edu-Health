/**
 * RegisterScreen.js - Registration screen for mobile app
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();
    const { t } = useI18n();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        setError('');

        const result = await register(name.trim(), email.trim(), password);

        if (!result.success) {
            setError(result.error || t('auth.registerError'));
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🏥</Text>
                    <Text style={styles.title}>{t('auth.createAccount')}</Text>
                    <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('auth.name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor="#64748b"
                            autoCapitalize="words"
                            autoComplete="name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('auth.email')}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            placeholderTextColor="#64748b"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('auth.password')}</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Min 8 characters"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            autoComplete="password-new"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            autoComplete="password-new"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t('auth.register')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomLink}>
                        <Text style={styles.linkText}>{t('auth.hasAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>{t('auth.login')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center'
    },
    header: {
        alignItems: 'center',
        marginBottom: 24
    },
    logo: {
        fontSize: 48,
        marginBottom: 12
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8'
    },
    form: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    errorBox: {
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderColor: 'rgba(239,68,68,0.5)',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 14
    },
    inputContainer: {
        marginBottom: 12
    },
    label: {
        color: '#cbd5e1',
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '500'
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 14,
        color: '#f8fafc',
        fontSize: 16
    },
    button: {
        backgroundColor: '#0891b2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    bottomLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    linkText: {
        color: '#94a3b8',
        fontSize: 14
    },
    link: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '600'
    }
});
