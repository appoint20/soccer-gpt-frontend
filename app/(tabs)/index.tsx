import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    Text,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LottieAnimation } from '../../src/components/LottieAnimation';
import { Colors } from '../../src/constants/colors';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StatGrid } from '../../src/components/StatGrid';
import { LeagueFilter, League } from '../../src/components/LeagueFilter';
import { SofascoreDatePicker } from '../../src/components/SofascoreDatePicker';
import { PastDayStats } from '../../src/components/PastDayStats';
import { MatchCard, Match } from '../../src/components/MatchCard';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { MatchDataCache } from '../../src/store/matchCache';

import { fetchMatchesFromApi, fetchLeaguesFromApi } from '../../src/services/apiClient';

// Helper to get country flag based on league name
const getFlagForLeague = (leagueName: string) => {
    if (leagueName.includes('Premier') || leagueName.includes('League') || leagueName.includes('Championship')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    if (leagueName.includes('La Liga')) return '🇪🇸';
    if (leagueName.includes('Bundesliga') || leagueName.includes('Liga')) return '🇩🇪';
    if (leagueName.includes('Serie')) return '🇮🇹';
    if (leagueName.includes('Ligue')) return '🇫🇷';
    return '⚽️';
};

// Helper to determine time block
function getTimeBlock(timeStr: string) {
    const [hours] = timeStr.split(':').map(Number);
    if (hours < 15 || (hours === 15 && timeStr !== '15:30')) return '12:00 - 15:30';
    if (hours < 18 || (hours === 18 && timeStr !== '18:30')) return '15:30 - 18:30';
    return '18:30 - 21:30+';
}

const qualifiedCount = (m: Match) =>
    [m.prediction.over25, m.prediction.btts, m.prediction.two_to_three_goals, m.prediction.low_scoring, m.prediction.match_winner]
        .filter((p) => p.is_qualified).length;

// Helper to reliably format confidence percentage whether the API sends 0.75 or 75
const parsePctRaw = (val?: number) => {
    if (!val) return 0;
    return Math.round(val);
};

// Module-level cache to prevent re-fetching when navigating back to the screen
const matchesCache: Record<string, { matches: Match[]; pastStats: any; rawMatches: any[] }> = {};

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'matches' | 'confidence' | 'picks' | 'traps' | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [pastStats, setPastStats] = useState<any>(null);
    const rawApiMatchesRef = useRef<any[]>([]);

    const loadData = async (dateObj: Date, forceRefresh = false) => {
        setRefreshing(true);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const lang = i18n.language || 'en';
        const cacheKey = `${dateStr}-${lang}`;

        // Load from cache if available and not forcing refresh
        if (!forceRefresh && matchesCache[cacheKey]) {
            setMatches(matchesCache[cacheKey].matches);
            setPastStats(matchesCache[cacheKey].pastStats);
            rawApiMatchesRef.current = matchesCache[cacheKey].rawMatches || [];
            setRefreshing(false);

            // Still load leagues in background if empty
            if (leagues.length === 0) {
                fetchLeaguesFromApi().then((apiLeagues: any) => {
                    if (apiLeagues && Array.isArray(apiLeagues)) {
                        const mappedLeagues = apiLeagues.map((l: any) => ({
                            id: l.id.toString(), name: l.name, country: l.name, flag: getFlagForLeague(l.name),
                        }));
                        setLeagues([{ id: 'all', name: 'All', country: 'World', flag: '🌍' }, ...mappedLeagues]);
                    }
                });
            }
            return;
        }

        // Load Leagues if empty
        if (leagues.length === 0) {
            const apiLeagues: any = await fetchLeaguesFromApi();
            if (apiLeagues && Array.isArray(apiLeagues)) {
                const mappedLeagues = apiLeagues.map((l: any) => ({
                    id: l.id.toString(),
                    name: l.name,
                    country: l.name, // The backend doesn't pass country, so re-using name
                    flag: getFlagForLeague(l.name),
                }));
                setLeagues([{ id: 'all', name: 'All', country: 'World', flag: '🌍' }, ...mappedLeagues]);
            }
        }

        const response: any = await fetchMatchesFromApi(dateStr, lang);

        if (response) {
            // The API response comes in as { matches: [], summary: {} } or an array
            const apiMatches = response.matches || (Array.isArray(response) ? response : []);
            // Store the raw API match objects for passing to the detail screen
            rawApiMatchesRef.current = apiMatches;

            const mappedMatches = apiMatches
                .filter((m: any) => !m.summary) // skip summary if inline
                .map((apiMatch: any) => {
                    const pred = apiMatch.prediction || {};

                    return {
                        id: apiMatch.id || apiMatch.Id,
                        date: apiMatch.date || apiMatch.Date || dateStr,
                        home: apiMatch.homeTeam || apiMatch.home_team || apiMatch.HomeTeam,
                        away: apiMatch.awayTeam || apiMatch.away_team || apiMatch.AwayTeam,
                        time: apiMatch.time || apiMatch.Time ? (apiMatch.time || apiMatch.Time).substring(0, 5) : '00:00',
                        league: apiMatch.league || apiMatch.League || apiMatch.leagueName || '',
                        flag: getFlagForLeague(apiMatch.league),
                        prediction: {
                            over25: {
                                value: pred.over25?.prediction ? 'YES' : 'NO',
                                confidence: Math.round(pred.over25?.probability || 0),
                                is_qualified: !!pred.over25?.is_qualified
                            },
                            btts: {
                                value: pred.btts?.prediction ? 'YES' : 'NO',
                                confidence: Math.round(pred.btts?.probability || 0),
                                is_qualified: !!pred.btts?.is_qualified
                            },
                            two_to_three_goals: {
                                value: pred.two_to_three_goals?.prediction ? 'YES' : 'NO',
                                confidence: Math.round(pred.two_to_three_goals?.probability || 0),
                                is_qualified: !!pred.two_to_three_goals?.is_qualified
                            },
                            low_scoring: {
                                value: pred.low_scoring?.prediction ? 'YES' : 'NO',
                                confidence: Math.round(pred.low_scoring?.probability || 0),
                                is_qualified: !!pred.low_scoring?.is_qualified
                            },
                            match_winner: {
                                value: pred.match_winner?.prediction ? pred.match_winner.prediction.toUpperCase() : 'DRAW',
                                confidence: Math.round(pred.match_winner?.confidence || 0),
                                is_qualified: !!pred.match_winner?.is_qualified
                            },
                        }
                    };
                });
            setMatches(mappedMatches);

            // Handle Past Stats property if bundled
            const summaryData = response.summary || (Array.isArray(response) ? response.find((r: any) => r.summary)?.summary : null);
            setPastStats(summaryData || null);

            // Save to cache
            matchesCache[cacheKey] = { matches: mappedMatches, pastStats: summaryData || null, rawMatches: apiMatches };
        } else {
            setMatches([]);
            setPastStats(null);
            matchesCache[cacheKey] = { matches: [], pastStats: null, rawMatches: [] };
        }
        setRefreshing(false);
    };

    React.useEffect(() => {
        loadData(selectedDate);
    }, [selectedDate, i18n.language]);

    const onRefresh = useCallback(() => {
        loadData(selectedDate, true);
    }, [selectedDate]);

    const leagueFilteredMatches = useMemo(() => {
        let result = matches;
        // Apply league filter in a strictly case-insensitive manner
        if (selectedLeague && selectedLeague.toLowerCase() !== 'all') {
            result = result.filter((m) => m.league?.toLowerCase().trim() === selectedLeague.toLowerCase().trim());
        }
        return result;
    }, [selectedLeague, matches]);

    const filteredMatches = useMemo(() => {
        let result = leagueFilteredMatches;

        // Apply active stat card filter
        if (activeFilter) {
            if (activeFilter === 'confidence') {
                result = result.filter(m => Object.values(m.prediction).some(p => p.is_qualified && p.confidence >= 80));
            } else if (activeFilter === 'picks') {
                result = result.filter(m => qualifiedCount(m) > 0);
            } else if (activeFilter === 'traps') {
                result = result.filter(m => m.prediction.low_scoring.is_qualified);
            }
        }

        return result;
    }, [leagueFilteredMatches, activeFilter]);

    // Group matches by time block
    const groupedMatches = useMemo(() => {
        const groups: Record<string, Match[]> = {};
        filteredMatches.forEach(match => {
            const block = getTimeBlock(match.time);
            if (!groups[block]) groups[block] = [];
            groups[block].push(match);
        });

        // Ensure consistent ordering
        const orderedBlocks = ['12:00 - 15:30', '15:30 - 18:30', '18:30 - 21:30+'];
        return orderedBlocks.map(block => ({
            title: block,
            data: groups[block] || []
        })).filter(g => g.data.length > 0);
    }, [filteredMatches]);

    // Stat calculations - Must use leagueFilteredMatches so numbers don't shrink when selecting a filter card!
    const highConf = leagueFilteredMatches.filter((m) =>
        Object.values(m.prediction).some((p) => p.is_qualified && p.confidence >= 80)
    ).length;
    const totalQualified = leagueFilteredMatches.reduce((acc, m) => acc + qualifiedCount(m), 0);
    const traps = leagueFilteredMatches.filter((m) => m.prediction.low_scoring.is_qualified).length;

    const isPastDate = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(selectedDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    }, [selectedDate]);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* View Headers */}
                <ScreenHeader
                    title={t('upcomingMatches', 'Upcoming Matches')}
                    subtitle={t('aiDrivenAnalytics', 'AI-Driven Match Analytics: Team Stats & Mathematical Probabilities')}
                />


                {/* Stat Cards - Only show on today/future */}
                {!isPastDate && (
                    <StatGrid
                        matchCount={leagueFilteredMatches.length}
                        highConfidenceCount={highConf}
                        qualifiedPicksCount={totalQualified}
                        trapsCount={traps}
                        activeFilter={activeFilter}
                        onSelectFilter={setActiveFilter}
                    />
                )}

                {/* Past Day Stats Summary - Only show on past dates */}
                {isPastDate && pastStats && pastStats.total_matches > 0 && (
                    <PastDayStats
                        correctMatches={pastStats.correct_matches || 0}
                        totalMatches={pastStats.total_matches || 0}
                        accuracyRate={pastStats.accuracy_rate || 0}
                    />
                )}

                {/* League Filter */}
                <LeagueFilter
                    leagues={leagues}
                    selectedLeague={selectedLeague}
                    onSelectLeague={setSelectedLeague}
                />

                {/* Date Picker */}
                <SofascoreDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

                {/* Loading animation or Matches */}
                {refreshing && matches.length === 0 ? (
                    <View style={styles.lottieContainer}>
                        <LottieAnimation
                            source={require('../../assets/Loading.json')}
                            autoPlay
                            loop
                            style={{ width: 120, height: 120 }}
                        />
                    </View>
                ) : (
                    <View style={styles.matchesSection}>
                        {groupedMatches.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="football-outline" size={40} color={Colors.textMuted} />
                                <Text style={styles.emptyText}>{t('noMatches', 'No matches for this filter')}</Text>
                            </View>
                        ) : (
                            groupedMatches.map(group => (
                                <View key={group.title} style={styles.groupContainer}>
                                    <Text style={styles.groupTitle}>{group.title}</Text>
                                    {group.data.map((match) => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            onPress={() => {
                                                const raw = rawApiMatchesRef.current.find((m: any) =>
                                                    (m.id || m.fixture_id || m.Id)?.toString() === match.id?.toString()
                                                );
                                                if (raw) MatchDataCache.set(match.id.toString(), raw);
                                                router.push({ pathname: '/match/[id]', params: { id: match.id.toString() } });
                                            }}
                                        />
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* Bottom padding for floating nav */}
                <View style={{ height: 130 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scroll: { flex: 1 },
    scrollContent: { paddingTop: 4 },

    matchesSection: { paddingTop: 4 },

    groupContainer: {
        marginBottom: 16,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textMuted,
        marginLeft: 16,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    emptyState: { alignItems: 'center', paddingTop: 40, gap: 10 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    lottieContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
});
