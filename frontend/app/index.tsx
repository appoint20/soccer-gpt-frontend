import React, { useState, useEffect, useCallback } from 'react';
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
import { fetchLeagues, fetchMatches, League, Match } from '../src/services/api';
import MatchCard from '../src/components/MatchCard';
import LeagueFilter from '../src/components/LeagueFilter';

interface TimeGroup {
  label: string;
  startHour: number;
  endHour: number;
  matches: Match[];
}

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
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

  const filteredMatches = selectedLeague
    ? matches.filter((m) => m.league === selectedLeague)
    : matches;

  const groupMatchesByTime = (matchList: Match[]): TimeGroup[] => {
    const groups: TimeGroup[] = [
      { label: '12:00 - 15:00', startHour: 12, endHour: 15, matches: [] },
      { label: '15:00 - 18:00', startHour: 15, endHour: 18, matches: [] },
      { label: '18:00 - 22:00', startHour: 18, endHour: 22, matches: [] },
    ];

    matchList.forEach((match) => {
      const hour = parseInt(match.time.split(':')[0], 10);
      if (hour >= 12 && hour < 15) {
        groups[0].matches.push(match);
      } else if (hour >= 15 && hour < 18) {
        groups[1].matches.push(match);
      } else if (hour >= 18 && hour < 22) {
        groups[2].matches.push(match);
      } else {
        // For matches outside these ranges, add to closest group
        if (hour < 12) {
          groups[0].matches.push(match);
        } else {
          groups[2].matches.push(match);
        }
      }
    });

    return groups.filter((g) => g.matches.length > 0);
  };

  const timeGroups = groupMatchesByTime(filteredMatches);

  const navigateToMatch = (match: Match) => {
    router.push({
      pathname: '/match/[id]',
      params: { id: match.id.toString(), matchData: JSON.stringify(match) },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Soccer AI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-Powered Match Analysis</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Ionicons
            name={theme === 'dark' ? 'sunny' : 'moon'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <LeagueFilter
        leagues={leagues}
        selectedLeague={selectedLeague}
        onSelectLeague={setSelectedLeague}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredMatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches Today</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Check back later for upcoming match analysis
            </Text>
          </View>
        ) : (
          timeGroups.map((group, index) => (
            <View key={index} style={styles.timeGroup}>
              <View style={styles.timeGroupHeader}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.timeGroupLabel, { color: colors.primary }]}>
                  {group.label}
                </Text>
                <Text style={[styles.matchCount, { color: colors.textMuted }]}>
                  {group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}
                </Text>
              </View>
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onPress={() => navigateToMatch(match)}
                />
              ))}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  themeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  timeGroup: {
    marginTop: 16,
  },
  timeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 6,
  },
  timeGroupLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchCount: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  bottomPadding: {
    height: 32,
  },
});
