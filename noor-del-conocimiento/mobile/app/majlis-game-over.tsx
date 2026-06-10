// Majlis Game Over — podium + ranking
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground, MihrabArch } from "../components/patterns/IslamicPattern";
import { getMajlisRankings } from "../lib/gameLogic";
import { useLanguage } from "../context/LanguageContext";
import type { Player } from "../lib/types";

export default function MajlisGameOverScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const params = useLocalSearchParams<{ players: string }>();

  let players: Player[] = [];
  try {
    if (params.players) players = JSON.parse(params.players) as Player[];
  } catch {
    // malformed deep-link param — fall through with empty array
  }
  const rankings = getMajlisRankings(players);

  const medalEmoji = ["🥇", "🥈", "🥉"];

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.05} tileSize={52} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.archContainer}>
          <MihrabArch color={Colors.gold.primary} width={200} />
        </View>

        <Text style={[styles.title, isRTL && { textAlign: "right" }]}>
          {t("majlis.results")}
        </Text>

        {/* Winner highlight */}
        {rankings[0] && (
          <NoorCard variant="gold" style={styles.winnerCard}>
            <Text style={styles.winnerMedal}>🥇</Text>
            <Text style={styles.winnerName}>{rankings[0].name}</Text>
            <Text style={styles.winnerScore}>{Math.round(rankings[0].score)}</Text>
            <Text style={styles.winnerLabel}>
              {t("game.score")}
            </Text>
          </NoorCard>
        )}

        {/* Full ranking */}
        <View style={styles.rankingList}>
          {rankings.map((player, i) => (
            <NoorCard key={player.id} style={styles.rankRow}>
              <View style={styles.rankRowInner}>
                <Text style={styles.rankMedal}>
                  {medalEmoji[i] ?? `#${i + 1}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rankName,
                      player.isEliminated && styles.eliminated,
                      isRTL && { textAlign: "right" },
                    ]}
                  >
                    {player.name}
                  </Text>
                  {player.isEliminated && (
                    <Text style={styles.eliminatedLabel}>
                      {t("playerStatus.eliminated")}
                    </Text>
                  )}
                </View>
                <Text style={styles.rankScore}>{Math.round(player.score)}</Text>
              </View>
            </NoorCard>
          ))}
        </View>

        <View style={styles.buttons}>
          <NoorButton
            onPress={() => router.replace("/majlis-setup")}
            label={t("game.playAgain")}
            variant="primary"
            size="lg"
          />
          <NoorButton
            onPress={() => router.replace("/home")}
            label={t("game.backHome")}
            variant="secondary"
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 24, gap: 20, paddingBottom: 40, alignItems: "center" },
  archContainer: { opacity: 0.7 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.parchment.primary, textAlign: "center" },
  winnerCard: { width: "100%", alignItems: "center" },
  winnerMedal: { fontSize: 40, marginBottom: 4 },
  winnerName: { fontSize: 22, fontWeight: "700", color: Colors.parchment.primary },
  winnerScore: { fontSize: 44, fontWeight: "800", color: Colors.gold.primary },
  winnerLabel: { fontSize: 13, color: Colors.text.muted },
  rankingList: { width: "100%", gap: 8 },
  rankRow: {},
  rankRowInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankMedal: { fontSize: 22, width: 32 },
  rankName: { fontSize: 16, fontWeight: "600", color: Colors.parchment.primary },
  rankScore: { fontSize: 18, fontWeight: "800", color: Colors.parchment.primary },
  eliminated: { opacity: 0.5 },
  eliminatedLabel: { fontSize: 11, color: Colors.incorrect, marginTop: 2 },
  buttons: { width: "100%", gap: 10 },
});
