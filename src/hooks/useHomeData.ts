import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchLeagues, fetchMatches, League, Match } from '../services/api';

export const useHomeData = () => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadData = async (date: Date) => {
        try {
            setLoading(true);
            const [leaguesData, matchesData] = await Promise.all([
                fetchLeagues(),
                fetchMatches(formatDateForApi(date)),
            ]);
            setLeagues(leaguesData);
            setMatches(matchesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData(selectedDate);
    }, [selectedDate]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(selectedDate);
    }, [selectedDate]);

    const filteredMatches = useMemo(() => {
        let result = selectedLeague
            ? matches.filter((m) => m.league === selectedLeague)
            : matches;

        // Sort by qualified picks count (Business Logic)
        result = [...result].sort((a, b) => {
            const aCount = [
                a.prediction.over25,
                a.prediction.btts,
                a.prediction.two_to_three_goals,
                a.prediction.low_scoring,
                a.prediction.match_winner
            ].filter(p => p.is_qualified).length;

            const bCount = [
                b.prediction.over25,
                b.prediction.btts,
                b.prediction.two_to_three_goals,
                b.prediction.low_scoring,
                b.prediction.match_winner
            ].filter(p => p.is_qualified).length;

            return bCount - aCount;
        });

        return result;
    }, [matches, selectedLeague]);

    return {
        leagues,
        matches,
        selectedLeague,
        setSelectedLeague,
        selectedDate,
        setSelectedDate,
        loading,
        refreshing,
        onRefresh,
        filteredMatches,
    };
};
