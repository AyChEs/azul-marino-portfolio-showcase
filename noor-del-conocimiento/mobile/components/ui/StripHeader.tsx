import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useTheme } from '../../context/ThemeContext';
import { NumPlate } from './NumPlate';

interface StripHeaderProps {
  title: string;
  /** Mono meta plate, e.g. "L. 01" or "PÁG 03/08". */
  meta?: string;
  /** Arabic mark (defaults to none). */
  arabicMark?: string;
  right?: React.ReactNode;
}

/** Notebook "spine" header. Minimal variant = paper band, ink text, no trim. */
export function StripHeader({ title, meta, arabicMark, right }: StripHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const minimal = theme.headerStyle === 'minimo';

  return (
    <View>
      <View
        style={[
          styles.band,
          { paddingTop: insets.top + 10 },
          minimal
            ? { backgroundColor: theme.paper.paper, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.hairlineStrong }
            : { backgroundColor: Colors.emeraldDeep },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.titleBlock}>
            {arabicMark ? (
              <Text style={[styles.arabic, { color: minimal ? Colors.ink : Colors.cream }]}>
                {arabicMark}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.title,
                theme.titleFont,
                { color: minimal ? Colors.ink : Colors.cream },
              ]}
            >
              {title}
            </Text>
          </View>
          <View style={styles.right}>
            {meta ? <NumPlate label={meta} style={minimal ? undefined : styles.metaOnGreen} /> : null}
            {right}
          </View>
        </View>
      </View>
      {!minimal ? (
        <View style={styles.trim}>
          <View style={[styles.trimSeg, { backgroundColor: Colors.emerald }]} />
          <View style={[styles.trimSeg, { backgroundColor: Colors.emeraldHi }]} />
          <View style={[styles.trimSeg, { backgroundColor: Colors.gold }]} />
          <View style={[styles.trimSeg, { backgroundColor: theme.paper.paperDeep }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: 18, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  arabic: { fontFamily: Fonts.arabic, fontSize: 22, lineHeight: 28 },
  title: { fontSize: 19, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaOnGreen: { color: Colors.goldHi },
  trim: { flexDirection: 'row', height: 4 },
  trimSeg: { flex: 1 },
});
