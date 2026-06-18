// Daily hadith card. The daily reflection comes from the curated trilingual
// bundle (coherent + offline). A refresh control pulls a fresh authentic hadith
// from the live API (An-Nawawi, en/ar) with a graceful bundle fallback.
// Crossfade on change; fade+rise entrance with a custom ease-out curve.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { Fonts, MicroLabel } from "../../constants/fonts";
import { Duration, Ease } from "../../constants/motion";
import { NoorCard } from "./NoorCard";
import { feedback } from "../../lib/feedback";
import { useLanguage } from "../../context/LanguageContext";
import {
  getDailyHadith,
  fetchLiveHadith,
  pickHadithLang,
  HADITHS,
  type HadithView,
} from "../../lib/hadith";
import { parseSource } from "../../lib/sources";

export const HadithCard: React.FC = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [view, setView] = useState<HadithView | null>(null);
  const [loading, setLoading] = useState(false);
  // Rotating index into the bundle, used when the live API is unavailable.
  const bundleIdxRef = useRef(0);

  const enter = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    let cancelled = false;
    getDailyHadith().then((h) => {
      if (cancelled) return;
      setView(pickHadithLang(h, language));
      enter.value = withTiming(1, { duration: Duration.slow, easing: Ease.out });
    });
    return () => {
      cancelled = true;
    };
    // Re-pick language label without refetching when language changes.
  }, [language]);

  const swapTo = useCallback(
    (next: HadithView) => {
      // Crossfade: fade out fast, swap at the trough, fade back in.
      contentOpacity.value = withSequence(
        withTiming(0, { duration: Duration.fast, easing: Ease.out }),
        withTiming(1, { duration: Duration.base, easing: Ease.out })
      );
      setTimeout(() => setView(next), Duration.fast);
    },
    [contentOpacity]
  );

  const handleRefresh = useCallback(async () => {
    if (loading) return;
    feedback.tap();
    setLoading(true);
    const live = await fetchLiveHadith(language);
    if (live) {
      swapTo(live);
    } else {
      // Fallback: rotate through the verified bundle in the current language.
      bundleIdxRef.current = (bundleIdxRef.current + 1) % HADITHS.length;
      const h = HADITHS[bundleIdxRef.current];
      if (h) swapTo(pickHadithLang(h, language));
    }
    setLoading(false);
  }, [loading, language, swapTo]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 12 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  if (!view) return null;

  const src = parseSource(view.source);

  return (
    <Animated.View style={[styles.wrap, cardStyle]}>
      <NoorCard variant="gold" style={styles.card}>
        {/* Header: label + refresh */}
        <View style={styles.header}>
          <Text style={styles.label}>{t("hadith.dailyLabel")}</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t("hadith.another")}
            hitSlop={10}
            style={styles.refreshBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.gold.dusty} />
            ) : (
              <Text style={styles.refreshIcon}>↻</Text>
            )}
          </TouchableOpacity>
        </View>

        <Animated.View style={contentStyle}>
          {/* Oversized opening quote ornament */}
          <Text style={styles.quoteMark}>“</Text>
          <Text style={[styles.text, isRTL && styles.textRTL]}>{view.text}</Text>

          {/* Divider with center ornament */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerOrn}>۞</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={[styles.footer, isRTL && styles.footerRTL]}>
            <Text style={styles.narrator}>{view.narrator}</Text>
            {src ? (
              <TouchableOpacity
                accessibilityRole={src.url ? "link" : "text"}
                disabled={!src.url}
                onPress={() => src.url && Linking.openURL(src.url)}
                hitSlop={6}
              >
                <Text style={[styles.source, src.url && styles.sourceLink]}>{src.label}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </NoorCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center" },
  card: { width: "100%", maxWidth: 420 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { ...MicroLabel, color: Colors.gold.dusty },
  refreshBtn: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  refreshIcon: { fontSize: 17, color: Colors.gold.dusty },
  // Quote mark hangs above the text as a decorative drop-cap-style ornament.
  quoteMark: {
    fontFamily: Fonts.serif,
    fontSize: 44,
    lineHeight: 36,
    color: "rgba(212, 175, 55, 0.45)",
    height: 30,
  },
  text: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 17,
    color: Colors.parchment.primary,
    lineHeight: 27,
  },
  textRTL: {
    fontFamily: Fonts.arabic,
    fontStyle: "normal",
    textAlign: "right",
    fontSize: 19,
    lineHeight: 34,
    writingDirection: "rtl",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(212, 175, 55, 0.2)" },
  dividerOrn: { fontSize: 12, color: Colors.gold.dusty },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  footerRTL: { flexDirection: "row-reverse" },
  narrator: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: Colors.gold.light,
  },
  source: { fontFamily: Fonts.body, fontSize: 11, color: Colors.text.muted },
  sourceLink: { color: Colors.gold.primary, textDecorationLine: "underline" },
});
