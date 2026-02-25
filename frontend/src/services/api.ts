import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface League {
  id: number;
  name: string;
}

export interface TeamStats {
  name: string;
  rank: number;
  points: number;
  form: string;
  form_percentage: number;
  possession: number;
  momentum: number;
  avg_goals_scored_last_3: number;
  avg_goals_conceded_last_3: number;
  btts_rate_last_3: number;
  over_25_rate_last_3: number;
  avg_goals_scored_last_7: number;
  avg_goals_conceded_last_7: number;
  attack_strength: number;
  defensive_strength: number;
  clean_sheet_rate: number;
  win_rate: number;
  zero_zero_matches: number;
}

export interface Prediction {
  prediction: boolean | string;
  probability: number;
  is_qualified: boolean;
  reason: string;
  confidence?: number;
}

export interface HeadToHead {
  matches_analyzed: number;
  draw_rate: number;
  home_win_rate: number;
  away_win_rate: number;
  btts_rate: number;
  over25_rate: number;
  two_to_three_goals_rate: number;
  avg_goals_home: number;
  avg_goals_away: number;
  avg_total_goals: number;
  last_match_date: string;
  is_valid: boolean;
}

export interface Trap {
  is_trap: boolean;
  reason: string;
}

export interface GeminiAnalysis {
  recommendation: string;
  confidence: number;
  reasoning: string;
  full_analysis: string;
}

export interface Match {
  id: number;
  date: string;
  time: string;
  league: string;
  home_team: string;
  away_team: string;
  result: string | null;
  odds_home_win: number;
  odds_draw: number;
  odds_away_win: number;
  odds_over25: number;
  odds_btts_yes: number;
  home_stats: TeamStats;
  away_stats: TeamStats;
  models: {
    poisson: {
      home_win: number;
      draw: number;
      away_win: number;
      btts: number;
      over25: number;
      two_to_three_goals: number;
      scoring_draw_prob: number;
      is_valid: boolean;
    };
    monte_carlo: {
      simulation_count: number;
      home_win: number;
      draw: number;
      away_win: number;
      btts: number;
      over25: number;
      two_to_three_goals: number;
      is_valid: boolean;
    };
  };
  trap: Trap;
  prediction: {
    over25: Prediction;
    btts: Prediction;
    two_to_three_goals: Prediction;
    low_scoring: Prediction;
    match_winner: Prediction;
  };
  h2_h: HeadToHead;
  gemini: GeminiAnalysis | null;
}

export const fetchLeagues = async (): Promise<League[]> => {
  try {
    const response = await api.get('/leagues');
    return response.data;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
};

export const fetchMatches = async (date: string): Promise<Match[]> => {
  try {
    const response = await api.get('/matches', {
      params: { date },
    });
    return response.data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export default api;
