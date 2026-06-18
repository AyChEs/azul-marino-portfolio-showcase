import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import type { Language } from "../../lib/types";

interface ShareCardProps {
  score: number;
  correct: number;
  total: number;
  rankTitle: string;
  rankIndex: number;
  totalRanks: number;
  isPerfect: boolean;
  isDaily?: boolean;
  language: Language;
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ score, correct, total, rankTitle, rankIndex, totalRanks, isPerfect, isDaily }, ref) => {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <View ref={ref} style={styles.container}>
        <Text style={styles.ornament}>۞</Text>
        <Text style={styles.appName}>نور · Noor</Text>
        {isDaily ? (
          <Text style={styles.badge}>DAILY CHALLENGE</Text>
        ) : (
          <Text style={styles.badge}>MUSAFIR MODE</Text>
        )}
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.stats}>
          {correct}/{total} · {pct}%
        </Text>
        <Text style={styles.rankLabel}>
          {rankTitle}
          {"  "}
          {rankIndex + 1}/{totalRanks}
        </Text>
        {isPerfect && <Text style={styles.perfect}>✦ PERFECT ✦</Text>}
        <Text style={styles.footer}>islamic-triva.app</Text>
      </View>
    );
  },
);

ShareCard.displayName = "ShareCard";

const styles = StyleSheet.create({
  container: {
    width: 340,
    padding: 32,
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: Colors.bg.primary,
    borderWidth: 2,
    borderColor: Colors.gold.primary,
    borderRadius: 24,
    alignItems: "center",
    gap: 6,
  },
  ornament: { fontSize: 24, color: Colors.gold.dusty },
  appName: {
    fontFamily: Fonts.arabic,
    fontSize: 18,
    color: Colors.parchment.primary,
  },
  badge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.gold.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  score: {
    fontFamily: Fonts.serif,
    fontSize: 64,
    color: Colors.gold.cta,
    lineHeight: 78,
    marginTop: 4,
  },
  stats: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  rankLabel: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 20,
    color: Colors.parchment.primary,
    textAlign: "center",
    marginTop: 6,
  },
  perfect: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.gold.cta,
    letterSpacing: 3,
    marginTop: 4,
  },
  footer: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 12,
  },
});
