// Rules — how to play. Renders the fully-translated rules.* locale tree that
// shipped with the original spec but never had a screen.
import React from "react";
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
import { Fonts } from "../constants/fonts";
import { NoorCard } from "../components/ui/NoorCard";
import { SectionLabel } from "../components/ui/SectionLabel";
import { NoorButton } from "../components/ui/NoorButton";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";

export default function RulesScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const rtl = isRTL ? styles.rtlText : null;

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("stats.back")}</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("rulesTitle")}</Text>
        </View>

        {/* Game modes */}
        <SectionLabel title={t("rules.gameModes.title")} />
        <NoorCard>
          <Text style={[styles.itemTitle, rtl]}>{t("rules.gameModes.musafir.title")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("rules.gameModes.musafir.description")}</Text>
          <View style={styles.divider} />
          <Text style={[styles.itemTitle, rtl]}>{t("rules.gameModes.majlis.title")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("rules.gameModes.majlis.description")}</Text>
          <View style={styles.divider} />
          <Text style={[styles.itemTitle, rtl]}>{t("setup.learnMode.title")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("setup.learnMode.description")}</Text>
        </NoorCard>

        {/* Difficulty */}
        <SectionLabel title={t("rules.difficulty.title")} />
        <NoorCard>
          <Text style={[styles.itemTitle, rtl]}>{t("difficulty.easy")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("rules.difficulty.easy")}</Text>
          <View style={styles.divider} />
          <Text style={[styles.itemTitle, rtl]}>{t("difficulty.medium")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("rules.difficulty.medium")}</Text>
          <View style={styles.divider} />
          <Text style={[styles.itemTitle, rtl]}>{t("difficulty.hard")}</Text>
          <Text style={[styles.itemBody, rtl]}>{t("rules.difficulty.hard")}</Text>
        </NoorCard>

        {/* Lifelines */}
        <SectionLabel title={t("rules.lifelines.title")} />
        <NoorCard variant="gold">
          <Text style={[styles.itemBody, rtl, styles.inventoryNote]}>
            {t("rules.lifelines.inventory")}
          </Text>
          <View style={styles.lifelineRow}>
            <Text style={styles.lifelineArabic}>{t("lifeline.fiftyArabic")}</Text>
            <View style={styles.lifelineText}>
              <Text style={[styles.itemTitle, rtl]}>{t("rules.lifelines.fiftyFifty.title")}</Text>
              <Text style={[styles.itemBody, rtl]}>{t("rules.lifelines.fiftyFifty.description")}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.lifelineRow}>
            <Text style={styles.lifelineArabic}>{t("lifeline.timeArabic")}</Text>
            <View style={styles.lifelineText}>
              <Text style={[styles.itemTitle, rtl]}>{t("rules.lifelines.extraTime.title")}</Text>
              <Text style={[styles.itemBody, rtl]}>{t("rules.lifelines.extraTime.description")}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.lifelineRow}>
            <Text style={styles.lifelineArabic}>{t("lifeline.skipArabic")}</Text>
            <View style={styles.lifelineText}>
              <Text style={[styles.itemTitle, rtl]}>{t("rules.lifelines.skip.title")}</Text>
              <Text style={[styles.itemBody, rtl]}>{t("rules.lifelines.skip.description")}</Text>
            </View>
          </View>
        </NoorCard>

        {/* Scoring */}
        <SectionLabel title={t("rules.scoring.title")} />
        <NoorCard>
          <Text style={[styles.scoringItem, rtl]}>◈ {t("rules.scoring.difficulty")}</Text>
          <Text style={[styles.scoringItem, rtl]}>◈ {t("rules.scoring.category")}</Text>
          <Text style={[styles.scoringItem, rtl]}>◈ {t("rules.scoring.timeBonus")}</Text>
        </NoorCard>

        <NoorButton
          onPress={() => router.push("/home")}
          label={t("setup.startJourney")}
          variant="gold"
          size="lg"
          style={{ marginTop: 8 }}
        />
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
    textAlign: "center",
  },
  rtlText: { textAlign: "right" },
  itemTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 17,
    color: Colors.parchment.primary,
    marginBottom: 4,
  },
  itemBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: 12,
  },
  inventoryNote: { marginBottom: 12, fontStyle: "italic" },
  lifelineRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  lifelineArabic: {
    fontFamily: Fonts.arabic,
    fontSize: 18,
    color: Colors.gold.light,
    minWidth: 64,
    textAlign: "center",
    paddingTop: 2,
  },
  lifelineText: { flex: 1 },
  scoringItem: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
});
