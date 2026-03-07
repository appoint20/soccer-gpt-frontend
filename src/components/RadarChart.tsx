import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
    data: Record<string, number>;
    labels?: string[];
    size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, labels, size = 200 }) => {
    const center = size / 2;
    const radius = center - 30; // Leave room for labels

    // If labels are provided, use them. Otherwise fallback to the prediction defaults.
    const axisLabels = labels || ["OVER 2.5", "BTTS", "2-3 GOALS", "LOW SCORE", "WIN PROB"];
    const angleStep = (Math.PI * 2) / axisLabels.length;

    // Ordered axis matching the mockup or custom labels
    // Values mapped 0-100 to 0-1 multiplier
    const values = axisLabels.map(label => {
        // Map label back to data key if it's the default set
        if (!labels) {
            if (label === "OVER 2.5") return (data.over25 || 0) / 100;
            if (label === "BTTS") return (data.btts || 0) / 100;
            if (label === "2-3 GOALS") return (data.goals23 || 0) / 100;
            if (label === "LOW SCORE") return (data.lowScore || 0) / 100;
            if (label === "WIN PROB") return (data.winProb || 0) / 100;
        }

        // For custom charts, we assume keys are lowercase versions of labels or specific keys
        const key = label.toLowerCase().replace(/ /g, '_');
        return (data[key] || 0) / 100;
    });

    // Helper to calc coordinates
    const getPoint = (value: number, index: number) => {
        // -Math.PI / 2 starts it at exactly top 12 o'clock
        const angle = -Math.PI / 2 + index * angleStep;
        return {
            x: center + radius * value * Math.cos(angle),
            y: center + radius * value * Math.sin(angle)
        };
    };

    // Construct the polygon string for the data fill
    const dataPoints = values.map((val, i) => getPoint(val, i));
    const polygonPointsString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    // Draw background concentric grid polygons (e.g. 3 rings)
    const gridLevels = [0.33, 0.66, 1.0];

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Draw Grid Webs */}
                {gridLevels.map((level, levelIdx) => {
                    const levelPoints = axisLabels.map((_, i) => getPoint(level, i));
                    const pointsStr = levelPoints.map(p => `${p.x},${p.y}`).join(' ');
                    return (
                        <Polygon
                            key={`grid-${levelIdx}`}
                            points={pointsStr}
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Draw Axis Lines extending from center to edges */}
                {axisLabels.map((_, i) => {
                    const outerPoint = getPoint(1, i);
                    return (
                        <Line
                            key={`axis-${i}`}
                            x1={center}
                            y1={center}
                            x2={outerPoint.x}
                            y2={outerPoint.y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Draw Data Shape Polygon */}
                <Polygon
                    points={polygonPointsString}
                    fill="rgba(59, 130, 246, 0.2)" // Light blue fill
                    stroke="#3B82F6"             // Solid thick blue border
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Draw Axis Labels */}
                {axisLabels.map((label, i) => {
                    // Push labels slightly further out than the 1.0 radius ring
                    const labelPoint = getPoint(1.2, i);
                    return (
                        <SvgText
                            key={`label-${i}`}
                            x={labelPoint.x}
                            y={labelPoint.y}
                            fill="#9CA3AF"
                            fontSize="9"
                            fontWeight="600"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {label}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
