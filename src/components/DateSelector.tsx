import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
    const { colors } = useTheme();

    const getDates = () => {
        const dates = [];
        for (let i = -3; i <= 3; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const dates = getDates();

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            isToday: new Date().toDateString() === date.toDateString(),
        };
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {dates.map((d, i) => {
                    const info = formatDate(d);
                    const isSelected = d.toDateString() === selectedDate.toDateString();

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.dateCard,
                                { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: colors.border }
                            ]}
                            onPress={() => onSelectDate(d)}
                        >
                            <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : colors.textMuted }]}>
                                {info.isToday ? 'Today' : info.day}
                            </Text>
                            <Text style={[styles.dateText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                                {info.date}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 8 },
    scrollContent: { paddingHorizontal: 16, gap: 8 },
    dateCard: {
        width: 60,
        height: 70,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
    dateText: { fontSize: 18, fontWeight: '700' },
});

export default DateSelector;
