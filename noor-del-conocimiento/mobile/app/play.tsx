import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Alert,
  Platform,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { Fonts, MicroLabel } from "../constants/fonts";
import { LifelineTile } from "../components/ui/LifelineTile";
import { SectionLabel } from "../components/ui/SectionLabel";
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
  MAJLIS_QUESTIONS_PER_PLAYER,
  shuffleSeeded,
} from "../lib/gameLogic";
import { getPlayedQuestions, addPlayedQuestions, addMissedQuestion, updateStats, getStats, getDailyStreak, bumpDailyStreak, incrementMajlisGames, addCategoryStats } from "../lib/storage";
import { feedback } from "../lib/feedback";
import { buildAchievements, diffUnlocked } from "../lib/achievements";
import { parseSource } from "../lib/sources";
import type { Question, Difficulty, GameMode, Player } from "../lib/types";
import { loadQuestions } from "../lib/questionsLoader";

type AnswerState = "idle" | "selected" | "correct" | "incorrect";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const VALID_CATEGORIES: GameMode[] = ["mix", "Seerah", "Profetas", "Corán y General"];

const findNextMajlisTurn = (
  fromIdx: number,
  players: Player[],
  answered: Record<string, number>
): number | null => {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIdx + step) % n;
    const p = players[idx];
    if (!p.isEliminated && (answered[p.id] ?? 0) < MAJLIS_QUESTIONS_PER_PLAYER) {
      return idx;
    }
  }
  return null;
};

const isMajlisGameOver = (players: Player[], answered: Record<string, number>): boolean => {
  const alive = players.filter((p) => !p.isEliminated);
  if (alive.length <= 1) return true;
  return players.every(
    (p) => p.isEliminated || (answered[p.id] ?? 0) >= MAJLIS_QUESTIONS_PER_PLAYER
  );
};

