import { useState, useEffect } from 'react';
import { fetchCombinationsFromApi } from '../services/apiClient';

export interface ComboMatch {
    id: number;
    league: string;
    home: string;
    away: string;
    time: string;
    pick: string;
    odds: number;
    confidence: number;
}

export interface CombinationData {
    id: number;
    score: number;
    type: string;
    date: string;
    reason?: string;
    matches: ComboMatch[];
}

export const useCombinations = (dateStr: string, language: string = 'en') => {
    const [combinations, setCombinations] = useState<CombinationData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedCombinations, setSavedCombinations] = useState<number[]>([]);
    const [skippedCombinations, setSkippedCombinations] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCombinations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchCombinationsFromApi(dateStr, language);
                // Ensure combinations exists inside response
                const rawCombinations = response?.combinations || [];

                const mapped: CombinationData[] = rawCombinations.map((c: any) => ({
                    id: c.combination_id || Math.random(),
                    type: c.type || 'COMBINATION',
                    score: c.total_odds || 0,
                    date: dateStr,
                    reason: c.reason,
                    matches: (c.matches || []).map((m: any) => ({
                        id: m.fixture_id || Math.random(),
                        league: m.league || 'Unknown',
                        home: m.home_team || 'Home',
                        away: m.away_team || 'Away',
                        time: '00:00', // API might not provide time in combination
                        pick: m.selection || 'Pick',
                        odds: m.odds || 0,
                        confidence: m.confidence || 0,
                    }))
                }));

                setCombinations(mapped);
                setCurrentIndex(0);
            } catch (err: any) {
                setError(err.message || 'Failed to load combinations');
                setCombinations([]);
            } finally {
                setLoading(false);
            }
        };

        if (dateStr) {
            loadCombinations();
        }
    }, [dateStr, language]);

    const handleSwipeLeft = () => {
        const currentCombo = combinations[currentIndex];
        if (currentCombo) {
            setSkippedCombinations((prev) => [...prev, currentCombo.id]);
        }
        setCurrentIndex((prev) => prev + 1);
    };

    const handleSwipeRight = () => {
        const currentCombo = combinations[currentIndex];
        if (currentCombo) {
            setSavedCombinations((prev) => [...prev, currentCombo.id]);
        }
        setCurrentIndex((prev) => prev + 1);
    };

    const resetCards = () => {
        setCurrentIndex(0);
        setSavedCombinations([]);
        setSkippedCombinations([]);
    };

    return {
        combinations,
        currentCombo: combinations[currentIndex],
        currentIndex,
        totalCount: combinations.length,
        savedCount: savedCombinations.length,
        skippedCount: skippedCombinations.length,
        isFinished: currentIndex >= combinations.length && combinations.length > 0,
        loading,
        error,
        handleSwipeLeft,
        handleSwipeRight,
        resetCards,
    };
};
