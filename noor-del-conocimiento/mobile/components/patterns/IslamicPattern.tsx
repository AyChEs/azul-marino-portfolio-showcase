import React from "react";
import { View } from "react-native";
import Svg, { Path, G, Defs, Pattern as SvgPattern, Rect } from "react-native-svg";

interface IslamicPatternProps {
  color?: string;
  opacity?: number;
  size?: number;
}

// 8-pointed star — foundational Islamic geometric motif
// Used as subtle background texture (design principle: texture supports mood, never competes)
export const EightPointStar: React.FC<IslamicPatternProps> = React.memo(
  ({ color = "#d4af37", opacity = 0.08, size = 40 }) => (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <G opacity={opacity} fill={color}>
        {/* Outer 8-pointed star */}
        <Path d="M20 2 L22.5 10 L30 7.5 L27.5 15 L35 17.5 L27.5 20 L35 22.5 L27.5 25 L30 32.5 L22.5 30 L20 38 L17.5 30 L10 32.5 L12.5 25 L5 22.5 L12.5 20 L5 17.5 L12.5 15 L10 7.5 L17.5 10 Z" />
        {/* Center square rotated 45° */}
        <Path d="M20 13 L27 20 L20 27 L13 20 Z" />
      </G>
    </Svg>
  )
);

// Repeating geometric tile background.
// Memoized — the SVG <pattern> handles repetition natively, no need to
// recompute on every parent re-render (timer ticks, answer state, etc).
const IslamicPatternBackgroundBase: React.FC<{
  color?: string;
  opacity?: number;
  tileSize?: number;
  style?: object;
}> = ({ color = "#d4af37", opacity = 0.06, tileSize = 50, style }) => {
  return (
    <View
      style={[
        { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
        style,
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <SvgPattern
            id="islamic-tile"
            x="0"
            y="0"
            width={tileSize}
            height={tileSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Simplified 6-point star for tile repeat */}
            <G opacity={opacity} fill={color}>
              <Path
                d={`M${tileSize / 2} ${tileSize * 0.1}
                   L${tileSize * 0.62} ${tileSize * 0.35}
                   L${tileSize * 0.88} ${tileSize * 0.35}
                   L${tileSize * 0.76} ${tileSize * 0.55}
                   L${tileSize * 0.88} ${tileSize * 0.75}
                   L${tileSize * 0.62} ${tileSize * 0.75}
                   L${tileSize / 2} ${tileSize * 0.9}
                   L${tileSize * 0.38} ${tileSize * 0.75}
                   L${tileSize * 0.12} ${tileSize * 0.75}
                   L${tileSize * 0.24} ${tileSize * 0.55}
                   L${tileSize * 0.12} ${tileSize * 0.35}
                   L${tileSize * 0.38} ${tileSize * 0.35} Z`}
              />
            </G>
          </SvgPattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#islamic-tile)" />
      </Svg>
    </View>
  );
};
export const IslamicPatternBackground = React.memo(IslamicPatternBackgroundBase);

// Decorative arch / mihrab shape — used as card top ornament
export const MihrabArch: React.FC<{ color?: string; width?: number }> = React.memo(
  ({ color = "#d4af37", width = 200 }) => {
    const h = width * 0.4;
    return (
      <Svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}>
        <Path
          d={`M${width * 0.1} ${h}
             Q${width * 0.1} ${h * 0.2} ${width / 2} ${h * 0.05}
             Q${width * 0.9} ${h * 0.2} ${width * 0.9} ${h}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity={0.4}
        />
        {/* Inner arch */}
        <Path
          d={`M${width * 0.2} ${h}
             Q${width * 0.2} ${h * 0.35} ${width / 2} ${h * 0.15}
             Q${width * 0.8} ${h * 0.35} ${width * 0.8} ${h}`}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={0.25}
        />
      </Svg>
    );
  }
);
