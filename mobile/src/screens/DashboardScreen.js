/**
 * DashboardScreen.js - Main dashboard for mobile app
 * Shows personalized feed with content cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { feedAPI, contentAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
    const { user } = useAuth();
    const { t } = useI18n();

    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('forYou');

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'forYou'
                ? await feedAPI.getFeed({ limit: 20 })
                : await feedAPI.getTrending({ limit: 20 });

            if (response.data.success) {
                setFeed(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFeed();
        setRefreshing(false);
    }, [activeTab]);

    const handleLike = async (contentId) => {
        try {
            await contentAPI.likeContent(contentId);
            setFeed(prev => prev.map(item =>
                item._id === contentId
                    ? { ...item, metrics: { ...item.metrics, likes: (item.metrics?.likes || 0) + 1 } }
                    : item
            ));
        } catch (error) {
            console.error('Like failed:', error);
        }
    };

    const renderContentCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardType}>
                    <Text style={styles.cardTypeIcon}>
                        {item.type === 'health' ? '🏥' : '📚'}
                    </Text>
                    <Text style={styles.cardTypeText}>{item.type}</Text>
                </View>
                {item.verified && (
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                )}
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            <Text style={styles.cardSummary} numberOfLines={3}>
                {item.summary || item.bodyMarkdown?.substring(0, 120)}
            </Text>

            {item.tags?.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, i) => (
                        <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.cardFooter}>
                <View style={styles.metrics}>
                    <Text style={styles.metricText}>👁️ {item.metrics?.views || 0}</Text>
                    <TouchableOpacity
                        onPress={() => handleLike(item._id)}
                        style={styles.likeButton}
                    >
                        <Text style={styles.metricText}>❤️ {item.metrics?.likes || 0}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.langBadge}>
                    {item.language === 'hi' ? '🇮🇳' : '🇬🇧'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}
                    </Text>
                    <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'forYou' && styles.tabActive]}
                    onPress={() => { setActiveTab('forYou'); loadFeed(); }}
                >
                    <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
                        {t('dashboard.forYou')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
                    onPress={() => { setActiveTab('trending'); loadFeed(); }}
                >
                    <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
                        {t('dashboard.trending')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22d3ee" />
                </View>
            ) : (
                <FlatList
                    data={feed}
                    renderItem={renderContentCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#22d3ee"
                            colors={['#22d3ee']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('dashboard.noContent')}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a'
    },
    header: {
        padding: 20,
        paddingBottom: 10
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc'
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 10
    },
    tab: {
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    tabActive: {
        borderBottomColor: '#22d3ee'
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '500'
    },
    tabTextActive: {
        color: '#22d3ee'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {
        padding: 16,
        gap: 16
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    cardType: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    cardTypeIcon: {
        fontSize: 16
    },
    cardTypeText: {
        color: '#94a3b8',
        fontSize: 12,
        textTransform: 'uppercase'
    },
    verifiedBadge: {
        backgroundColor: 'rgba(34,197,94,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    verifiedText: {
        color: '#4ade80',
        fontSize: 11
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f8fafc',
        marginBottom: 8
    },
    cardSummary: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
        marginBottom: 12
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    tagText: {
        color: '#cbd5e1',
        fontSize: 12
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12
    },
    metrics: {
        flexDirection: 'row',
        gap: 16
    },
    metricText: {
        color: '#94a3b8',
        fontSize: 13
    },
    likeButton: {
        paddingHorizontal: 4
    },
    langBadge: {
        fontSize: 14
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16
    }
});
