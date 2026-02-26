export const getLeagueFlag = (leagueName: string): string => {
    const flags: { [key: string]: string } = {
        'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'La Liga': '🇪🇸',
        'Bundesliga': '🇩🇪',
        'Serie A': '🇮🇹',
        'Ligue 1': '🇫🇷',
        'Eredivisie': '🇳🇱',
        'Primeira Liga': '🇵🇹',
        'Champions League': '🇪🇺',
        'Europa League': '🇪🇺',
        'World Cup': '🌎',
    };

    return flags[leagueName] || '⚽';
};
