import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface StatItem {
    id: string;
    icon: string;
    label: string;
    value: number | string;
    iconColor: string;
}

interface StatGridProps {
    matchCount: number;
    highConfidenceCount: number;
    qualifiedPicksCount: number;
    trapsCount: number;
    activeFilter?: 'matches' | 'confidence' | 'picks' | 'traps' | null;
    onSelectFilter?: (filter: 'matches' | 'confidence' | 'picks' | 'traps' | null) => void;
}

export const StatGrid: React.FC<StatGridProps> = ({
    matchCount,
    highConfidenceCount,
    qualifiedPicksCount,
    trapsCount,
    activeFilter,
    onSelectFilter,
}) => {
    const { t } = useTranslation();

    const stats: StatItem[] = [
        { id: 'matches', icon: 'trophy-outline', label: t('statMatches', 'MATCHES'), value: matchCount, iconColor: Colors.matches },
        { id: 'confidence', icon: 'bulb-outline', label: t('statHighConfidence', 'HIGH CONFIDENCE'), value: highConfidenceCount, iconColor: Colors.highConfidence },
        { id: 'picks', icon: 'trending-up-outline', label: t('statQualifiedPicks', 'QUALIFIED PICKS'), value: qualifiedPicksCount, iconColor: Colors.qualifiedPicks },
        { id: 'traps', icon: 'warning-outline', label: t('statTraps', 'TRAPS DETECTED'), value: trapsCount, iconColor: Colors.traps },
    ];

    const handlePress = (id: string) => {
        if (!onSelectFilter) return;
        // If clicking matches, or clicking the already active filter, clear it (null)
        if (id === 'matches' || id === activeFilter) {
            onSelectFilter(null);
        } else {
            onSelectFilter(id as any);
        }
    };

    return (
        <View style={styles.grid}>
            {stats.map((stat) => {
                const isActive = activeFilter === stat.id || (!activeFilter && stat.id === 'matches');
                return (
                    <TouchableOpacity
                        key={stat.id}
                        style={[
                            styles.card,
                            isActive && { borderColor: stat.iconColor, borderWidth: 1.5, backgroundColor: `${stat.iconColor}08` }
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handlePress(stat.id)}
                    >
                        <View style={styles.cardTop}>
                            <Ionicons name={stat.icon as any} size={18} color={stat.iconColor} />
                            <Text style={[styles.cardLabel, { color: stat.iconColor }]}>{stat.label}</Text>
                        </View>
                        <Text style={[styles.cardValue, { color: stat.iconColor }]}>{stat.value}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 10,
        marginVertical: 12,
    },
    card: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: `${Colors.accent}30`,
        gap: 8,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        flexShrink: 1,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: '800',
    },
});