export default function PlayScreen() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const params = useLocalSearchParams<{
    mode: string;
    category: string;
    difficulty: string;
    players?: string;
  }>();

  const isMajlis = params.mode === "majlis";
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
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [majlisQuestion, setMajlisQuestion] = useState<Question | null>(null);
  const [majlisPlayers, setMajlisPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<Record<string, number>>({});
  const [sessionPlayedIds, setSessionPlayedIds] = useState<number[]>([]);
  const [awaitingReady, setAwaitingReady] = useState(false);

  const [isLoading, setIsLoading] = useState(!isMajlis);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [lifelines, setLifelines] = useState({ ...INITIAL_LIFELINES });
  const [visibleOptions, setVisibleOptions] = useState<string[]>([]);
  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        setPaused(true);
      } else if (nextAppState === "active") {
        setPaused(false);
      }
    });
    return () => subscription.remove();
  }, []);

  // Consecutive-correct tracking for the "streak" achievements (musafir only).
  const correctStreakRef = useRef(0);
  const maxCorrectStreakRef = useRef(0);
  // Per-category tally for this game → persisted on endGame (musafir only).
  const perCategoryRef = useRef<Record<string, { correct: number; total: number }>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endGameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timedOutRef = useRef(false);
  const isAnsweredRef = useRef(false);
  const endedRef = useRef(false);
  const timeLeftRef = useRef(totalTime);
  const endGameRef = useRef<(() => Promise<void>) | null>(null);
  const handleTimeOutRef = useRef<(() => void) | null>(null);
  const visibleOptionsRef = useRef<string[]>([]);
  const majlisPlayersRef = useRef<Player[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  // Per-game salt so option order varies between games but stays stable for a
  // given question within this game (and across language switches).
  const optionSaltRef = useRef((Math.random() * 0xffffffff) | 0);

  const goldFlash = useSharedValue(0);
  const scorePopScale = useSharedValue(0);
  const scorePopOpacity = useSharedValue(0);
  const scorePopY = useSharedValue(12);

  const activeMajlisPlayer = isMajlis ? majlisPlayers[currentPlayerIdx] : null;
  const currentQ = isMajlis ? majlisQuestion : gameQuestions[currentIndex];

  majlisPlayersRef.current = majlisPlayers;

  const syncMajlisDerivedState = useCallback((player: Player | null) => {
    if (!player) return;
    setLives(player.lives);
    setLifelines({ ...player.lifelines });
  }, []);

  const updateMajlisPlayer = useCallback((idx: number, updater: (p: Player) => Player) => {
    setMajlisPlayers((prev) => {
      const next = prev.map((p, i) => (i === idx ? updater(p) : p));
      const updated = next[idx];
      if (idx === currentPlayerIdx && updated) {
        syncMajlisDerivedState(updated);
      }
      return next;
    });
  }, [currentPlayerIdx, syncMajlisDerivedState]);

  // ── Init majlis players ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMajlis) return;
    if (!params.players) {
      setIsLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(params.players) as Player[];
      if (parsed.length > 0) {
        setMajlisPlayers(parsed);
        setAwaitingReady(true);
        syncMajlisDerivedState(parsed[0]);
      }
    } catch {
      // malformed param
    } finally {
      setIsLoading(false);
    }
  }, [isMajlis, params.players, syncMajlisDerivedState]);

  // ── Load questions data ─────────────────────────────────────────────────────
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

  // ── Load musafir questions ──────────────────────────────────────────────────
  useEffect(() => {
    if (isMajlis || allQuestions.length === 0) return;
    let cancelled = false;
    const init = async () => {
      try {
        const played = await getPlayedQuestions();
        let selected = selectGameQuestions(
          allQuestions,
          category,
          difficulty,
          language,
          played
        );
        if (selected.length === 0) {
          selected = selectGameQuestions(
            allQuestions,
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
  }, [category, difficulty, language, isMajlis, allQuestions]);

  const resetQuestionUi = useCallback(() => {
    setAnswerStates({});
    setIsAnswered(false);
    isAnsweredRef.current = false;
    setTimeLeft(totalTime);
    timeLeftRef.current = totalTime;
    timedOutRef.current = false;
    scorePopOpacity.value = 0;
    scorePopScale.value = 0;
    scorePopY.value = 12;
  }, [totalTime, scorePopOpacity, scorePopScale, scorePopY]);

  // ── Reset state when question changes ───────────────────────────────────────
  useEffect(() => {
    if (!currentQ) return;
    // Seeded shuffle kills positional bias from the JSON author ordering;
    // same seed across languages so the answer doesn't jump on switch.
    const langOpts = currentQ.options[language];
    const fallbackOpts = currentQ.options["es"] ?? currentQ.options["en"] ?? [];
    const opts = shuffleSeeded(
      Array.isArray(langOpts) && langOpts.length > 0 ? langOpts : fallbackOpts,
      currentQ.id ^ optionSaltRef.current
    );
    visibleOptionsRef.current = opts;
    setVisibleOptions(opts);
    resetQuestionUi();
  }, [currentIndex, language, currentQ?.id, resetQuestionUi]);

  // ── Sync majlis player lives/lifelines on turn change ───────────────────────
  useEffect(() => {
    if (!isMajlis || !activeMajlisPlayer) return;
    syncMajlisDerivedState(activeMajlisPlayer);
  }, [isMajlis, activeMajlisPlayer, syncMajlisDerivedState]);

  // ── Scroll to explanation once the player answers (review phase) ──────────────
  useEffect(() => {
    if (!isAnswered || !currentQ) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 320);
    return () => clearTimeout(id);
  }, [isAnswered, currentQ?.id]);

  // ── Global cleanup ──────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (endGameTimeoutRef.current) clearTimeout(endGameTimeoutRef.current);
    };
  }, []);

  const endMajlisGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (endGameTimeoutRef.current) clearTimeout(endGameTimeoutRef.current);
    incrementMajlisGames();
    router.replace({
      pathname: "/majlis-game-over",
      params: { players: JSON.stringify(majlisPlayersRef.current) },
    });
  }, []);

  const endGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (endGameTimeoutRef.current) clearTimeout(endGameTimeoutRef.current);
    const playedIds = gameQuestions.map((q) => q.id);
    await addPlayedQuestions(playedIds);
    const finalScore = calculateFinalScore(earnedPoints, maxPoints);
    const prevStats = await getStats();
    const prevStreak = await getDailyStreak();
    const newRecord = finalScore > prevStats.bestScore && prevStats.gamesPlayed > 0;
    // Snapshot achievements before recording this game.
    const before = buildAchievements(prevStats, prevStreak, prevStats.learnReviewed ?? 0);
    await updateStats({
      score: finalScore,
      correct: correctCount,
      total: gameQuestions.length,
      difficulty,
      maxCorrectStreak: maxCorrectStreakRef.current,
    });
    await addCategoryStats(perCategoryRef.current);
    const newStreak = await bumpDailyStreak();
    // Re-read post-game stats and diff to find freshly-unlocked achievements.
    const nextStats = await getStats();
    const after = buildAchievements(nextStats, newStreak, nextStats.learnReviewed ?? 0);
    const unlocked = diffUnlocked(before, after).map((a) => a.id);
    router.replace({
      pathname: "/game-over",
      params: {
        score: String(finalScore),
        correct: String(correctCount),
        total: String(gameQuestions.length),
        newRecord: newRecord ? "1" : "0",
        unlocked: unlocked.join(","),
        language,
        category,
        difficulty,
      },
    });
  }, [gameQuestions, earnedPoints, maxPoints, correctCount, language, category, difficulty]);

  endGameRef.current = isMajlis ? () => Promise.resolve(endMajlisGame()) : endGame;

  const loseLife = useCallback(() => {
    if (isMajlis) {
      updateMajlisPlayer(currentPlayerIdx, (p) => {
        const nextLives = p.lives - 1;
        return {
          ...p,
          lives: nextLives,
          isEliminated: nextLives <= 0,
        };
      });
      return;
    }

    setLives((prev) => prev - 1);
  }, [isMajlis, currentPlayerIdx, updateMajlisPlayer]);

  const handleTimeOut = useCallback(() => {
    if (timedOutRef.current || isAnsweredRef.current) return;
    timedOutRef.current = true;
    isAnsweredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const opts = visibleOptionsRef.current;
    const correct = currentQ?.correctAnswer[language] ?? "";
    const newStates: Record<string, AnswerState> = {};
    opts.forEach((opt) => {
      newStates[opt] = opt === correct ? "correct" : "idle";
    });
    setAnswerStates(newStates);
    setIsAnswered(true);
    correctStreakRef.current = 0;
    if (!isMajlis && currentQ) {
      const cat = currentQ.category;
      const prev = perCategoryRef.current[cat] ?? { correct: 0, total: 0 };
      perCategoryRef.current[cat] = { correct: prev.correct, total: prev.total + 1 };
    }
    feedback.incorrect();
    if (currentQ) addMissedQuestion(currentQ.id);
    loseLife();
  }, [currentQ, language, loseLife, isMajlis]);

  handleTimeOutRef.current = handleTimeOut;

  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && currentQ && !awaitingReady) {
      handleTimeOutRef.current?.();
    }
  }, [timeLeft, isAnswered, currentQ, awaitingReady]);

  useEffect(() => {
    if (isAnswered || !currentQ || awaitingReady || paused) return;
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
  }, [isAnswered, currentIndex, currentQ, awaitingReady, paused]);

  const showScorePop = useCallback(
    (pts: number) => {
      setLastScore(pts);
      goldFlash.value = withSequence(
        withTiming(0.18, { duration: 120 }),
        withDelay(180, withTiming(0, { duration: 250 }))
      );
      scorePopScale.value = 0.6;
      scorePopOpacity.value = 0;
      scorePopY.value = 16;
      scorePopScale.value = withSequence(
        withSpring(1, { stiffness: 420, damping: 18 }),
        withDelay(500, withTiming(0.85, { duration: 200 }))
      );
      scorePopOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(480, withTiming(0, { duration: 280 }))
      );
      scorePopY.value = withSequence(
        withTiming(0, { duration: 200 }),
        withDelay(300, withTiming(-8, { duration: 280 }))
      );
    },
    [goldFlash, scorePopScale, scorePopOpacity, scorePopY]
  );

  const handleAnswer = useCallback(
    async (option: string) => {
      if (isAnswered || isAnsweredRef.current || awaitingReady) return;
      isAnsweredRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      setIsAnswered(true);

      const correct = currentQ!.correctAnswer[language];
      const isCorrect = option === correct;

      if (!isMajlis) {
        const cat = currentQ!.category;
        const prev = perCategoryRef.current[cat] ?? { correct: 0, total: 0 };
        perCategoryRef.current[cat] = {
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1,
        };
      }

      const opts = visibleOptionsRef.current;
      const newStates: Record<string, AnswerState> = {};
      opts.forEach((opt) => {
        if (opt === option) newStates[opt] = isCorrect ? "correct" : "incorrect";
        else if (opt === correct) newStates[opt] = "correct";
        else newStates[opt] = "idle";
      });
      setAnswerStates(newStates);

      if (isCorrect) {
        const pts = calculateQuestionScore(difficulty, timeLeftRef.current, totalTime, category);
        if (isMajlis) {
          updateMajlisPlayer(currentPlayerIdx, (p) => ({ ...p, score: p.score + pts }));
        } else {
          setEarnedPoints((prev) => prev + pts);
          setCorrectCount((prev) => prev + 1);
          correctStreakRef.current += 1;
          if (correctStreakRef.current > maxCorrectStreakRef.current) {
            maxCorrectStreakRef.current = correctStreakRef.current;
          }
        }
        feedback.correct();
        showScorePop(pts);
      } else {
        correctStreakRef.current = 0;
        feedback.incorrect();
        addMissedQuestion(currentQ!.id);
        loseLife();
      }
    },
    [
      isAnswered,
      awaitingReady,
      currentQ,
      language,
      totalTime,
      difficulty,
      category,
      isMajlis,
      currentPlayerIdx,
      updateMajlisPlayer,
      loseLife,
      showScorePop,
    ]
  );

  const loadMajlisQuestion = useCallback(async () => {
    try {
      const played = await getPlayedQuestions();
      const exclude = [...played, ...sessionPlayedIds];
      let selected = selectGameQuestions(
        allQuestions,
        category,
        difficulty,
        language,
        exclude
      );
      if (selected.length === 0) {
        selected = selectGameQuestions(
          allQuestions,
          category,
          difficulty,
          language,
          sessionPlayedIds
        );
      }
      if (selected.length === 0) {
        selected = selectGameQuestions(
          allQuestions,
          category,
          difficulty,
          language,
          []
        );
      }
      // selectGameQuestions deprioritizes (not excludes) played ids, so make
      // sure we never repeat a question already shown this session.
      const q = selected.find((s) => !sessionPlayedIds.includes(s.id)) ?? selected[0];
      if (!q) {
        endMajlisGame();
        return;
      }
      setMajlisQuestion(q);
      setAwaitingReady(false);
      resetQuestionUi();
    } catch {
      endMajlisGame();
    }
  }, [category, difficulty, language, sessionPlayedIds, endMajlisGame, resetQuestionUi]);

  const handleMajlisReady = useCallback(() => {
    loadMajlisQuestion();
  }, [loadMajlisQuestion]);

  const handleMajlisNext = useCallback(() => {
    const currentPlayer = majlisPlayersRef.current[currentPlayerIdx];
    if (!currentPlayer || !currentQ) return;

    const newAnswered = {
      ...questionsAnswered,
      [currentPlayer.id]: (questionsAnswered[currentPlayer.id] ?? 0) + 1,
    };
    setQuestionsAnswered(newAnswered);
    setSessionPlayedIds((prev) => [...prev, currentQ.id]);
    setMajlisQuestion(null);

    if (isMajlisGameOver(majlisPlayersRef.current, newAnswered)) {
      endMajlisGame();
      return;
    }

    const nextIdx = findNextMajlisTurn(currentPlayerIdx, majlisPlayersRef.current, newAnswered);
    if (nextIdx === null) {
      endMajlisGame();
      return;
    }

    setCurrentPlayerIdx(nextIdx);
    setAwaitingReady(true);
    resetQuestionUi();
  }, [currentPlayerIdx, currentQ, questionsAnswered, endMajlisGame, resetQuestionUi]);

  const handleNext = useCallback(() => {
    if (endedRef.current) return;
    if (isMajlis) {
      handleMajlisNext();
      return;
    }
    if (currentIndex >= gameQuestions.length - 1 || lives <= 0) {
      if (endGameTimeoutRef.current) {
        clearTimeout(endGameTimeoutRef.current);
        endGameTimeoutRef.current = null;
      }
      endGameRef.current?.();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isMajlis, currentIndex, gameQuestions.length, lives, handleMajlisNext]);

  const handleExit = useCallback(() => {
    const leave = () => router.replace("/home");
    if (Platform.OS === "web") {
      if (window.confirm(`${t("play.exitTitle")}\n${t("play.exitDescription")}`)) leave();
      return;
    }
    Alert.alert(t("play.exitTitle"), t("play.exitDescription"), [
      { text: t("play.exitCancel"), style: "cancel" },
      { text: t("play.exitConfirm"), style: "destructive", onPress: leave },
    ]);
  }, [t]);

  const setLifelinesForCurrent = useCallback(
    (updater: (l: typeof INITIAL_LIFELINES) => typeof INITIAL_LIFELINES) => {
      if (isMajlis) {
        updateMajlisPlayer(currentPlayerIdx, (p) => ({
          ...p,
          lifelines: updater(p.lifelines),
        }));
      } else {
        setLifelines(updater);
      }
    },
    [isMajlis, currentPlayerIdx, updateMajlisPlayer]
  );

  const useFiftyFifty = useCallback(() => {
    if (lifelines.fiftyFifty <= 0 || isAnswered || !currentQ) return;
    const correct = currentQ.correctAnswer[language];
    const reduced = applyFiftyFifty(visibleOptionsRef.current, correct);
    visibleOptionsRef.current = reduced;
    setVisibleOptions(reduced);
    setLifelinesForCurrent((l) => ({ ...l, fiftyFifty: l.fiftyFifty - 1 }));
  }, [lifelines.fiftyFifty, isAnswered, currentQ, language, setLifelinesForCurrent]);

  const useExtraTime = useCallback(() => {
    if (lifelines.extraTime <= 0 || isAnswered) return;
    setTimeLeft((t) => {
      const next = t + EXTRA_TIME_BONUS;
      timeLeftRef.current = next;
      return next;
    });
    setLifelinesForCurrent((l) => ({ ...l, extraTime: l.extraTime - 1 }));
  }, [lifelines.extraTime, isAnswered, setLifelinesForCurrent]);

  const useSkip = useCallback(() => {
    if (lifelines.skip <= 0 || isAnswered || difficulty === "easy") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLifelinesForCurrent((l) => ({ ...l, skip: 0 }));
    handleNext();
  }, [lifelines.skip, isAnswered, difficulty, handleNext, setLifelinesForCurrent]);

  const goldFlashStyle = useAnimatedStyle(() => ({ opacity: goldFlash.value }));
  const scorePopStyle = useAnimatedStyle(() => ({
    opacity: scorePopOpacity.value,
    transform: [{ scale: scorePopScale.value }, { translateY: scorePopY.value }],
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t("loading.game")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isMajlis && majlisPlayers.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t("loading.noQuestions")}</Text>
          <NoorButton
            onPress={() => router.replace("/majlis-setup")}
            label={t("game.backHome")}
            variant="primary"
            size="md"
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQ && !awaitingReady) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t("loading.noQuestions")}</Text>
          <NoorButton
            onPress={() => router.replace(isMajlis ? "/majlis-setup" : "/home")}
            label={t("game.backHome")}
            variant="primary"
            size="md"
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const progressText = isMajlis
    ? activeMajlisPlayer
      ? t("majlis.questionOf", {
          current: (questionsAnswered[activeMajlisPlayer.id] ?? 0) + (awaitingReady ? 1 : 0),
          total: MAJLIS_QUESTIONS_PER_PLAYER,
        })
      : ""
    : `${currentIndex + 1} / ${gameQuestions.length}`;

  const categoryBadge =
    currentQ?.category === "Corán y General"
      ? t("category.general")
      : currentQ?.category === "Seerah"
        ? t("category.seerah")
        : t("category.prophets");

  const showNextButton = isMajlis
    ? isAnswered
    : isAnswered;

  const nextLabel = isMajlis
    ? isMajlisGameOver(majlisPlayers, {
        ...questionsAnswered,
        ...(activeMajlisPlayer
          ? { [activeMajlisPlayer.id]: (questionsAnswered[activeMajlisPlayer.id] ?? 0) + 1 }
          : {}),
      })
      ? t("game.seeResults")
      : t("game.nextQuestion")
    : currentIndex >= gameQuestions.length - 1 || lives <= 0
      ? t("game.seeResults")
      : t("game.nextQuestion");

  return (
    <SafeAreaView style={styles.root}>
      <IslamicPatternBackground color={Colors.gold.primary} opacity={0.04} tileSize={52} />

      <Animated.View style={[styles.flashOverlay, goldFlashStyle]} pointerEvents="none" />
      <Animated.View style={[styles.scorePop, scorePopStyle]} pointerEvents="none">
        <Text style={styles.scorePopPlus}>+</Text>
        <Text style={styles.scorePopText}>{lastScore}</Text>
        <Text style={styles.scorePopPts}>{t("playerStatus.pts")}</Text>
      </Animated.View>

      {/* Pause overlay */}
      {paused && !awaitingReady && (
        <View style={styles.readyOverlay}>
          <NoorCard variant="gold" style={styles.readyCard}>
            <Text style={styles.readyLabel}>{t("pause.title")}</Text>
            <NoorButton
              onPress={() => setPaused(false)}
              label={t("pause.resume")}
              variant="gold"
              size="lg"
              style={{ marginTop: 16 }}
            />
            <NoorButton
              onPress={() => {
                setPaused(false);
                handleExit();
              }}
              label={t("pause.quit")}
              variant="ghost"
              size="sm"
              style={{ marginTop: 8 }}
            />
          </NoorCard>
        </View>
      )}

      {/* Majlis ready overlay */}
      {isMajlis && awaitingReady && activeMajlisPlayer && (
        <View style={styles.readyOverlay}>
          <NoorCard variant="gold" style={styles.readyCard}>
            <Text style={styles.readyRound}>
              {t("play.round")} {(questionsAnswered[activeMajlisPlayer.id] ?? 0) + 1}
            </Text>
            <Text style={styles.readyLabel}>{t("play.turnOf")}</Text>
            <Text style={styles.readyName}>{activeMajlisPlayer.name}</Text>
            <Text style={styles.readyMeta}>
              {t("majlis.questionOf", {
                current: (questionsAnswered[activeMajlisPlayer.id] ?? 0) + 1,
                total: MAJLIS_QUESTIONS_PER_PLAYER,
              })}
            </Text>
            <NoorButton
              onPress={handleMajlisReady}
              label={t("play.readyButton")}
              variant="gold"
              size="lg"
              style={{ marginTop: 16 }}
            />
          </NoorCard>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Majlis player strip */}
        {isMajlis && (
          <View style={styles.majlisStrip}>
            {majlisPlayers.map((p, i) => {
              const isActive = i === currentPlayerIdx && !awaitingReady;
              const isTurn = i === currentPlayerIdx;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.majlisChip,
                    isTurn && styles.majlisChipTurn,
                    isActive && styles.majlisChipActive,
                    p.isEliminated && styles.majlisChipEliminated,
                  ]}
                >
                  <Text style={[styles.majlisChipName, isActive && styles.majlisChipNameActive]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <View style={styles.majlisChipMeta}>
                    <Text style={styles.majlisChipScore}>{Math.round(p.score)}</Text>
                    <Text style={styles.majlisChipLives}>
                      {p.isEliminated ? "✕" : "♥".repeat(Math.max(0, p.lives))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Turn banner during play */}
        {isMajlis && activeMajlisPlayer && !awaitingReady && (
          <View style={styles.turnBanner}>
            <Text style={styles.turnBannerText}>
              {t("play.turnOf")} <Text style={styles.turnBannerName}>{activeMajlisPlayer.name}</Text>
            </Text>
          </View>
        )}

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleExit}
            accessibilityRole="button"
            accessibilityLabel={t("play.exitAria")}
            style={styles.exitBtn}
          >
            <Text style={styles.exitX}>✕</Text>
          </TouchableOpacity>
          {!isAnswered && !awaitingReady && (
            <TouchableOpacity
              onPress={() => setPaused((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={paused ? t("pause.resume") : t("pause.title")}
              style={styles.exitBtn}
            >
              <Text style={styles.exitX}>{paused ? "▶" : "⏸"}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.progress}>{progressText}</Text>
          {!awaitingReady && (
            <View style={styles.timerWrap}>
              <TimerBar
                timeLeft={timeLeft}
                totalTime={totalTime}
                paused={isAnswered}
                pausedLabel={t("play.reviewPaused")}
              />
            </View>
          )}
          <View style={styles.lives}>
            {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
              <Text key={i} style={[styles.heart, i >= lives && styles.heartLost]}>♥</Text>
            ))}
          </View>
        </View>

        {currentQ && !awaitingReady && (
          <>
            {currentQ.arabicVerse && (
              <NoorCard variant="gold" style={styles.verseCard}>
                <Text style={styles.arabicVerse}>{currentQ.arabicVerse}</Text>
              </NoorCard>
            )}

            <View style={styles.badgeRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{categoryBadge}</Text>
              </View>
            </View>
            <Text style={[styles.question, isRTL && styles.questionRTL]}>
              {currentQ.question[language]}
            </Text>

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

            {!isAnswered && (
              <View style={styles.lifelinesBlock}>
                <SectionLabel title={t("play.lifelines")} />
                <View style={styles.lifelines}>
                  <LifelineTile
                    name={t("lifeline.fiftyFifty")}
                    arabicName={t("lifeline.fiftyArabic")}
                    effect={t("lifeline.fiftyEffect")}
                    count={lifelines.fiftyFifty}
                    onPress={useFiftyFifty}
                    disabled={isAnswered}
                  />
                  <LifelineTile
                    name={t("lifeline.extraTime")}
                    arabicName={t("lifeline.timeArabic")}
                    effect={t("lifeline.timeEffect")}
                    count={lifelines.extraTime}
                    onPress={useExtraTime}
                    disabled={isAnswered}
                  />
                  {difficulty !== "easy" && (
                    <LifelineTile
                      name={t("lifeline.skip")}
                      arabicName={t("lifeline.skipArabic")}
                      effect={t("lifeline.skipEffect")}
                      count={lifelines.skip}
                      onPress={useSkip}
                      disabled={isAnswered}
                    />
                  )}
                </View>
              </View>
            )}

            {showNextButton && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.feedbackContainer}>
                <View style={styles.reviewBanner}>
                  <Text style={styles.reviewBannerText}>{t("play.reviewHint")}</Text>
                </View>
                <NoorCard variant="gold">
                  <Text style={styles.explanationLabel}>{t("game.explanation")}</Text>
                  {Object.values(answerStates).includes("incorrect") && (
                    <Text style={[styles.correctReveal, isRTL && { textAlign: "right" }]}>
                      {t("feedback.correctAnswerIs")}{" "}
                      <Text style={styles.correctRevealAnswer}>
                        {currentQ.correctAnswer[language]}
                      </Text>
                    </Text>
                  )}
                  <Text style={[styles.feedbackText, isRTL && { textAlign: "right" }]}>
                    {currentQ.explanation[language]}
                  </Text>
                  {(() => {
                    const src = parseSource(currentQ.source);
                    if (!src) return null;
                    return (
                      <TouchableOpacity
                        accessibilityRole={src.url ? "link" : "text"}
                        disabled={!src.url}
                        onPress={() => src.url && Linking.openURL(src.url)}
                      >
                        <Text style={[styles.sourceText, src.url && styles.sourceLink]}>
                          {t("game.source")}: {src.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })()}
                  <TouchableOpacity
                    accessibilityRole="link"
                    accessibilityLabel={t("game.report")}
                    onPress={() =>
                      Linking.openURL(
                        `mailto:aymanessamadi72@gmail.com?subject=${encodeURIComponent(
                          `[Noor] Reporte de contenido — pregunta ${currentQ.id}`
                        )}`
                      )
                    }
                  >
                    <Text style={styles.reportText}>{t("game.report")}</Text>
                  </TouchableOpacity>
                </NoorCard>

                <NoorButton
                  onPress={handleNext}
                  label={nextLabel}
                  variant="primary"
                  size="lg"
                  style={{ marginTop: 4 }}
                />
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: Colors.text.secondary, fontSize: 16, textAlign: "center" },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12 },
  exitBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(253, 246, 227, 0.07)",
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  exitX: { fontSize: 13, color: Colors.text.secondary },
  timerWrap: { flex: 1 },
  lives: { flexDirection: "row", gap: 3 },
  heart: { fontSize: 18, color: Colors.incorrect },
  heartLost: { color: Colors.border.subtle, opacity: 0.4 },
  progress: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.text.muted },
  lifelinesBlock: { marginTop: 4 },
  lifelines: { flexDirection: "row", gap: 12, paddingTop: 6 },
  badgeRow: { alignItems: "center", marginTop: 6 },
  catBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  catBadgeText: { ...MicroLabel, color: Colors.gold.light },
  verseCard: {},
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
    fontSize: 23,
    color: Colors.parchment.primary,
    lineHeight: 32,
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  questionRTL: { fontFamily: Fonts.arabic, fontStyle: "normal", fontSize: 24, lineHeight: 40 },
  options: { gap: 10 },
  feedbackContainer: { gap: 12 },
  reviewBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  reviewBannerText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.gold.light,
    textAlign: "center",
    lineHeight: 20,
  },
  correctReveal: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 10,
    lineHeight: 22,
  },
  correctRevealAnswer: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.accent.emeraldLight,
  },
  feedbackText: { fontSize: 15, color: Colors.text.primary, lineHeight: 24 },
  explanationLabel: {
    fontSize: 11,
    color: Colors.gold.primary,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sourceText: { fontSize: 12, color: Colors.text.muted, marginTop: 10 },
  sourceLink: { color: Colors.gold.primary, textDecorationLine: "underline" },
  reportText: {
    fontSize: 12,
    color: Colors.incorrect,
    textDecorationLine: "underline",
    marginTop: 10,
    paddingVertical: 6,
  },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.gold.primary, zIndex: 10 },
  scorePop: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    zIndex: 25,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    backgroundColor: "rgba(16, 185, 129, 0.92)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gold.primary,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  scorePopPlus: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: "#ffffff",
  },
  scorePopText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 28,
    color: "#ffffff",
    lineHeight: 32,
  },
  scorePopPts: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginLeft: 2,
  },
  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    backgroundColor: "rgba(10, 22, 40, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  readyCard: { width: "100%", alignItems: "center", paddingVertical: 24 },
  readyRound: { ...MicroLabel, color: Colors.gold.dusty, marginBottom: 8 },
  readyLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  readyName: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 32,
    color: Colors.parchment.primary,
    textAlign: "center",
  },
  readyMeta: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.text.muted,
    marginTop: 8,
  },
  majlisStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  majlisChip: {
    flexBasis: "30%",
    flexGrow: 1,
    minWidth: 90,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    backgroundColor: "rgba(253, 246, 227, 0.04)",
  },
  majlisChipTurn: {
    borderColor: Colors.gold.dusty,
  },
  majlisChipActive: {
    borderColor: Colors.accent.emeraldLight,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  majlisChipEliminated: {
    opacity: 0.45,
  },
  majlisChipName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  majlisChipNameActive: {
    color: Colors.parchment.primary,
  },
  majlisChipMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  majlisChipScore: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.gold.primary,
  },
  majlisChipLives: {
    fontSize: 11,
    color: Colors.incorrect,
  },
  turnBanner: {
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
  turnBannerText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  turnBannerName: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    color: Colors.gold.light,
  },
});
