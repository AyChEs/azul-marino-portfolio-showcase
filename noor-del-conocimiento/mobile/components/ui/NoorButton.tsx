import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';

interface NoorButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function NoorButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityLabel,
}: NoorButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const { container, text } = variantStyles(variant, theme.paper.paper);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 150 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        onPress={onPress}
        style={[styles.base, container, disabled && styles.disabled]}
      >
        <Text style={[styles.label, text]} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function variantStyles(
  variant: ButtonVariant,
  paper: string,
): { container: ViewStyle; text: { color: string } } {
  switch (variant) {
    case 'gold':
      return { container: { backgroundColor: Colors.goldHi }, text: { color: Colors.ink } };
    case 'outline':
      return {
        container: {
          backgroundColor: paper,
          borderWidth: 1,
          borderColor: Colors.hairlineStrong,
        },
        text: { color: Colors.ink },
      };
    case 'ghost':
      return { container: { backgroundColor: 'transparent' }, text: { color: Colors.inkSoft } };
    case 'danger':
      return { container: { backgroundColor: Colors.terracotta }, text: { color: Colors.white } };
    case 'primary':
    default:
      return { container: { backgroundColor: Colors.emerald }, text: { color: Colors.white } };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  disabled: { opacity: 0.45 },
});
