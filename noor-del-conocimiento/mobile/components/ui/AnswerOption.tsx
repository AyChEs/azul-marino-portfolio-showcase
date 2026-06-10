// Answer option button — core game interaction component
// Design: Emil Kowalski spring feedback + color state (idle/selected/correct/incorrect)
// RTL-aware text alignment for Darija
import React, { useEffect } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";

type AnswerState = "idle" | "selected" | "correct" | "incorrect";

interface AnswerOptionProps {
  label: string;
  state: AnswerState;
  // Stable handler called with the option value — lets the parent memoize
  // without recreating an arrow function per row on every render.
  onSelect: (value: string) => void;
  disabled?: boolean;
  isRTL?: boolean;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnswerOptionBase: React.FC<AnswerOptionProps> = ({
  label,
  state,
  onSelect,
  disabled = false,
  isRTL = false,
  index,
}) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  // Stagger entrance — 60ms between options (Emil: 30-80ms between items)
  useEffect(() => {
    const delay = index * 60;
    setTimeout(() => {
      scale.value = withSpring(1, { stiffness: 180, damping: 18 });
      opacity.value = withTiming(1, { duration: 220 });
    }, delay);
  }, []);

  // Shake animation for incorrect
  useEffect(() => {
    if (state === "incorrect") {
      scale.value = withSequence(
        withSpring(1.02, { stiffness: 600, damping: 10 }),
        withSpring(0.98, { stiffness: 600, damping: 10 }),
        withSpring(1.02, { stiffness: 600, damping: 10 }),
        withSpring(1, { stiffness: 300, damping: 20 })
      );
    }
    if (state === "correct") {
      scale.value = withSpring(1.03, { stiffness: 300, damping: 18 });
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.97, { stiffness: 400, damping: 25 });
  };

  const handlePressOut = () => {
    if (!disabled && state === "idle") {
      scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    }
  };

  const containerStyle = [
    styles.container,
    state === "correct" && styles.correct,
    state === "incorrect" && styles.incorrect,
    state === "selected" && styles.selected,
    disabled && state === "idle" && styles.dimmed,
  ];

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : () => onSelect(label)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.label,
          state === "correct" && styles.labelCorrect,
          state === "incorrect" && styles.labelIncorrect,
          isRTL && { textAlign: "right", fontFamily: "Amiri_400Regular", fontSize: 18 },
        ]}
        numberOfLines={3}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

// Memoized — option props only change when the question/state/disabled changes,
// not when the parent re-renders from the timer tick.
export const AnswerOption = React.memo(AnswerOptionBase);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Double-bezel hint via inner shadow would be here in web
    // In RN we achieve it via border + background contrast
  },
  correct: {
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    borderColor: Colors.correct,
  },
  incorrect: {
    backgroundColor: "rgba(220, 38, 38, 0.12)",
    borderColor: Colors.incorrect,
  },
  selected: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: Colors.accent.emerald,
  },
  dimmed: {
    opacity: 0.45,
  },
  label: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  labelCorrect: {
    color: Colors.correct,
    fontWeight: "700",
  },
  labelIncorrect: {
    color: Colors.incorrect,
  },
});
