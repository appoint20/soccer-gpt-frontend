import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Match } from '../services/api';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const { colors } = useTheme();

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getQualifiedPicks = () => {
    const picks = [];
    if (match.prediction.over25.is_qualified) picks.push('O2.5');
    if (match.prediction.btts.is_qualified) picks.push('BTTS');
    if (match.prediction.two_to_three_goals.is_qualified) picks.push('2-3G');
    return picks;
  };

  const qualifiedPicks = getQualifiedPicks();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.leagueBadge, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.leagueText, { color: colors.accent }]}>{match.league}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(match.time)}</Text>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {match.home_team}
          </Text>
          <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.rankText, { color: colors.primary }]}>#{match.home_stats.rank}</Text>
          </View>
        </View>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {match.away_team}
          </Text>
          <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.rankText, { color: colors.primary }]}>#{match.away_stats.rank}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.picksContainer}>
          {qualifiedPicks.length > 0 ? (
            qualifiedPicks.map((pick, index) => (
              <View key={index} style={[styles.pickBadge, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={[styles.pickText, { color: colors.success }]}>{pick}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noPicksText, { color: colors.textMuted }]}>No qualified picks</Text>
          )}
        </View>
        {match.trap.is_trap && (
          <View style={[styles.trapBadge, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="warning" size={12} color={colors.warning} />
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leagueText: {
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    fontSize: 13,
    fontWeight: '500',
  },
  teamsContainer: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  picksContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
    flexWrap: 'wrap',
  },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pickText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noPicksText: {
    fontSize: 12,
  },
  trapBadge: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default MatchCard;
