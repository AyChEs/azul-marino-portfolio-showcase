import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { setMajlisPlayers } from '../lib/session';
import { MAX_PLAYER_NAME_LENGTH, sanitizeUserText } from '../lib/utils';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

/** "Class register": numbered student list for the Majlis mode. */
export default function MajlisSetupScreen() {
  const router = useRouter();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const [names, setNames] = useState<string[]>(['', '']);

  const setName = (index: number, value: string) => {
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const validNames = names.map((nm) => sanitizeUserText(nm)).filter((nm) => nm.length > 0);
  const canStart = validNames.length >= MIN_PLAYERS;

  const start = () => {
    setMajlisPlayers(validNames.map((name) => ({ name, score: 0, correctCount: 0 })));
    router.push('/play');
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader
        title={t('majlis.setupTitle')}
        arabicMark={t('common.appNameArabic')}
        meta="L. 02"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PaperCard>
          <NumPlate label={t('majlis.players')} style={styles.sectionPlate} />
          {names.map((name, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.num}>{n(i + 1)}</Text>
              <TextInput
                value={name}
                onChangeText={(v) => setName(i, v)}
                placeholder={t('majlis.playerPlaceholder')}
                placeholderTextColor={Colors.inkDim}
                maxLength={MAX_PLAYER_NAME_LENGTH}
                style={styles.input}
                accessibilityLabel={`${t('majlis.playerPlaceholder')} ${n(i + 1)}`}
              />
            </View>
          ))}
          {names.length < MAX_PLAYERS ? (
            <NoorButton
              label={t('majlis.addPlayer')}
              variant="outline"
              onPress={() => setNames((prev) => [...prev, ''])}
            />
          ) : (
            <Text style={styles.hint}>{t('majlis.maxPlayers')}</Text>
          )}
        </PaperCard>
        {!canStart ? <Text style={styles.hint}>{t('majlis.minPlayers')}</Text> : null}
        <NoorButton label={t('home.start')} onPress={start} disabled={!canStart} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 12, paddingBottom: 40 },
  sectionPlate: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  num: { fontFamily: Fonts.monoBold, fontSize: 12, color: Colors.gold, width: 20 },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    paddingHorizontal: 12,
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.white,
  },
  hint: { fontFamily: Fonts.body, fontSize: 12, color: Colors.inkMuted, textAlign: 'center' },
});
