// Timer bar — animates with linear easing (progress bars are linear, not spring)
// Color shifts green→amber→red as time runs out.
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { timerColor } from "../../lib/utils";
import { Fonts } from "../../constants/fonts";

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
  /** When true the bar freezes and shows a pause label — review phase after answering. */
  paused?: boolean;
  pausedLabel?: string;
}

const WINDOW_WIDTH = Dimensions.get("window").width;

export const TimerBar: React.FC<TimerBarProps> = ({
  timeLeft,
  totalTime,
  paused = false,
  pausedLabel = "—",
}) => {
  const fraction = Math.max(0, timeLeft / totalTime);
  const widthPx = useSharedValue(fraction * WINDOW_WIDTH);

  useEffect(() => {
    if (paused) return;
    widthPx.value = withTiming(fraction * WINDOW_WIDTH, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [fraction, paused, widthPx]);

  const animatedBar = useAnimatedStyle(() => ({
    width: widthPx.value,
    backgroundColor: paused
      ? "rgba(193, 154, 91, 0.55)"
      : timerColor(widthPx.value / WINDOW_WIDTH),
  }));

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={
        paused
          ? { text: pausedLabel }
          : { min: 0, max: totalTime, now: Math.ceil(timeLeft) }
      }
    >
      <View style={[styles.track, paused && styles.trackPaused]}>
        <Animated.View style={[styles.bar, animatedBar]} />
      </View>
      <Text style={[styles.label, paused ? styles.labelPaused : { color: timerColor(fraction) }]}>
        {paused ? pausedLabel : `${Math.ceil(timeLeft)}s`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(253, 246, 227, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  trackPaused: {
    backgroundColor: "rgba(193, 154, 91, 0.12)",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    minWidth: 30,
    textAlign: "right",
    // Tabular figures so the countdown doesn't shift width on 10→9.
    fontVariant: ["tabular-nums"],
  },
  labelPaused: {
    fontFamily: Fonts.bodySemiBold,
    color: "rgba(193, 154, 91, 0.9)",
    fontSize: 11,
    minWidth: 72,
  },
});
