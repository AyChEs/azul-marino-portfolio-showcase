import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { getTodaysQuestion, getTodayDateString } from "../lib/dailyChallenge";
import { completeDailyChallenge, isDailyDone } from "../lib/storage";
import { parseSource } from "../lib/sources";
import { shuffleSeeded } from "../lib/gameLogic";
import { feedback } from "../lib/feedback";
import type { Question } from "../lib/types";
import { loadQuestions } from "../lib/questionsLoader";

const LETTERS = ["A", "B", "C", "D"] as const;
type PickState = "idle" | "correct" | "wrong";

export default function DailyChallengeScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const todayStr = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [already, allQuestions] = await Promise.all([
        isDailyDone(),
        loadQuestions(),
      ]);
      if (cancelled) return;
      const q = getTodaysQuestion(allQuestions, language);
      if (cancelled) return;
      setQuestion(q);
      setDone(already);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [language]);

  const options = useMemo<string[]>(
    () =>
      question
        ? shuffleSeeded(question.options[language] ?? [], question.id)
        : [],
    [question, language],
  );

  const handlePick = (opt: string) => {
    if (picked !== null || !question) return;
    setPicked(opt);
    const correct = opt === question.correctAnswer[language];
    if (correct) feedback.correct();
    else feedback.incorrect();
    completeDailyChallenge(correct, question.id, todayStr);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.hint}>{t("loading.default")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
        <View style={styles.center}>
          <Text style={styles.doneIcon}>✓</Text>
          <Text style={styles.doneTitle}>{t("dailyChallenge.alreadyDone")}</Text>
          <NoorButton
            onPress={() => router.back()}
            label={t("game.backHome")}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.hint}>{t("loading.noQuestions")}</Text>
          <NoorButton
            onPress={() => router.back()}
            label={t("game.backHome")}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  const correct = question.correctAnswer[language];
  const revealed = picked !== null;
  const src = parseSource(question.source);

  const getPickState = (opt: string): PickState => {
    if (!revealed) return "idle";
    if (opt === correct) return "correct";
    if (opt === picked) return "wrong";
    return "idle";
  };

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {t("game.backHome")}</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>{t("dailyChallenge.badge")}</Text>
        <Text style={styles.title}>{t("dailyChallenge.title")}</Text>

        {question.arabicVerse ? (
          <NoorCard variant="gold">
            <Text style={styles.arabicVerse}>{question.arabicVerse}</Text>
          </NoorCard>
        ) : null}

        <NoorCard>
          <Text style={[styles.questionText, isRTL && styles.questionRTL]}>
            {question.question[language]}
          </Text>
        </NoorCard>

        <View style={styles.options}>
          {options.map((opt, i) => {
            const state = getPickState(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => handlePick(opt)}
                activeOpacity={revealed ? 1 : 0.75}
                style={[
                  styles.option,
                  state === "correct" && styles.optionCorrect,
                  state === "wrong" && styles.optionWrong,
                ]}
              >
                <View
                  style={[
                    styles.letterChip,
                    state === "correct" && styles.letterChipCorrect,
                    state === "wrong" && styles.letterChipWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.letter,
                      state === "correct" && styles.letterActive,
                      state === "wrong" && styles.letterActive,
                    ]}
                  >
                    {LETTERS[i] ?? "?"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isRTL && styles.optionTextRTL,
                    state === "correct" && styles.optionTextCorrect,
                    state === "wrong" && styles.optionTextWrong,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {revealed ? (
          <>
            <NoorCard variant="dark" style={styles.explanationCard}>
              <Text style={styles.explanationLabel}>{t("game.explanation")}</Text>
              <Text style={[styles.explanation, isRTL && { textAlign: "right" }]}>
                {question.explanation[language]}
              </Text>
              {src ? (
                <TouchableOpacity
                  accessibilityRole={src.url ? "link" : "text"}
                  disabled={!src.url}
                  onPress={() => src.url && Linking.openURL(src.url)}
                >
                  <Text style={[styles.sourceText, src.url && styles.sourceLink]}>
                    {t("game.source")}: {src.label}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </NoorCard>
            <NoorButton
              onPress={() => router.back()}
              label={t("dailyChallenge.done")}
              variant="primary"
              size="lg"
            />
          </>
        ) : (
          <Text style={styles.hint}>{t("learn.tapHint")}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  doneIcon: { fontSize: 48, color: Colors.accent.emeraldLight },
  doneTitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 22,
    color: Colors.parchment.primary,
    textAlign: "center",
  },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  back: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
  badge: {
    ...MicroLabel,
    color: Colors.gold.primary,
    marginBottom: -4,
  },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 26,
    color: Colors.parchment.primary,
  },
  arabicVerse: {
    fontFamily: "Amiri_400Regular",
    fontSize: 20,
    color: Colors.gold.primary,
    textAlign: "right",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  questionText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 20,
    color: Colors.parchment.primary,
    lineHeight: 29,
  },
  questionRTL: { textAlign: "right", fontFamily: Fonts.arabic, fontStyle: "normal", fontSize: 21 },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  optionCorrect: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: "rgba(16, 185, 129, 0.13)",
  },
  optionWrong: {
    borderColor: Colors.incorrect,
    backgroundColor: "rgba(220, 38, 38, 0.10)",
  },
  letterChip: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.gold.dusty,
    backgroundColor: "rgba(193, 154, 91, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  letterChipCorrect: {
    backgroundColor: Colors.accent.emerald,
    borderColor: Colors.accent.emeraldLight,
  },
  letterChipWrong: {
    backgroundColor: Colors.incorrect,
    borderColor: Colors.incorrect,
  },
  letter: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 13,
    color: Colors.gold.dusty,
  },
  letterActive: { color: Colors.text.onAccent },
  optionText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 21,
  },
  optionTextRTL: { textAlign: "right", fontFamily: Fonts.arabic, fontSize: 16 },
  optionTextCorrect: { color: Colors.accent.emeraldLight, fontFamily: Fonts.bodySemiBold },
  optionTextWrong: { color: Colors.incorrect },
  explanationCard: { marginTop: 4 },
  explanationLabel: { ...MicroLabel, color: Colors.gold.primary, marginBottom: 8 },
  explanation: { fontSize: 15, color: Colors.text.primary, lineHeight: 24 },
  sourceText: { fontSize: 12, color: Colors.text.muted, marginTop: 10 },
  sourceLink: { color: Colors.gold.primary, textDecorationLine: "underline" },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.text.muted,
    textAlign: "center",
    marginTop: 4,
  },
});
