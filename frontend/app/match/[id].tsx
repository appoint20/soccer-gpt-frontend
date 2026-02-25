import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { Match } from '../../src/services/api';
import RadarChart from '../../src/components/RadarChart';
import DonutChart from '../../src/components/DonutChart';

export default function MatchDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { matchData } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 56) / 2; // More gap between cards

  const match: Match = useMemo(() => {
    try {
      return JSON.parse(matchData as string);
    } catch {
      return null;
    }
  }, [matchData]);

  if (!match) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Match not found</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const renderFormBadge = (result: string, index: number) => {
    const bgColor =
      result === 'W' ? colors.success : result === 'D' ? colors.warning : colors.error;
    return (
      <View key={index} style={[styles.formBadge, { backgroundColor: bgColor }]}>
        <Text style={styles.formBadgeText}>{result}</Text>
      </View>
    );
  };

  const renderStatBar = (value: number, maxValue: number, color: string) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <View style={[styles.statBar, { backgroundColor: colors.border }]}>
        <View
          style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]}
        />
      </View>
    );
  };

  const renderTeamStats = (stats: typeof match.home_stats, isHome: boolean) => {
    const winRatePercent = Math.round(stats.win_rate * 100);
    const cleanSheetPercent = Math.round(stats.clean_sheet_rate * 100);
    const recentScoredPercent = Math.round((stats.avg_goals_scored_last_3 / 3) * 100);
    const recentConcededPercent = Math.round((stats.avg_goals_conceded_last_3 / 3) * 100);
    const formPercent = stats.form_percentage || 50;

    return (
      <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border, width: cardWidth }]}>
        {/* Team Name + Donut Chart on same line */}
        <View style={styles.teamHeaderRow}>
          <View style={styles.teamNameSection}>
            <Text style={[styles.teamRank, { color: colors.accent }]}>#{stats.rank}</Text>
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>
              {stats.name}
            </Text>
          </View>
          <DonutChart 
            percentage={formPercent} 
            size={50} 
            strokeWidth={5}
            color={isHome ? colors.error : colors.accent}
          />
        </View>

        {/* Form Badges right under */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.textMuted }]}>Form</Text>
          <View style={styles.formRow}>
            {stats.form.split('').slice(0, 5).map((r, i) => renderFormBadge(r, i))}
          </View>
        </View>

        {/* Main Stats */}
        <View style={styles.mainStats}>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Points</Text>
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.points}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Win Rate</Text>
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{winRatePercent}%</Text>
          </View>
        </View>

        <View style={styles.mainStats}>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Avg Scored</Text>
            <Text style={[styles.statBoxValue, { color: colors.success }]}>
              {stats.avg_goals_scored_last_7.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Avg Conceded</Text>
            <Text style={[styles.statBoxValue, { color: colors.error }]}>
              {stats.avg_goals_conceded_last_7.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Recent Scored (L3)</Text>
            <Text style={[styles.progressValue, { color: colors.success }]}>{recentScoredPercent}%</Text>
          </View>
          {renderStatBar(recentScoredPercent, 100, colors.success)}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Recent Conceded (L3)</Text>
            <Text style={[styles.progressValue, { color: colors.warning }]}>{recentConcededPercent}%</Text>
          </View>
          {renderStatBar(recentConcededPercent, 100, colors.warning)}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Clean Sheet Rate</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{cleanSheetPercent}%</Text>
          </View>
          {renderStatBar(cleanSheetPercent, 100, colors.primary)}
        </View>
      </View>
    );
  };

  // Calculate AI confidence from model predictions if gemini is not available
  const getAIConfidence = () => {
    if (match.gemini) return match.gemini.confidence;
    return Math.round(Math.max(
      match.models.poisson.home_win,
      match.models.poisson.away_win,
      match.models.monte_carlo.home_win,
      match.models.monte_carlo.away_win
    ) * 100);
  };

  const getRecommendation = () => {
    if (match.gemini) return match.gemini.recommendation;
    if (match.prediction.btts.is_qualified) return 'BTTS';
    if (match.prediction.over25.is_qualified) return 'OVER 2.5';
    if (match.prediction.low_scoring.is_qualified) return 'UNDER 2.5';
    if (match.prediction.match_winner.is_qualified) {
      return match.prediction.match_winner.prediction === 'home' ? match.home_team : match.away_team;
    }
    return 'No Clear Pick';
  };

  const getReasoning = () => {
    if (match.gemini) return match.gemini.reasoning;
    const homeAttack = match.home_stats.avg_goals_scored_last_7.toFixed(2);
    const homeDef = match.home_stats.avg_goals_conceded_last_7.toFixed(2);
    const awayAttack = match.away_stats.avg_goals_scored_last_7.toFixed(2);
    const awayDef = match.away_stats.avg_goals_conceded_last_7.toFixed(2);
    return `${match.home_team} averages ${homeAttack} goals scored and ${homeDef} conceded. ${match.away_team} averages ${awayAttack} goals scored and ${awayDef} conceded. Based on recent form and statistical models.`;
  };

  const getFullAnalysis = () => {
    if (match.gemini) return match.gemini.full_analysis;
    const poisson = match.models.poisson;
    const mc = match.models.monte_carlo;
    return `Poisson Model: Home ${Math.round(poisson.home_win * 100)}%, Draw ${Math.round(poisson.draw * 100)}%, Away ${Math.round(poisson.away_win * 100)}%. Monte Carlo (${mc.simulation_count} simulations): Home ${Math.round(mc.home_win * 100)}%, Draw ${Math.round(mc.draw * 100)}%, Away ${Math.round(mc.away_win * 100)}%. BTTS probability: ${Math.round(poisson.btts * 100)}%. Over 2.5 probability: ${Math.round(poisson.over25 * 100)}%.`;
  };

  const aiConfidence = getAIConfidence();
  const recommendation = getRecommendation();
  const reasoning = getReasoning();
  const fullAnalysis = getFullAnalysis();

  const radarData = [
    { label: 'OVER 2.5', value: Math.round(match.prediction.over25.probability * 100) },
    { label: 'BTTS', value: Math.round(match.prediction.btts.probability * 100) },
    { label: '2-3 GOALS', value: Math.round(match.prediction.two_to_three_goals.probability * 100) },
    { label: 'LOW SCORE', value: Math.round(match.prediction.low_scoring.probability * 100) },
    { label: 'WIN PROB', value: Math.round((match.prediction.match_winner.confidence || 0) * 100) },
  ];

  const qualifiedPicks = [
    { key: 'over25', label: 'Over 2.5 Goals', data: match.prediction.over25 },
    { key: 'btts', label: 'Both Teams to Score', data: match.prediction.btts },
    { key: 'two_to_three_goals', label: '2-3 Goals', data: match.prediction.two_to_three_goals },
    { key: 'low_scoring', label: 'Low Scoring', data: match.prediction.low_scoring },
    {
      key: 'match_winner',
      label: `Winner: ${match.prediction.match_winner.prediction === 'home' ? match.home_team : match.away_team}`,
      data: match.prediction.match_winner,
    },
  ];

  const qualified = qualifiedPicks.filter((p) => p.data.is_qualified);
  const notQualified = qualifiedPicks.filter((p) => !p.data.is_qualified);

  const renderStatBarH2H = (value: number, maxValue: number, color: string) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <View style={[styles.h2hStatBar, { backgroundColor: colors.border }]}>
        <View
          style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Match Details</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Deep Dive & Analysis
          </Text>
        </View>
        {match.trap.is_trap && (
          <View style={[styles.trapIcon, { backgroundColor: colors.warning }]}>
            <Ionicons name="warning" size={18} color="#FFFFFF" />
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* League & Date */}
        <View style={styles.matchInfo}>
          <View style={[styles.leagueBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.leagueText, { color: colors.accent }]}>{match.league}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(match.date)} - {formatTime(match.time)}
          </Text>
        </View>

        {/* Team Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Statistics</Text>
          </View>
          <View style={styles.teamsRow}>
            {renderTeamStats(match.home_stats, true)}
            {renderTeamStats(match.away_stats, false)}
          </View>
        </View>

        {/* Deep Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Deep Analysis</Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.analysisHeader}>
              <View style={[styles.aiIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <View style={styles.analysisHeaderText}>
                <Text style={[styles.aiTitle, { color: colors.text }]}>AI Analysis</Text>
                <Text style={[styles.aiSubtitle, { color: colors.textMuted }]}>
                  Deep reasoning & trap detection
                </Text>
              </View>
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceValue, { color: colors.primary }]}>
                  {aiConfidence}%
                </Text>
                <Text style={[styles.confidenceLabel, { color: colors.textMuted }]}>CONFIDENCE</Text>
              </View>
            </View>

            <View style={styles.recommendationSection}>
              <Text style={[styles.recommendationLabel, { color: colors.textMuted }]}>RECOMMENDATION</Text>
              <View style={styles.recommendationRow}>
                <Ionicons name="trending-up" size={24} color={colors.primary} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>
                  {recommendation}
                </Text>
              </View>
              {renderStatBarH2H(aiConfidence, 100, colors.primary)}
            </View>

            {match.trap.is_trap && (
              <View style={[styles.trapBanner, { backgroundColor: colors.warning + '20' }]}>
                <View style={styles.trapBannerHeader}>
                  <View style={[styles.trapIconSmall, { backgroundColor: colors.warning + '30' }]}>
                    <Ionicons name="warning" size={16} color={colors.warning} />
                  </View>
                  <Text style={[styles.trapBannerTitle, { color: colors.warning }]}>TRAP DETECTED</Text>
                </View>
                <Text style={[styles.trapBannerText, { color: colors.text }]}>
                  {match.trap.reason || 'AI has identified potential misleading signals in this match. Exercise caution.'}
                </Text>
              </View>
            )}

            <View style={styles.reasoningSection}>
              <Text style={[styles.reasoningLabel, { color: colors.textMuted }]}>REASONING</Text>
              <Text style={[styles.reasoningText, { color: colors.text }]}>
                {reasoning}
              </Text>
            </View>

            <View style={styles.fullAnalysisSection}>
              <Text style={[styles.reasoningLabel, { color: colors.textMuted }]}>FULL ANALYSIS</Text>
              <Text style={[styles.reasoningText, { color: colors.text }]}>
                {fullAnalysis}
              </Text>
            </View>
          </View>
        </View>

        {/* Head to Head */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Head to Head</Text>
          </View>

          <View style={[styles.h2hCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.h2hHeader}>
              <View style={styles.h2hHeaderLeft}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.h2hTitle, { color: colors.text }]}>Head to Head</Text>
              </View>
              <View style={[styles.matchesBadge, { backgroundColor: colors.success }]}>
                <Text style={styles.matchesBadgeText}>{match.h2_h.matches_analyzed} Matches</Text>
              </View>
            </View>

            {/* H2H Bar */}
            <View style={styles.h2hBarContainer}>
              <View style={styles.h2hBar}>
                <View
                  style={[
                    styles.h2hBarSegment,
                    {
                      flex: Math.max(match.h2_h.home_win_rate, 0.01),
                      backgroundColor: colors.primary,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.h2hBarSegment,
                    { flex: Math.max(match.h2_h.draw_rate, 0.01), backgroundColor: colors.textMuted },
                  ]}
                />
                <View
                  style={[
                    styles.h2hBarSegment,
                    {
                      flex: Math.max(match.h2_h.away_win_rate, 0.01),
                      backgroundColor: colors.error,
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    },
                  ]}
                />
              </View>
              <View style={styles.h2hLabels}>
                <View style={styles.h2hLabelItem}>
                  <Text style={[styles.h2hLabelTitle, { color: colors.textMuted }]}>Home</Text>
                  <Text style={[styles.h2hLabelValue, { color: colors.success }]}>
                    {Math.round(match.h2_h.home_win_rate * 100)}%
                  </Text>
                </View>
                <View style={styles.h2hLabelItem}>
                  <Text style={[styles.h2hLabelTitle, { color: colors.textMuted }]}>Draw</Text>
                  <Text style={[styles.h2hLabelValue, { color: colors.primary }]}>
                    {Math.round(match.h2_h.draw_rate * 100)}%
                  </Text>
                </View>
                <View style={styles.h2hLabelItem}>
                  <Text style={[styles.h2hLabelTitle, { color: colors.textMuted }]}>Away</Text>
                  <Text style={[styles.h2hLabelValue, { color: colors.error }]}>
                    {Math.round(match.h2_h.away_win_rate * 100)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* H2H Stats */}
            <View style={styles.h2hStats}>
              <View style={styles.h2hStatRow}>
                <Text style={[styles.h2hStatLabel, { color: colors.text }]}>BTTS</Text>
                <View style={styles.h2hStatBarWrapper}>
                  {renderStatBarH2H(match.h2_h.btts_rate * 100, 100, colors.primary)}
                </View>
                <Text style={[styles.h2hStatValue, { color: colors.primary }]}>
                  {Math.round(match.h2_h.btts_rate * 100)}%
                </Text>
              </View>
              <View style={styles.h2hStatRow}>
                <Text style={[styles.h2hStatLabel, { color: colors.text }]}>Over 2.5</Text>
                <View style={styles.h2hStatBarWrapper}>
                  {renderStatBarH2H(match.h2_h.over25_rate * 100, 100, colors.warning)}
                </View>
                <Text style={[styles.h2hStatValue, { color: colors.warning }]}>
                  {Math.round(match.h2_h.over25_rate * 100)}%
                </Text>
              </View>
              <View style={styles.h2hStatRow}>
                <Text style={[styles.h2hStatLabel, { color: colors.text }]}>Avg Goals</Text>
                <View style={styles.h2hStatBarWrapper}>
                  {renderStatBarH2H((match.h2_h.avg_total_goals / 5) * 100, 100, colors.primary)}
                </View>
                <Text style={[styles.h2hStatValue, { color: colors.primary }]}>
                  {match.h2_h.avg_total_goals.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Predictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>System Predictions</Text>
          </View>

          <View style={[styles.radarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <RadarChart data={radarData} size={Math.min(width - 64, 280)} />
          </View>
        </View>

        {/* Qualified Picks */}
        {qualified.length > 0 && (
          <View style={styles.section}>
            <View style={styles.picksHeader}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.picksTitle, { color: colors.success }]}>QUALIFIED PICKS</Text>
            </View>
            {qualified.map((pick, index) => (
              <View
                key={index}
                style={[styles.pickCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}
              >
                <View style={styles.pickCardHeader}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={[styles.pickLabel, { color: colors.text }]} numberOfLines={1}>{pick.label}</Text>
                  <Text style={[styles.pickProbability, { color: colors.success }]}>
                    {Math.round((pick.data.probability || pick.data.confidence || 0) * 100)}%
                  </Text>
                </View>
                <Text style={[styles.pickReason, { color: colors.textSecondary }]} numberOfLines={2}>
                  {pick.data.reason}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Not Qualified */}
        {notQualified.length > 0 && (
          <View style={styles.section}>
            <View style={styles.picksHeader}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              <Text style={[styles.picksTitle, { color: colors.textMuted }]}>NOT QUALIFIED</Text>
            </View>
            {notQualified.map((pick, index) => (
              <View
                key={index}
                style={[styles.pickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.pickCardHeader}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  <Text style={[styles.pickLabel, { color: colors.text }]} numberOfLines={1}>{pick.label}</Text>
                  <Text style={[styles.pickProbability, { color: colors.textMuted }]}>
                    {Math.round((pick.data.probability || pick.data.confidence || 0) * 100)}%
                  </Text>
                </View>
                <Text style={[styles.pickReason, { color: colors.textSecondary }]} numberOfLines={2}>
                  {pick.data.reason}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  trapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leagueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  leagueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  teamCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamNameSection: {
    flex: 1,
    marginRight: 10,
  },
  teamRank: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  formSection: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 3,
  },
  formBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  mainStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
  },
  statBoxLabel: {
    fontSize: 9,
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 9,
    flex: 1,
  },
  progressValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  statBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  analysisCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  aiSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  confidenceLabel: {
    fontSize: 9,
  },
  recommendationSection: {
    marginTop: 16,
  },
  recommendationLabel: {
    fontSize: 9,
    marginBottom: 6,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 20,
    fontWeight: '700',
  },
  trapBanner: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  trapBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  trapIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trapBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  trapBannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  reasoningSection: {
    marginTop: 16,
  },
  reasoningLabel: {
    fontSize: 9,
    marginBottom: 6,
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  fullAnalysisSection: {
    marginTop: 16,
  },
  h2hCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  h2hHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  h2hHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  h2hTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchesBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  h2hBarContainer: {
    marginBottom: 16,
  },
  h2hBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  h2hBarSegment: {
    height: '100%',
  },
  h2hLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  h2hLabelItem: {
    alignItems: 'center',
  },
  h2hLabelTitle: {
    fontSize: 10,
  },
  h2hLabelValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  h2hStats: {
    gap: 12,
  },
  h2hStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  h2hStatLabel: {
    width: 70,
    fontSize: 12,
    fontWeight: '500',
  },
  h2hStatBarWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  h2hStatBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  h2hStatValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  radarContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  picksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  picksTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  pickCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  pickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pickProbability: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickReason: {
    marginTop: 6,
    fontSize: 12,
    marginLeft: 26,
  },
  bottomPadding: {
    height: 40,
  },
});
