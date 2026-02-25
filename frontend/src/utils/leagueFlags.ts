// League to country flag mapping
export const leagueFlags: { [key: string]: string } = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Championship': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'League One': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'League Two': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Bundesliga': '🇩🇪',
  '2. Bundesliga': '🇩🇪',
  'Serie A': '🇮🇹',
  'Serie B': '🇮🇹',
  'La Liga': '🇪🇸',
  'La Liga 2': '🇪🇸',
  'Ligue 1': '🇫🇷',
  'Ligue 2': '🇫🇷',
};

export const getLeagueFlag = (leagueName: string): string => {
  return leagueFlags[leagueName] || '⚽';
};
