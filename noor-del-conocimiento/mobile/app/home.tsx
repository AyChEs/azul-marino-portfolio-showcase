import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getQuestionBank } from '../lib/questions';
import { setGameSettings } from '../lib/session';
import type { Category, Difficulty, GameMode } from '../lib/types';

const QUESTION_COUNT = 10;

export default function HomeScreen() {
  const router = useRouter();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const [mode, setMode] = useState<GameMode>('solo');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const availableCount = useMemo(
    () =>
      getQuestionBank().filter(
        (q) => q.difficulty === difficulty && (category === 'all' || q.category === category),
      ).length,
    [category, difficulty],
  );

  const modes: Array<{ key: GameMode; label: string; desc: string }> = [
    { key: 'solo', label: t('home.modeSolo'), desc: t('home.modeSoloDesc') },
    { key: 'majlis', label: t('home.modeMajlis'), desc: t('home.modeMajlisDesc') },
    { key: 'learn', label: t('home.modeLearn'), desc: t('home.modeLearnDesc') },
  ];
  const categories: Array<{ key: Category | 'all'; label: string }> = [
    { key: 'all', label: t('home.categoryAll') },
    { key: 'quran_general', label: t('home.categoryQuranGeneral') },
    { key: 'prophets', label: t('home.categoryProphets') },
    { key: 'seerah', label: t('home.categorySeerah') },
  ];
  const difficulties: Array<{ key: Difficulty; label: string }> = [
    { key: 'easy', label: t('home.difficultyEasy') },
    { key: 'medium', label: t('home.difficultyMedium') },
    { key: 'hard', label: t('home.difficultyHard') },
  ];

  const start = () => {
    setGameSettings({ mode, category, difficulty, questionCount: QUESTION_COUNT });
    if (mode === 'majlis') router.push('/majlis-setup');
    else if (mode === 'learn') router.push('/learn');
    else router.push('/play');
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader title={t('home.title')} arabicMark={t('common.appNameArabic')} meta="L. 01" />
      <ScrollView contentContainerStyle={styles.content}>
        <Lesson num="01" label={t('home.mode')}>
          {modes.map((m) => (
            <Choice
              key={m.key}
              label={m.label}
              desc={m.desc}
              selected={mode === m.key}
              onPress={() => setMode(m.key)}
            />
          ))}
        </Lesson>
        <Text style={styles.separator}>۞</Text>
        <Lesson num="02" label={t('home.subject')}>
          {categories.map((c) => (
            <Choice
              key={c.key}
              label={c.label}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </Lesson>
        <Text style={styles.separator}>۞</Text>
        <Lesson num="03" label={t('home.tempo')}>
          {difficulties.map((d) => (
            <Choice
              key={d.key}
              label={d.label}
              selected={difficulty === d.key}
              onPress={() => setDifficulty(d.key)}
            />
          ))}
        </Lesson>
        <Text style={styles.count}>
          {availableCount === 0
            ? t('home.noQuestions')
            : t('plurals.questions', { count: availableCount, formattedCount: n(availableCount) })}
        </Text>
        <NoorButton label={t('home.start')} onPress={start} disabled={availableCount === 0} />
        <NoorButton
          label={t('settings.title')}
          variant="ghost"
          onPress={() => router.push('/settings')}
        />
      </ScrollView>
    </View>
  );
}

function Lesson({
  num,
  label,
  children,
}: {
  num: string;
  label: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <PaperCard>
      <View style={styles.lessonHeader}>
        <NumPlate label={`L. ${num}`} />
        <Text style={[styles.lessonTitle, theme.titleFont]}>{label}</Text>
      </View>
      <View style={styles.choices}>{children}</View>
    </PaperCard>
  );
}

function Choice({
  label,
  desc,
  selected,
  onPress,
}: {
  label: string;
  desc?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text>
      {desc ? <Text style={styles.choiceDesc}>{desc}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 10, paddingBottom: 40 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  lessonTitle: { fontSize: 18, color: Colors.ink },
  choices: { gap: 8 },
  choice: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  choiceSelected: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldGlow },
  choiceLabel: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  choiceLabelSelected: { color: Colors.emeraldDeep, fontFamily: Fonts.bodySemiBold },
  choiceDesc: { fontFamily: Fonts.body, fontSize: 12, color: Colors.inkMuted, marginTop: 2 },
  separator: { textAlign: 'center', color: Colors.gold, fontSize: 14, marginVertical: 2 },
  count: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
