import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Match } from '../services/api';
import { getLeagueFlag } from '../utils/leagueFlags';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
    const { colors } = useTheme();

    const getQualifiedCount = () => {
        return [
            match.prediction.over25,
            match.prediction.btts,
            match.prediction.two_to_three_goals,
            match.prediction.low_scoring,
            match.prediction.match_winner
        ].filter(p => p.is_qualified).length;
    };

    const qualifiedCount = getQualifiedCount();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.leagueContainer}>
                    <Text style={styles.flag}>{getLeagueFlag(match.league)}</Text>
                    <Text style={[styles.leagueName, { color: colors.textSecondary }]}>{match.league}</Text>
                </View>
                <Text style={[styles.time, { color: colors.textMuted }]}>{match.time}</Text>
            </View>

            <View style={styles.teamsContainer}>
                <View style={styles.teamRow}>
                    <Text style={[styles.teamName, { color: colors.text }]}>{match.home}</Text>
                    {qualifiedCount > 2 && (
                        <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.success }]}>Top Pick</Text>
                        </View>
                    )}
                </View>
                <View style={styles.teamRow}>
                    <Text style={[styles.teamName, { color: colors.text }]}>{match.away}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.footer}>
                <View style={styles.predictionTags}>
                    {match.prediction.over25.is_qualified && (
                        <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
                            <Text style={[styles.tagText, { color: colors.primary }]}>Ov 2.5</Text>
                        </View>
                    )}
                    {match.prediction.btts.is_qualified && (
                        <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
                            <Text style={[styles.tagText, { color: colors.primary }]}>BTTS</Text>
                        </View>
                    )}
                    <Text style={[styles.moreTags, { color: colors.textMuted }]}>
                        {qualifiedCount > 2 ? `+${qualifiedCount - 2} more` : ''}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    leagueContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    flag: { fontSize: 14 },
    leagueName: { fontSize: 12, fontWeight: '500' },
    time: { fontSize: 11, fontWeight: '600' },
    teamsContainer: { gap: 4, marginBottom: 12 },
    teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    teamName: { fontSize: 16, fontWeight: '600' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    divider: { height: 1, width: '100%', marginBottom: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    predictionTags: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 10, fontWeight: '700' },
    moreTags: { fontSize: 10 },
});

export default MatchCard;
