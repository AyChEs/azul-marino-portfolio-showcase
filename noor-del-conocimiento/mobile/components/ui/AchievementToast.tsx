// Achievement-unlock toast. Shows a queue of newly-earned achievements one at
// a time, sliding in from the top. Self-dismisses; respects reduced motion.
import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { Fonts, MicroLabel } from "../../constants/fonts";
import type { Achievement } from "../../lib/achievements";

const VISIBLE_MS = 2600;

export const AchievementToast: React.FC<{ queue: Achievement[] }> = ({ queue }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const current = queue[index];

  useEffect(() => {
    if (!current) return;
    const advance = () => setIndex((i) => i + 1);
    translateY.value = withSpring(0, { stiffness: 140, damping: 16 });
    opacity.value = withTiming(1, { duration: 220 });
    // Hold, then slide out and advance to the next queued achievement.
    translateY.value = withDelay(
      VISIBLE_MS,
      withTiming(-120, { duration: 280 }, (finished) => {
        if (finished) runOnJS(advance)();
      })
    );
    opacity.value = withDelay(VISIBLE_MS, withTiming(0, { duration: 280 }));
    // Re-runs whenever `index` changes (i.e. a new toast is shown).
  }, [index, current]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <Animated.View style={[styles.toast, style]} pointerEvents="none">
      <Text style={styles.icon}>{current.icon}</Text>
      <Animated.View>
        <Text style={styles.label}>{t("achievementToast.unlocked")}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {t(`achievements.${current.id}`)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 54,
    alignSelf: "center",
    zIndex: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: "90%",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(20, 40, 28, 0.97)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  icon: { fontSize: 26, color: Colors.gold.light },
  label: { ...MicroLabel, fontSize: 9, color: Colors.gold.dusty },
  name: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 16,
    color: Colors.parchment.primary,
  },
});
