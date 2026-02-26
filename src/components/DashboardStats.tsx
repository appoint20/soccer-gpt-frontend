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

    const totalMatches = matches.length;
    const highConfidence = matches.filter(m => {
        const counts = [
            m.prediction.over25,
            m.prediction.btts,
            m.prediction.two_to_three_goals,
            m.prediction.low_scoring,
            m.prediction.match_winner
        ].filter(p => p.is_qualified && p.confidence >= 80).length;
        return counts > 0;
    }).length;

    const bttsCount = matches.filter(m => m.prediction.btts.is_qualified).length;

    return (
        <View style={styles.container}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="calendar" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalMatches}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Matches</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                    <Ionicons name="flash" size={16} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{highConfidence}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hot Picks</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: '#F59E0B20' }]}>
                    <Ionicons name="flame" size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{bttsCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>BTTS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: { fontSize: 16, fontWeight: '700' },
    statLabel: { fontSize: 10, marginTop: 2, fontWeight: '500' },
});

export default DashboardStats;
