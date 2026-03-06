import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
    title: string;
    subtitle: string;
    showWarning?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, showWarning }) => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {showWarning && (
                <View style={styles.warningContainer}>
                    <Ionicons name="warning" size={24} color="#F59E0B" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    textContainer: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        fontSize: 25,
        fontWeight: '900', // Black matching "Match Details" in screenshot
        color: '#111827',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    warningContainer: {
        marginTop: 4,
    },
});
