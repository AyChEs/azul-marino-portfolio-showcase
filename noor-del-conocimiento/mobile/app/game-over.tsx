// Game Over Screen — resultados modo Musafir
// Design: staggered reveal, gold rank display, Islamic pattern
import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Share,
} from "react-native";
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
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground, MihrabArch } from "../components/patterns/IslamicPattern";
import { getRank } from "../lib/gameLogic";
import { useLanguage } from "../context/LanguageContext";

export default function GameOverScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const params = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    newRecord: string;
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
  const isNewRecord = params.newRecord === "1";

  const handleShare = () => {
    Share.share({
      message: t("game.shareMessage", { score, correct, total }),
    }).catch(() => {});
  };

  // Staggered entrance animations
  const archOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.6);
  const scoreOpacity = useSharedValue(0);
  const rankOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    archOpacity.value = withTiming(1, { duration: 400 });
    scoreScale.value = withDelay(200, withSpring(1, { stiffness: 120, damping: 14 }));
    scoreOpacity.value = withDelay(200, withTiming(1, { duration: 350 }));
    rankOpacity.value = withDelay(450, withTiming(1, { duration: 350 }));
    statsOpacity.value = withDelay(650, withTiming(1, { duration: 350 }));
    buttonsOpacity.value = withDelay(850, withTiming(1, { duration: 350 }));
  }, []);

  const archStyle = useAnimatedStyle(() => ({ opacity: archOpacity.value }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));
  const rankStyle = useAnimatedStyle(() => ({ opacity: rankOpacity.value }));
  const statsStyle = useAnimatedStyle(() => ({ opacity: statsOpacity.value }));
  const buttonsStyle = useAnimatedStyle(() => ({ opacity: buttonsOpacity.value }));

  const handlePlayAgain = () => {
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.05} tileSize={52} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Arch ornament */}
        <Animated.View style={[styles.archContainer, archStyle]}>
          <MihrabArch color={Colors.gold.primary} width={220} />
        </Animated.View>

        {/* Score */}
        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          {isNewRecord && (
            <Text style={styles.newRecord}>★ {t("game.newRecord") ?? "¡Nuevo récord!"}</Text>
          )}
          <Text style={styles.scoreLabel}>{t("game.score") ?? "Puntuación"}</Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreOutOf}>/100</Text>
        </Animated.View>

        {/* Rank */}
        <Animated.View style={rankStyle}>
          <NoorCard variant="gold" style={styles.rankCard}>
            <Text
              style={[styles.rankTitle, isRTL && { textAlign: "right" }]}
            >
              {t(rank.titleKey)}
            </Text>
            <Text
              style={[styles.rankDesc, isRTL && { textAlign: "right" }]}
            >
              {t(rank.descriptionKey)}
            </Text>
          </NoorCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={statsStyle}>
          <NoorCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{correct}</Text>
                <Text style={styles.statLabel}>
                  {t("game.correct") ?? "Correctas"}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>
                  {t("game.total") ?? "Total"}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {Math.round((correct / total) * 100)}%
                </Text>
                <Text style={styles.statLabel}>
                  {t("game.accuracy") ?? "Precisión"}
                </Text>
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
        </Animated.View>

        {/* Bismillah footer */}
        <Text style={styles.bismillah}>
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Text>
      </ScrollView>
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
  archContainer: { opacity: 0.75, marginBottom: -8 },
  scoreContainer: { alignItems: "center" },
  newRecord: {
    fontSize: 13, fontWeight: "800", color: Colors.gold.primary,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 6,
  },
  scoreLabel: { fontSize: 13, color: Colors.text.muted, letterSpacing: 1.5, textTransform: "uppercase" },
  score: { fontSize: 72, fontWeight: "800", color: Colors.gold.primary, lineHeight: 82 },
  scoreOutOf: { fontSize: 18, color: Colors.text.secondary },
  rankCard: { width: "100%" },
  rankTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 24,
    color: Colors.gold.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  rankDesc: { fontSize: 14, color: Colors.text.secondary, textAlign: "center", lineHeight: 22 },
  statsCard: { width: "100%" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  stat: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 28, fontWeight: "800", color: Colors.parchment.primary },
  statLabel: { fontSize: 12, color: Colors.text.muted },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border.subtle },
  buttons: { width: "100%", gap: 10 },
  bismillah: {
    fontFamily: "Amiri_400Regular",
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: "center",
    marginTop: 8,
  },
});
