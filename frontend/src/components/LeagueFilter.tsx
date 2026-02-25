import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { League } from '../services/api';

interface LeagueFilterProps {
  leagues: League[];
  selectedLeague: string | null;
  onSelectLeague: (league: string | null) => void;
}

const LeagueFilter: React.FC<LeagueFilterProps> = ({ leagues, selectedLeague, onSelectLeague }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: selectedLeague === null ? colors.primary : colors.surface,
            borderColor: selectedLeague === null ? colors.primary : colors.border,
          },
        ]}
        onPress={() => onSelectLeague(null)}
      >
        <Text
          style={[
            styles.chipText,
            { color: selectedLeague === null ? '#FFFFFF' : colors.text },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      {leagues.map((league) => (
        <TouchableOpacity
          key={league.id}
          style={[
            styles.chip,
            {
              backgroundColor: selectedLeague === league.name ? colors.primary : colors.surface,
              borderColor: selectedLeague === league.name ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelectLeague(league.name)}
        >
          <Text
            style={[
              styles.chipText,
              { color: selectedLeague === league.name ? '#FFFFFF' : colors.text },
            ]}
            numberOfLines={1}
          >
            {league.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    height: 32,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LeagueFilter;
