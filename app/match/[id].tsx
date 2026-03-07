import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Colors } from '../../src/constants/colors';
import { RadarChart } from '../../src/components/RadarChart';
import { useTranslation } from 'react-i18next';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

// ─── Form percentage ring ─────────────────────────────────────────────────────
const FormRing = ({ percentage, color }: { percentage: number; color: string }) => {
    const size = 48;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
                <SvgCircle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <Text style={{ fontSize: 11, fontWeight: '900', color }}>{percentage}%</Text>
        </View>
    );
};

// ─── Form Block helper ────────────────────────────────────────────────────────
const FormBlock = ({ result }: { result: string }) => {
    let bgColor = '#D1D5DB';
    if (result === 'W') bgColor = '#34D399';
    if (result === 'D') bgColor = '#FBBF24';
    if (result === 'L') bgColor = '#EF4444';

    return (
        <View style={[styles.formBlock, { backgroundColor: bgColor }]}>
            <Text style={styles.formBlockText}>{result}</Text>
        </View>
    );
};

// ─── Progress Line helper ─────────────────────────────────────────────────────
const ProgressLine = ({ value, maxValue = 100, label, color, isPercentage = true }: { value: number, maxValue?: number, label: string, color: string, isPercentage?: boolean }) => {
    const widthPct = Math.min(100, (value / maxValue) * 100);
    const displayValue = isPercentage ? `${value}%` : value.toFixed(2);

    return (
        <View style={styles.progressRow}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={[styles.progressValue, { color }]}>{displayValue}</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${widthPct}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

export default function MatchDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();

    // expo-router may return params as string | string[] — normalize
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const rawData = Array.isArray(params.rawData) ? params.rawData[0] : params.rawData;

    // Parse match data directly from the passed JSON string (no re-fetch needed!)
    let matchData: any = null;
    try {
        if (rawData) {
            matchData = JSON.parse(rawData);
        }
    } catch (e) {
        console.error('[MatchDetail] Failed to parse rawData:', e);
    }

    if (!matchData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Match not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formattedDate = matchData.date ? new Date(matchData.date).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
    }) + ` • ${matchData.time?.substring(0, 5) || ''}` : '';

    const home = matchData.home_stats;
    const away = matchData.away_stats;
    const h2h = matchData.h2_h || {};
    const preds = matchData.prediction || {};
    const trap = matchData.trap || { is_trap: false, reason: '' };
    const gemini = matchData.gemini || null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Nav Back Header (Safe Area Buffer) */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Native Screen Header */}
            <ScreenHeader
                title="Match Details"
                subtitle="Deep Dive & Analysis"
                showWarning={trap?.is_trap}
            />

            {/* League & Time Row */}
            <View style={styles.leagueRow}>
                <View style={styles.leagueBadge}>
                    <Text style={styles.leagueText}>{matchData.league}</Text>
                </View>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {/* Section: Team Statistics */}
            <View style={styles.sectionHeader}>
                <View style={styles.shLine} />
                <Text style={styles.sectionTitle}>Team Statistics</Text>
            </View>

            <View style={styles.statsGrid}>
                {/* HOME CARD */}
                <View style={styles.teamCard}>
                    <Text style={[styles.teamRank, { color: '#3B82F6' }]}>#{home?.rank || '-'}</Text>
                    <Text style={styles.teamName} numberOfLines={1}>{home?.name || matchData.home_team}</Text>

                    <View style={styles.formRow}>
                        <FormRing percentage={home?.form_percentage || 0} color="#3B82F6" />
                        <View>
                            <Text style={styles.formLabel}>Form</Text>
                            <View style={styles.formBlocks}>
                                {(home?.form || '').split('').map((res: string, i: number) => <FormBlock key={i} result={res} />)}
                            </View>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Points</Text>
                            <Text style={styles.dataValue}>{home?.points || 0}</Text>
                        </View>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Win Rate</Text>
                            <Text style={styles.dataValue}>{Math.round((home?.win_rate || 0) * 100)}%</Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Avg Scored</Text>
                            <Text style={styles.dataValue}>{home?.avg_goals_scored_last_7?.toFixed(2) || '0.00'}</Text>
                        </View>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Avg Conceded</Text>
                            <Text style={styles.dataValue}>{home?.avg_goals_conceded_last_7?.toFixed(2) || '0.00'}</Text>
                        </View>
                    </View>

                    {/* Recent Stats (Last 3) header */}
                    <Text style={styles.recentHeader}>Recent Stats (Last 3)</Text>
                    <ProgressLine value={home?.avg_goals_scored_last_3 || 0} maxValue={3} isPercentage={false} label="Scored" color="#34D399" />
                    <ProgressLine value={home?.avg_goals_conceded_last_3 || 0} maxValue={3} isPercentage={false} label="Conceded" color="#FBBF24" />
                    <ProgressLine value={Math.round((home?.clean_sheet_rate || 0) * 100)} label="Clean Sheet" color="#3B82F6" />
                </View>

                {/* AWAY CARD */}
                <View style={styles.teamCard}>
                    <Text style={[styles.teamRank, { color: '#B91C1C' }]}>#{away?.rank || '-'}</Text>
                    <Text style={styles.teamName} numberOfLines={1}>{away?.name || matchData.away_team}</Text>

                    <View style={styles.formRow}>
                        <FormRing percentage={away?.form_percentage || 0} color="#EF4444" />
                        <View>
                            <Text style={styles.formLabel}>Form</Text>
                            <View style={styles.formBlocks}>
                                {(away?.form || '').split('').map((res: string, i: number) => <FormBlock key={i} result={res} />)}
                            </View>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Points</Text>
                            <Text style={styles.dataValue}>{away?.points || 0}</Text>
                        </View>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Win Rate</Text>
                            <Text style={styles.dataValue}>{Math.round((away?.win_rate || 0) * 100)}%</Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Avg Scored</Text>
                            <Text style={styles.dataValue}>{away?.avg_goals_scored_last_7?.toFixed(2) || '0.00'}</Text>
                        </View>
                        <View style={styles.dataCol}>
                            <Text style={styles.dataLabel}>Avg Conceded</Text>
                            <Text style={styles.dataValue}>{away?.avg_goals_conceded_last_7?.toFixed(2) || '0.00'}</Text>
                        </View>
                    </View>

                    {/* Recent Stats (Last 3) header */}
                    <Text style={styles.recentHeader}>Recent Stats (Last 3)</Text>
                    <ProgressLine value={away?.avg_goals_scored_last_3 || 0} maxValue={3} isPercentage={false} label="Scored" color="#34D399" />
                    <ProgressLine value={away?.avg_goals_conceded_last_3 || 0} maxValue={3} isPercentage={false} label="Conceded" color="#FBBF24" />
                    <ProgressLine value={Math.round((away?.clean_sheet_rate || 0) * 100)} label="Clean Sheet" color="#3B82F6" />
                </View>
            </View>

            {/* Section: Deep Analysis */}
            <View style={styles.sectionHeader}>
                <View style={styles.shLine} />
                <Text style={styles.sectionTitle}>Deep Analysis</Text>
            </View>
            {(gemini && gemini.recommendation) ? (
                <View style={styles.analysisCard}>
                    <View style={styles.analysisTop}>
                        <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={16} color="#3B82F6" />
                        </View>
                        <View style={styles.aiTitles}>
                            <Text style={styles.aiTitle}>AI Analysis</Text>
                            <Text style={styles.aiSubtitle}>Deep reasoning & trap detection</Text>
                        </View>
                        <View style={styles.confidenceBlock}>
                            <Text style={styles.confValue}>{Math.round((gemini?.confidence || 0) * 100)}%</Text>
                            <Text style={styles.confLabel}>CONFIDENCE</Text>
                        </View>
                    </View>

                    <View style={styles.recommendationBlock}>
                        <Text style={styles.recLabel}>RECOMMENDATION</Text>
                        <View style={styles.recRow}>
                            <Ionicons name="trending-up" size={24} color="#3B82F6" />
                            <Text style={styles.recValue}>{gemini?.recommendation || 'Analyzed'}</Text>
                        </View>
                        <View style={styles.recTrack}>
                            <View style={[styles.recFill, { width: `${Math.round((gemini?.confidence || 0) * 100)}%` }]} />
                        </View>
                    </View>

                    {/* Trap Box */}
                    {trap?.is_trap && (
                        <View style={styles.trapBox}>
                            <Ionicons name="warning" size={20} color="#F59E0B" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.trapTitle}>TRAP DETECTED</Text>
                                <Text style={styles.trapBody}>{trap.reason || 'AI has identified potential misleading signals in this match. Exercise caution.'}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.textBlock}>
                        <Text style={styles.textHeading}>REASONING</Text>
                        <Text style={styles.textContent}>{gemini?.reasoning}</Text>
                    </View>
                    {gemini?.analysis ? (
                        <View style={styles.textBlock}>
                            <Text style={styles.textHeading}>FULL ANALYSIS</Text>
                            <Text style={[styles.textContent, { color: '#9CA3AF' }]}>{gemini.analysis}</Text>
                        </View>
                    ) : null}
                </View>
            ) : (
                <View style={[styles.analysisCard, { alignItems: 'center', paddingVertical: 40 }]}>
                    <Ionicons name="time-outline" size={40} color="#D1D5DB" />
                    <Text style={{ marginTop: 10, color: '#6B7280', fontWeight: '500' }}>Deep analysis pending or unavailable.</Text>
                </View>
            )}

            {/* Section: Head to Head */}
            <View style={styles.sectionHeader}>
                <View style={styles.shLine} />
                <Text style={styles.sectionTitle}>Head to Head</Text>
            </View>

            {h2h?.matches_analyzed > 0 ? (
                <View style={styles.h2hCard}>
                    <View style={styles.h2hTop}>
                        <View style={styles.h2hLogBox}>
                            <Ionicons name="time-outline" size={20} color="#3B82F6" />
                            <Text style={styles.h2hTitle}>Head to Head</Text>
                        </View>
                        <View style={styles.matchesBadge}>
                            <Text style={styles.matchesText}>{h2h.matches_analyzed} Matches</Text>
                        </View>
                    </View>

                    {/* 1x2 split bar */}
                    <View style={styles.splitLineTrack}>
                        <View style={[styles.splitHome, { width: `${Math.round(h2h.home_win_rate * 100)}%` }]} />
                        <View style={[styles.splitDraw, { width: `${Math.round(h2h.draw_rate * 100)}%` }]} />
                        <View style={[styles.splitAway, { width: `${Math.round(h2h.away_win_rate * 100)}%` }]} />
                    </View>
                    <View style={styles.splitLabels}>
                        <View style={{ alignItems: 'flex-start' }}>
                            <Text style={styles.slTitle}>Home</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.slDot, { backgroundColor: '#34D399' }]} />
                                <Text style={[styles.slValue, { color: '#34D399' }]}>{Math.round(h2h.home_win_rate * 100)}%</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.slTitle}>Draw</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.slDot, { backgroundColor: '#818CF8' }]} />
                                <Text style={[styles.slValue, { color: '#818CF8' }]}>{Math.round(h2h.draw_rate * 100)}%</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.slTitle}>Away</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.slDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={[styles.slValue, { color: '#EF4444' }]}>{Math.round(h2h.away_win_rate * 100)}%</Text>
                            </View>
                        </View>
                    </View>

                    <ProgressLine value={Math.round(h2h.btts_rate * 100)} label="BTTS" color="#818CF8" />
                    <ProgressLine value={Math.round(h2h.over25_rate * 100)} label="Over 2.5" color="#FBBF24" />
                    <ProgressLine value={h2h.avg_total_goals || 0} maxValue={4} isPercentage={false} label="Avg Goals/Match" color="#0EA5E9" />
                </View>
            ) : (
                <View style={[styles.h2hCard, { alignItems: 'center', paddingVertical: 40 }]}>
                    <Ionicons name="book-outline" size={40} color="#D1D5DB" />
                    <Text style={{ marginTop: 10, color: '#6B7280', fontWeight: '500' }}>No Head to Head data available.</Text>
                </View>
            )}

            {/* Section: System Predictions */}
            <View style={styles.sectionHeader}>
                <View style={styles.shLine} />
                <Text style={styles.sectionTitle}>System Predictions</Text>
            </View>

            <View style={styles.spiderCard}>
                <RadarChart
                    size={280}
                    data={{
                        over25: Math.round(((preds?.over25?.probability || preds?.over25?.confidence) || 0) * 100),
                        btts: Math.round(((preds?.btts?.probability || preds?.btts?.confidence) || 0) * 100),
                        goals23: Math.round(((preds?.two_to_three_goals?.probability || preds?.two_to_three_goals?.confidence) || 0) * 100),
                        lowScore: Math.round(((preds?.low_scoring?.probability || preds?.low_scoring?.confidence) || 0) * 100),
                        winProb: Math.round(((preds?.match_winner?.probability || preds?.match_winner?.confidence) || 0) * 100)
                    }}
                />

                <View style={styles.picksHeader}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#34D399" />
                    <Text style={[styles.picksTitle, { color: '#34D399' }]}>QUALIFIED PICKS</Text>
                </View>

                {Object.entries(preds)
                    .filter(([k, v]: any) => v.is_qualified)
                    .map(([key, p]: any) => (
                        <View key={`qual-${key}`} style={[styles.pickBox, { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }]}>
                            <View style={styles.pickBoxTop}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#34D399" />
                                <Text style={styles.pickBoxTitle}>{key.toUpperCase().replace(/_/g, ' ')}</Text>
                                <Text style={[styles.pickBoxPct, { color: '#34D399' }]}>{Math.round((p.probability || p.confidence || 0) * 100)}%</Text>
                            </View>
                            <Text style={styles.pickBoxDesc}>{p.reason || 'AI qualifies this pick based on high-confidence algorithms.'}</Text>
                        </View>
                    ))}

                <View style={[styles.picksHeader, { marginTop: 16 }]}>
                    <Ionicons name="close-circle-outline" size={16} color="#9CA3AF" />
                    <Text style={[styles.picksTitle, { color: '#9CA3AF' }]}>NOT QUALIFIED</Text>
                </View>

                {Object.entries(preds)
                    .filter(([k, v]: any) => !v.is_qualified)
                    .map(([key, p]: any) => (
                        <View key={`not-qual-${key}`} style={[styles.pickBox, { borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' }]}>
                            <View style={styles.pickBoxTop}>
                                <Ionicons name="close-circle-outline" size={20} color="#9CA3AF" />
                                <Text style={[styles.pickBoxTitle, { color: '#6B7280' }]}>{key.toUpperCase().replace(/_/g, ' ')}</Text>
                                <Text style={[styles.pickBoxPct, { color: '#4B5563' }]}>{Math.round((p.probability || p.confidence || 0) * 100)}%</Text>
                            </View>
                            <Text style={styles.pickBoxDesc}>{p.reason || 'Low confidence score.'}</Text>
                        </View>
                    ))}

            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { paddingTop: 10, paddingBottom: 40 },
    navBar: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 4 },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    backText: { fontSize: 16, color: Colors.primary, marginLeft: 4, fontWeight: '600' },
    leagueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 16 },
    leagueBadge: { backgroundColor: '#57845E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    leagueText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    dateText: { color: '#6B7280', fontSize: 12, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
    shLine: { width: 4, height: 18, backgroundColor: '#2563EB', marginRight: 8, borderRadius: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },

    statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
    teamCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    teamRank: { fontSize: 16, fontWeight: '900' },
    teamName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },

    formRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    formLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 4, fontWeight: '600' },
    formBlocks: { flexDirection: 'row', gap: 4 },
    formBlock: { width: 14, height: 14, borderRadius: 3, justifyContent: 'center', alignItems: 'center' },
    formBlockText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },

    recentHeader: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },

    dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dataCol: { flex: 1 },
    dataLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500', marginBottom: 2 },
    dataValue: { fontSize: 15, fontWeight: '900', color: '#111827' },

    progressRow: { marginBottom: 10 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    progressValue: { fontSize: 10, fontWeight: '800' },
    progressTrack: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },

    analysisCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    analysisTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    aiBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    aiTitles: { flex: 1 },
    aiTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
    aiSubtitle: { fontSize: 12, color: '#6B7280' },
    confidenceBlock: { alignItems: 'flex-end' },
    confValue: { fontSize: 22, fontWeight: '900', color: '#3B82F6' },
    confLabel: { fontSize: 8, fontWeight: '800', color: '#6B7280', letterSpacing: 1 },

    recommendationBlock: { marginBottom: 24 },
    recLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8 },
    recRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    recValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
    recTrack: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
    recFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 3 },

    trapBox: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5', borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', marginBottom: 24 },
    trapTitle: { fontSize: 13, fontWeight: '800', color: '#D97706', marginBottom: 4 },
    trapBody: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },

    textBlock: { marginBottom: 20 },
    textHeading: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 6 },
    textContent: { fontSize: 14, color: '#374151', lineHeight: 22 },

    h2hCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    h2hTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    h2hLogBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    h2hTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
    matchesBadge: { backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    matchesText: { color: '#0D9488', fontSize: 11, fontWeight: '800' },
    splitLineTrack: { height: 10, flexDirection: 'row', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
    splitHome: { backgroundColor: '#34D399' },
    splitDraw: { backgroundColor: '#818CF8' },
    splitAway: { backgroundColor: '#EF4444' },
    splitLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    slTitle: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
    slDot: { width: 4, height: 4, borderRadius: 2 },
    slValue: { fontSize: 14, fontWeight: '900' },

    spiderCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingTop: 30, paddingHorizontal: 20, paddingBottom: 20, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    picksHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 10 },
    picksTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    pickBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
    pickBoxTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    pickBoxTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#111827', marginLeft: 8 },
    pickBoxPct: { fontSize: 14, fontWeight: '900' },
    pickBoxDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
});
