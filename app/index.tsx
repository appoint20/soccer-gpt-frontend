import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useHomeData } from '../src/hooks/useHomeData';
import { Match } from '../src/services/api';
import DateSelector from '../src/components/DateSelector';
import MatchCard from '../src/components/MatchCard';
import DashboardStats from '../src/components/DashboardStats';
import LeagueFilter from '../src/components/LeagueFilter';

export default function HomeScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const router = useRouter();

    const {
        leagues,
        matches,
        selectedLeague,
        setSelectedLeague,
        selectedDate,
        setSelectedDate,
        loading,
        refreshing,
        onRefresh,
        filteredMatches,
    } = useHomeData();

    const navigateToMatch = (match: Match) => {
        router.push({
            pathname: '/match/[id]',
            params: { id: match.id.toString(), matchData: JSON.stringify(match) },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="football" size={18} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Match<Text style={{ color: colors.primary }}>Analyst</Text></Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-powered match analysis</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                    <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <DashboardStats matches={matches} />

            {/* League Chips */}
            <LeagueFilter
                leagues={leagues}
                selectedLeague={selectedLeague}
                onSelectLeague={setSelectedLeague}
            />

            {/* Date Selector */}
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

            {/* Matches List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading matches...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.matchesList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.matchesContent}
                >
                    {filteredMatches.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="football-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                No matches available for this date.
                            </Text>
                        </View>
                    ) : (
                        filteredMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onPress={() => navigateToMatch(match)}
                            />
                        ))
                    )}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { fontSize: 11 },
    themeButton: { padding: 8 },
    matchesList: { flex: 1 },
    matchesContent: { paddingTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
    emptySubtitle: { fontSize: 13, marginTop: 4 },
    bottomPadding: { height: 120 },
});
