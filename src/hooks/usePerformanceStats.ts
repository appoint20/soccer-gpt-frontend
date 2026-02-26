import { useMemo } from 'react';

export const usePerformanceStats = () => {
    // Mock data for statistics
    const weeklyData = useMemo(() => [
        { week: 'W1', profit: 12.5, roi: 8.2, bets: 24, won: 15 },
        { week: 'W2', profit: -5.2, roi: -3.1, bets: 18, won: 8 },
        { week: 'W3', profit: 8.4, roi: 5.6, bets: 22, won: 14 },
        { week: 'W4', profit: 15.1, roi: 10.4, bets: 30, won: 19 },
        { week: 'W5', profit: 2.3, roi: 1.5, bets: 20, won: 11 },
        { week: 'W6', profit: -8.7, roi: -5.8, bets: 25, won: 10 },
        { week: 'W7', profit: 11.2, roi: 7.9, bets: 28, won: 18 },
        { week: 'W8', profit: 6.5, roi: 4.2, bets: 15, won: 9 },
        { week: 'W9', profit: 18.2, roi: 12.1, bets: 32, won: 22 },
        { week: 'W10', profit: 4.8, roi: 3.2, bets: 21, won: 12 },
    ], []);

    const totals = useMemo(() => {
        return weeklyData.reduce(
            (acc, curr) => ({
                profit: acc.profit + curr.profit,
                roi: acc.roi + curr.roi,
                bets: acc.bets + curr.bets,
                won: acc.won + curr.won,
            }),
            { profit: 0, roi: 0, bets: 0, won: 0 }
        );
    }, [weeklyData]);

    return {
        weeklyData,
        totalProfit: totals.profit,
        totalWon: totals.won,
        totalBets: totals.bets,
        avgROI: totals.roi / weeklyData.length,
        winRate: (totals.won / totals.bets) * 100,
    };
};
