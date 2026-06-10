import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface TimerBarProps {
  /** Remaining fraction of time, 0..1. */
  fraction: number;
}

/** Emerald → gold → terracotta as time runs out. Isolated so the per-second
 *  re-render does not drag the whole screen. */
export const TimerBar = memo(function TimerBar({ fraction }: TimerBarProps) {
  const color =
    fraction > 0.5 ? Colors.emerald : fraction > 0.25 ? Colors.goldHi : Colors.terracotta;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.max(0, Math.min(1, fraction)) * 100}%`, { duration: 250 }),
    backgroundColor: withTiming(color, { duration: 250 }),
    shadowColor: color,
  }));

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
});

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.hairline,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
