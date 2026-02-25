import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 200 }) => {
  const { colors } = useTheme();
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / data.length;

  // Generate points for the polygon
  const generatePoints = (dataArray: { label: string; value: number }[]) => {
    return dataArray
      .map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (d.value / 100) * radius;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate grid lines
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level;
    const points = data
      .map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
    gridLines.push(
      <Polygon
        key={`grid-${level}`}
        points={points}
        fill="none"
        stroke={colors.border}
        strokeWidth={1}
        opacity={0.3}
      />
    );
  }

  // Generate axis lines
  const axisLines = data.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x2 = centerX + radius * Math.cos(angle);
    const y2 = centerY + radius * Math.sin(angle);
    return (
      <Line
        key={`axis-${i}`}
        x1={centerX}
        y1={centerY}
        x2={x2}
        y2={y2}
        stroke={colors.border}
        strokeWidth={1}
        opacity={0.3}
      />
    );
  });

  // Generate labels
  const labels = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const labelRadius = radius + 25;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return (
      <SvgText
        key={`label-${i}`}
        x={x}
        y={y}
        fontSize={10}
        fill={colors.textSecondary}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {d.label}
      </SvgText>
    );
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {gridLines}
          {axisLines}
          <Polygon
            points={generatePoints(data)}
            fill={colors.chartFill}
            stroke={colors.chartStroke}
            strokeWidth={2}
          />
          {data.map((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = (d.value / 100) * radius;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            return (
              <Circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={colors.chartStroke}
              />
            );
          })}
          {labels}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RadarChart;
