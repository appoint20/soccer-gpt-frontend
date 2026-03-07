import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/context/AuthContext';
import { triggerDailySync } from '../../src/services/apiClient';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { theme, colors, setTheme } = useTheme();
    const { user } = useAuth();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScreenHeader
                title={t('settingsTitle', 'Settings')}
                subtitle={t('settingsSubtitle', 'Manage your preferences')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Theme Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('appearance', 'Appearance')}</Text>

                    <View style={styles.optionsRow}>
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.optionCard,
                                    { borderColor: colors.border },
                                    theme === mode && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                ]}
                                onPress={() => setTheme(mode as 'light' | 'dark' | 'system')}
                            >
                                <Ionicons
                                    name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'settings-outline'}
                                    size={24}
                                    color={theme === mode ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.optionText,
                                    { color: theme === mode ? colors.primary : colors.text }
                                ]}>
                                    {t(mode, mode.charAt(0).toUpperCase() + mode.slice(1))}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Language Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('language', 'Language')}</Text>

                    <View style={styles.optionsRow}>
                        {[
                            { code: 'en', label: 'english' },
                            { code: 'de', label: 'german' }
                        ].map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.optionCard,
                                    { borderColor: colors.border },
                                    i18n.language === lang.code && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                ]}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text style={styles.flagText}>{lang.code === 'en' ? '🇬🇧' : '🇩🇪'}</Text>
                                <Text style={[
                                    styles.optionText,
                                    { color: i18n.language === lang.code ? colors.primary : colors.text }
                                ]}>
                                    {t(lang.label, lang.label.charAt(0).toUpperCase() + lang.label.slice(1))}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Admin Section (Restricted to shivm) */}
                {user?.username === 'shivm' && (
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('admin', 'Admin Panel')}</Text>

                        <TouchableOpacity
                            style={[styles.syncButton, { backgroundColor: colors.primary }]}
                            onPress={async () => {
                                try {
                                    alert('Daily Sync started in the backend. This might take a few seconds.');
                                    await triggerDailySync();
                                    alert('Sync completed successfully!');
                                } catch (e: any) {
                                    alert(`Sync failed: ${e.message}`);
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.syncButtonText}>Trigger Daily Sync</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderWidth: 1,
        borderRadius: 12,
        gap: 8,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    flagText: {
        fontSize: 24,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
    },
    syncButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    }
});
