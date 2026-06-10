import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useTheme } from '../../context/ThemeContext';
import type { LifelineKind } from '../../lib/types';
import { ExtraTimeIcon, FiftyFiftyIcon, SkipIcon } from './LifelineIcons';

interface LifelineProps {
  kind: LifelineKind;
  arabicName: string;
  effect: string;
  count: number;
  onPress: (kind: LifelineKind) => void;
  disabled?: boolean;
}

const ICONS: Record<LifelineKind, React.ComponentType<{ size?: number }>> = {
  fiftyFifty: FiftyFiftyIcon,
  extraTime: ExtraTimeIcon,
  skip: SkipIcon,
};

export const Lifeline = memo(function Lifeline({
  kind,
  arabicName,
  effect,
  count,
  onPress,
  disabled = false,
}: LifelineProps) {
  const { theme } = useTheme();
  const Icon = ICONS[kind];
  const unusable = disabled || count <= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${arabicName} — ${effect}`}
      accessibilityState={{ disabled: unusable }}
      disabled={unusable}
      onPress={() => onPress(kind)}
      style={[styles.tile, { backgroundColor: theme.paper.paperHi }, unusable && styles.unusable]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
      <Icon size={22} />
      <Text style={styles.arabic} numberOfLines={1}>
        {arabicName}
      </Text>
      <Text style={[styles.effect, theme.titleFont]} numberOfLines={2}>
        {effect}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 3,
  },
  unusable: { opacity: 0.35 },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontFamily: Fonts.monoBold, fontSize: 9, color: Colors.white },
  arabic: { fontFamily: Fonts.arabic, fontSize: 14, color: Colors.ink },
  effect: { fontSize: 10, color: Colors.inkMuted, textAlign: 'center' },
});
