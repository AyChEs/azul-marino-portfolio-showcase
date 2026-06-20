// Welcome — title screen shown on every launch after the language is set.
// Cinematic staggered entrance: bismillah → نور wordmark → tagline → CTA.
// Quick links to How to Play and Stats, plus streak/best-score strip.
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { NoorButton } from "../components/ui/NoorButton";
// import { HadithCard } from "../components/ui/HadithCard"; // daily hadith disabled for now
import { IslamicPatternBackground, MihrabArch } from "../components/patterns/IslamicPattern";
import { getStats, getDailyStreak } from "../lib/storage";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [bestScore, setBestScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStats(), getDailyStreak()]).then(([stats, s]) => {
      if (cancelled) return;
      setBestScore(stats.bestScore);
      setGamesPlayed(stats.gamesPlayed);
      setStreak(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bismillahOpacity = useSharedValue(0);
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.85);
  const taglineOpacity = useSharedValue(0);
  const stripOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(16);

  useEffect(() => {
    bismillahOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    markOpacity.value = withDelay(350, withTiming(1, { duration: 600 }));
    markScale.value = withDelay(350, withSpring(1, { stiffness: 90, damping: 14 }));
    taglineOpacity.value = withDelay(750, withTiming(1, { duration: 450 }));
    stripOpacity.value = withDelay(950, withTiming(1, { duration: 400 }));
    ctaOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
    ctaY.value = withDelay(1100, withSpring(0, { stiffness: 120, damping: 16 }));
  }, []);

  const bismillahStyle = useAnimatedStyle(() => ({ opacity: bismillahOpacity.value }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const stripStyle = useAnimatedStyle(() => ({ opacity: stripOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const hasHistory = gamesPlayed > 0 || streak > 0;

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />

      <View style={styles.archWrap} pointerEvents="none">
        <MihrabArch color={Colors.gold.dusty} width={230} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.bismillah, bismillahStyle]}>
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Animated.Text>

        <Animated.View style={[styles.markBlock, markStyle]}>
          <Text style={styles.wordmark}>نور</Text>
          <Text style={styles.noor}>Noor</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineBlock, taglineStyle]}>
          <Text style={styles.tagline}>DEL CONOCIMIENTO</Text>
          <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
        </Animated.View>

        {/* Streak / best score strip */}
        {hasHistory && (
          <Animated.View style={[styles.strip, stripStyle]}>
            {streak > 0 && (
              <View style={styles.stripItem}>
                <Text style={styles.stripValue}>🔥 {streak}</Text>
                <Text style={styles.stripLabel}>{t("welcome.streakLabel")}</Text>
              </View>
            )}
            {bestScore > 0 && (
              <>
                {streak > 0 && <View style={styles.stripDivider} />}
                <View style={styles.stripItem}>
                  <Text style={styles.stripValue}>{bestScore}</Text>
                  <Text style={styles.stripLabel}>{t("welcome.bestLabel")}</Text>
                </View>
              </>
            )}
            {gamesPlayed > 0 && (
              <>
                <View style={styles.stripDivider} />
                <View style={styles.stripItem}>
                  <Text style={styles.stripValue}>{gamesPlayed}</Text>
                  <Text style={styles.stripLabel}>{t("welcome.gamesLabel")}</Text>
                </View>
              </>
            )}
          </Animated.View>
        )}

        <Animated.View style={[styles.actions, ctaStyle]}>
          <NoorButton
            onPress={() => router.push("/home")}
            label={t("welcome.playCta")}
            variant="gold"
            size="lg"
          />
          <View style={styles.linkRow}>
            <TouchableOpacity
              onPress={() => router.push("/rules")}
              accessibilityRole="button"
              accessibilityLabel={t("welcome.howToPlay")}
              style={styles.link}
            >
              <Text style={styles.linkText}>{t("welcome.howToPlay")}</Text>
            </TouchableOpacity>
            <Text style={styles.linkDot}>·</Text>
            <TouchableOpacity
              onPress={() => router.push("/stats")}
              accessibilityRole="button"
              accessibilityLabel={t("welcome.statsLink")}
              style={styles.link}
            >
              <Text style={styles.linkText}>{t("welcome.statsLink")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Daily hadith disabled for now — re-enable by restoring <HadithCard />:
        <Animated.View style={[styles.hadithWrap, stripStyle]}>
          <HadithCard />
        </Animated.View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  archWrap: { position: "absolute", top: 54, alignSelf: "center", opacity: 0.5 },
  bismillah: {
    fontFamily: Fonts.verse,
    fontSize: 18,
    color: Colors.gold.light,
    marginBottom: 22,
    textAlign: "center",
  },
  markBlock: { alignItems: "center" },
  wordmark: {
    fontFamily: Fonts.arabicBold,
    fontSize: 92,
    lineHeight: 120,
    color: Colors.parchment.primary,
    textShadowColor: "rgba(212, 175, 55, 0.35)",
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },
  noor: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 28,
    color: Colors.gold.cta,
    marginTop: -8,
  },
  taglineBlock: { alignItems: "center", marginTop: 10 },
  tagline: {
    ...MicroLabel,
    letterSpacing: 3,
    color: "rgba(253, 246, 227, 0.65)",
  },
  subtitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 10,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 21,
  },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 26,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.04)",
  },
  stripItem: { alignItems: "center", gap: 2 },
  stripValue: { fontFamily: Fonts.serif, fontSize: 20, color: Colors.parchment.primary },
  stripLabel: { ...MicroLabel, fontSize: 9, color: Colors.text.muted },
  stripDivider: { width: 1, height: 28, backgroundColor: Colors.border.subtle },
  actions: { width: "100%", maxWidth: 420, marginTop: 34, gap: 14 },
  hadithWrap: { width: "100%", alignItems: "center", marginTop: 28 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  link: { paddingVertical: 6, paddingHorizontal: 4 },
  linkText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: Colors.gold.dusty,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(193, 154, 91, 0.4)",
  },
  linkDot: { color: Colors.text.muted, fontSize: 14 },
});
