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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { fetchLeagues, fetchMatches, League, Match } from '../src/services/api';
import { getLeagueFlag } from '../src/utils/leagueFlags';

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const renderFormBadge = (result: string, index: number) => {
    const bgColor =
      result === 'W' ? colors.success : result === 'D' ? colors.warning : colors.error;
    return (
      <View key={index} style={[styles.formBadge, { backgroundColor: bgColor }]}>
        <Text style={styles.formBadgeText}>{result}</Text>
      </View>
    );
  };

  const renderMatchCard = (match: Match) => {
    const qualifiedCount = getQualifiedCount(match);
    
    return (
      <TouchableOpacity
        key={match.id}
        style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigateToMatch(match)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.matchHeader}>
          <View style={[styles.leagueBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={styles.leagueFlag}>{getLeagueFlag(match.league)}</Text>
            <Text style={[styles.leagueName, { color: colors.accent }]}>{match.league}</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.dateTime, { color: colors.textMuted }]}>
              {formatDate(match.date)}, {formatTime(match.time)}
            </Text>
          </View>
        </View>

        {/* Teams */}
        <View style={styles.teamsContainer}>
          {/* Home Team */}
          <View style={styles.teamRow}>
            <View style={[styles.teamBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.teamInitial, { color: colors.primary }]}>
                {match.home_team.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, { color: colors.text }]}>{match.home_team}</Text>
              <View style={styles.formRow}>
                {match.home_stats.form.split('').slice(0, 5).map((r, i) => renderFormBadge(r, i))}
              </View>
            </View>
            <Text style={[styles.vsText, { color: colors.textMuted }]}>vs</Text>
          </View>

          {/* Away Team */}
          <View style={styles.teamRow}>
            <View style={[styles.teamBadge, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.teamInitial, { color: colors.error }]}>
                {match.away_team.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, { color: colors.text }]}>{match.away_team}</Text>
              <View style={styles.formRow}>
                {match.away_stats.form.split('').slice(0, 5).map((r, i) => renderFormBadge(r, i))}
              </View>
            </View>
          </View>
        </View>

        {/* Footer with qualified picks */}
        <View style={[styles.matchFooter, { borderTopColor: colors.divider }]}>
          {qualifiedCount > 0 ? (
            <View style={[styles.qualifiedBadge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.qualifiedText, { color: colors.success }]}>
                {qualifiedCount} Qualified Pick{qualifiedCount !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noPicksText, { color: colors.textMuted }]}>No qualified picks</Text>
          )}
          {match.trap.is_trap && (
            <View style={[styles.trapBadge, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="warning" size={14} color={colors.warning} />
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="football" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Match<Text style={{ color: colors.primary }}>Analyst</Text></Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-powered match analysis</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
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

      {/* Filters Row */}
      <View style={styles.filtersRow}>
        {/* League Filter Dropdown */}
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setSelectedLeague(selectedLeague ? null : leagues[0]?.name)}
        >
          <Ionicons name="filter-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>
            {selectedLeague || 'All Leagues'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Sort Dropdown */}
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={[styles.filterText, { color: colors.text }]}>
            {sortBy === 'qualified' ? 'By Qualified' : 'By Time'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
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

      {/* Matches List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading matches...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
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
  themeButton: { padding: 6 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  statCard: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  statLabel: { fontSize: 8, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '700' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginVertical: 6 },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  filterText: { flex: 1, fontSize: 13 },
  leagueChips: { paddingHorizontal: 12, paddingVertical: 4, gap: 6, height: 44 },
  leagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
    gap: 4,
    height: 30,
  },
  chipFlag: { fontSize: 14 },
  leagueChipText: { fontSize: 12, fontWeight: '500' },
  content: { flex: 1 },
  matchCard: { marginHorizontal: 12, marginVertical: 6, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingBottom: 8 },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  leagueFlag: { fontSize: 14 },
  leagueName: { fontSize: 11, fontWeight: '600' },
  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateTime: { fontSize: 11 },
  teamsContainer: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamBadge: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  teamInitial: { fontSize: 12, fontWeight: '700' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  formRow: { flexDirection: 'row', gap: 2 },
  formBadge: { width: 18, height: 18, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  formBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  vsText: { fontSize: 12, fontWeight: '500', marginRight: 46 },
  matchFooter: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  qualifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  qualifiedText: { fontSize: 11, fontWeight: '600' },
  noPicksText: { fontSize: 11 },
  trapBadge: { marginLeft: 8, padding: 6, borderRadius: 8 },
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
