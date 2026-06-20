// Majlis Setup Screen — 2-6 player configuration
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/fonts";
import { SectionLabel } from "../components/ui/SectionLabel";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { createPlayer } from "../lib/gameLogic";
import type { Difficulty } from "../lib/types";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const ARABIC_LETTERS = ["ا", "ب", "ج", "د", "هـ", "و"];

export default function MajlisSetupScreen() {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleStart = () => {
    // Strip control characters and limit length — player names can appear
    // in context when AI feedback is requested, so sanitize upfront.
    const sanitizeName = (raw: string, fallback: string) =>
      raw.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 20).trim() || fallback;
    const names = playerNames.map((n, i) =>
      sanitizeName(n, `${t("majlis.defaultPlayer")} ${i + 1}`)
    );
    const players = names.map((name, i) => createPlayer(`player_${i}`, name));
    router.push({
      pathname: "/play",
      params: {
        mode: "majlis",
        category: "mix",
        difficulty,
        language,
        players: JSON.stringify(players),
      },
    });
  };

  const canStart = playerNames.length >= MIN_PLAYERS;

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("majlisSetup.title")}</Text>
          <Text style={styles.subtitle}>{t("majlisSetup.description")}</Text>
        </View>

        {/* Player list */}
        <SectionLabel
          title={t("majlisSetup.playersLabel")}
          meta={`${playerNames.length} / ${MAX_PLAYERS}`}
        />
        <View style={styles.section}>
          {playerNames.map((name, i) => (
            <View key={i} style={styles.playerRow}>
              <View style={styles.playerChip}>
                <Text style={styles.playerChipText}>{ARABIC_LETTERS[i] ?? "•"}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  isRTL && { textAlign: "right" },
                ]}
                placeholder={`${t("majlis.player") ?? "Jugador"} ${i + 1}`}
                placeholderTextColor={Colors.text.muted}
                value={name}
                onChangeText={(v) => updateName(i, v)}
                maxLength={20}
                accessibilityLabel={`${t("majlis.player") ?? "Jugador"} ${i + 1}`}
              />
              {playerNames.length > MIN_PLAYERS && (
                <TouchableOpacity
                  onPress={() => removePlayer(i)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("majlis.removePlayer") ?? "Eliminar"} ${t("majlis.player") ?? "Jugador"} ${i + 1}`}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {playerNames.length < MAX_PLAYERS && (
            <NoorButton
              onPress={addPlayer}
              label={`+ ${t("majlis.addPlayer") ?? "Añadir jugador"}`}
              variant="ghost"
              size="sm"
            />
          )}
        </View>

        {/* Difficulty */}
        <SectionLabel title={t("setup.difficultyLabel")} />
        <NoorCard style={styles.diffSection}>
          <View style={styles.diffRow}>
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                style={[styles.diffChip, difficulty === d && styles.diffChipActive]}
              >
                <Text
                  style={[
                    styles.diffChipText,
                    difficulty === d && styles.diffChipTextActive,
                  ]}
                >
                  {t(`difficulty.${d}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </NoorCard>

        <NoorButton
          onPress={handleStart}
          label={t("majlisSetup.start")}
          variant="gold"
          size="lg"
          disabled={!canStart}
        />
        <NoorButton
          onPress={() => router.back()}
          label={t("majlisSetup.back")}
          variant="ghost"
          size="md"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  headerBlock: { alignItems: "center", gap: 4, marginBottom: 6 },
  ornament: { fontSize: 20, color: Colors.gold.dusty },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 28,
    color: Colors.parchment.primary,
  },
  subtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.text.muted },
  section: { gap: 10 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  playerChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(193, 154, 91, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(193, 154, 91, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  playerChipText: { fontFamily: Fonts.arabic, fontSize: 14, color: Colors.gold.dusty },
  input: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.parchment.primary,
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 16,
  },
  removeBtn: { padding: 8 },
  removeBtnText: { color: Colors.incorrect, fontSize: 16 },
  diffSection: {},
  diffRow: { flexDirection: "row", gap: 8 },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  diffChipActive: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: Colors.accent.emerald,
  },
  diffChipText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: Colors.text.secondary,
  },
  diffChipTextActive: { color: Colors.text.onAccent },
});
