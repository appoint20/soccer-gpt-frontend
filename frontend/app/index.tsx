import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { fetchLeagues, fetchMatches, League, Match } from '../src/services/api';
import { getLeagueFlag } from '../src/utils/leagueFlags';
import DateSelector from '../src/components/DateSelector';

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = async (date: Date) => {
    try {
      setLoading(true);
      const [leaguesData, matchesData] = await Promise.all([
        fetchLeagues(),
        fetchMatches(formatDateForApi(date)),
      ]);
      setLeagues(leaguesData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(selectedDate);
  }, [selectedDate]);

  // Calculate stats
  const stats = useMemo(() => {
    let highConfidence = 0;
    let qualifiedPicks = 0;
    let trapsDetected = 0;

    matches.forEach((match) => {
      if (
        match.prediction.over25.probability > 0.6 ||
        match.prediction.btts.probability > 0.6 ||
        (match.prediction.match_winner.confidence || 0) > 0.6
      ) {
        highConfidence++;
      }
      if (match.prediction.over25.is_qualified) qualifiedPicks++;
      if (match.prediction.btts.is_qualified) qualifiedPicks++;
      if (match.prediction.two_to_three_goals.is_qualified) qualifiedPicks++;
      if (match.prediction.low_scoring.is_qualified) qualifiedPicks++;
      if (match.prediction.match_winner.is_qualified) qualifiedPicks++;
      if (match.trap.is_trap) trapsDetected++;
    });

    return { totalMatches: matches.length, highConfidence, qualifiedPicks, trapsDetected };
  }, [matches]);

  // Get highest qualified prediction
  const getHighestPrediction = (match: Match) => {
    const predictions = [
      { name: 'Over 2.5', prob: match.prediction.over25.probability, qualified: match.prediction.over25.is_qualified },
      { name: 'BTTS', prob: match.prediction.btts.probability, qualified: match.prediction.btts.is_qualified },
      { name: '2-3 Goals', prob: match.prediction.two_to_three_goals.probability, qualified: match.prediction.two_to_three_goals.is_qualified },
      { name: 'Under 2.5', prob: match.prediction.low_scoring.probability, qualified: match.prediction.low_scoring.is_qualified },
    ];
    
    const qualified = predictions.filter(p => p.qualified).sort((a, b) => b.prob - a.prob);
    if (qualified.length > 0) {
      return { name: qualified[0].name, prob: Math.round(qualified[0].prob * 100) };
    }
    return null;
  };

  // Filter matches
  const filteredMatches = useMemo(() => {
    let result = selectedLeague
      ? matches.filter((m) => m.league === selectedLeague)
      : matches;
    // Sort by qualified picks count
    result = [...result].sort((a, b) => {
      const aCount = [a.prediction.over25, a.prediction.btts, a.prediction.two_to_three_goals, a.prediction.low_scoring, a.prediction.match_winner].filter(p => p.is_qualified).length;
      const bCount = [b.prediction.over25, b.prediction.btts, b.prediction.two_to_three_goals, b.prediction.low_scoring, b.prediction.match_winner].filter(p => p.is_qualified).length;
      return bCount - aCount;
    });
    return result;
  }, [matches, selectedLeague]);

  const navigateToMatch = (match: Match) => {
    router.push({
      pathname: '/match/[id]',
      params: { id: match.id.toString(), matchData: JSON.stringify(match) },
    });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const renderMatchCard = (match: Match) => {
    const prediction = getHighestPrediction(match);
    const isTrap = match.trap.is_trap;
    
    // Get home/draw/away probabilities
    const homeProb = Math.round(match.models.poisson.home_win * 100);
    const drawProb = Math.round(match.models.poisson.draw * 100);
    const awayProb = Math.round(match.models.poisson.away_win * 100);
    
    return (
      <View key={match.id} style={styles.cardWrapper}>
        {/* Trap Icon Overlay */}
        {isTrap && (
          <View style={[styles.trapOverlay, { backgroundColor: colors.warning }]}>
            <Ionicons name="warning" size={14} color="#FFFFFF" />
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.matchCard,
            { 
              backgroundColor: colors.card, 
              borderColor: isTrap ? '#FFD700' : colors.border,
              borderWidth: isTrap ? 2 : 1,
            }
          ]}
          onPress={() => navigateToMatch(match)}
          activeOpacity={0.7}
        >
          {/* Header Row */}
          <View style={styles.matchHeader}>
            <View style={[styles.leagueBadge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={styles.leagueFlag}>{getLeagueFlag(match.league)}</Text>
              <Text style={[styles.leagueName, { color: colors.accent }]}>{match.league}</Text>
            </View>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(match.time)}</Text>
          </View>

          {/* Main Content Row */}
          <View style={styles.mainContent}>
            {/* Left: Teams with logos */}
            <View style={styles.teamsSection}>
              <View style={styles.teamRow}>
                <View style={[styles.teamLogo, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.teamLogoText, { color: colors.primary }]}>
                    {match.home_team.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                  {match.home_team}
                </Text>
              </View>
              <View style={styles.teamRow}>
                <View style={[styles.teamLogo, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.teamLogoText, { color: colors.error }]}>
                    {match.away_team.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                  {match.away_team}
                </Text>
              </View>
            </View>

            {/* Right: Prediction Badge */}
            {prediction && (
              <View style={[styles.predictionBadge, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.predictionName, { color: colors.success }]}>{prediction.name}</Text>
                <Text style={[styles.predictionProb, { color: colors.success }]}>{prediction.prob}%</Text>
              </View>
            )}
          </View>

          {/* Bottom: Home/Draw/Away Probability Chart */}
          <View style={styles.probContainer}>
            <View style={styles.probBar}>
              <View style={[styles.probSegment, { flex: homeProb, backgroundColor: colors.primary, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
              <View style={[styles.probSegment, { flex: drawProb, backgroundColor: colors.textMuted }]} />
              <View style={[styles.probSegment, { flex: awayProb, backgroundColor: colors.error, borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
            </View>
            <View style={styles.probLabels}>
              <Text style={[styles.probLabel, { color: colors.primary }]}>H {homeProb}%</Text>
              <Text style={[styles.probLabel, { color: colors.textMuted }]}>D {drawProb}%</Text>
              <Text style={[styles.probLabel, { color: colors.error }]}>A {awayProb}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
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

      {/* Stats Cards - 2x2 Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="football-outline" size={14} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>MATCHES</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalMatches}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>HIGH CONF</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.highConfidence}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up-outline" size={14} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>QUALIFIED</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.qualifiedPicks}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="warning-outline" size={14} color={colors.error} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>TRAPS</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.trapsDetected}</Text>
          </View>
        </View>
      </View>

      {/* League Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.leagueChips}
      >
        <TouchableOpacity
          style={[
            styles.leagueChip,
            {
              backgroundColor: selectedLeague === null ? colors.primary : colors.surface,
              borderColor: selectedLeague === null ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedLeague(null)}
        >
          <Text style={[styles.leagueChipText, { color: selectedLeague === null ? '#FFFFFF' : colors.text }]}>
            All
          </Text>
        </TouchableOpacity>
        {leagues.map((league) => (
          <TouchableOpacity
            key={league.id}
            style={[
              styles.leagueChip,
              {
                backgroundColor: selectedLeague === league.name ? colors.primary : colors.surface,
                borderColor: selectedLeague === league.name ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedLeague(league.name)}
          >
            <Text style={styles.chipFlag}>{getLeagueFlag(league.name)}</Text>
            <Text
              style={[
                styles.leagueChipText,
                { color: selectedLeague === league.name ? '#FFFFFF' : colors.text },
              ]}
              numberOfLines={1}
            >
              {league.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Selector - Under leagues */}
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
            filteredMatches.map(renderMatchCard)
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
  statsGrid: { paddingHorizontal: 12, gap: 8 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '700' },
  leagueChips: { paddingHorizontal: 12, paddingVertical: 8, height: 44 },
  leagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
    height: 32,
  },
  chipFlag: { fontSize: 14 },
  leagueChipText: { fontSize: 12, fontWeight: '500' },
  matchesList: { flex: 1 },
  matchesContent: { paddingTop: 4 },
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    position: 'relative',
  },
  trapOverlay: {
    position: 'absolute',
    top: -8,
    right: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  matchCard: {
    borderRadius: 14,
    overflow: 'hidden',
    padding: 14,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  leagueFlag: { fontSize: 14 },
  leagueName: { fontSize: 11, fontWeight: '600' },
  timeText: { fontSize: 13, fontWeight: '600' },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamsSection: { flex: 1, gap: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: { fontSize: 11, fontWeight: '700' },
  teamName: { fontSize: 14, fontWeight: '600', flex: 1 },
  predictionBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
  },
  predictionName: { fontSize: 11, fontWeight: '600' },
  predictionProb: { fontSize: 18, fontWeight: '700' },
  probContainer: { marginTop: 4 },
  probBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  probSegment: { height: '100%' },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  probLabel: { fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptySubtitle: { fontSize: 13, marginTop: 4 },
  bottomPadding: { height: 120 },
});
