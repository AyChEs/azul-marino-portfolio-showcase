// 404 — "Ruta no encontrada": gold Arabic-Indic ٤٠٤ over green, serif title.
import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/fonts";
import { NoorButton } from "../components/ui/NoorButton";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <View style={styles.content}>
        <Text style={styles.code}>٤٠٤</Text>
        <Text style={styles.title}>{t("notFound.title")}</Text>
        <Text style={styles.description}>{t("notFound.description")}</Text>
        <NoorButton
          onPress={() => router.replace("/home")}
          label={t("notFound.cta")}
          variant="primary"
          size="lg"
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 },
  code: {
    fontFamily: Fonts.arabicBold,
    fontSize: 64,
    lineHeight: 84,
    color: Colors.gold.cta,
    textShadowColor: "rgba(233, 196, 106, 0.4)",
    textShadowRadius: 26,
    textShadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 26,
    color: Colors.parchment.primary,
  },
  description: { fontFamily: Fonts.body, fontSize: 14, color: Colors.text.muted, textAlign: "center" },
  cta: { marginTop: 18, alignSelf: "stretch", maxWidth: 360 },
});
