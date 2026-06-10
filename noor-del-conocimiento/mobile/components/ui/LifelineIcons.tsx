import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

/** Stroke SVG icons for the lifelines (section 4.4) — no emoji. */

const STROKE = { stroke: Colors.inkSoft, strokeWidth: 1.6, fill: 'none' as const };

/** Bipartite circle — Al-Furqān (50/50). */
export function FiftyFiftyIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...STROKE} />
      <Path d="M12 3v18" {...STROKE} />
      <Path d="M12 3a9 9 0 0 1 0 18z" fill={Colors.emeraldGlow} stroke="none" />
    </Svg>
  );
}

/** Hourglass — Aṣ-Ṣabr (+15s). */
export function ExtraTimeIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" {...STROKE} />
    </Svg>
  );
}

/** Forward curved arrow — Al-Hijra (skip). */
export function SkipIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 16c0-6 6-9 13-9" {...STROKE} />
      <Path d="M13 3l4 4-4 4" {...STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
