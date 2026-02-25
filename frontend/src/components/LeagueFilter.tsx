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
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default LeagueFilter;
