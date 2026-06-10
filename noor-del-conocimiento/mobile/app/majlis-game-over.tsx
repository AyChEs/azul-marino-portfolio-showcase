import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getMajlisPlayers } from '../lib/session';

/** "Class ranking": winner in a gold seal + score table. */
export default function MajlisGameOverScreen() {
  const router = useRouter();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const players = useMemo(
    () => [...getMajlisPlayers()].sort((a, b) => b.score - a.score),
    [],
  );

  if (players.length === 0) return <Redirect href="/home" />;
  const winner = players[0];

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader
        title={t('majlis.resultsTitle')}
        arabicMark={t('common.appNameArabic')}
        meta="№ 06"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {winner ? (
          <PaperCard style={styles.winnerCard}>
            <Text style={styles.seal}>۞</Text>
            <NumPlate label={t('majlis.winner')} />
            <Text style={[styles.winnerName, theme.titleFont]}>{winner.name}</Text>
            <Text style={styles.winnerScore}>{n(winner.score)}</Text>
          </PaperCard>
        ) : null}
        <PaperCard>
          <NumPlate label={t('majlis.finalScores')} style={styles.tablePlate} />
          {players.map((p, i) => (
            <View key={`${p.name}-${i}`} style={styles.row}>
              <NumPlate label={`${t('majlis.rank')} · ${i + 1}/${players.length}`} />
              <Text style={styles.rowName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.rowScore}>{n(p.score)}</Text>
            </View>
          ))}
        </PaperCard>
        <NoorButton label={t('gameOver.playAgain')} onPress={() => router.replace('/majlis-setup')} />
        <NoorButton
          label={t('gameOver.goHome')}
          variant="outline"
          onPress={() => router.replace('/home')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 12, paddingBottom: 40 },
  winnerCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 26,
    borderWidth: 2,
    borderColor: Colors.goldHi,
  },
  seal: { fontSize: 30, color: Colors.goldHi },
  winnerName: { fontSize: 26, color: Colors.ink },
  winnerScore: { fontFamily: Fonts.monoBold, fontSize: 30, color: Colors.emeraldDeep },
  tablePlate: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.hairline,
  },
  rowName: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  rowScore: { fontFamily: Fonts.monoBold, fontSize: 14, color: Colors.ink },
});
