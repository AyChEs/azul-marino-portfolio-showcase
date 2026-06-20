import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
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
import { getSRCards, saveSRCard, incrementLearnReviewed } from "../lib/storage";
import { qualityFromResponse, applySM2, sortByPriority, isDue } from "../lib/spacedRepetition";
import { feedback } from "../lib/feedback";
import { parseSource } from "../lib/sources";
import { shuffleSeeded } from "../lib/gameLogic";
import type { Question, SRCard } from "../lib/types";
import { loadQuestions } from "../lib/questionsLoader";

const LETTERS = ["A", "B", "C", "D"] as const;

type PickState = "idle" | "correct" | "wrong";

export default function ReviewScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  const [dueCards, setDueCards] = useState<SRCard[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const cardStartRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await loadQuestions();
        if (!cancelled) setAllQuestions(data);
      } catch {
        if (!cancelled) setAllQuestions([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const optionSaltRef = useRef((Math.random() * 0xffffffff) | 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cards = await getSRCards();
      if (cancelled) return;
      const now = Date.now();
      const due = cards.filter((c) => isDue(c, now)).sort(sortByPriority);
      setDueCards(due);
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setPicked(null);
    cardStartRef.current = Date.now();
  }, [index]);

  const srCard = dueCards[index];
  const byId = useMemo(() => new Map(allQuestions.map((q) => [q.id, q])), [allQuestions]);
  const card: Question | undefined = srCard ? byId.get(srCard.questionId) : undefined;

  const options = useMemo<string[]>(
    () =>
      card
        ? shuffleSeeded(card.options[language] ?? [], card.id ^ optionSaltRef.current)
        : [],
    [card, language],
  );

  const next = useCallback(() => {
    if (index < dueCards.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setIndex(dueCards.length);
    }
  }, [index, dueCards.length]);

  const handlePick = useCallback(
    (opt: string) => {
      if (picked !== null || !card || !srCard) return;
      setPicked(opt);
      const elapsed = Date.now() - cardStartRef.current;
      const correct = opt === card.correctAnswer[language];
      if (correct) feedback.correct();
      else feedback.incorrect();
      const quality = qualityFromResponse(correct, elapsed);
      const updated = applySM2(srCard, quality);
      saveSRCard(updated);
      incrementLearnReviewed(1);
    },
    [picked, card, srCard, language],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.hint}>{t("loading.default")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // `card` can be undefined if we've run past the deck, or if a due card points
  // at a question id that no longer exists in the bank (e.g. pulled in an
  // update). Both collapse into the completion screen.
  if (dueCards.length === 0 || index >= dueCards.length || !card) {
    const total = reviewedCount > 0 ? reviewedCount : (index > 0 ? index : 0);
    return (
      <SafeAreaView style={styles.root}>
        <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />
        <View style={styles.center}>
          <Text style={styles.doneIcon}>✓</Text>
          <Text style={styles.doneTitle}>{t("review.done")}</Text>
          <Text style={styles.doneSub}>
            {dueCards.length === 0
              ? t("review.noneDue")
              : t("review.cardsReviewed", { count: total })}
          </Text>
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

  const src = parseSource(card.source);
  const correct = card.correctAnswer[language];
  const revealed = picked !== null;

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

        <View style={styles.topBar}>
          <Text style={styles.title}>{t("review.title")}</Text>
          <Text style={styles.progress}>
            {index + 1} / {dueCards.length}
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
          <NoorCard variant="dark" style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>{t("game.explanation")}</Text>
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
                  {t("game.source")}: {src.label}
                </Text>
              </TouchableOpacity>
            ) : null}
          </NoorCard>
        ) : null}

        {revealed ? (
          <NoorButton
            onPress={() => {
              setReviewedCount((c) => c + 1);
              next();
            }}
            label={
              index >= dueCards.length - 1
                ? t("review.finish")
                : t("learn.next")
            }
            variant="primary"
            size="lg"
          />
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
  doneSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: "center",
  },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  back: { paddingVertical: 4 },
  backText: { fontSize: 14, color: Colors.text.secondary },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 24,
    color: Colors.parchment.primary,
  },
  progress: { ...MicroLabel, color: Colors.text.muted },
  arabicVerse: {
    fontFamily: "Amiri_400Regular",
    fontSize: 20,
    color: Colors.gold.primary,
    textAlign: "right",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  question: {
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
