import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';

export interface League {
    id: string;
    name: string;
    country: string;
    flag: string;
}

interface LeagueFilterProps {
    leagues: League[];
    selectedLeague: string | null;
    onSelectLeague: (league: string | null) => void;
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({
    leagues,
    selectedLeague,
    onSelectLeague,
}) => {
    const isAll = !selectedLeague || selectedLeague.toLowerCase() === 'all';

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Leagues */}                {leagues.map((league) => {
                    const active = selectedLeague === league.name;
                    return (
                        <TouchableOpacity
                            key={league.id}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => onSelectLeague(league.name)}
                            activeOpacity={0.7}
                        >
                            {league.flag ? (
                                <Text style={styles.flag}>{league.flag}</Text>
                            ) : null}
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                {league.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 6 },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.card,
        borderWidth: 1.5,
        borderColor: `${Colors.accent}60`,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    flag: { fontSize: 14 },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
});
