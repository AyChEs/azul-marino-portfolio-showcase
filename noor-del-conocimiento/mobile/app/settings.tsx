import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { NumPlate } from '../components/ui/NumPlate';
import { PaperCard } from '../components/ui/PaperCard';
import { StripHeader } from '../components/ui/StripHeader';
import { NoorButton } from '../components/ui/NoorButton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_LANGUAGES, type Language, type ThemePrefs } from '../lib/types';

const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  ar: 'العربية',
  ma: 'الدارجة',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, settings, updateSettings, updateTheme } = useTheme();

  const papers: Array<{ key: ThemePrefs['paper']; label: string }> = [
    { key: 'linen', label: t('settings.paperLinen') },
    { key: 'pergamino', label: t('settings.paperPergamino') },
    { key: 'antiguo', label: t('settings.paperAntiguo') },
  ];
  const voices: Array<{ key: ThemePrefs['voice']; label: string }> = [
    { key: 'editorial', label: t('settings.voiceEditorial') },
    { key: 'amable', label: t('settings.voiceAmable') },
    { key: 'clasica', label: t('settings.voiceClasica') },
  ];
  const headers: Array<{ key: ThemePrefs['header']; label: string }> = [
    { key: 'cuaderno', label: t('settings.headerCuaderno') },
    { key: 'minimo', label: t('settings.headerMinimo') },
  ];

  return (
    <View style={[styles.page, { backgroundColor: theme.paper.paper }]}>
      <StripHeader title={t('settings.title')} arabicMark={t('common.appNameArabic')} meta="L. 07" />
      <ScrollView contentContainerStyle={styles.content}>
        <Section label={t('settings.language')}>
          <View style={styles.chips}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Chip
                key={lang}
                label={lang === 'ma' ? `${LANGUAGE_NAMES[lang]} (${t('common.beta')})` : LANGUAGE_NAMES[lang]}
                selected={language === lang}
                onPress={() => void setLanguage(lang)}
              />
            ))}
          </View>
        </Section>
        <Section label={t('settings.themePaper')}>
          <View style={styles.chips}>
            {papers.map((p) => (
              <Chip
                key={p.key}
                label={p.label}
                selected={settings.theme.paper === p.key}
                onPress={() => void updateTheme({ paper: p.key })}
              />
            ))}
          </View>
        </Section>
        <Section label={t('settings.themeVoice')}>
          <View style={styles.chips}>
            {voices.map((v) => (
              <Chip
                key={v.key}
                label={v.label}
                selected={settings.theme.voice === v.key}
                onPress={() => void updateTheme({ voice: v.key })}
              />
            ))}
          </View>
        </Section>
        <Section label={t('settings.themeHeader')}>
          <View style={styles.chips}>
            {headers.map((h) => (
              <Chip
                key={h.key}
                label={h.label}
                selected={settings.theme.header === h.key}
                onPress={() => void updateTheme({ header: h.key })}
              />
            ))}
          </View>
        </Section>
        <Section label={t('settings.sound')}>
          <Toggle
            label={t('settings.sound')}
            value={settings.soundEnabled}
            onChange={(v) => void updateSettings({ soundEnabled: v })}
          />
          <Toggle
            label={t('settings.haptics')}
            value={settings.hapticsEnabled}
            onChange={(v) => void updateSettings({ hapticsEnabled: v })}
          />
        </Section>
        <NoorButton label={t('about.title')} variant="outline" onPress={() => router.push('/about')} />
        <NoorButton label={t('common.back')} variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <PaperCard>
      <NumPlate label={label} style={styles.sectionPlate} />
      {children}
    </PaperCard>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.emerald, false: Colors.hairlineStrong }}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 18, gap: 12, paddingBottom: 40 },
  sectionPlate: { marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 14,
  },
  chipSelected: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldGlow },
  chipLabel: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  chipLabelSelected: { color: Colors.emeraldDeep, fontFamily: Fonts.bodySemiBold },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  toggleLabel: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
});
