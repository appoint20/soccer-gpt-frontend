import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { usePerformanceStats } from '../src/hooks/usePerformanceStats';
import { LineChart } from '../src/components/charts/LineChart';
import { BarChart } from '../src/components/charts/BarChart';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
    const { colors } = useTheme();
    const { weeklyData, totalProfit, totalWon, totalBets, avgROI, winRate } = usePerformanceStats();
    const chartWidth = width - 32;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Performance</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Last 10 weeks statistics</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="trending-up" size={24} color={totalProfit >= 0 ? colors.success : colors.error} />
                        <Text style={[styles.summaryValue, { color: totalProfit >= 0 ? colors.success : colors.error }]}>
                            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(1)}%
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Profit</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="analytics" size={24} color={colors.primary} />
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>
                            {avgROI.toFixed(1)}%
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Avg ROI</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        <Text style={[styles.summaryValue, { color: colors.success }]}>
                            {winRate.toFixed(1)}%
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Win Rate</Text>
                    </View>
                </View>

                {/* ROI Chart */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.chartTitle, { color: colors.text }]}>ROI Trend</Text>
                        <View style={[styles.chartBadge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.chartBadgeText, { color: colors.success }]}>+{avgROI.toFixed(1)}% avg</Text>
                        </View>
                    </View>
                    <LineChart
                        data={weeklyData.map((w) => w.roi)}
                        labels={weeklyData.map((w) => w.week)}
                        color={colors.primary}
                        width={chartWidth - 32}
                        height={200}
                    />
                </View>

                {/* Profit Chart */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Profit</Text>
                        <View style={[styles.chartBadge, { backgroundColor: totalProfit >= 0 ? colors.success + '20' : colors.error + '20' }]}>
                            <Text style={[styles.chartBadgeText, { color: totalProfit >= 0 ? colors.success : colors.error }]}>
                                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(1)}% total
                            </Text>
                        </View>
                    </View>
                    <LineChart
                        data={weeklyData.map((w) => w.profit)}
                        labels={weeklyData.map((w) => w.week)}
                        color={colors.success}
                        width={chartWidth - 32}
                        height={200}
                    />
                </View>

                {/* Bets Won Chart */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.chartTitle, { color: colors.text }]}>Bets Won per Week</Text>
                        <View style={[styles.chartBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.chartBadgeText, { color: colors.primary }]}>{totalWon} / {totalBets} total</Text>
                        </View>
                    </View>
                    <BarChart
                        data={weeklyData.map((w) => ({ label: w.week, value: w.won }))}
                        color={colors.primary}
                        width={chartWidth - 32}
                        height={180}
                    />
                </View>

                {/* Weekly Breakdown */}
                <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.breakdownTitle, { color: colors.text }]}>Weekly Breakdown</Text>
                    {weeklyData.map((week, index) => (
                        <View key={index} style={[styles.weekRow, { borderBottomColor: colors.divider }]}>
                            <Text style={[styles.weekLabel, { color: colors.text }]}>{week.week}</Text>
                            <View style={styles.weekStats}>
                                <Text style={[styles.weekBets, { color: colors.textMuted }]}>{week.bets} bets</Text>
                                <Text style={[styles.weekWon, { color: colors.primary }]}>{week.won} won</Text>
                                <Text
                                    style={[
                                        styles.weekProfit,
                                        { color: week.profit >= 0 ? colors.success : colors.error },
                                    ]}
                                >
                                    {week.profit >= 0 ? '+' : ''}{week.profit.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingVertical: 8 },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { fontSize: 12, marginTop: 2 },
    content: { flex: 1 },
    summaryContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    summaryCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    summaryValue: { fontSize: 18, fontWeight: '700', marginTop: 6 },
    summaryLabel: { fontSize: 10, marginTop: 2 },
    chartCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    chartTitle: { fontSize: 16, fontWeight: '600' },
    chartBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    chartBadgeText: { fontSize: 11, fontWeight: '600' },
    breakdownCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    breakdownTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    weekLabel: { fontSize: 14, fontWeight: '500', width: 40 },
    weekStats: { flexDirection: 'row', gap: 16 },
    weekBets: { fontSize: 12, width: 50 },
    weekWon: { fontSize: 12, width: 50 },
    weekProfit: { fontSize: 12, fontWeight: '600', width: 50, textAlign: 'right' },
    bottomPadding: { height: 24 },
});
