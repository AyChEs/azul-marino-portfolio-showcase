import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { rankFor, type Rank } from '../lib/gameLogic';
import { getSoloResult } from '../lib/session';

const RANK_KEYS: Record<Rank, { name: string; desc: string }> = {
  hafiz: { name: 'gameOver.rankHafiz', desc: 'gameOver.rankHafizDesc' },
  alim: { name: 'gameOver.rankAlim', desc: 'gameOver.rankAlimDesc' },
  talib: { name: 'gameOver.rankTalib', desc: 'gameOver.rankTalibDesc' },
  mubtadi: { name: 'gameOver.rankMubtadi', desc: 'gameOver.rankMubtadiDesc' },
};

/** Report card screen after a solo game. */
export default function GameOverScreen() {
  const router = useRouter();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const result = getSoloResult();

  if (!result) return <Redirect href="/home" />;

  const rank = rankFor(result.accuracy);
  const rankName = t(RANK_KEYS[rank].name);

  const share = () => {
    void Share.share({
      message: t('gameOver.shareMessage', {
        score: n(result.score),
        accuracy: n(result.accuracy),
        rank: rankName,
      }),
    });
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader title={t('gameOver.title')} arabicMark={t('common.appNameArabic')} meta="№ 04" />
      <ScrollView contentContainerStyle={styles.content}>
        {result.newRecord ? <NumPlate label={t('gameOver.newRecord')} /> : null}
        <Text style={styles.score}>{n(result.score)}</Text>
        <NumPlate label={t('gameOver.score')} />
        <PaperCard style={styles.rankCard}>
          <Text style={styles.sealRing}>۞</Text>
          <Text style={[styles.rankName, theme.titleFont]}>{rankName}</Text>
          <Text style={styles.rankDesc}>{t(RANK_KEYS[rank].desc)}</Text>
        </PaperCard>
        <View style={styles.statsRow}>
          <Stat label={t('gameOver.accuracy')} value={`${n(result.accuracy)}%`} />
          <Stat label={t('gameOver.answered')} value={n(result.answered)} />
        </View>
        <NoorButton label={t('gameOver.share')} variant="gold" onPress={share} />
        <NoorButton label={t('gameOver.playAgain')} onPress={() => router.replace('/play')} />
        <NoorButton
          label={t('gameOver.goHome')}
          variant="outline"
          onPress={() => router.replace('/home')}
        />
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <PaperCard style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <NumPlate label={label} />
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 12, alignItems: 'stretch', paddingBottom: 40 },
  score: {
    fontFamily: Fonts.monoBold,
    fontSize: 64,
    color: Colors.emeraldDeep,
    textAlign: 'center',
  },
  rankCard: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  sealRing: { fontSize: 26, color: Colors.goldHi },
  rankName: { fontSize: 26, color: Colors.ink },
  rankDesc: { fontFamily: Fonts.body, fontSize: 13, color: Colors.inkMuted, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: Fonts.monoBold, fontSize: 22, color: Colors.ink },
});
