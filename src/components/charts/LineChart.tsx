import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polyline, Line, Text as SvgText } from 'react-native-svg';

interface LineChartProps {
    data: number[];
    labels: string[];
    color: string;
    width: number;
    height: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, labels, color, width, height }) => {
    if (!data || data.length === 0) return null;

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = padding + (i * chartWidth) / (data.length - 1);
        const y = height - padding - ((val - min) * chartHeight) / range;
        return `${x},${y}`;
    }).join(' ');

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                {/* Y Axis Grid */}
                {[0, 0.5, 1].map((p, i) => {
                    const y = height - padding - p * chartHeight;
                    return (
                        <Line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#E2E8F020"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* The Line */}
                <Polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {data.map((val, i) => {
                    const x = padding + (i * chartWidth) / (data.length - 1);
                    const y = height - padding - ((val - min) * chartHeight) / range;
                    return (
                        <SvgText
                            key={i}
                            x={x}
                            y={height - 2}
                            fontSize="10"
                            fill="#94A3B8"
                            textAnchor="middle"
                        >
                            {labels[i]}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
});
