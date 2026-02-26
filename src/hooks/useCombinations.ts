import { useState } from 'react';

// Mock combination data (moved from component)
const mockCombinations = [
    {
        id: 1,
        type: 'Double',
        totalOdds: 3.45,
        confidence: 72,
        matches: [
            { id: 1, home: 'Man City', away: 'Arsenal', pick: 'Over 2.5', league: 'Premier League', time: '15:00', odds: 1.85 },
            { id: 2, home: 'Bayern', away: 'Dortmund', pick: 'BTTS', league: 'Bundesliga', time: '17:30', odds: 1.87 },
        ],
    },
    {
        id: 2,
        type: 'Triple',
        totalOdds: 5.21,
        confidence: 65,
        matches: [
            { id: 3, home: 'Barcelona', away: 'Real Madrid', pick: 'Over 2.5', league: 'La Liga', time: '20:00', odds: 1.75 },
            { id: 4, home: 'PSG', away: 'Lyon', pick: 'BTTS', league: 'Ligue 1', time: '21:00', odds: 1.82 },
            { id: 5, home: 'Inter', away: 'Milan', pick: 'Over 2.5', league: 'Serie A', time: '18:00', odds: 1.64 },
        ],
    },
    {
        id: 3,
        type: 'Double',
        totalOdds: 4.12,
        confidence: 68,
        matches: [
            { id: 6, home: 'Liverpool', away: 'Chelsea', pick: 'BTTS', league: 'Premier League', time: '16:30', odds: 1.90 },
            { id: 7, home: 'Juventus', away: 'Roma', pick: 'Over 2.5', league: 'Serie A', time: '20:45', odds: 2.17 },
        ],
    },
    {
        id: 4,
        type: 'Single',
        totalOdds: 1.95,
        confidence: 78,
        matches: [
            { id: 8, home: 'Atletico', away: 'Sevilla', pick: 'Under 2.5', league: 'La Liga', time: '19:00', odds: 1.95 },
        ],
    },
];

export const useCombinations = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedCombinations, setSavedCombinations] = useState<number[]>([]);
    const [skippedCombinations, setSkippedCombinations] = useState<number[]>([]);

    const currentCombo = mockCombinations[currentIndex];

    const handleSwipeLeft = () => {
        if (currentIndex < mockCombinations.length) {
            setSkippedCombinations([...skippedCombinations, currentCombo.id]);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (currentIndex < mockCombinations.length) {
            setSavedCombinations([...savedCombinations, currentCombo.id]);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const resetCards = () => {
        setCurrentIndex(0);
        setSavedCombinations([]);
        setSkippedCombinations([]);
    };

    return {
        currentCombo,
        currentIndex,
        totalCount: mockCombinations.length,
        savedCount: savedCombinations.length,
        skippedCount: skippedCombinations.length,
        handleSwipeLeft,
        handleSwipeRight,
        resetCards,
        isFinished: currentIndex >= mockCombinations.length,
    };
};
