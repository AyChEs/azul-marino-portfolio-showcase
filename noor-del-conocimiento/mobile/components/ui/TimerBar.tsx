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

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
}

const WINDOW_WIDTH = Dimensions.get("window").width;

export const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalTime }) => {
  const fraction = Math.max(0, timeLeft / totalTime);
  const widthPx = useSharedValue(fraction * WINDOW_WIDTH);

  useEffect(() => {
    widthPx.value = withTiming(fraction * WINDOW_WIDTH, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [fraction]);

  const animatedBar = useAnimatedStyle(() => ({
    width: widthPx.value,
    backgroundColor: timerColor(widthPx.value / WINDOW_WIDTH),
  }));

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: totalTime, now: Math.ceil(timeLeft) }}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.bar, animatedBar]} />
      </View>
      <Text style={[styles.label, { color: timerColor(fraction) }]}>
        {Math.ceil(timeLeft)}s
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
  bar: {
    height: "100%",
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "right",
  },
});
