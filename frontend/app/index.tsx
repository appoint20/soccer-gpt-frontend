import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { fetchLeagues, fetchMatches, League, Match } from '../src/services/api';
import { getLeagueFlag } from '../src/utils/leagueFlags';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'qualified' | 'time'>('qualified');
  const [showSortModal, setShowSortModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaguesData, matchesData] = await Promise.all([
        fetchLeagues(),
        fetchMatches(getCurrentDate()),
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
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

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

  // Count qualified picks for a match
  const getQualifiedCount = (match: Match) => {
    let count = 0;
    if (match.prediction.over25.is_qualified) count++;
    if (match.prediction.btts.is_qualified) count++;
    if (match.prediction.two_to_three_goals.is_qualified) count++;
    if (match.prediction.low_scoring.is_qualified) count++;
    if (match.prediction.match_winner.is_qualified) count++;
    return count;
  };

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let result = selectedLeague
      ? matches.filter((m) => m.league === selectedLeague)
      : matches;

    if (sortBy === 'qualified') {
      result = [...result].sort((a, b) => getQualifiedCount(b) - getQualifiedCount(a));
    } else {
      result = [...result].sort((a, b) => a.time.localeCompare(b.time));
    }

    return result;
  }, [matches, selectedLeague, sortBy]);

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
          {/* Header */}
          <View style={styles.matchHeader}>
            <View style={[styles.leagueBadge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={styles.leagueFlag}>{getLeagueFlag(match.league)}</Text>
              <Text style={[styles.leagueName, { color: colors.accent }]}>{match.league}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formatTime(match.time)}</Text>
            </View>
          </View>

          {/* Teams in one line */}
          <View style={styles.teamsRow}>
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {match.home_team}
            </Text>
            <Text style={[styles.vsText, { color: colors.textMuted }]}>vs</Text>
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {match.away_team}
            </Text>
          </View>

          {/* Prediction Badge */}
          {prediction && (
            <View style={[styles.predictionBadge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={[styles.predictionText, { color: colors.success }]}>
                {prediction.name} ({prediction.prob}%)
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.matchFooter, { borderTopColor: colors.divider }]}>
            <Text style={[styles.qualifiedCount, { color: colors.primary }]}>
              {getQualifiedCount(match)} Qualified Pick{getQualifiedCount(match) !== 1 ? 's' : ''}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Upper Section - 1/3 of screen */}
      <View style={styles.upperSection}>
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
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="football-outline" size={12} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>MATCHES</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalMatches}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="shield-checkmark-outline" size={12} color={colors.success} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>HIGH CONF</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.highConfidence}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up-outline" size={12} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>QUALIFIED</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.qualifiedPicks}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Ionicons name="warning-outline" size={12} color={colors.error} />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>TRAPS</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.trapsDetected}</Text>
          </View>
        </View>

        {/* Sort Row */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="funnel-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.sortText, { color: colors.text }]}>
              {sortBy === 'qualified' ? 'By Qualified' : 'By Time'}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
          </TouchableOpacity>
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
      </View>

      {/* Lower Section - 2/3 of screen for matches */}
      <View style={styles.lowerSection}>
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
          >
            {filteredMatches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="football-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No matches available for today.
                </Text>
              </View>
            ) : (
              filteredMatches.map(renderMatchCard)
            )}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
            <TouchableOpacity
              style={[styles.modalOption, sortBy === 'qualified' && { backgroundColor: colors.primary + '20' }]}
              onPress={() => { setSortBy('qualified'); setShowSortModal(false); }}
            >
              <Ionicons name="checkmark-circle" size={20} color={sortBy === 'qualified' ? colors.primary : colors.textMuted} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>By Qualified Picks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, sortBy === 'time' && { backgroundColor: colors.primary + '20' }]}
              onPress={() => { setSortBy('time'); setShowSortModal(false); }}
            >
              <Ionicons name="time" size={20} color={sortBy === 'time' ? colors.primary : colors.textMuted} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>By Time</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperSection: {
    flex: 0,
    minHeight: 'auto',
  },
  lowerSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 10 },
  themeButton: { padding: 6 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4, gap: 6 },
  statCard: { flex: 1, padding: 6, borderRadius: 8, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  statLabel: { fontSize: 7, fontWeight: '600' },
  statValue: { fontSize: 16, fontWeight: '700' },
  sortRow: { paddingHorizontal: 12, paddingVertical: 4 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  sortText: { fontSize: 12 },
  leagueChips: { paddingHorizontal: 12, paddingVertical: 4, height: 40 },
  leagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
    gap: 4,
    height: 28,
  },
  chipFlag: { fontSize: 12 },
  leagueChipText: { fontSize: 11, fontWeight: '500' },
  matchesList: { flex: 1 },
  cardWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    position: 'relative',
  },
  trapOverlay: {
    position: 'absolute',
    top: -8,
    right: 8,
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
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  leagueFlag: { fontSize: 12 },
  leagueName: { fontSize: 10, fontWeight: '600' },
  timeContainer: {},
  timeText: { fontSize: 12, fontWeight: '500' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 8 },
  teamName: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'center' },
  vsText: { fontSize: 12, fontWeight: '400' },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  predictionText: { fontSize: 12, fontWeight: '600' },
  matchFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  qualifiedCount: { fontSize: 12, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptySubtitle: { fontSize: 13, marginTop: 4 },
  bottomPadding: { height: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8, gap: 12 },
  modalOptionText: { fontSize: 15, fontWeight: '500' },
});
