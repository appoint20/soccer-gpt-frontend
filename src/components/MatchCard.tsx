import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

type Prediction = { value: string; confidence: number; is_qualified: boolean };
export interface Match {
    id: number; home: string; away: string; time: string; league: string; flag?: string; date?: string;
    prediction: { over25: Prediction; btts: Prediction; two_to_three_goals: Prediction; low_scoring: Prediction; match_winner: Prediction };
}

interface MatchCardProps {
    match: Match;
    onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
    const { t } = useTranslation();

    // High confidence badges - user wants only ONE prediction badge showing (no hot picks)
    // Let's get the most confident one that is qualified
    const allPicks = [
        { key: 'Ov 2.5', p: match.prediction.over25 },
        { key: 'BTTS', p: match.prediction.btts },
        { key: '2-3 Goals', p: match.prediction.two_to_three_goals },
        { key: 'Low Scoring', p: match.prediction.low_scoring },
        { key: `Win ${match.prediction.match_winner.value}`, p: match.prediction.match_winner }
    ].filter(x => x.p.is_qualified).sort((a, b) => b.p.confidence - a.p.confidence);

    const topPick = allPicks.length > 0 ? allPicks[0] : null;

    // Home/Away initials
    const homeInitial = match.home.charAt(0).toUpperCase();
    const awayInitial = match.away.charAt(0).toUpperCase();

    // 1x2 Prediction Bar Logic based on Match Winner confidence
    let homePct = 33;
    let drawPct = 34;
    let awayPct = 33;
    if (match.prediction.match_winner.value === 'HOME') {
        homePct = match.prediction.match_winner.confidence;
        awayPct = (100 - homePct) / 2;
        drawPct = 100 - homePct - awayPct;
    } else if (match.prediction.match_winner.value === 'AWAY') {
        awayPct = match.prediction.match_winner.confidence;
        homePct = (100 - awayPct) / 2;
        drawPct = 100 - awayPct - homePct;
    } else {
        drawPct = match.prediction.match_winner.confidence;
        homePct = (100 - drawPct) / 2;
        awayPct = 100 - drawPct - homePct;
    }

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
            {/* Top Header Row */}
            <View style={styles.topRow}>
                {/* League Badge */}
                <View style={styles.leagueBadge}>
                    {match.flag && <Text style={styles.flag}>{match.flag}</Text>}
                    <Text style={styles.leagueName}>{match.league}</Text>
                </View>

                {/* Date & Time */}
                <View style={styles.timeWrapper}>
                    <Text style={styles.timeText}>{match.time}</Text>
                </View>
            </View>

            {/* Badges immediately under time */}
            <View style={styles.badgesWrapper}>
                {topPick && (
                    <View style={styles.pickBadge}>
                        <Text style={styles.pickBadgeText}>{topPick.key} ({topPick.p.confidence}%)</Text>
                    </View>
                )}
            </View>

            {/* Middle Row: Teams */}
            <View style={styles.teamsRow}>
                {/* Home Team grouped with its circle */}
                <View style={[styles.teamGroup, styles.homeGroup]}>
                    <View style={[styles.teamCircle, styles.homeCircle]}>
                        <Text style={[styles.circleText, styles.homeCircleText]}>{homeInitial}</Text>
                    </View>
                    <Text style={styles.teamNameText} numberOfLines={1}>{match.home}</Text>
                </View>

                {/* VS text in the absolute center */}
                <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>{t('vs', 'vs.')}</Text>
                </View>

                {/* Away Team grouped with its circle */}
                <View style={[styles.teamGroup, styles.awayGroup]}>
                    <Text style={styles.teamNameText} numberOfLines={1}>{match.away}</Text>
                    <View style={[styles.teamCircle, styles.awayCircle]}>
                        <Text style={[styles.circleText, styles.awayCircleText]}>{awayInitial}</Text>
                    </View>
                </View>
            </View>

