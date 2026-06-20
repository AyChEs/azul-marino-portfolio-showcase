// Learn Mode — review without clock or lives. A/B/C/D chips to guess, then
// reveals correct answer, explanation and cited source.
// Smart review: questions the player failed in game mode are dealt first
// (spaced-repetition lite) and drop off the list once answered correctly here.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Fonts, MicroLabel } from "../constants/fonts";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import { selectGameQuestions, shuffleSeeded } from "../lib/gameLogic";
import {
  getMissedQuestions,
  addMissedQuestion,
  removeMissedQuestion,
  incrementLearnReviewed,
  saveSRCard,
  getSRCards,
} from "../lib/storage";
import { createSRCard, qualityFromResponse, applySM2 } from "../lib/spacedRepetition";
import { feedback } from "../lib/feedback";
import { parseSource } from "../lib/sources";
import type { Question, Difficulty, GameMode } from "../lib/types";
import { loadQuestions } from "../lib/questionsLoader";

const VALID_CATEGORIES: GameMode[] = ["mix", "Seerah", "Profetas", "Corán y General"];
const CARDS_PER_SESSION = 15;
const LETTERS = ["A", "B", "C", "D"] as const;

type PickState = "idle" | "correct" | "wrong";

export default function LearnScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const params = useLocalSearchParams<{ category: string }>();
  const rawCat = params.category ?? "mix";
  const category: GameMode = VALID_CATEGORIES.includes(rawCat as GameMode)
    ? (rawCat as GameMode)
    : "mix";

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [deck, setDeck] = useState<Question[]>([]);
  const [missedIds, setMissedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const optionSaltRef = useRef((Math.random() * 0xffffffff) | 0);
  const cardStartRef = useRef(Date.now());

  // Failed-in-game questions are dealt first, then the deck fills with the
  // regular mixed-difficulty selection.
  useEffect(() => {
    let cancelled = false;
    const build = async () => {
      const [missed, allQuestions] = await Promise.all([
        getMissedQuestions(),
        loadQuestions(),
      ]);
      if (cancelled) return;
      const missedSet = new Set(missed);
      const byId = new Map(allQuestions.map((q) => [q.id, q]));
      const reviewCards = missed
        .map((id) => byId.get(id))
        .filter((q): q is Question => {
          if (!q) return false;
          if (category !== "mix" && q.category !== category) return false;
          return Boolean(q.correctAnswer?.[language]);
        });

      const fresh = (["easy", "medium", "hard"] as Difficulty[])
        .flatMap((d) =>
          selectGameQuestions(allQuestions, category, d, language, [])
        )
        .filter((q) => !missedSet.has(q.id));

      setMissedIds(missedSet);
      setDeck([...reviewCards, ...fresh].slice(0, CARDS_PER_SESSION));
      setIsLoading(false);
    };
    build();
    return () => {
      cancelled = true;
    };
    // Build once per category/language session — not on every card advance.
  }, [category, language]);

  useEffect(() => {
    setPicked(null);
    cardStartRef.current = Date.now();
  }, [index]);

  const card = deck[index];

  const options = useMemo<string[]>(
    () =>
      card
        ? shuffleSeeded(card.options[language] ?? [], card.id ^ optionSaltRef.current)
        : [],
    [card, language]
  );

  const handlePick = (opt: string) => {
    if (picked !== null || !card) return;
    setPicked(opt);
    const elapsed = Date.now() - cardStartRef.current;
    const correct = opt === card.correctAnswer[language];
    const quality = qualityFromResponse(correct, elapsed);
    if (correct) feedback.correct();
    else feedback.incorrect();
    incrementLearnReviewed(1);
    // Legacy review-badge bookkeeping
    if (correct) {
      removeMissedQuestion(card.id);
    } else {
      addMissedQuestion(card.id);
    }
    // SM-2 spaced repetition: create or update card
    getSRCards().then((cards) => {
      const existing = cards.find((c) => c.questionId === card.id);
      const srCard = existing
        ? applySM2(existing, quality)
        : applySM2(createSRCard(card.id), quality);
      saveSRCard(srCard);
    });
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

  if (!card) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.doneText}>{t("learn.done")}</Text>
          <NoorButton
            onPress={() => router.replace("/home")}
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
  const isReviewCard = missedIds.has(card.id);
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
          <Text style={styles.title}>{t("setup.learnMode.title")}</Text>
          <Text style={styles.progress}>
            {index + 1} / {deck.length}
          </Text>
        </View>

        {isReviewCard ? (
          <View style={styles.reviewBadge}>
            <Text style={styles.reviewBadgeText}>↻ {t("learn.reviewBadge")}</Text>
          </View>
        ) : null}

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

        {/* Answer chips */}
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

        {/* Explanation revealed after pick */}
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
            onPress={() => setIndex((i) => i + 1)}
            label={
              index >= deck.length - 1
                ? t("learn.done")
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
  doneText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 22,
    color: Colors.parchment.primary,
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
  reviewBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.10)",
  },
  reviewBadgeText: { ...MicroLabel, fontSize: 10, color: Colors.gold.light },
});
