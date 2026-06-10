import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { Wordmark } from '../components/ui/Wordmark';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const REPORT_EMAIL = 'aymanessamadi72@gmail.com';
// Primary sources are proper names — not translated.
const MAIN_SOURCES = [
  'Al-Qurʾan al-Karīm (quran.com)',
  'Sahih al-Bukhari · Sahih Muslim (sunnah.com)',
  'Sirat Ibn Hisham',
  'Ar-Raheeq Al-Makhtum',
];

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const report = () => {
    const subject = encodeURIComponent(t('about.reportSubject', { id: '—' }));
    void Linking.openURL(`mailto:${REPORT_EMAIL}?subject=${subject}`);
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: Colors.coverTeal }]}
      contentContainerStyle={styles.content}
    >
      <Wordmark scale={0.7} />
      <PaperCard style={styles.card}>
        <Text style={styles.disclaimer}>{t('about.disclaimer')}</Text>
        <Text style={styles.separator}>۞</Text>
        <NumPlate label={t('about.sourcesTitle')} />
        {MAIN_SOURCES.map((s) => (
          <Text key={s} style={styles.sourceLine}>
            · {s}
          </Text>
        ))}
        <Text style={styles.separator}>۞</Text>
        <NoorButton label={t('about.reportContent')} variant="danger" onPress={report} />
        <NoorButton
          label={t('about.privacy')}
          variant="outline"
          onPress={() => void Linking.openURL('https://github.com/ayches/azul-marino-portfolio-showcase/blob/main/noor-del-conocimiento/mobile/PRIVACY.md')}
        />
        <Text style={styles.version}>
          {t('about.version')} {version}
        </Text>
      </PaperCard>
      <NoorButton label={t('common.back')} variant="gold" onPress={() => router.back()} />
      <View style={{ backgroundColor: theme.paper.paper }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 24, paddingTop: 64, gap: 18, paddingBottom: 48 },
  card: { gap: 8 },
  disclaimer: { fontFamily: Fonts.body, fontSize: 13, color: Colors.inkSoft, lineHeight: 20 },
  separator: { textAlign: 'center', color: Colors.gold, fontSize: 14, marginVertical: 4 },
  sourceLine: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  version: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
