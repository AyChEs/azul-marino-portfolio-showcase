// Majlis Setup Screen — 2-6 player configuration
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { createPlayer } from "../lib/gameLogic";
import type { Difficulty } from "../lib/types";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

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
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("setup.chooseAnotherMode")}</Text>
        </TouchableOpacity>

        <Text style={[styles.title, isRTL && { textAlign: "right" }]}>
          {t("setup.majlisMode.title")}
        </Text>
        <Text style={[styles.subtitle, isRTL && { textAlign: "right" }]}>
          {t("setup.majlisMode.description")}
        </Text>

        {/* Player list */}
        <View style={styles.section}>
          {playerNames.map((name, i) => (
            <View key={i} style={styles.playerRow}>
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
              />
              {playerNames.length > MIN_PLAYERS && (
                <TouchableOpacity
                  onPress={() => removePlayer(i)}
                  style={styles.removeBtn}
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
        <NoorCard style={styles.diffSection}>
          <Text style={[styles.sectionLabel, isRTL && { textAlign: "right" }]}>
            {t("setup.chooseDifficulty")}
          </Text>
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
          label={t("game.start") ?? "Iniciar Majlis"}
          variant="primary"
          size="lg"
          disabled={!canStart}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  back: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
  title: { fontSize: 26, fontWeight: "800", color: Colors.parchment.primary },
  subtitle: { fontSize: 14, color: Colors.text.secondary, lineHeight: 22 },
  section: { gap: 10 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.parchment.primary,
    fontSize: 16,
  },
  removeBtn: { padding: 8 },
  removeBtnText: { color: Colors.incorrect, fontSize: 16 },
  diffSection: {},
  sectionLabel: { fontSize: 15, fontWeight: "700", color: Colors.parchment.primary, marginBottom: 12 },
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
    borderColor: Colors.accent.emerald,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  diffChipText: { fontSize: 13, color: Colors.text.secondary, fontWeight: "600" },
  diffChipTextActive: { color: Colors.accent.emerald },
});
