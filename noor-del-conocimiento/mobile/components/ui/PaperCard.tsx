import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

/** Notebook sheet card: paperHi surface, hairline border, soft shadow. */
export function PaperCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.paper.paperHi }, style]}>{children}</View>
  );
}

/** Question flashcard: brighter surface, cream outer ring, gold rule on top. */
export function Flashcard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={styles.flashRing}>
      <View style={[styles.flashcard, style]}>
        <View style={styles.goldRule} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    padding: 16,
    shadowColor: Colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flashRing: {
    borderRadius: 19,
    padding: 3,
    backgroundColor: 'rgba(243,234,212,0.45)',
  },
  flashcard: {
    backgroundColor: Colors.flashcard,
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    shadowColor: Colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  goldRule: {
    width: 24,
    height: 2,
    backgroundColor: Colors.gold,
    marginBottom: 12,
  },
});
