import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { AnswerOption, type AnswerState } from '../components/ui/AnswerOption';
import { Flashcard } from '../components/ui/PaperCard';
import { Lifeline } from '../components/ui/Lifeline';
import { NumPlate } from '../components/ui/NumPlate';
import { StripHeader } from '../components/ui/StripHeader';
import { TimerBar } from '../components/ui/TimerBar';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getFeedback } from '../lib/ai';
import {
  BASE_TIME_SECONDS,
  EXTRA_TIME_SECONDS,
  POINTS,
  accuracy,
  answerQuestion,
  createGame,
  currentQuestion,
  pickQuestions,
  rankFor,
  timeOut,
  useLifeline as applyLifeline,
} from '../lib/gameLogic';
import { getQuestionBank } from '../lib/questions';
import {
  getGameSettings,
  getMajlisPlayers,
  setMajlisPlayers,
  setSoloResult,
} from '../lib/session';
import { bumpDailyStreak, recordResult } from '../lib/storage';
import { localized, localizedOptions } from '../lib/utils';
import type { GameState, LifelineKind, MajlisPlayer } from '../lib/types';

const REPORT_EMAIL = 'aymanessamadi72@gmail.com';

type Phase = 'answering' | 'revealed';

export default function PlayScreen() {
  const router = useRouter();
  const { t, n, language } = useLanguage();
  const { theme, settings: appSettings } = useTheme();
  const settings = getGameSettings();
  const isMajlis = settings?.mode === 'majlis';
  const majlisPlayers = useMemo<MajlisPlayer[]>(
    () => (isMajlis ? getMajlisPlayers().map((p) => ({ ...p })) : []),
    [isMajlis],
  );

  const initialGame = useMemo(() => {
    if (!settings) return createGame([]);
    const perPlayerCount = isMajlis
      ? settings.questionCount * Math.max(1, majlisPlayers.length)
      : settings.questionCount;
    return createGame(
      pickQuestions(getQuestionBank(), settings.category, settings.difficulty, perPlayerCount),
    );
  }, [settings, isMajlis, majlisPlayers.length]);

  const [game, setGame] = useState<GameState>(initialGame);
  const [phase, setPhase] = useState<Phase>('answering');
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackFromBank, setFeedbackFromBank] = useState(false);
  const [turn, setTurn] = useState(0);

  const baseTime = settings ? BASE_TIME_SECONDS[settings.difficulty] : 20;
  const [timeLeft, setTimeLeft] = useState(baseTime);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const question = currentQuestion(game);

  // Countdown — cleared on unmount/phase change (section 8.1 timer hygiene).
  useEffect(() => {
    if (phase !== 'answering' || !question || game.finished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, question, game.finished]);

  // Time out → counts as wrong.
  useEffect(() => {
    if (timeLeft === 0 && phase === 'answering' && question) {
      setSelected(null);
      setPhase('revealed');
      void loadFeedback(question.id);
    }
  }, [timeLeft, phase, question?.id]);

  const finish = useCallback(
    async (finalState: GameState) => {
      if (!settings) return;
      if (isMajlis) {
        setMajlisPlayers(majlisPlayers);
        router.replace('/majlis-game-over');
        return;
      }
      const acc = accuracy(finalState);
      const newRecord = await recordResult(
        settings.category,
        settings.difficulty,
        finalState.score,
        acc,
      );
      await bumpDailyStreak();
      setSoloResult({
        score: finalState.score,
        accuracy: acc,
        answered: finalState.currentIndex,
        newRecord,
        settings,
      });
      router.replace('/game-over');
    },
    [settings, isMajlis, majlisPlayers, router],
  );

  const loadFeedback = async (questionId: string) => {
    setFeedback(null);
    const result = await getFeedback(questionId, language);
    setFeedback(result.text);
    setFeedbackFromBank(result.fromBank);
  };

  const onAnswer = (index: number) => {
    if (phase !== 'answering' || !question) return;
    setSelected(index);
    setPhase('revealed');
    const correct = index === question.correctIndex;
    if (appSettings.hapticsEnabled) {
      void Haptics.notificationAsync(
        correct
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      );
    }
    if (isMajlis) {
      const player = majlisPlayers[turn % majlisPlayers.length];
      if (player && correct && settings) {
        player.score += POINTS[settings.difficulty];
        player.correctCount += 1;
      }
    }
    if (!correct) void loadFeedback(question.id);
  };

  const onContinue = () => {
    if (!question) return;
    const next =
      selected == null && timeLeft === 0
        ? timeOut(game)
        : answerQuestion(game, selected ?? -1).state;
    setSelected(null);
    setFeedback(null);
    setPhase('answering');
    setTimeLeft(baseTime);
    if (isMajlis) setTurn((p) => p + 1);
    if (next.finished) void finish(next);
    else setGame(next);
  };

  const onLifeline = (kind: LifelineKind) => {
    if (phase !== 'answering') return;
    if (kind === 'extraTime') setTimeLeft((prev) => prev + EXTRA_TIME_SECONDS);
    const next = applyLifeline(game, kind);
    if (kind === 'skip') {
      if (next.finished) {
        void finish(next);
        return;
      }
      setTimeLeft(baseTime);
      if (isMajlis) setTurn((p) => p + 1);
    }
    setGame(next);
  };

  // Android back button: confirm before abandoning the game.
  const confirmExit = useCallback(() => {
    Alert.alert(t('play.exitTitle'), t('play.exitBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: () => router.replace('/home') },
    ]);
    return true;
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', confirmExit);
      return () => sub.remove();
    }, [confirmExit]),
  );

  if (!settings || !question) return <Redirect href="/home" />;

  const reportQuestion = () => {
    const subject = encodeURIComponent(t('about.reportSubject', { id: question.id }));
    void Linking.openURL(`mailto:${REPORT_EMAIL}?subject=${subject}`);
  };

  const options = localizedOptions(question, language);
  const stateFor = (i: number): AnswerState => {
    if (game.eliminatedOptions.includes(i)) return 'eliminated';
    if (phase === 'revealed') {
      if (i === question.correctIndex) return 'correct';
      if (i === selected) return 'wrong';
      return 'default';
    }
    return i === selected ? 'selected' : 'default';
  };

  const currentPlayer = isMajlis ? majlisPlayers[turn % majlisPlayers.length] : null;

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader
        title={
          currentPlayer
            ? t('majlis.turnOf', { name: currentPlayer.name })
            : `${t('play.score')} ${n(game.score)}`
        }
        meta={t('play.questionMeta', {
          current: n(game.currentIndex + 1),
          total: n(game.questions.length),
        })}
        right={
          !isMajlis ? (
            <Text style={styles.lives} accessibilityLabel={`${t('play.lives')}: ${n(game.lives)}`}>
              {'♥'.repeat(Math.max(0, game.lives))}
            </Text>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <TimerBar fraction={timeLeft / baseTime} />
        <Flashcard>
          <Text style={styles.question}>{localized(question.question, language)}</Text>
        </Flashcard>
        <View style={styles.answers}>
          {options.map((opt, i) => (
            <AnswerOption
              key={i}
              index={i}
              label={opt}
              state={stateFor(i)}
              onPress={onAnswer}
              disabled={phase !== 'answering'}
            />
          ))}
        </View>

        {phase === 'answering' ? (
          <View style={styles.lifelines}>
            <Lifeline
              kind="fiftyFifty"
              arabicName={t('play.lifelineFiftyName')}
              effect={t('play.lifelineFiftyEffect')}
              count={game.lifelines.fiftyFifty}
              onPress={onLifeline}
            />
            <Lifeline
              kind="extraTime"
              arabicName={t('play.lifelineTimeName')}
              effect={t('play.lifelineTimeEffect')}
              count={game.lifelines.extraTime}
              onPress={onLifeline}
            />
            <Lifeline
              kind="skip"
              arabicName={t('play.lifelineSkipName')}
              effect={t('play.lifelineSkipEffect')}
              count={game.lifelines.skip}
              onPress={onLifeline}
            />
          </View>
        ) : (
          <View style={styles.reveal}>
            <NumPlate
              label={
                selected === question.correctIndex ? t('play.correct') : t('play.incorrect')
              }
              style={{
                color: selected === question.correctIndex ? Colors.emerald : Colors.terracotta,
              }}
            />
            {selected !== question.correctIndex ? (
              <>
                {feedbackFromBank ? (
                  <Text style={styles.feedbackNote}>{t('play.aiUnavailable')}</Text>
                ) : null}
                <Text style={styles.explanation}>
                  {feedback ?? t('play.aiThinking')}
                </Text>
              </>
            ) : (
              <Text style={styles.explanation}>{localized(question.explanation, language)}</Text>
            )}
            <Text style={styles.source}>
              {t('play.source')}: {question.source.primary}
              {question.source.secondary ? ` · ${question.source.secondary}` : ''}
            </Text>
            <Text style={styles.report} onPress={reportQuestion} accessibilityRole="link">
              {t('play.reportQuestion')}
            </Text>
            <Text style={styles.continue} onPress={onContinue} accessibilityRole="button">
              {t('common.continue')} →
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  lives: { color: Colors.goldHi, fontSize: 14, fontFamily: Fonts.bodyBold },
  question: { fontFamily: Fonts.bodySemiBold, fontSize: 17, color: Colors.ink, lineHeight: 25 },
  answers: { gap: 8 },
  lifelines: { flexDirection: 'row', gap: 8 },
  reveal: { gap: 8, alignItems: 'flex-start' },
  feedbackNote: { fontFamily: Fonts.monoMedium, fontSize: 10, color: Colors.inkMuted },
  explanation: { fontFamily: Fonts.body, fontSize: 14, color: Colors.inkSoft, lineHeight: 21 },
  source: { fontFamily: Fonts.monoMedium, fontSize: 10, color: Colors.gold },
  report: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: Colors.terracotta,
    textDecorationLine: 'underline',
    paddingVertical: 8,
  },
  continue: {
    alignSelf: 'flex-end',
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.emerald,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
