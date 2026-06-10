// Home Screen — mode selection + category + difficulty setup
// Migrated from Next.js page.tsx
// Mobile-native: bottom sheet approach for difficulty (not website tabs in phone)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { getDailyStreak } from "../lib/storage";
import type { GameMode, Difficulty, Language } from "../lib/types";

const { width } = Dimensions.get("window");

type Step = "mode" | "category" | "difficulty";

const CATEGORIES: { key: GameMode; labelKey: string; icon: string }[] = [
  { key: "Seerah", labelKey: "category.seerah", icon: "🌙" },
  { key: "Profetas", labelKey: "category.prophets", icon: "📜" },
  { key: "Corán y General", labelKey: "category.general", icon: "🌍" },
  { key: "mix", labelKey: "category.mix", icon: "✦" },
];

const DIFFICULTIES: { key: Difficulty; labelKey: string; timeKey: string }[] = [
  { key: "easy", labelKey: "difficulty.easy", timeKey: "30s" },
  { key: "medium", labelKey: "difficulty.medium", timeKey: "20s" },
  { key: "hard", labelKey: "difficulty.hard", timeKey: "15s" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, isRTL, setLanguage } = useLanguage();

  const [step, setStep] = useState<Step>("mode");
  const [selectedCategory, setSelectedCategory] = useState<GameMode | null>(null);
  const [flow, setFlow] = useState<"musafir" | "learn">("musafir");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getDailyStreak().then((s) => {
      if (!cancelled) setStreak(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStartMusafir = (difficulty: Difficulty) => {
    if (!selectedCategory) {
      // Defensive — UI flow should never allow this, but bail safely if it does.
      setStep("category");
      return;
    }
    router.push({
      pathname: "/play",
      params: {
        mode: "musafir",
        category: selectedCategory,
        difficulty,
        language,
      },
    });
  };

  const handleMajlis = () => {
    router.push("/majlis-setup");
  };

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.arabicTitle, isRTL && { textAlign: "right" }]}>
            نور المعرفة
          </Text>
          <Text style={[styles.headerSub, isRTL && { textAlign: "right" }]}>
            {t("welcomeMessage")}
          </Text>
          {streak > 0 && (
            <Text style={[styles.streak, isRTL && { textAlign: "right" }]}>
              🔥 {t("home.streak", { count: streak })}
            </Text>
          )}
        </View>

        {/* Language switcher — compact, top right */}
        <View style={styles.langRow}>
          {(["es", "en", "ar"] as Language[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[styles.langChip, language === lang && styles.langChipActive]}
            >
              <Text
                style={[
                  styles.langChipText,
                  language === lang && styles.langChipTextActive,
                ]}
              >
                {lang === "es" ? "ES" : lang === "en" ? "EN" : "عر"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step: Mode selection */}
        {step === "mode" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>
              {t("setup.chooseMode")}
            </Text>
            <View style={styles.modeCards}>
              {/* Musafir — solo */}
              <NoorCard style={styles.modeCard}>
                <Text style={styles.modeIcon}>🧳</Text>
                <Text style={[styles.modeTitle, isRTL && { textAlign: "right" }]}>
                  {t("setup.musafirMode.title")}
                </Text>
                <Text style={[styles.modeDesc, isRTL && { textAlign: "right" }]}>
                  {t("setup.musafirMode.description")}
                </Text>
                <NoorButton
                  onPress={() => {
                    setFlow("musafir");
                    setStep("category");
                  }}
                  label={t("setup.selectButton")}
                  variant="primary"
                  size="sm"
                  style={{ marginTop: 16 }}
                />
              </NoorCard>

              {/* Learn — no clock, no lives */}
              <NoorCard style={styles.modeCard}>
                <Text style={styles.modeIcon}>📖</Text>
                <Text style={[styles.modeTitle, isRTL && { textAlign: "right" }]}>
                  {t("setup.learnMode.title")}
                </Text>
                <Text style={[styles.modeDesc, isRTL && { textAlign: "right" }]}>
                  {t("setup.learnMode.description")}
                </Text>
                <NoorButton
                  onPress={() => {
                    setFlow("learn");
                    setStep("category");
                  }}
                  label={t("setup.selectButton")}
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: 16 }}
                />
              </NoorCard>

              {/* Majlis — multiplayer */}
              <NoorCard style={styles.modeCard} variant="gold">
                <Text style={styles.modeIcon}>🪑</Text>
                <Text style={[styles.modeTitle, isRTL && { textAlign: "right" }]}>
                  {t("setup.majlisMode.title")}
                </Text>
                <Text style={[styles.modeDesc, isRTL && { textAlign: "right" }]}>
                  {t("setup.majlisMode.description")}
                </Text>
                <NoorButton
                  onPress={handleMajlis}
                  label={t("setup.majlisMode.button")}
                  variant="gold"
                  size="sm"
                  style={{ marginTop: 16 }}
                />
              </NoorCard>
            </View>
          </View>
        )}

        {/* Step: Category selection */}
        {step === "category" && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setStep("mode")} style={styles.backBtn}>
              <Text style={styles.backText}>← {t("setup.chooseAnotherMode")}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>
              {t("setup.chooseCategory")}
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => {
                    if (flow === "learn") {
                      router.push({ pathname: "/learn", params: { category: cat.key } });
                      return;
                    }
                    setSelectedCategory(cat.key);
                    setStep("difficulty");
                  }}
                  style={styles.categoryCard}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[styles.categoryLabel, isRTL && { textAlign: "right" }]}
                    numberOfLines={2}
                  >
                    {t(cat.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step: Difficulty selection */}
        {step === "difficulty" && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setStep("category")} style={styles.backBtn}>
              <Text style={styles.backText}>← {t("setup.chooseCategory")}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>
              {t("setup.chooseDifficulty")}
            </Text>
            <View style={styles.difficultyList}>
              {DIFFICULTIES.map((d) => (
                <NoorCard key={d.key} style={styles.diffCard}>
                  <View style={styles.diffRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.diffLabel, isRTL && { textAlign: "right" }]}>
                        {t(d.labelKey)}
                      </Text>
                      <Text style={styles.diffTime}>{d.timeKey}</Text>
                    </View>
                    <NoorButton
                      onPress={() => handleStartMusafir(d.key)}
                      label="▶"
                      variant="primary"
                      size="sm"
                    />
                  </View>
                </NoorCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 8 },
  header: { alignItems: "center", paddingVertical: 16 },
  arabicTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 34,
    color: Colors.parchment.primary,
    textAlign: "center",
    lineHeight: 48,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    maxWidth: 280,
  },
  streak: { fontSize: 13, color: Colors.gold.primary, fontWeight: "700", marginTop: 6 },
  langRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 8 },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  langChipActive: {
    borderColor: Colors.accent.emerald,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  langChipText: { fontSize: 12, color: Colors.text.muted, fontWeight: "600" },
  langChipTextActive: { color: Colors.accent.emerald },
  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: Colors.parchment.primary },
  modeCards: { gap: 12 },
  modeCard: { flex: 1 },
  modeIcon: { fontSize: 32, marginBottom: 8 },
  modeTitle: { fontSize: 18, fontWeight: "700", color: Colors.parchment.primary, marginBottom: 4 },
  modeDesc: { fontSize: 14, color: Colors.text.secondary, lineHeight: 20 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: { fontSize: 28 },
  categoryLabel: { fontSize: 14, color: Colors.parchment.primary, fontWeight: "600", textAlign: "center" },
  difficultyList: { gap: 10 },
  diffCard: {},
  diffRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  diffLabel: { fontSize: 16, fontWeight: "700", color: Colors.parchment.primary },
  diffTime: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
});
