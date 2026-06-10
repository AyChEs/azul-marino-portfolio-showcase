import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { AnswerOption } from "../components/ui/AnswerOption";
import { TimerBar } from "../components/ui/TimerBar";
import { NoorButton } from "../components/ui/NoorButton";
import { NoorCard } from "../components/ui/NoorCard";
import { IslamicPatternBackground } from "../components/patterns/IslamicPattern";
import { useLanguage } from "../context/LanguageContext";
import {
  selectGameQuestions,
  calculateQuestionScore,
  calculateFinalScore,
  getTimerDuration,
  applyFiftyFifty,
  INITIAL_LIVES,
  INITIAL_LIFELINES,
  EXTRA_TIME_BONUS,
} from "../lib/gameLogic";
import { getPlayedQuestions, addPlayedQuestions, updateStats } from "../lib/storage";
import { getAIFeedback } from "../lib/ai";
import type { Question, Difficulty, GameMode } from "../lib/types";
import questions from "../data/questions.json";

type AnswerState = "idle" | "selected" | "correct" | "incorrect";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const VALID_CATEGORIES: GameMode[] = ["mix", "Seerah", "Profetas", "Corán y General"];

export default function PlayScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const params = useLocalSearchParams<{
    mode: string;
    category: string;
    difficulty: string;
  }>();

  const rawDiff = params.difficulty ?? "easy";
  const rawCat = params.category ?? "mix";
  const difficulty: Difficulty = VALID_DIFFICULTIES.includes(rawDiff as Difficulty)
    ? (rawDiff as Difficulty)
    : "easy";
  const category: GameMode = VALID_CATEGORIES.includes(rawCat as GameMode)
    ? (rawCat as GameMode)
    : "mix";

  const totalTime = getTimerDuration(difficulty);

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [lifelines, setLifelines] = useState({ ...INITIAL_LIFELINES });
  const [visibleOptions, setVisibleOptions] = useState<string[]>([]);
  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastScore, setLastScore] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endGameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timedOutRef = useRef(false);
  const isAnsweredRef = useRef(false);
  const endedRef = useRef(false);
  // timeLeftRef mirrors timeLeft state — lets handleAnswer read the current
  // time without listing timeLeft as a dep (which would invalidate the
  // callback every second and break React.memo on AnswerOption children).
  const timeLeftRef = useRef(totalTime);

  // Refs for latest callbacks — avoids stale closures in timer/timeout
  const endGameRef = useRef<(() => Promise<void>) | null>(null);
  const handleTimeOutRef = useRef<(() => void) | null>(null);
  const visibleOptionsRef = useRef<string[]>([]);

  const goldFlash = useSharedValue(0);
  const scorePopScale = useSharedValue(0);
  const scorePopOpacity = useSharedValue(0);

  const currentQ = gameQuestions[currentIndex];

  // ── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const played = await getPlayedQuestions();
        let selected = selectGameQuestions(
          questions as Question[],
          category,
          difficulty,
          language,
          played
        );
        // If the played-history exhausted the pool, retry ignoring history.
        // Prevents the user from getting stuck on an empty deck.
        if (selected.length === 0) {
          selected = selectGameQuestions(
            questions as Question[],
            category,
            difficulty,
            language,
            []
          );
        }
        if (cancelled) return;
        setGameQuestions(selected);
        setMaxPoints(selected.length);
      } catch {
        if (!cancelled) setGameQuestions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [category, difficulty, language]);

  // ── Reset state when question changes ───────────────────────────────────────
  useEffect(() => {
    if (!currentQ) return;
    const opts = currentQ.options[language] ?? [];
    visibleOptionsRef.current = opts;
    setVisibleOptions(opts);
    setAnswerStates({});
    setIsAnswered(false);
    isAnsweredRef.current = false;
    setAiFeedback(null);
    setTimeLeft(totalTime);
    timeLeftRef.current = totalTime;
    timedOutRef.current = false;
  }, [currentIndex, language]);

  // ── Global cleanup on unmount — kill any pending timers/timeouts ────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (endGameTimeoutRef.current) clearTimeout(endGameTimeoutRef.current);
    };
  }, []);

  // ── endGame — guarded to run only once per game ─────────────────────────────
  const endGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (endGameTimeoutRef.current) clearTimeout(endGameTimeoutRef.current);
    const playedIds = gameQuestions.map((q) => q.id);
    await addPlayedQuestions(playedIds);
    const finalScore = calculateFinalScore(earnedPoints, maxPoints);
    await updateStats(finalScore, correctCount);
    router.replace({
      pathname: "/game-over",
      params: {
        score: String(finalScore),
        correct: String(correctCount),
        total: String(gameQuestions.length),
        language,
        category,
        difficulty,
      },
    });
  }, [gameQuestions, earnedPoints, maxPoints, correctCount, language, category, difficulty]);

  // Assign ref directly during render — cheaper than useEffect, safe for refs
  endGameRef.current = endGame;

  // ── loseLife — schedules endGame once, tracked via ref to allow cleanup ─────
  const loseLife = useCallback(() => {
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0 && !endedRef.current && !endGameTimeoutRef.current) {
        endGameTimeoutRef.current = setTimeout(() => {
          endGameTimeoutRef.current = null;
          endGameRef.current?.();
        }, 1200);
      }
      return next;
    });
  }, []);

  // ── handleTimeOut — also guards against double-trigger after answer ─────────
  const handleTimeOut = useCallback(() => {
    if (timedOutRef.current || isAnsweredRef.current) return;
    timedOutRef.current = true;
    isAnsweredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    // Read opts from ref — pure, no setState inside another setState updater
    const opts = visibleOptionsRef.current;
    const correct = currentQ?.correctAnswer[language] ?? "";
    const newStates: Record<string, AnswerState> = {};
    opts.forEach((opt) => {
      newStates[opt] = opt === correct ? "correct" : "idle";
    });
    setAnswerStates(newStates);
    setIsAnswered(true);
    loseLife();
  }, [currentQ, language, loseLife]);

  // Assign ref directly during render — refs don't need useEffect
  handleTimeOutRef.current = handleTimeOut;

  // ── Timer — only decrements, NO side effects inside the updater ─────────────
  useEffect(() => {
    if (isAnswered || !currentQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, currentIndex, currentQ]);

  // ── React to timeLeft hitting 0 (separate from timer, outside updater) ──────
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && currentQ) {
      handleTimeOutRef.current?.();
    }
  }, [timeLeft, isAnswered, currentQ]);

  // ── handleAnswer ─────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (option: string) => {
      if (isAnswered || isAnsweredRef.current) return;
      isAnsweredRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      setIsAnswered(true);

      const correct = currentQ.correctAnswer[language];
      const isCorrect = option === correct;

      // Read options from ref — keeps handleAnswer stable through 50/50 reduce.
      const opts = visibleOptionsRef.current;
      const newStates: Record<string, AnswerState> = {};
      opts.forEach((opt) => {
        if (opt === option) newStates[opt] = isCorrect ? "correct" : "incorrect";
        else if (opt === correct) newStates[opt] = "correct";
        else newStates[opt] = "idle";
      });
      setAnswerStates(newStates);

      if (isCorrect) {
        // Read time from ref, not closure — keeps handleAnswer stable across
        // timer ticks so memoized children don't re-render every second.
        const pts = calculateQuestionScore(difficulty, timeLeftRef.current, totalTime, category);
        setEarnedPoints((prev) => prev + pts);
        setCorrectCount((prev) => prev + 1);
        setLastScore(pts);

        // Gold flash
        goldFlash.value = withSequence(
          withTiming(0.18, { duration: 120 }),
          withDelay(180, withTiming(0, { duration: 250 }))
        );
        // Score pop — withSequence keeps the animations in order on the same value
        scorePopScale.value = withSequence(
          withSpring(1, { stiffness: 420, damping: 18 }),
          withDelay(400, withSpring(0.7, { stiffness: 300, damping: 20 }))
        );
        scorePopOpacity.value = withSequence(
          withTiming(1, { duration: 120 }),
          withDelay(380, withTiming(0, { duration: 300 }))
        );
      } else {
        loseLife();
        setIsLoadingFeedback(true);
        try {
          const feedback = await getAIFeedback({
            question: currentQ.question[language],
            correctAnswer: correct,
            userAnswer: option,
            language,
          });
          setAiFeedback(feedback || null);
        } catch {
          setAiFeedback(null);
        } finally {
          setIsLoadingFeedback(false);
        }
      }
    },
    // timeLeft and visibleOptions intentionally omitted — read via refs to
    // keep handleAnswer stable so AnswerOption's React.memo remains effective.
    [isAnswered, currentQ, language, totalTime, difficulty, category, loseLife]
  );

  // ── handleNext ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (endedRef.current) return;
    if (currentIndex >= gameQuestions.length - 1 || lives <= 0) {
      // Cancel the pending endGame timeout — we're ending now, no need to wait
      if (endGameTimeoutRef.current) {
        clearTimeout(endGameTimeoutRef.current);
        endGameTimeoutRef.current = null;
      }
      endGameRef.current?.();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, gameQuestions.length, lives]);

  // ── Lifelines ────────────────────────────────────────────────────────────────
  const useFiftyFifty = useCallback(() => {
    if (lifelines.fiftyFifty <= 0 || isAnswered || !currentQ) return;
    const correct = currentQ.correctAnswer[language];
    const reduced = applyFiftyFifty(visibleOptionsRef.current, correct);
    visibleOptionsRef.current = reduced;
    setVisibleOptions(reduced);
    setLifelines((l) => ({ ...l, fiftyFifty: l.fiftyFifty - 1 }));
  }, [lifelines.fiftyFifty, isAnswered, currentQ, language]);

  const useExtraTime = useCallback(() => {
    if (lifelines.extraTime <= 0 || isAnswered) return;
    setTimeLeft((t) => {
      const next = t + EXTRA_TIME_BONUS;
      timeLeftRef.current = next;
      return next;
    });
    setLifelines((l) => ({ ...l, extraTime: l.extraTime - 1 }));
  }, [lifelines.extraTime, isAnswered]);

  const useSkip = useCallback(() => {
    if (lifelines.skip <= 0 || isAnswered || difficulty === "easy") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLifelines((l) => ({ ...l, skip: 0 }));
    handleNext();
  }, [lifelines.skip, isAnswered, difficulty, handleNext]);

  // ── Animated styles ──────────────────────────────────────────────────────────
  const goldFlashStyle = useAnimatedStyle(() => ({ opacity: goldFlash.value }));
  const scorePopStyle = useAnimatedStyle(() => ({
    opacity: scorePopOpacity.value,
    transform: [{ scale: scorePopScale.value }],
  }));

  // ── Loading / empty-pool state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t("loading.game") ?? "Cargando..."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQ) {
    // No questions matched difficulty + category + language. Offer escape.
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>
            {t("loading.noQuestions") ?? "No hay preguntas disponibles para esta combinación."}
          </Text>
          <NoorButton
            onPress={() => router.replace("/home")}
            label={t("game.backHome") ?? "Volver al inicio"}
            variant="primary"
            size="md"
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const progressText = `${currentIndex + 1} / ${gameQuestions.length}`;

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />

      <Animated.View style={[styles.flashOverlay, goldFlashStyle]} pointerEvents="none" />
      <Animated.View style={[styles.scorePop, scorePopStyle]} pointerEvents="none">
        <Text style={styles.scorePopText}>+{lastScore}</Text>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.lives}>
            {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
              <Text key={i} style={[styles.heart, i >= lives && styles.heartLost]}>♥</Text>
            ))}
          </View>
          <Text style={styles.progress}>{progressText}</Text>
        </View>

        <TimerBar timeLeft={timeLeft} totalTime={totalTime} />

        {/* Lifelines */}
        <View style={styles.lifelines}>
          <NoorButton onPress={useFiftyFifty} label={`50/50 (${lifelines.fiftyFifty})`} variant="ghost" size="sm" disabled={lifelines.fiftyFifty === 0 || isAnswered} />
          <NoorButton onPress={useExtraTime} label={`+${EXTRA_TIME_BONUS}s (${lifelines.extraTime})`} variant="ghost" size="sm" disabled={lifelines.extraTime === 0 || isAnswered} />
          {difficulty !== "easy" && (
            <NoorButton onPress={useSkip} label={`↷ (${lifelines.skip})`} variant="ghost" size="sm" disabled={lifelines.skip === 0 || isAnswered} />
          )}
        </View>

        {/* Arabic verse */}
        {currentQ.arabicVerse && (
          <NoorCard variant="gold" style={styles.verseCard}>
            <Text style={styles.arabicVerse}>{currentQ.arabicVerse}</Text>
          </NoorCard>
        )}

        {/* Question */}
        <NoorCard style={styles.questionCard}>
          <Text style={styles.diffBadge}>{difficulty.toUpperCase()}</Text>
          <Text style={[styles.question, isRTL && styles.questionRTL]}>
            {currentQ.question[language]}
          </Text>
        </NoorCard>

        {/* Options */}
        <View style={styles.options}>
          {visibleOptions.map((opt, i) => (
            <AnswerOption
              key={opt}
              label={opt}
              index={i}
              state={answerStates[opt] ?? "idle"}
              onSelect={handleAnswer}
              disabled={isAnswered}
              isRTL={isRTL}
            />
          ))}
        </View>

        {/* Feedback + Next button */}
        {isAnswered && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.feedbackContainer}>
            {isLoadingFeedback ? (
              <NoorCard>
                <Text style={styles.feedbackLoading}>{t("loading.default") ?? "..."}</Text>
              </NoorCard>
            ) : aiFeedback ? (
              <NoorCard variant="dark">
                <Text style={styles.feedbackLabel}>نور</Text>
                <Text style={[styles.feedbackText, isRTL && { textAlign: "right" }]}>{aiFeedback}</Text>
              </NoorCard>
            ) : null}

            <NoorButton
              onPress={handleNext}
              label={
                currentIndex >= gameQuestions.length - 1 || lives <= 0
                  ? t("game.seeResults") ?? "Ver resultados"
                  : t("game.nextQuestion") ?? "Siguiente"
              }
              variant="primary"
              size="lg"
              style={{ marginTop: 4 }}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: Colors.text.secondary, fontSize: 16 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lives: { flexDirection: "row", gap: 4 },
  heart: { fontSize: 20, color: Colors.incorrect },
  heartLost: { color: Colors.border.subtle, opacity: 0.4 },
  progress: { fontSize: 13, color: Colors.text.muted, fontWeight: "600" },
  lifelines: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  verseCard: {},
  arabicVerse: {
    fontFamily: "Amiri_400Regular",
    fontSize: 20,
    color: Colors.gold.primary,
    textAlign: "right",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  questionCard: {},
  diffBadge: { fontSize: 10, color: Colors.text.muted, fontWeight: "700", letterSpacing: 1.5, marginBottom: 8 },
  question: { fontSize: 17, color: Colors.parchment.primary, fontWeight: "600", lineHeight: 26 },
  questionRTL: { textAlign: "right", fontFamily: "Amiri_400Regular", fontSize: 20 },
  options: { gap: 10 },
  feedbackContainer: { gap: 12 },
  feedbackLoading: { color: Colors.text.muted, textAlign: "center", fontStyle: "italic" },
  feedbackLabel: { fontFamily: "Amiri_700Bold", fontSize: 16, color: Colors.gold.primary, marginBottom: 8, textAlign: "right" },
  feedbackText: { fontSize: 15, color: Colors.text.primary, lineHeight: 24 },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.gold.primary, zIndex: 10 },
  scorePop: {
    position: "absolute", top: "40%", alignSelf: "center", zIndex: 20,
    backgroundColor: Colors.gold.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 40,
  },
  scorePopText: { fontSize: 28, fontWeight: "800", color: Colors.bg.primary },
});
