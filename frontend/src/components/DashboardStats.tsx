import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Match } from '../services/api';

interface DashboardStatsProps {
  matches: Match[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ matches }) => {
  const { colors } = useTheme();

  const stats = React.useMemo(() => {
    const totalMatches = matches.length;
    let highConfidence = 0;
    let qualifiedPicks = 0;
    let trapsDetected = 0;

    matches.forEach((match) => {
      // High confidence if any prediction > 60%
      if (
        match.prediction.over25.probability > 0.6 ||
        match.prediction.btts.probability > 0.6 ||
        (match.prediction.match_winner.confidence || 0) > 0.6
      ) {
        highConfidence++;
      }

      // Count qualified picks
      if (match.prediction.over25.is_qualified) qualifiedPicks++;
      if (match.prediction.btts.is_qualified) qualifiedPicks++;
      if (match.prediction.two_to_three_goals.is_qualified) qualifiedPicks++;
      if (match.prediction.low_scoring.is_qualified) qualifiedPicks++;
      if (match.prediction.match_winner.is_qualified) qualifiedPicks++;

      // Count traps
      if (match.trap.is_trap) trapsDetected++;
    });

    return { totalMatches, highConfidence, qualifiedPicks, trapsDetected };
  }, [matches]);

  const statItems = [
    {
      icon: 'football-outline' as const,
      label: 'MATCHES',
      value: stats.totalMatches,
      color: colors.primary,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'HIGH CONF',
      value: stats.highConfidence,
      color: colors.success,
    },
    {
      icon: 'trending-up-outline' as const,
      label: 'QUALIFIED',
      value: stats.qualifiedPicks,
      color: colors.primary,
    },
    {
      icon: 'warning-outline' as const,
      label: 'TRAPS',
      value: stats.trapsDetected,
      color: colors.error,
    },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((item, index) => (
        <View
          key={index}
          style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.statHeader}>
            <Ionicons name={item.icon} size={14} color={item.color} />
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
          </View>
          <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statCard: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DashboardStats;
