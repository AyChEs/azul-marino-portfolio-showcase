// Answer option — Direction D: gold serif letter chip (A/B/C/D) + label,
// spring feedback, state colors (idle/selected/correct/incorrect).
import React, { useEffect } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import { Spring, Duration, Ease, STAGGER_STEP } from "../../constants/motion";
import { feedback } from "../../lib/feedback";

type AnswerState = "idle" | "selected" | "correct" | "incorrect";

interface AnswerOptionProps {
  label: string;
  state: AnswerState;
  onSelect: (value: string) => void;
  disabled?: boolean;
  isRTL?: boolean;
  index: number;
}

const LETTERS = ["A", "B", "C", "D"] as const;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnswerOptionBase: React.FC<AnswerOptionProps> = ({
  label,
  state,
  onSelect,
  disabled = false,
  isRTL = false,
  index,
}) => {
  const scale = useSharedValue(0.96);
  const opacity = useSharedValue(0);

  // Staggered entrance on the UI thread (withDelay, not setTimeout — survives
  // re-renders and works identically on web). scale starts at 0.96 (never 0).
  useEffect(() => {
    scale.value = withDelay(index * STAGGER_STEP, withSpring(1, Spring.gentle));
    opacity.value = withDelay(
      index * STAGGER_STEP,
      withTiming(1, { duration: Duration.base, easing: Ease.out })
    );
  }, []);

  useEffect(() => {
    if (state === "incorrect") {
      // Quick horizontal-feeling shake via scale pulse, then settle.
      scale.value = withSequence(
        withSpring(1.02, Spring.pop),
        withSpring(0.98, Spring.pop),
        withSpring(1, Spring.press)
      );
    }
    if (state === "correct") {
      scale.value = withSpring(1.03, Spring.pop);
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const stateStyle =
    state === "correct"
      ? styles.correct
      : state === "incorrect"
        ? styles.incorrect
        : state === "selected"
          ? styles.selected
          : null;

  const letter = LETTERS[index] ?? "•";

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : () => onSelect(label)}
      onPressIn={() => {
        // Light tap on touch; the answer result (correct/incorrect) fires its
        // own stronger notification haptic in handleAnswer, so keep this subtle.
        if (!disabled) { feedback.tap(); scale.value = withSpring(0.98, Spring.press); }
      }}
      onPressOut={() => {
        if (!disabled && state === "idle")
          scale.value = withSpring(1, Spring.press);
      }}
      style={[
        animatedStyle,
        styles.container,
        isRTL && styles.containerRTL,
        stateStyle,
        disabled && state === "idle" && styles.dimmed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${letter}. ${label}`}
    >
      <View
        style={[
          styles.chip,
          state === "correct" && styles.chipCorrect,
          state === "incorrect" && styles.chipIncorrect,
        ]}
      >
        <Text style={styles.chipLetter}>{letter}</Text>
      </View>
      <Text
        style={[
          styles.label,
          state === "correct" && styles.labelCorrect,
          state === "incorrect" && styles.labelIncorrect,
          isRTL && { textAlign: "right", fontFamily: Fonts.arabic, fontSize: 17 },
        ]}
        numberOfLines={3}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

export const AnswerOption = React.memo(AnswerOptionBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(253, 246, 227, 0.05)",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  containerRTL: { flexDirection: "row-reverse" },
  correct: {
    backgroundColor: "rgba(22, 163, 74, 0.16)",
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
  dimmed: { opacity: 0.4 },
  chip: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(193, 154, 91, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(193, 154, 91, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipCorrect: { backgroundColor: "rgba(22,163,74,0.25)", borderColor: Colors.correct },
  chipIncorrect: { backgroundColor: "rgba(220,38,38,0.2)", borderColor: Colors.incorrect },
  chipLetter: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: Colors.gold.dusty,
  },
  label: {
    flex: 1,
    color: Colors.text.primary,
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 21,
  },
  labelCorrect: { color: Colors.correct, fontFamily: Fonts.bodyBold },
  labelIncorrect: { color: Colors.incorrect },
});
