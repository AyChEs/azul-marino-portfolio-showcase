// Majlis Game Over — podium + ranking
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { SectionLabel } from "../components/ui/SectionLabel";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
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
  const winner = rankings[0];
  const aliveCount = players.filter((p) => !p.isEliminated).length;
  const winnerReason =
    aliveCount === 1 && players.length > 1
      ? t("majlis.winnerBySurvival")
      : t("majlis.winnerByScore");

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.05} tileSize={52} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("gameOver.majlis.title")}</Text>
          <Text style={styles.subtitle}>{t("gameOver.majlis.description")}</Text>
        </View>

        {/* Winner highlight */}
        {winner && (
          <NoorCard variant="gold" style={styles.winnerCard}>
            <Text style={styles.winnerMedal}>🏆</Text>
            <Text style={styles.winnerLabel}>{t("gameOver.winnerLabel")}</Text>
            <Text style={styles.winnerReason}>{winnerReason}</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <View style={styles.winnerStats}>
              <Text style={styles.winnerScore}>{Math.round(winner.score)}</Text>
              <Text style={styles.winnerPts}>{t("gameOver.ptsLabel")}</Text>
            </View>
            {winner.isEliminated ? (
              <Text style={styles.eliminatedLabel}>{t("playerStatus.eliminated")}</Text>
            ) : (
              <Text style={styles.survivalLabel}>
                ♥ {winner.lives} · {t("playerStatus.lives")}
              </Text>
            )}
          </NoorCard>
        )}

        {/* Full ranking */}
        <View style={styles.rankingWrap}>
          <SectionLabel title={t("gameOver.majlis.finalStandings")} />
        </View>
        <View style={styles.rankingList}>
          {rankings.map((player, idx) => (
            <NoorCard key={player.id} style={styles.rankRow}>
              <View style={styles.rankRowInner}>
                <View style={[styles.rankChip, idx === 0 && styles.rankChipWinner]}>
                  <Text style={styles.rankChipText}>{idx + 1}</Text>
                </View>
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
                  <Text style={styles.rankMeta}>
                    {player.isEliminated
                      ? t("playerStatus.eliminated")
                      : `♥ ${player.lives} · ${Math.round(player.score)} ${t("playerStatus.pts")}`}
                  </Text>
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
  headerBlock: { alignItems: "center", gap: 4 },
  ornament: { fontSize: 20, color: Colors.gold.dusty },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 28,
    color: Colors.parchment.primary,
    textAlign: "center",
  },
  subtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.text.muted },
  winnerCard: { width: "100%", alignItems: "center", paddingVertical: 8 },
  winnerMedal: { fontSize: 34, marginBottom: 4 },
  winnerLabel: { ...MicroLabel, color: Colors.gold.dusty, marginBottom: 2 },
  winnerReason: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 6,
  },
  winnerStats: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  winnerName: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 26,
    color: Colors.parchment.primary,
  },
  winnerScore: {
    fontFamily: Fonts.serif,
    fontSize: 46,
    color: Colors.gold.cta,
    lineHeight: 54,
    textShadowColor: "rgba(233, 196, 106, 0.35)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  winnerPts: { ...MicroLabel, fontSize: 11, color: Colors.text.muted },
  survivalLabel: { fontSize: 12, color: Colors.accent.emeraldLight, marginTop: 6 },
  rankingWrap: { width: "100%", marginBottom: -10 },
  rankingList: { width: "100%", gap: 8 },
  rankRow: {},
  rankRowInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(253, 246, 227, 0.08)",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  rankChipWinner: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: Colors.border.gold,
  },
  rankChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.text.secondary },
  rankMeta: { fontSize: 11, color: Colors.text.muted, marginTop: 2 },
  rankName: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 17,
    color: Colors.parchment.primary,
  },
  rankScore: { fontFamily: Fonts.serif, fontSize: 18, color: Colors.parchment.primary },
  eliminated: { opacity: 0.5 },
  eliminatedLabel: { fontSize: 11, color: Colors.incorrect, marginTop: 2 },
  buttons: { width: "100%", gap: 10 },
});
