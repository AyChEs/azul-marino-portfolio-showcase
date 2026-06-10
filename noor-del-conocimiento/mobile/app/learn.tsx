import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Flashcard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { pickQuestions } from '../lib/gameLogic';
import { getQuestionBank } from '../lib/questions';
import { getGameSettings } from '../lib/session';
import { localized, localizedOptions } from '../lib/utils';

/** Learn mode: no clock, no lives — flashcards with verified explanations. */
export default function LearnScreen() {
  const router = useRouter();
  const { t, n, language } = useLanguage();
  const { theme } = useTheme();
  const settings = getGameSettings();

  const questions = useMemo(() => {
    if (!settings) return [];
    return pickQuestions(
      getQuestionBank(),
      settings.category,
      settings.difficulty,
      settings.questionCount,
    );
  }, [settings]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!settings || questions.length === 0) return <Redirect href="/home" />;
  const question = questions[index];
  if (!question) return <Redirect href="/home" />;

  const next = () => {
    setRevealed(false);
    if (index + 1 >= questions.length) router.replace('/home');
    else setIndex(index + 1);
  };

  const options = localizedOptions(question, language);

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader
        title={t('learn.title')}
        arabicMark={t('common.appNameArabic')}
        meta={t('play.questionMeta', { current: n(index + 1), total: n(questions.length) })}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{t('learn.subtitle')}</Text>
        <Flashcard>
          <Text style={styles.question}>{localized(question.question, language)}</Text>
          {revealed ? (
            <View style={styles.answerBlock}>
              <Text style={styles.answer}>{options[question.correctIndex]}</Text>
              <Text style={styles.explanation}>{localized(question.explanation, language)}</Text>
              <Text style={styles.source}>
                {t('play.source')}: {question.source.primary}
                {question.source.secondary ? ` · ${question.source.secondary}` : ''}
              </Text>
            </View>
          ) : null}
        </Flashcard>
        {revealed ? (
          <NoorButton label={t('learn.nextCard')} onPress={next} />
        ) : (
          <NoorButton label={t('learn.showAnswer')} variant="gold" onPress={() => setRevealed(true)} />
        )}
        <NoorButton label={t('gameOver.goHome')} variant="ghost" onPress={() => router.replace('/home')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  subtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.inkMuted, textAlign: 'center' },
  question: { fontFamily: Fonts.bodySemiBold, fontSize: 17, color: Colors.ink, lineHeight: 25 },
  answerBlock: { marginTop: 14, gap: 8 },
  answer: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.emeraldDeep },
  explanation: { fontFamily: Fonts.body, fontSize: 14, color: Colors.inkSoft, lineHeight: 21 },
  source: { fontFamily: Fonts.monoMedium, fontSize: 10, color: Colors.gold },
});
