import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { getLeagueFlag } from '../src/utils/leagueFlags';

const { width, height } = Dimensions.get('window');

// Mock combination data
const mockCombinations = [
  {
    id: 1,
    type: 'Double',
    totalOdds: 3.45,
    confidence: 72,
    matches: [
      { id: 1, home: 'Man City', away: 'Arsenal', pick: 'Over 2.5', league: 'Premier League', time: '15:00', odds: 1.85 },
      { id: 2, home: 'Bayern', away: 'Dortmund', pick: 'BTTS', league: 'Bundesliga', time: '17:30', odds: 1.87 },
    ],
  },
  {
    id: 2,
    type: 'Triple',
    totalOdds: 5.21,
    confidence: 65,
    matches: [
      { id: 3, home: 'Barcelona', away: 'Real Madrid', pick: 'Over 2.5', league: 'La Liga', time: '20:00', odds: 1.75 },
      { id: 4, home: 'PSG', away: 'Lyon', pick: 'BTTS', league: 'Ligue 1', time: '21:00', odds: 1.82 },
      { id: 5, home: 'Inter', away: 'Milan', pick: 'Over 2.5', league: 'Serie A', time: '18:00', odds: 1.64 },
    ],
  },
  {
    id: 3,
    type: 'Double',
    totalOdds: 4.12,
    confidence: 68,
    matches: [
      { id: 6, home: 'Liverpool', away: 'Chelsea', pick: 'BTTS', league: 'Premier League', time: '16:30', odds: 1.90 },
      { id: 7, home: 'Juventus', away: 'Roma', pick: 'Over 2.5', league: 'Serie A', time: '20:45', odds: 2.17 },
    ],
  },
  {
    id: 4,
    type: 'Single',
    totalOdds: 1.95,
    confidence: 78,
    matches: [
      { id: 8, home: 'Atletico', away: 'Sevilla', pick: 'Under 2.5', league: 'La Liga', time: '19:00', odds: 1.95 },
    ],
  },
];

export default function CombinationsScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedCombinations, setSavedCombinations] = useState<number[]>([]);
  const [skippedCombinations, setSkippedCombinations] = useState<number[]>([]);

  const currentCombo = mockCombinations[currentIndex];

  const handleSwipeLeft = () => {
    if (currentIndex < mockCombinations.length - 1) {
      setSkippedCombinations([...skippedCombinations, currentCombo.id]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < mockCombinations.length - 1) {
      setSavedCombinations([...savedCombinations, currentCombo.id]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setSavedCombinations([]);
    setSkippedCombinations([]);
  };

  if (currentIndex >= mockCombinations.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Combinations</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-curated betting combos</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All Done!</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You've reviewed all combinations
          </Text>
          <Text style={[styles.statsText, { color: colors.primary }]}>
            Saved: {savedCombinations.length} | Skipped: {skippedCombinations.length}
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.primary }]}
            onPress={resetCards}
          >
            <Text style={styles.resetButtonText}>Review Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Combinations</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Swipe right to save, left to skip</Text>
      </View>

      <View style={styles.cardCounter}>
        <Text style={[styles.counterText, { color: colors.textMuted }]}>
          {currentIndex + 1} / {mockCombinations.length}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>{currentCombo.type}</Text>
            </View>
            <View style={styles.oddsContainer}>
              <Text style={[styles.oddsLabel, { color: colors.textMuted }]}>Total Odds</Text>
              <Text style={[styles.oddsValue, { color: colors.success }]}>{currentCombo.totalOdds.toFixed(2)}</Text>
            </View>
          </View>

          {/* Confidence */}
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${currentCombo.confidence}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.confidenceText, { color: colors.primary }]}>{currentCombo.confidence}%</Text>
          </View>

          {/* Matches */}
          <View style={styles.matchesContainer}>
            {currentCombo.matches.map((match, index) => (
              <View key={match.id} style={[styles.matchItem, { borderBottomColor: colors.divider }]}>
                <View style={styles.matchLeague}>
                  <Text style={styles.matchFlag}>{getLeagueFlag(match.league)}</Text>
                  <Text style={[styles.matchLeagueName, { color: colors.textMuted }]}>{match.league}</Text>
                  <Text style={[styles.matchTime, { color: colors.textMuted }]}>{match.time}</Text>
                </View>
                <View style={styles.matchTeams}>
                  <Text style={[styles.matchTeamText, { color: colors.text }]}>
                    {match.home} vs {match.away}
                  </Text>
                </View>
                <View style={styles.matchPick}>
                  <View style={[styles.pickBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.pickText, { color: colors.success }]}>{match.pick}</Text>
                  </View>
                  <Text style={[styles.pickOdds, { color: colors.textSecondary }]}>@ {match.odds.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
          onPress={handleSwipeLeft}
        >
          <Ionicons name="close" size={32} color={colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
          onPress={handleSwipeRight}
        >
          <Ionicons name="checkmark" size={32} color={colors.success} />
        </TouchableOpacity>
      </View>

      {/* Saved Counter */}
      <View style={styles.savedCounter}>
        <View style={[styles.savedBadge, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="bookmark" size={14} color={colors.success} />
          <Text style={[styles.savedText, { color: colors.success }]}>Saved: {savedCombinations.length}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  cardCounter: { alignItems: 'center', marginVertical: 8 },
  counterText: { fontSize: 13 },
  cardContainer: { flex: 1, paddingHorizontal: 16, justifyContent: 'center' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  typeText: { fontSize: 14, fontWeight: '600' },
  oddsContainer: { alignItems: 'flex-end' },
  oddsLabel: { fontSize: 10 },
  oddsValue: { fontSize: 20, fontWeight: '700' },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  confidenceBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 3 },
  confidenceText: { fontSize: 14, fontWeight: '600' },
  matchesContainer: { gap: 12 },
  matchItem: { borderBottomWidth: 1, paddingBottom: 12 },
  matchLeague: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  matchFlag: { fontSize: 14 },
  matchLeagueName: { fontSize: 11, flex: 1 },
  matchTime: { fontSize: 11 },
  matchTeams: { marginBottom: 6 },
  matchTeamText: { fontSize: 14, fontWeight: '600' },
  matchPick: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pickText: { fontSize: 12, fontWeight: '600' },
  pickOdds: { fontSize: 12 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 20 },
  actionButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  skipButton: {},
  saveButton: {},
  savedCounter: { alignItems: 'center', paddingBottom: 16 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  savedText: { fontSize: 13, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8 },
  statsText: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  resetButton: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  resetButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
