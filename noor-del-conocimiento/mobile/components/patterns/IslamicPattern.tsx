import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

/** Very subtle 8-pointed star background pattern (~3% ink on paper). */
export const IslamicPattern = memo(function IslamicPattern() {
  const cells: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 6; col++) {
      cells.push({ x: col * 72 + (row % 2 === 0 ? 0 : 36), y: row * 72 });
    }
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 432 864" preserveAspectRatio="xMidYMid slice">
        {cells.map(({ x, y }, i) => (
          <G key={i} transform={`translate(${x + 36}, ${y + 36})`}>
            <Path
              d={starPath(22)}
              fill="none"
              stroke={Colors.ink}
              strokeOpacity={0.03}
              strokeWidth={1}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
});

/** 8-pointed star (two overlapping rotated squares) path centered at origin. */
function starPath(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI / 8) * i;
    const radius = i % 2 === 0 ? r : r * 0.62;
    pts.push(`${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
