import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Brand wordmark "03b · El Messiri Editorial" (section 3.1).
 * Intended over deep teal (cover) — pass onPaper for ink-on-paper contexts.
 */
export function Wordmark({ scale = 1, onPaper = false }: { scale?: number; onPaper?: boolean }) {
  const { t } = useLanguage();
  const creamOr = (c: string) => (onPaper ? Colors.ink : c);
  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('common.appName')}>
      <Text style={[styles.arabic, { fontSize: 84 * scale, color: creamOr(Colors.cream) }]}>
        {t('common.appNameArabic')}
      </Text>
      <Text style={[styles.latin, { fontSize: 22 * scale }]}>{t('common.appName')}</Text>
      <Text
        style={[
          styles.tagline,
          { fontSize: 9 * Math.max(1, scale * 0.9), color: onPaper ? Colors.inkMuted : 'rgba(243,234,212,0.65)' },
        ]}
      >
        {t('common.tagline')}
      </Text>
    </View>
  );
}

const GOLD_DUSTY = '#c19a5b'; // brand-spec gold for the latin wordmark only

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 2 },
  arabic: { fontFamily: Fonts.arabic, lineHeight: undefined, includeFontPadding: false },
  latin: {
    fontFamily: Fonts.displayItalic,
    fontStyle: 'italic',
    color: GOLD_DUSTY,
    letterSpacing: 0.5,
  },
  tagline: { fontFamily: Fonts.bodySemiBold, letterSpacing: 3, textTransform: 'uppercase' },
});
