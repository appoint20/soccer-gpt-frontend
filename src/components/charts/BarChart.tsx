import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

interface BarChartProps {
    data: { label: string; value: number }[];
    color: string;
    width: number;
    height: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, width, height }) => {
    if (!data || data.length === 0) return null;

    const padding = 20;
    const barGap = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const max = Math.max(...data.map(d => d.value)) || 1;
    const barWidth = (chartWidth - (data.length - 1) * barGap) / data.length;

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                {data.map((item, i) => {
                    const barHeight = (item.value * chartHeight) / max;
                    const x = padding + i * (barWidth + barGap);
                    const y = height - padding - barHeight;

                    return (
                        <React.Fragment key={i}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                rx="4"
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={height - 2}
                                fontSize="10"
                                fill="#94A3B8"
                                textAnchor="middle"
                            >
                                {item.label}
                            </SvgText>
                            <SvgText
                                x={x + barWidth / 2}
                                y={y - 4}
                                fontSize="10"
                                fill={color}
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {item.value}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
});
