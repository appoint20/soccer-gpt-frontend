import axios from 'axios';

// Note: No backend required for core functionality as per requirements.
// These are placeholders for potential future data fetching.

export interface League {
    id: string;
    name: string;
    country: string;
    logo: string;
}

export interface Match {
    id: number;
    home: string;
    away: string;
    time: string;
    league: string;
    prediction: {
        over25: { value: string; confidence: number; is_qualified: boolean };
        btts: { value: string; confidence: number; is_qualified: boolean };
        two_to_three_goals: { value: string; confidence: number; is_qualified: boolean };
        low_scoring: { value: string; confidence: number; is_qualified: boolean };
        match_winner: { value: string; confidence: number; is_qualified: boolean };
    };
}

export const fetchLeagues = async (): Promise<League[]> => {
    // Return mock leagues
    return [
        { id: '1', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', logo: '' },
        { id: '2', name: 'La Liga', country: '🇪🇸 Spain', logo: '' },
        { id: '3', name: 'Bundesliga', country: '🇩🇪 Germany', logo: '' },
        { id: '4', name: 'Serie A', country: '🇮🇹 Italy', logo: '' },
        { id: '5', name: 'Ligue 1', country: '🇫🇷 France', logo: '' },
    ];
};

export const fetchMatches = async (date: string): Promise<Match[]> => {
    // Return mock matches with predictions
    return [
        {
            id: 1,
            home: 'Man City',
            away: 'Arsenal',
            time: '12:30',
            league: 'Premier League',
            prediction: {
                over25: { value: 'YES', confidence: 85, is_qualified: true },
                btts: { value: 'YES', confidence: 78, is_qualified: true },
                two_to_three_goals: { value: 'NO', confidence: 45, is_qualified: false },
                low_scoring: { value: 'NO', confidence: 32, is_qualified: false },
                match_winner: { value: 'HOME', confidence: 62, is_qualified: true },
            },
        },
        {
            id: 2,
            home: 'Liverpool',
            away: 'Chelsea',
            time: '15:00',
            league: 'Premier League',
            prediction: {
                over25: { value: 'YES', confidence: 72, is_qualified: true },
                btts: { value: 'YES', confidence: 82, is_qualified: true },
                two_to_three_goals: { value: 'YES', confidence: 68, is_qualified: true },
                low_scoring: { value: 'NO', confidence: 15, is_qualified: false },
                match_winner: { value: 'HOME', confidence: 55, is_qualified: true },
            },
        },
    ];
};
