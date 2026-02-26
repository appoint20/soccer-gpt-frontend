import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.chip,
                        { backgroundColor: selectedLeague === null ? colors.primary : colors.card, borderColor: colors.border }
                    ]}
                    onPress={() => onSelectLeague(null)}
                >
                    <Text style={[styles.chipText, { color: selectedLeague === null ? '#FFFFFF' : colors.textSecondary }]}>
                        All Leagues
                    </Text>
                </TouchableOpacity>

                {leagues.map((league) => (
                    <TouchableOpacity
                        key={league.id}
                        style={[
                            styles.chip,
                            { backgroundColor: selectedLeague === league.name ? colors.primary : colors.card, borderColor: colors.border }
                        ]}
                        onPress={() => onSelectLeague(league.name)}
                    >
                        <Text style={[styles.chipText, { color: selectedLeague === league.name ? '#FFFFFF' : colors.textSecondary }]}>
                            {league.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 8 },
    scrollContent: { paddingHorizontal: 16, gap: 8 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: { fontSize: 13, fontWeight: '600' },
});

export default LeagueFilter;
