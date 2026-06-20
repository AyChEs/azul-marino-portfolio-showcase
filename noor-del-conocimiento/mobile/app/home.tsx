// Home — Direction D: single-page setup. نور header + greeting, language chips,
// MODO DE JUEGO 01/03 · CATEGORÍA 02/03 · DIFICULTAD 03/03 · "Empezar viaje →".
import React, { useState, useEffect } from "react";
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
import { NoorButton } from "../components/ui/NoorButton";
import { SectionLabel } from "../components/ui/SectionLabel";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { getDailyStreak, hasOnboarded, setOnboarded, getDueCards, getDailyChallenge } from "../lib/storage";
import type { GameMode, Difficulty } from "../lib/types";

type Mode = "musafir" | "majlis" | "learn";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  const [mode, setMode] = useState<Mode>("musafir");
  const [category, setCategory] = useState<GameMode>("mix");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [streak, setStreak] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getDailyStreak().then((s) => {
      if (!cancelled) setStreak(s);
    });
    // First-run onboarding: show rules once
    hasOnboarded().then((done) => {
      if (!cancelled && !done) {
        setOnboarded();
        router.push("/rules");
      }
    });
    getDueCards().then((cards) => {
      if (!cancelled) setDueCount(cards.length);
    });
    getDailyChallenge().then((dc) => {
      if (!cancelled) {
        setDailyDone(dc.completed);
        setDailyStreak(dc.streak);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const MODES: Array<{ key: Mode; chip: string; title: string; sub: string }> = [
    { key: "musafir", chip: "ا", title: t("setup.musafirMode.title"), sub: t("setup.musafirShort") },
    { key: "majlis", chip: "م", title: t("setup.majlisMode.title"), sub: t("setup.majlisShort") },
    { key: "learn", chip: "ع", title: t("setup.learnMode.title"), sub: t("setup.learnShort") },
  ];

  const CATEGORIES: Array<{ key: GameMode; icon: string; title: string; sub: string }> = [
    { key: "Seerah", icon: "☾", title: t("category.seerah"), sub: t("category.seerahShort") },
    { key: "Profetas", icon: "✦", title: t("category.prophets"), sub: t("category.prophetsShort") },
    { key: "Corán y General", icon: "♥", title: t("category.general"), sub: t("category.generalShort") },
    { key: "mix", icon: "◈", title: t("category.mix"), sub: t("category.mixShort") },
  ];

  const DIFFICULTIES: Array<{ key: Difficulty; dots: string; seconds: number }> = [
    { key: "easy", dots: "●○○", seconds: 30 },
    { key: "medium", dots: "●●○", seconds: 20 },
    { key: "hard", dots: "●●●", seconds: 15 },
  ];

  const start = () => {
    if (mode === "majlis") {
      router.push("/majlis-setup");
      return;
    }
    if (mode === "learn") {
      router.push({ pathname: "/learn", params: { category } });
      return;
    }
    router.push({
      pathname: "/play",
      params: { mode: "musafir", category, difficulty, language },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: نور + greeting · language chips */}
        <View style={[styles.header, isRTL && { flexDirection: "row-reverse" }]}>
          <View>
            <Text style={styles.wordmark}>نور</Text>
            <Text style={styles.greeting}>{t("greeting")}</Text>
            {streak > 0 && (
              <Text style={styles.streak}>🔥 {t("home.streak", { count: streak })}</Text>
            )}
          </View>
          <View style={styles.langRow}>
            <TouchableOpacity
              onPress={() => router.push("/stats")}
              accessibilityRole="button"
              accessibilityLabel={t("stats.title")}
              style={styles.langChip}
            >
              <Text style={styles.langChipText}>▦</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/rules")}
              accessibilityRole="button"
              accessibilityLabel={t("rulesTitle")}
              style={styles.langChip}
            >
              <Text style={styles.langChipText}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              accessibilityRole="button"
              accessibilityLabel={t("settings.title")}
              style={styles.langChip}
            >
              <Text style={styles.langChipText}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Challenge card */}
        <TouchableOpacity
          onPress={() => router.push("/daily-challenge")}
          activeOpacity={0.8}
          style={[styles.dcCard, dailyDone && styles.dcCardDone]}
        >
          <View style={styles.dcRow}>
            <View style={styles.dcLeft}>
              <Text style={styles.dcLabel}>{t("dailyChallenge.badge")}</Text>
              <Text style={styles.dcTitle}>{t("dailyChallenge.title")}</Text>
              {dailyStreak > 0 && (
                <Text style={styles.dcStreak}>🔥 {t("dailyChallenge.streak", { count: dailyStreak })}</Text>
              )}
            </View>
            <View style={[styles.dcStatus, dailyDone && styles.dcStatusDone]}>
              <Text style={[styles.dcStatusText, dailyDone && styles.dcStatusTextDone]}>
                {dailyDone ? "✓" : "→"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 01 · Mode */}
        <SectionLabel title={t("setup.modeLabel")} meta="01 / 03" />
        <View style={styles.modeGrid}>
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={
                  m.key === "learn" && dueCount > 0
                    ? () => router.push("/review")
                    : () => setMode(m.key)
                }
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.modeCard, active && styles.cardSelected]}
              >
                <View style={[styles.modeChip, active && styles.modeChipActive]}>
                  <Text style={styles.modeChipText}>{m.chip}</Text>
                </View>
                <Text style={styles.modeTitle}>{m.title}</Text>
                <Text style={styles.cardSub} numberOfLines={2}>
                  {m.sub}
                </Text>
                {m.key === "learn" && dueCount > 0 ? (
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>
                      {t("home.dueCount", { count: dueCount })}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 02 · Category */}
        <SectionLabel title={t("setup.categoryLabel")} meta="02 / 03" />
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.catCard, active && styles.cardSelected]}
              >
                <Text style={[styles.catIcon, active && { color: Colors.gold.cta }]}>{c.icon}</Text>
                <Text style={styles.catTitle}>{c.title}</Text>
                <Text style={styles.cardSub} numberOfLines={2}>
                  {c.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 03 · Difficulty */}
        <SectionLabel title={t("setup.difficultyLabel")} meta="03 / 03" />
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => {
            const active = difficulty === d.key;
            return (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDifficulty(d.key)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.diffCard, active && styles.diffSelected]}
              >
                <Text style={[styles.diffDots, active && { color: "#ffffff" }]}>{d.dots}</Text>
                <Text style={[styles.diffTitle, active && { color: "#ffffff" }]}>
                  {t(`difficulty.${d.key}`)}
                </Text>
                <Text style={[styles.diffSeconds, active && { color: "rgba(255,255,255,0.85)" }]}>
                  {t("difficulty.seconds", { count: d.seconds })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <NoorButton
          onPress={start}
          label={t("setup.startJourney")}
          variant="primary"
          size="lg"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 4, maxWidth: 560, width: "100%", alignSelf: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  wordmark: { fontFamily: Fonts.arabicBold, fontSize: 38, lineHeight: 52, color: Colors.parchment.primary },
  greeting: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: Colors.gold.cta,
    marginTop: -4,
  },
  streak: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.gold.light, marginTop: 6 },
  langRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  chipDivider: { width: 1, height: 18, backgroundColor: Colors.border.subtle, marginHorizontal: 2 },
  langChip: {
    minWidth: 38,
    height: 30,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: "rgba(253, 246, 227, 0.07)",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  langChipActive: { backgroundColor: Colors.gold.cta, borderColor: Colors.gold.cta },
  langChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.text.secondary },
  langChipTextActive: { color: Colors.bg.primary },

  modeGrid: { flexDirection: "row", gap: 10, marginBottom: 22 },
  modeCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.05)",
    padding: 14,
    minHeight: 120,
  },
  cardSelected: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: "rgba(16, 185, 129, 0.13)",
    shadowColor: Colors.accent.emerald,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  modeChip: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(193, 154, 91, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(193, 154, 91, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modeChipActive: { backgroundColor: Colors.accent.emerald, borderColor: Colors.accent.emeraldLight },
  modeChipText: { fontFamily: Fonts.arabic, fontSize: 15, color: Colors.parchment.primary },
  modeTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 19,
    color: Colors.parchment.primary,
    marginBottom: 2,
  },
  cardSub: { fontFamily: Fonts.body, fontSize: 11, color: Colors.text.muted, lineHeight: 15 },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  catCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.05)",
    padding: 14,
    minHeight: 92,
  },
  catIcon: { fontSize: 16, color: Colors.gold.dusty, marginBottom: 6 },
  catTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 18,
    color: Colors.parchment.primary,
    marginBottom: 2,
  },

  diffRow: { flexDirection: "row", gap: 10, marginBottom: 26 },
  diffCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.05)",
    paddingVertical: 12,
    alignItems: "center",
  },
  diffSelected: {
    backgroundColor: Colors.accent.emerald,
    borderColor: Colors.accent.emeraldLight,
    shadowColor: Colors.accent.emerald,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  diffDots: { fontSize: 10, color: Colors.gold.dusty, letterSpacing: 2, marginBottom: 4 },
  diffTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 17,
    color: Colors.parchment.primary,
  },
  diffSeconds: { fontFamily: Fonts.body, fontSize: 10, color: Colors.text.muted, marginTop: 2 },

  cta: { marginTop: 4 },
  dcCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    padding: 16,
    marginBottom: 18,
  },
  dcCardDone: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: "rgba(16, 185, 129, 0.10)",
  },
  dcRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dcLeft: { flex: 1, gap: 2 },
  dcLabel: { ...MicroLabel, color: Colors.gold.primary, fontSize: 10 },
  dcTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 20,
    color: Colors.parchment.primary,
  },
  dcStreak: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.gold.light, marginTop: 4 },
  dcStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold.cta,
    alignItems: "center",
    justifyContent: "center",
  },
  dcStatusDone: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: Colors.accent.emerald,
  },
  dcStatusText: { fontSize: 18, color: Colors.gold.cta },
  dcStatusTextDone: { color: "#ffffff" },
  dueBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.gold.cta,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dueBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.bg.primary,
  },
});
