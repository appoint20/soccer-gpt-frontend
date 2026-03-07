import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export interface ComboMatch {
    id: number;
    league: string;
    home: string;
    away: string;
    time: string;
    pick: string;
    confidence: number;
    odds: number;
    isHit?: boolean;
}

export interface CombinationData {
    id: number;
    score: number;
    type: string; // 'LOW', 'MEDIUM', 'HIGH'
    date: string;
    reason?: string;
    matches: ComboMatch[];
}

interface CombinationCardProps {
    combo: CombinationData;
}

export const CombinationCard: React.FC<CombinationCardProps> = ({ combo }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            {/* Top Dark Header Area */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Ionicons name="sparkles" size={14} color="#D946EF" style={styles.sparkleIcon} />
                    <Text style={styles.typeText}>{combo.type}</Text>
                </View>
                <Text style={styles.scoreText}>Odds: {combo.score.toFixed(2)}</Text>
            </View>

            {/* Matches Container (the inner slightly lighter block area) */}
            <View style={styles.matchesContainer}>
                {combo.matches.map((match, i) => (
                    <View key={match.id} style={[styles.matchRow, i > 0 && styles.matchSeparator]}>

                        {/* Match Row Top: League | Date/Time */}
                        <View style={styles.matchTopInfo}>
                            <View style={styles.leagueBadge}>
                                <Text style={styles.leagueText}>{match.league}</Text>
                            </View>
                            <Text style={styles.timeText}>{combo.date} • {match.time}</Text>
                        </View>

                        {/* Match Teams */}
                        <Text style={styles.teamsHeading}>{match.home} vs {match.away}</Text>

                        {/* Match Prediction row */}
                        <View style={styles.predictionRow}>
                            <Text style={styles.pickText}>{match.pick}</Text>
                            <Text style={styles.confidenceText}>
                                {match.confidence > 0
                                    ? t('confidenceLabel', { confidence: match.confidence })
                                    : `Odds: ${match.odds.toFixed(2)}`}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Inner Footer Note / Reason */}
            {combo.reason ? (
                <Text style={styles.footerNote}>{combo.reason}</Text>
            ) : (
                <Text style={styles.footerNote}>
                    {t('bundleInfo', { count: combo.matches.length })}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#4B5563', // A dark grey exactly like the mockup
        borderRadius: 20,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sparkleIcon: {
        marginBottom: 2,
    },
    typeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    scoreText: {
        color: '#D1D5DB', // soft grey/white
        fontSize: 13,
        fontWeight: '500',
    },
    matchesContainer: {
        // Not a fully separate box, but padding area for matches
        paddingHorizontal: 16,
    },
    matchRow: {
        backgroundColor: '#374151', // Lighter dark shade for the match block
        borderRadius: 12,
        padding: 12,
        paddingBottom: 14,
        marginBottom: 8,
    },
    matchSeparator: {
        // No explicit separator as they are boxed, but keeps space if needed
    },
    matchTopInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leagueBadge: {
        backgroundColor: '#4E7D63', // Dark greenish matching design
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    leagueText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    timeText: {
        color: '#9CA3AF', // slate grey
        fontSize: 11,
    },
    teamsHeading: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    predictionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickText: {
        color: '#34D399', // bright green for BTTS Yes
        fontSize: 13,
        fontWeight: '800',
    },
    confidenceText: {
        color: '#FBBF24', // amber confidence text
        fontSize: 11,
        fontWeight: '600',
    },
    footerNote: {
        color: '#9CA3AF',
        fontSize: 11,
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        lineHeight: 16,
    },
});
