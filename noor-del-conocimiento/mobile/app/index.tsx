import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { Wordmark } from '../components/ui/Wordmark';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, type Language } from '../lib/types';

const NATIVE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  ar: 'العربية',
  ma: 'الدارجة',
};

/** Notebook cover: shown on first launch or when opened from Settings. */
export default function CoverScreen() {
  const router = useRouter();
  const { firstLaunch, setLanguage, language, t } = useLanguage();
  const params = useLocalSearchParams<{ picker?: string }>();
  const forcePicker = params.picker === '1';

  // Language auto-detected on a previous launch → straight to home (section 5.1).
  if (!firstLaunch && !forcePicker) return <Redirect href="/home" />;

  const choose = async (lang: Language) => {
    await setLanguage(lang);
    router.replace('/home');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <NumPlate label={t('common.notebook')} style={styles.plate} />
      <Wordmark />
      <Text style={styles.bismillah}>{t('common.bismillah')}</Text>
      <Text style={styles.separator}>۞</Text>
      <Text style={styles.choose}>{t('common.chooseLanguage')}</Text>
      <View style={styles.cards}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            accessibilityRole="button"
            accessibilityLabel={NATIVE_NAMES[lang]}
            onPress={() => void choose(lang)}
            style={[styles.card, language === lang && styles.cardActive]}
          >
            <Text style={styles.cardLang}>{NATIVE_NAMES[lang]}</Text>
            <NumPlate label={lang === 'ma' ? `${lang} · ${t('common.beta')}` : lang} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.coverTeal },
  content: { alignItems: 'center', paddingVertical: 72, paddingHorizontal: 24, gap: 14 },
  plate: { marginBottom: 18 },
  bismillah: { fontFamily: Fonts.arabic, fontSize: 18, color: 'rgba(243,234,212,0.8)', marginTop: 20 },
  separator: { fontSize: 18, color: Colors.gold, marginVertical: 6 },
  choose: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.cream, marginBottom: 4 },
  cards: { width: '100%', gap: 10 },
  card: {
    backgroundColor: Colors.flashcard,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardActive: { borderWidth: 2, borderColor: Colors.goldHi },
  cardLang: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.ink },
});
