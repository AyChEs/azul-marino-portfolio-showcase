import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useTheme } from '../../context/ThemeContext';

export type AnswerState = 'default' | 'selected' | 'correct' | 'wrong' | 'eliminated';

interface AnswerOptionProps {
  index: number;
  label: string;
  state: AnswerState;
  onPress: (index: number) => void;
  disabled?: boolean;
}

const PREFIXES = ['A', 'B', 'C', 'D'] as const;

export const AnswerOption = memo(function AnswerOption({
  index,
  label,
  state,
  onPress,
  disabled = false,
}: AnswerOptionProps) {
  const { theme } = useTheme();
  const prefix = PREFIXES[index] ?? '?';

  const stateStyle = (() => {
    switch (state) {
      case 'selected':
        return { borderColor: Colors.emerald, backgroundColor: Colors.white };
      case 'correct':
        return {
          borderColor: Colors.emerald,
          backgroundColor: Colors.correctBg,
          transform: [{ scale: 1.015 }],
        };
      case 'wrong':
        return { borderColor: Colors.terracotta, backgroundColor: Colors.incorrectBg };
      case 'eliminated':
        return { opacity: 0.22, backgroundColor: theme.paper.paper };
      default:
        return { backgroundColor: theme.paper.paper };
    }
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${prefix}. ${label}`}
      accessibilityState={{ disabled: disabled || state === 'eliminated' }}
      disabled={disabled || state === 'eliminated'}
      onPress={() => onPress(index)}
      style={[styles.option, stateStyle]}
    >
      <View style={styles.prefixBox}>
        <Text style={styles.prefix}>{prefix}</Text>
      </View>
      <Text style={styles.label} numberOfLines={3}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  prefixBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefix: { fontFamily: Fonts.monoBold, fontSize: 11, color: Colors.inkSoft },
  label: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
});
