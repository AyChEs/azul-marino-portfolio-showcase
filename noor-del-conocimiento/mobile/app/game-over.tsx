// Game Over Screen — resultados modo Musafir
// Design: staggered reveal, gold rank display, Islamic pattern
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { Duration, Ease, Spring } from "../constants/motion";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { Confetti } from "../components/ui/Confetti";
import { AchievementToast } from "../components/ui/AchievementToast";
import { ACHIEVEMENT_ICONS } from "../lib/achievements";
import { getRank, RANKS } from "../lib/gameLogic";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../lib/types";
import { feedback } from "../lib/feedback";
import { ShareCard } from "../components/share/ShareCard";
import { captureViewAsImage, downloadImage } from "../lib/shareImage";
import { logError } from "../lib/logger";

export default function GameOverScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const params = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    newRecord: string;
    unlocked: string;
    language: string;
    category: string;
    difficulty: string;
  }>();

  // Clamp all numeric params to valid ranges — prevents manipulated deep links
  // from showing impossible scores or dividing by zero.
  const score = Math.min(100, Math.max(0, parseInt(params.score ?? "0", 10) || 0));
  const total = Math.max(1, parseInt(params.total ?? "1", 10) || 1);
  const correct = Math.min(total, Math.max(0, parseInt(params.correct ?? "0", 10) || 0));
  const rank = getRank(score);
  const rankIndex = Math.max(0, RANKS.indexOf(rank));
  const rankDots = RANKS.map((_, i) => (i <= rankIndex ? "●" : "○")).join(" ");
  const isNewRecord = params.newRecord === "1";
  const isPerfect = correct >= total;

  // Newly-unlocked achievements (ids passed from play.tsx) → toast queue.
  const unlockedQueue = useMemo(() => {
    const ids = (params.unlocked ?? "").split(",").filter(Boolean);
    return ids.map((id) => ({ id, icon: ACHIEVEMENT_ICONS[id] ?? "✦", unlocked: true }));
  }, [params.unlocked]);

  const shareCardRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const showConfetti = isNewRecord || isPerfect;

  // Fire victory haptic once
  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => feedback.victory(), 500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  const handleShare = useCallback(async () => {
    setIsCapturing(true);
  }, []);

  // Capture the card once the overlay renders it visible
  useEffect(() => {
    if (!isCapturing) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (cancelled) return;
        const uri = await captureViewAsImage(shareCardRef);
        if (cancelled) return;
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: t("game.shareTitle"),
          });
        } else if (Platform.OS === "web") {
          await downloadImage(uri, "noor-result.png");
        } else {
          Alert.alert(t("game.shareUnavailable"));
        }
      } catch (e) {
        logError("game-over.share", e);
      }
      if (!cancelled) setIsCapturing(false);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isCapturing]);

  // Staggered entrance animations. Each block fades + rises slightly (never
  // opacity-only — that reads as a generic AI fade). Custom ease-out curve,
  // ~80ms stagger between blocks; the score gets a restrained spring pop.
  const archOpacity = useSharedValue(0);
  const archY = useSharedValue(10);
  const scoreScale = useSharedValue(0.9);
  const scoreOpacity = useSharedValue(0);
  const rankOpacity = useSharedValue(0);
  const rankY = useSharedValue(14);
  const statsOpacity = useSharedValue(0);
  const statsY = useSharedValue(14);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(14);

  useEffect(() => {
    const rise = (delay: number) =>
      withDelay(delay, withTiming(0, { duration: Duration.slow, easing: Ease.out }));
    const fade = (delay: number) =>
      withDelay(delay, withTiming(1, { duration: Duration.slow, easing: Ease.out }));

    archOpacity.value = fade(0);
    archY.value = rise(0);
    scoreOpacity.value = fade(120);
    scoreScale.value = withDelay(120, withSpring(1, Spring.pop));
    rankOpacity.value = fade(280);
    rankY.value = rise(280);
    statsOpacity.value = fade(420);
    statsY.value = rise(420);
    buttonsOpacity.value = fade(560);
    buttonsY.value = rise(560);
  }, []);

  const archStyle = useAnimatedStyle(() => ({
    opacity: archOpacity.value,
    transform: [{ translateY: archY.value }],
  }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));
  const rankStyle = useAnimatedStyle(() => ({
    opacity: rankOpacity.value,
    transform: [{ translateY: rankY.value }],
  }));
  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsY.value }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  const handlePlayAgain = () => {
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.root}>
      {showConfetti && <Confetti />}
      {unlockedQueue.length > 0 && <AchievementToast queue={unlockedQueue} />}
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.05} tileSize={52} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Ornament + title */}
        <Animated.View style={[styles.headerBlock, archStyle]}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("gameOver.solo.title")}</Text>
        </Animated.View>

        {/* Score */}
        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          {isNewRecord && (
            <Text style={styles.newRecord}>★ {t("game.newRecord")}</Text>
          )}
          <Text style={styles.scoreLabel}>{t("gameOver.finalScore")}</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreOutOf}>
            {correct} {t("gameOver.correctOf")} {total} {t("gameOver.questions")}
          </Text>
        </Animated.View>

        {/* Rank */}
        <Animated.View style={rankStyle}>
          <NoorCard variant="gold" style={styles.rankCard}>
            <View style={styles.rankMetaRow}>
              <Text style={styles.rankMeta}>
                {t("gameOver.rankLabel")} · {rankIndex + 1}/{RANKS.length}
              </Text>
              <Text style={styles.rankDots}>{rankDots}</Text>
            </View>
            <Text style={[styles.rankTitle, isRTL && { textAlign: "right" }]}>
              {t(rank.titleKey)}
            </Text>
            <Text style={[styles.rankDesc, isRTL && { textAlign: "right" }]}>
              “{t(rank.descriptionKey)}”
            </Text>
          </NoorCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={statsStyle}>
          <NoorCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{correct}/{total}</Text>
                <Text style={styles.statLabel}>{t("gameOver.correctLabel")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Math.round((correct / total) * 100)}%</Text>
                <Text style={styles.statLabel}>{t("gameOver.accuracyLabel")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{score}</Text>
                <Text style={styles.statLabel}>{t("gameOver.pointsLabel")}</Text>
              </View>
            </View>
          </NoorCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          <NoorButton
            onPress={handleShare}
            label={t("game.share") ?? "Compartir resultado"}
            variant="gold"
            size="md"
          />
          <NoorButton
            onPress={handlePlayAgain}
            label={t("game.playAgain") ?? "Jugar de nuevo"}
            variant="primary"
            size="lg"
          />
          <NoorButton
            onPress={() => router.replace("/home")}
            label={t("game.backHome") ?? "Volver al inicio"}
            variant="secondary"
            size="md"
          />
          <NoorButton
            onPress={() => router.push("/stats")}
            label={t("stats.title")}
            variant="ghost"
            size="sm"
          />
        </Animated.View>

        {/* Bismillah footer */}
        <Text style={styles.bismillah}>
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Text>

      </ScrollView>

      {/* Capture overlay — renders the ShareCard visibly for html-to-image */}
      {isCapturing && (
        <Modal transparent animationType="none" visible={isCapturing}>
          <View style={styles.captureOverlay}>
            <ShareCard
              ref={shareCardRef}
              score={score}
              correct={correct}
              total={total}
              rankTitle={t(rank.titleKey)}
              rankIndex={rankIndex}
              totalRanks={RANKS.length}
              isPerfect={isPerfect}
              language={params.language as Language ?? "es"}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  headerBlock: { alignItems: "center", gap: 6 },
  ornament: { fontSize: 22, color: Colors.gold.dusty },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 30,
    color: Colors.parchment.primary,
  },
  scoreContainer: { alignItems: "center" },
  newRecord: { ...MicroLabel, color: Colors.gold.cta, marginBottom: 6 },
  scoreLabel: { ...MicroLabel, color: Colors.gold.dusty },
  score: {
    fontFamily: Fonts.serif,
    fontSize: 78,
    color: Colors.gold.cta,
    lineHeight: 92,
    textShadowColor: "rgba(233, 196, 106, 0.35)",
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 0 },
  },
  scoreOutOf: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text.secondary },
  rankCard: { width: "100%" },
  rankMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rankMeta: { ...MicroLabel, color: Colors.gold.dusty },
  rankDots: { fontSize: 10, color: Colors.gold.cta, letterSpacing: 3 },
  rankTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 26,
    color: Colors.parchment.primary,
    marginBottom: 6,
  },
  rankDesc: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  statsCard: { width: "100%" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  stat: { alignItems: "center", gap: 4 },
  statValue: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.parchment.primary },
  statLabel: { ...MicroLabel, fontSize: 10, color: Colors.text.muted },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border.subtle },
  buttons: { width: "100%", gap: 10 },
  captureOverlay: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bismillah: {
    fontFamily: "Amiri_400Regular",
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: "center",
    marginTop: 8,
  },
});