            {/* Prediction Line Chart */}
            <View style={styles.chartWrapper}>
                {/* Labels row moving based on covered line areas */}
                <View style={styles.chartLabelsRow}>
                    <View style={[styles.labelSegment, { width: `${homePct}%` }]}>
                        {homePct > 20 ? (
                            <Text style={[styles.chartLabelText, { color: '#38BDF8' }]} numberOfLines={1}>
                                {t('home', 'Home')} ({Math.round(homePct)}%)
                            </Text>
                        ) : (
                            <Text style={[styles.chartLabelText, { color: '#38BDF8' }]} numberOfLines={1}>
                                {Math.round(homePct)}%
                            </Text>
                        )}
                    </View>
                    <View style={[styles.labelSegment, { width: `${drawPct}%` }]}>
                        {drawPct > 20 ? (
                            <Text style={[styles.chartLabelText, { color: '#A4C3B2' }]} numberOfLines={1}>
                                {t('draw', 'Draw')} ({Math.round(drawPct)}%)
                            </Text>
                        ) : (
                            <Text style={[styles.chartLabelText, { color: '#A4C3B2' }]} numberOfLines={1}>
                                {Math.round(drawPct)}%
                            </Text>
                        )}
                    </View>
                    <View style={[styles.labelSegment, { width: `${awayPct}%` }]}>
                        {awayPct > 20 ? (
                            <Text style={[styles.chartLabelText, { color: '#D52941' }]} numberOfLines={1}>
                                {t('away', 'Away')} ({Math.round(awayPct)}%)
                            </Text>
                        ) : (
                            <Text style={[styles.chartLabelText, { color: '#D52941' }]} numberOfLines={1}>
                                {Math.round(awayPct)}%
                            </Text>
                        )}
                    </View>
                </View>

                {/* Thin neo colored lines */}
                <View style={styles.chartContainer}>
                    <View style={[styles.chartSegment, { backgroundColor: '#38BDF8', width: `${homePct}%`, borderTopLeftRadius: 1.5, borderBottomLeftRadius: 1.5 }]} />
                    <View style={[styles.chartSegment, { backgroundColor: '#A4C3B2', width: `${drawPct}%` }]} />
                    <View style={[styles.chartSegment, { backgroundColor: '#D52941', width: `${awayPct}%`, borderTopRightRadius: 1.5, borderBottomRightRadius: 1.5 }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 12,
        marginVertical: 6,
        padding: 16,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: `${Colors.accent}30`,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leagueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${Colors.accent}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    flag: {
        fontSize: 12,
    },
    leagueName: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.text,
    },
    badgesWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    pickBadge: {
        backgroundColor: `${Colors.primary}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pickBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.primary,
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        position: 'relative', // Allows absolute positioning of 'vs' if needed
    },
    teamGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    homeGroup: {
        justifyContent: 'flex-start',
    },
    awayGroup: {
        justifyContent: 'flex-end',
    },
    teamCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    homeCircle: {
        borderColor: '#38BDF8',
        shadowColor: '#38BDF8',
    },
    awayCircle: {
        borderColor: '#D52941',
        shadowColor: '#D52941',
    },
    circleText: {
        fontSize: 13,
        fontWeight: '800',
    },
    homeCircleText: {
        color: '#38BDF8',
    },
    awayCircleText: {
        color: '#D52941',
    },
    teamNameText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        flexShrink: 1, // Allow text to shrink/truncate if too long
    },
    vsContainer: {
        width: 30, // Fixed width for vs to keep it perfectly centered
        alignItems: 'center',
    },
    vsText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
        textTransform: 'lowercase',
    },
    chartWrapper: {
        width: '100%',
        marginTop: 4,
    },
    chartLabelsRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 4,
    },
    labelSegment: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartLabelText: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    chartContainer: {
        flexDirection: 'row',
        height: 3, // extremely thin line
        width: '100%',
        backgroundColor: `${Colors.accent}20`,
        borderRadius: 1.5,
        overflow: 'hidden',
        marginTop: 2,
    },
    chartSegment: {
        height: '100%',
    },
});
