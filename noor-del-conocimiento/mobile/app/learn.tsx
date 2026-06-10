// Learn Mode — review without clock or lives. Each card reveals the verified
// answer, explanation and cited source. Reinforces the educational angle.
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { selectGameQuestions } from "../lib/gameLogic";
import { parseSource } from "../lib/sources";
import type { Question, Difficulty, GameMode } from "../lib/types";
import questions from "../data/questions.json";

const VALID_CATEGORIES: GameMode[] = ["mix", "Seerah", "Profetas", "Corán y General"];
const CARDS_PER_SESSION = 15;

export default function LearnScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const params = useLocalSearchParams<{ category: string }>();
  const rawCat = params.category ?? "mix";
  const category: GameMode = VALID_CATEGORIES.includes(rawCat as GameMode)
    ? (rawCat as GameMode)
    : "mix";

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Mix all difficulties — Learn mode is about coverage, not challenge.
  const deck = useMemo<Question[]>(() => {
    const all = (["easy", "medium", "hard"] as Difficulty[]).flatMap((d) =>
      selectGameQuestions(questions as Question[], category, d, language, [])
    );
    return all.slice(0, CARDS_PER_SESSION);
  }, [category, language]);

  useEffect(() => {
    setRevealed(false);
  }, [index]);

  const card = deck[index];

  if (!card) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.doneText}>{t("learn.done") ?? "Fin del repaso"}</Text>
          <NoorButton
            onPress={() => router.replace("/home")}
            label={t("game.backHome") ?? "Volver al inicio"}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  const src = parseSource(card.source);
  const correct = card.correctAnswer[language];

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("game.backHome") ?? "Volver"}</Text>
        </TouchableOpacity>

        <View style={styles.topBar}>
          <Text style={styles.title}>{t("setup.learnMode.title") ?? "Aprender"}</Text>
          <Text style={styles.progress}>
            {index + 1} / {deck.length}
          </Text>
        </View>

        {card.arabicVerse ? (
          <NoorCard variant="gold">
            <Text style={styles.arabicVerse}>{card.arabicVerse}</Text>
          </NoorCard>
        ) : null}

        <NoorCard>
          <Text style={[styles.question, isRTL && styles.questionRTL]}>
            {card.question[language]}
          </Text>
        </NoorCard>

        {revealed ? (
          <NoorCard variant="dark">
            <Text style={styles.answer}>{correct}</Text>
            <Text style={[styles.explanation, isRTL && { textAlign: "right" }]}>
              {card.explanation[language]}
            </Text>
            {src ? (
              <TouchableOpacity
                accessibilityRole={src.url ? "link" : "text"}
                disabled={!src.url}
                onPress={() => src.url && Linking.openURL(src.url)}
              >
                <Text style={[styles.sourceText, src.url && styles.sourceLink]}>
                  {t("game.source") ?? "Fuente"}: {src.label}
                </Text>
              </TouchableOpacity>
            ) : null}
          </NoorCard>
        ) : null}

        {revealed ? (
          <NoorButton
            onPress={() => setIndex((i) => i + 1)}
            label={t("learn.next") ?? "Siguiente tarjeta"}
            variant="primary"
            size="lg"
          />
        ) : (
          <NoorButton
            onPress={() => setRevealed(true)}
            label={t("learn.showAnswer") ?? "Ver respuesta y explicación"}
            variant="secondary"
            size="lg"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  doneText: { fontSize: 18, color: Colors.parchment.primary, fontWeight: "700" },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  back: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: Colors.parchment.primary },
  progress: { fontSize: 13, color: Colors.text.muted, fontWeight: "600" },
  arabicVerse: {
    fontFamily: "Amiri_400Regular",
    fontSize: 20,
    color: Colors.gold.primary,
    textAlign: "right",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  question: { fontSize: 17, color: Colors.parchment.primary, fontWeight: "600", lineHeight: 26 },
  questionRTL: { textAlign: "right", fontFamily: "Amiri_400Regular", fontSize: 20 },
  answer: { fontSize: 16, fontWeight: "800", color: Colors.gold.primary, marginBottom: 8 },
  explanation: { fontSize: 15, color: Colors.text.primary, lineHeight: 24 },
  sourceText: { fontSize: 12, color: Colors.text.muted, marginTop: 10 },
  sourceLink: { color: Colors.gold.primary, textDecorationLine: "underline" },
});
