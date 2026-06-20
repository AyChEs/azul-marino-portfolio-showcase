import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/fonts";
import { NoorCard } from "../components/ui/NoorCard";
import { SectionLabel } from "../components/ui/SectionLabel";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { resetAllProgress } from "../lib/storage";
import type { Language, AppPrefs } from "../lib/types";

// Read the real version from the app manifest so it never drifts from app.json.
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const PRIVACY_URL =
  "https://github.com/AyChEs-0/azul-marino-portfolio-showcase/blob/main/noor-del-conocimiento/mobile/PRIVACY.md";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { prefs, setPref } = useSettings();
  const [resetting, setResetting] = useState(false);

  const toggle = <K extends keyof AppPrefs>(key: K) => {
    setPref(key, !prefs[key] as AppPrefs[K]);
  };

  const handleReset = () => {
    if (Platform.OS === "web") {
      if (window.confirm(t("settings.resetConfirm"))) doReset();
      return;
    }
    Alert.alert(t("settings.resetProgress"), t("settings.resetConfirm"), [
      { text: t("settings.resetCancel"), style: "cancel" },
      {
        text: t("settings.resetProgress"),
        style: "destructive",
        onPress: doReset,
      },
    ]);
  };

  const doReset = async () => {
    setResetting(true);
    await resetAllProgress();
    setResetting(false);
    Alert.alert(t("settings.resetDone"));
  };

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("settings.back")}</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.ornament}>۞</Text>
          <Text style={styles.title}>{t("settings.title")}</Text>
        </View>

        {/* Language */}
        <SectionLabel title={t("settings.language")} />
        <NoorCard style={styles.langCard}>
          {(["es", "en", "ar"] as Language[]).map((lang) => {
            const active = language === lang;
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langOption, active && styles.langOptionActive]}
              >
                <Text style={[styles.langText, active && styles.langTextActive]}>
                  {lang === "es" ? "🇪🇸 Español" : lang === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
                </Text>
                {active && <Text style={styles.langCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </NoorCard>

        {/* Sound */}
        <SectionLabel title={t("settings.sound")} />
        <NoorCard>
          <Row label={t("settings.sound")} value={prefs.sound} onToggle={() => toggle("sound")} />
          <View style={styles.divider} />
          <Row label={t("settings.haptics")} value={prefs.haptics} onToggle={() => toggle("haptics")} />
          <View style={styles.divider} />
          <Row label={t("settings.reducedMotion")} value={prefs.reducedMotion} onToggle={() => toggle("reducedMotion")} />
        </NoorCard>

        {/* Reset */}
        <SectionLabel title={t("settings.resetProgress")} />
        <NoorCard>
          <TouchableOpacity
            onPress={handleReset}
            disabled={resetting}
            style={styles.dangerBtn}
          >
            <Text style={styles.dangerText}>
              {resetting ? "..." : t("settings.resetProgress")}
            </Text>
          </TouchableOpacity>
        </NoorCard>

        {/* Info */}
        <SectionLabel title={t("settings.privacy")} />
        <NoorCard>
          <Text style={styles.infoText}>{t("settings.privacyBody")}</Text>
          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => Linking.openURL(PRIVACY_URL)}
            style={styles.privacyLink}
          >
            <Text style={styles.privacyLinkText}>{t("settings.privacyLink")} ↗</Text>
          </TouchableOpacity>
        </NoorCard>

        <Text style={styles.version}>
          {t("settings.version")} {APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border.subtle, true: Colors.accent.emeraldLight }}
        thumbColor={value ? Colors.accent.emerald : Colors.text.muted}
      />
    </View>
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
  langCard: { padding: 0, overflow: "hidden" },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  langOptionActive: { backgroundColor: "rgba(16, 185, 129, 0.1)" },
  langText: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.text.primary },
  langTextActive: { color: Colors.accent.emeraldLight, fontFamily: Fonts.bodySemiBold },
  langCheck: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.accent.emerald },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.text.primary },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 2 },
  dangerBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.incorrect,
    backgroundColor: "rgba(220, 38, 38, 0.08)",
  },
  dangerText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.incorrect },
  infoText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  privacyLink: { marginTop: 10 },
  privacyLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.gold.primary,
    textDecorationLine: "underline",
  },
  version: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: "center",
    marginTop: 8,
  },
});
