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
import Svg, { Path, Line, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

// Mock data for last 10 weeks
const mockWeeklyData = [
  { week: 'W1', profit: 12.5, bets: 45, won: 28, roi: 8.2 },
  { week: 'W2', profit: -5.2, bets: 52, won: 24, roi: -3.1 },
  { week: 'W3', profit: 18.7, bets: 48, won: 32, roi: 12.4 },
  { week: 'W4', profit: 8.3, bets: 41, won: 26, roi: 5.8 },
  { week: 'W5', profit: -2.1, bets: 55, won: 27, roi: -1.2 },
  { week: 'W6', profit: 22.4, bets: 50, won: 35, roi: 14.8 },
  { week: 'W7', profit: 15.6, bets: 47, won: 30, roi: 10.2 },
  { week: 'W8', profit: 9.8, bets: 44, won: 28, roi: 6.9 },
  { week: 'W9', profit: -8.5, bets: 58, won: 25, roi: -4.7 },
  { week: 'W10', profit: 25.2, bets: 51, won: 36, roi: 16.1 },
];

const totalProfit = mockWeeklyData.reduce((sum, w) => sum + w.profit, 0);
const totalBets = mockWeeklyData.reduce((sum, w) => sum + w.bets, 0);
const totalWon = mockWeeklyData.reduce((sum, w) => sum + w.won, 0);
const avgROI = mockWeeklyData.reduce((sum, w) => sum + w.roi, 0) / mockWeeklyData.length;
const winRate = (totalWon / totalBets) * 100;

interface LineChartProps {
  data: number[];
  labels: string[];
  color: string;
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, labels, color, width: chartWidth, height: chartHeight }) => {
  const { colors } = useTheme();
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;
  
  const maxVal = Math.max(...data.map(Math.abs));
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  
  const getY = (val: number) => {
    return padding + graphHeight - ((val - minVal) / range) * graphHeight;
  };
  
  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * graphWidth;
  };
  
  const pathData = data
    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`)
    .join(' ');

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Line
          key={i}
          x1={padding}
          y1={padding + (graphHeight / 4) * i}
          x2={chartWidth - padding}
          y2={padding + (graphHeight / 4) * i}
          stroke={colors.border}
          strokeWidth={1}
          opacity={0.5}
        />
      ))}
      
      {/* Zero line */}
      <Line
        x1={padding}
        y1={getY(0)}
        x2={chartWidth - padding}
        y2={getY(0)}
        stroke={colors.textMuted}
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      
      {/* Line path */}
      <Path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {data.map((val, i) => (
        <Circle
          key={i}
          cx={getX(i)}
          cy={getY(val)}
          r={4}
          fill={val >= 0 ? colors.success : colors.error}
        />
      ))}
      
      {/* Labels */}
      {labels.map((label, i) => (
        <SvgText
          key={i}
          x={getX(i)}
          y={chartHeight - 10}
          fontSize={9}
          fill={colors.textMuted}
          textAnchor="middle"
        >
          {label}
        </SvgText>
      ))}
    </Svg>
  );
};

interface BarChartProps {
  data: { label: string; value: number }[];
  color: string;
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, color, width: chartWidth, height: chartHeight }) => {
  const { colors } = useTheme();
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;
  
  const maxVal = Math.max(...data.map((d) => d.value));
  const barWidth = graphWidth / data.length - 8;
  
  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Line
          key={i}
          x1={padding}
          y1={padding + (graphHeight / 4) * i}
          x2={chartWidth - padding}
          y2={padding + (graphHeight / 4) * i}
          stroke={colors.border}
          strokeWidth={1}
          opacity={0.5}
        />
      ))}
      
      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.value / maxVal) * graphHeight;
        const x = padding + (graphWidth / data.length) * i + 4;
        const y = padding + graphHeight - barHeight;
        
        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
              opacity={0.8}
            />
            <SvgText
              x={x + barWidth / 2}
              y={chartHeight - 10}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

export default function StatsScreen() {
  const { colors } = useTheme();
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
            data={mockWeeklyData.map((w) => w.roi)}
            labels={mockWeeklyData.map((w) => w.week)}
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
            data={mockWeeklyData.map((w) => w.profit)}
            labels={mockWeeklyData.map((w) => w.week)}
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
            data={mockWeeklyData.map((w) => ({ label: w.week, value: w.won }))}
            color={colors.primary}
            width={chartWidth - 32}
            height={180}
          />
        </View>

        {/* Weekly Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.breakdownTitle, { color: colors.text }]}>Weekly Breakdown</Text>
          {mockWeeklyData.map((week, index) => (
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
