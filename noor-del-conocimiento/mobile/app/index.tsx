// Language Selection Screen — Direction D "El Messiri".
// Bismillah + نور wordmark over green; language cards with letter chips.
// Shown only on first launch; afterwards routes straight to home.
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { IslamicPatternBackground, MihrabArch } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../lib/types";

const LANGUAGES: Array<{
  code: Language;
  chip: string;
  name: string;
  sub: string;
}> = [
  { code: "es", chip: "E", name: "Español", sub: "Castellano" },
  { code: "en", chip: "N", name: "English", sub: "International" },
  { code: "ar", chip: "ع", name: "العربية", sub: "Arabic · RTL" },
];

export default function LanguageScreen() {
  const { setLanguage, isReady, isFirstTime, language } = useLanguage();

  useEffect(() => {
    if (isReady && !isFirstTime) router.replace("/welcome");
  }, [isReady, isFirstTime]);

  const fade = useSharedValue(0);
  useEffect(() => {
    if (!isReady || !isFirstTime) return;
    fade.value = withDelay(80, withTiming(1, { duration: 500 }));
  }, [isReady, isFirstTime]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const choose = async (lang: Language) => {
    await setLanguage(lang);
    router.replace("/welcome");
  };

  if (!isReady || !isFirstTime) {
    return <SafeAreaView style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <Animated.View style={[styles.content, fadeStyle]}>
        <View style={styles.archWrap}>
          <MihrabArch color={Colors.gold.dusty} width={220} />
        </View>

        <Text style={styles.bismillah}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        <Text style={styles.wordmark}>نور</Text>
        <Text style={styles.noor}>Noor</Text>
        <Text style={styles.tagline}>DEL CONOCIMIENTO</Text>

        <Text style={styles.choose}>
          <Text style={styles.chooseSerif}>Choose your language</Text>
          {"  ·  "}
          <Text style={styles.chooseArabic}>اختر لغتك</Text>
        </Text>

        <View style={styles.cards}>
          {LANGUAGES.map((l) => {
            const active = language === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => choose(l.code)}
                accessibilityRole="button"
                accessibilityLabel={l.name}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{l.chip}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.cardName,
                      l.code === "ar" && { fontFamily: Fonts.arabic, fontStyle: "normal" },
                      active && styles.cardNameActive,
                    ]}
                  >
                    {l.name}
                  </Text>
                  <Text style={[styles.cardSub, active && styles.cardSubActive]}>{l.sub}</Text>
                </View>
                <Text style={[styles.cardArrow, active && styles.cardArrowActive]}>
                  {active ? "✓" : "›"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  archWrap: { position: "absolute", top: 60, opacity: 0.5 },
  bismillah: {
    fontFamily: Fonts.verse,
    fontSize: 18,
    color: Colors.gold.light,
    marginBottom: 18,
    textAlign: "center",
  },
  wordmark: {
    fontFamily: Fonts.arabicBold,
    fontSize: 84,
    lineHeight: 110,
    color: Colors.parchment.primary,
    textShadowColor: "rgba(212, 175, 55, 0.35)",
    textShadowRadius: 28,
    textShadowOffset: { width: 0, height: 0 },
  },
  noor: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 26,
    color: Colors.gold.cta,
    marginTop: -6,
  },
  tagline: {
    ...MicroLabel,
    letterSpacing: 3,
    color: "rgba(253, 246, 227, 0.65)",
    marginTop: 8,
    marginBottom: 36,
  },
  choose: { marginBottom: 18, color: Colors.text.secondary },
  chooseSerif: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 16,
    color: Colors.parchment.primary,
  },
  chooseArabic: { fontFamily: Fonts.arabic, fontSize: 15, color: Colors.parchment.primary },
  cards: { width: "100%", maxWidth: 420, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(253, 246, 227, 0.06)",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  cardActive: {
    backgroundColor: Colors.accent.emerald,
    borderColor: Colors.accent.emeraldLight,
    shadowColor: Colors.accent.emerald,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(193, 154, 91, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(193, 154, 91, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.5)" },
  chipText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 16,
    color: Colors.gold.dusty,
  },
  chipTextActive: { color: "#ffffff" },
  cardName: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 19,
    color: Colors.parchment.primary,
  },
  cardNameActive: { color: "#ffffff" },
  cardSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.text.muted, marginTop: 1 },
  cardSubActive: { color: "rgba(255,255,255,0.8)" },
  cardArrow: { fontSize: 18, color: Colors.text.muted },
  cardArrowActive: { color: "#ffffff", fontFamily: Fonts.bodyBold },
});
