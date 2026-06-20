// Stats — player profile: lifetime stats, current rank, achievement badges.
// Achievements are derived from stored stats (no extra writes needed).
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { NoorCard } from "../components/ui/NoorCard";
import { SectionLabel } from "../components/ui/SectionLabel";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { getRank, RANKS, TOTAL_QUESTIONS_PER_GAME } from "../lib/gameLogic";
import { getStats, getDailyStreak, getMissedQuestions, getCategoryStats } from "../lib/storage";
import { buildAchievements } from "../lib/achievements";
import { useLanguage } from "../context/LanguageContext";
import type { StoredStats, CategoryStats } from "../lib/types";

export default function StatsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [streak, setStreak] = useState(0);
  const [pendingReview, setPendingReview] = useState(0);
  const [catStats, setCatStats] = useState<CategoryStats>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStats(), getDailyStreak(), getMissedQuestions(), getCategoryStats()]).then(
      ([s, st, missed, cat]) => {
        if (cancelled) return;
        setStats(s);
        setStreak(st);
        setPendingReview(missed.length);
        setCatStats(cat);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return <SafeAreaView style={styles.root} />;
  }

  const rank = getRank(stats.bestScore);
  const rankIndex = Math.max(0, RANKS.indexOf(rank));
  const accuracy =
    stats.gamesPlayed > 0
      ? Math.min(
          100,
          Math.round(
            (stats.totalCorrect / (stats.gamesPlayed * TOTAL_QUESTIONS_PER_GAME)) * 100
          )
        )
      : 0;
  const achievements = buildAchievements(stats, streak, stats.learnReviewed ?? 0);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("stats.back")}</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("stats.title")}</Text>
        </View>

        {/* Rank card */}
        <NoorCard variant="gold" style={styles.rankCard}>
          <View style={styles.rankMetaRow}>
            <Text style={styles.rankMeta}>
              {t("gameOver.rankLabel")} · {rankIndex + 1}/{RANKS.length}
            </Text>
            <Text style={styles.rankDots}>
              {RANKS.map((_, i) => (i <= rankIndex ? "●" : "○")).join(" ")}
            </Text>
          </View>
          <Text style={[styles.rankTitle, isRTL && { textAlign: "right" }]}>
            {stats.gamesPlayed > 0 ? t(rank.titleKey) : t("stats.noRankYet")}
          </Text>
          {stats.gamesPlayed > 0 && (
            <Text style={[styles.rankDesc, isRTL && { textAlign: "right" }]}>
              “{t(rank.descriptionKey)}”
            </Text>
          )}
        </NoorCard>

        {/* Lifetime stats grid */}
        <SectionLabel title={t("stats.lifetimeLabel")} />
        <View style={styles.grid}>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>{stats.bestScore}</Text>
            <Text style={styles.gridLabel}>{t("stats.bestScore")}</Text>
          </NoorCard>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.gridLabel}>{t("stats.gamesPlayed")}</Text>
          </NoorCard>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>{stats.totalCorrect}</Text>
            <Text style={styles.gridLabel}>{t("stats.totalCorrect")}</Text>
          </NoorCard>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>{accuracy}%</Text>
            <Text style={styles.gridLabel}>{t("stats.accuracy")}</Text>
          </NoorCard>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>🔥 {streak}</Text>
            <Text style={styles.gridLabel}>{t("stats.streak")}</Text>
          </NoorCard>
          <NoorCard style={styles.gridCard}>
            <Text style={styles.gridValue}>{pendingReview}</Text>
            <Text style={styles.gridLabel}>{t("stats.pendingReview")}</Text>
          </NoorCard>
        </View>

        {/* Achievements */}
        <SectionLabel
          title={t("stats.achievementsLabel")}
          meta={`${unlockedCount} / ${achievements.length}`}
        />
        <View style={styles.badges}>
          {achievements.map((a) => (
            <View key={a.id} style={[styles.badge, !a.unlocked && styles.badgeLocked]}>
              <Text style={[styles.badgeIcon, !a.unlocked && styles.badgeIconLocked]}>
                {a.unlocked ? a.icon : "🔒"}
              </Text>
              <Text
                style={[styles.badgeName, !a.unlocked && styles.badgeNameLocked]}
                numberOfLines={2}
              >
                {t(`achievements.${a.id}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* Category accuracy */}
        {Object.keys(catStats).length > 0 && (
          <>
            <SectionLabel title={t("categoryStats.title")} />
            <NoorCard>
              {Object.entries(catStats).map(([cat, { correct, total }], idx) => {
                const catKey =
                  cat === "Seerah"
                    ? "categoryStats.seerah"
                    : cat === "Profetas"
                      ? "categoryStats.prophets"
                      : "categoryStats.general";
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <View key={cat}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.catRow}>
                      <Text style={styles.catName}>{t(catKey)}</Text>
                      <View style={styles.catBarBg}>
                        <View style={[styles.catBarFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.catPct}>{pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </NoorCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, gap: 14, paddingBottom: 40, maxWidth: 560, width: "100%", alignSelf: "center" },
  back: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
  headerBlock: { alignItems: "center", gap: 4, marginBottom: 4 },
  ornament: { fontSize: 20, color: Colors.gold.dusty },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 28,
    color: Colors.parchment.primary,
  },
  rankCard: { width: "100%" },
  rankMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rankMeta: { ...MicroLabel, color: Colors.gold.dusty },
  rankDots: { fontSize: 10, color: Colors.gold.cta, letterSpacing: 3 },
  rankTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 24,
    color: Colors.parchment.primary,
    marginBottom: 4,
  },
  rankDesc: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCard: {
    flexBasis: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  gridValue: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.parchment.primary },
  gridLabel: { ...MicroLabel, fontSize: 9, color: Colors.text.muted, marginTop: 4, textAlign: "center" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    flexBasis: "30%",
    flexGrow: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.07)",
  },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 8 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  catName: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.parchment.primary, minWidth: 80 },
  catBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(253, 246, 227, 0.08)",
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 4, backgroundColor: Colors.accent.emerald },
  catPct: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.gold.light, minWidth: 36, textAlign: "right" },
  badgeLocked: {
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.03)",
    opacity: 0.6,
  },
  badgeIcon: { fontSize: 22, color: Colors.gold.light },
  badgeIconLocked: { fontSize: 16 },
  badgeName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.parchment.primary,
    textAlign: "center",
    lineHeight: 15,
  },
  badgeNameLocked: { color: Colors.text.muted },
});
