import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

/** "Missing page · ٤٠٤". */
export default function NotFoundScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <Text style={styles.ornament}>۞</Text>
      <Text style={[styles.title, theme.titleFont]}>{t('errors.notFoundTitle')}</Text>
      <Text style={styles.body}>{t('errors.notFoundBody')}</Text>
      <NoorButton label={t('errors.goHome')} onPress={() => router.replace('/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  ornament: { fontSize: 28, color: Colors.gold },
  title: { fontSize: 24, color: Colors.ink },
  body: { fontFamily: Fonts.body, fontSize: 14, color: Colors.inkMuted, textAlign: 'center' },
});
