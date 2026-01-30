/**
 * LoadingScreen.js - Loading/splash screen
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🏥</Text>
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text style={styles.text}>Health Assistant</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        fontSize: 64,
        marginBottom: 24
    },
    text: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16
    }
});
