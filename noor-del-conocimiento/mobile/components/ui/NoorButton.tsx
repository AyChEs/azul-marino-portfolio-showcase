// Design principles applied:
// - Emil Kowalski: scale(0.97) on press, ease-out, < 200ms
// - high-end skill: double-bezel nested architecture for premium feel
// - design-taste: spring physics, no linear easing
import React from "react";
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

interface NoorButtonProps {
  onPress: () => void;
  label: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  isRTL?: boolean;
  style?: object;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NoorButtonBase: React.FC<NoorButtonProps> = ({
  onPress,
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  isRTL = false,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    // Emil Kowalski: scale(0.97) on active, spring physics, not linear
    scale.value = withSpring(0.97, { stiffness: 400, damping: 25 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 20 });
  };

  const styles = getStyles(variant, size, disabled);

  return (
    // Double-bezel: outer shell + inner core (high-end skill)
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, styles.outerShell, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <View style={styles.innerCore}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? Colors.parchment.primary : Colors.accent.emerald}
          />
        ) : (
          <Text
            style={[styles.label, isRTL && { textAlign: "right" }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

// Memoize the button — its props (label, variant, size, etc.) rarely change
// for a given instance, so React skips re-renders when the parent updates.
// Crucial in play.tsx where the parent re-renders every second from the timer.
export const NoorButton = React.memo(NoorButtonBase);

const getStyles = (variant: Variant, size: Size, disabled: boolean) => {
  const pad = { sm: 12, md: 16, lg: 20 }[size];
  const fontSize = { sm: 14, md: 16, lg: 18 }[size];

  const variantOuter: Record<Variant, object> = {
    primary: {
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      borderWidth: 1,
      borderColor: Colors.border.emerald,
      borderRadius: 16,
      padding: 2,
    },
    secondary: {
      backgroundColor: "rgba(253, 246, 227, 0.08)",
      borderWidth: 1,
      borderColor: Colors.border.subtle,
      borderRadius: 16,
      padding: 2,
    },
    ghost: {
      borderRadius: 16,
      padding: 2,
    },
    gold: {
      backgroundColor: "rgba(212, 175, 55, 0.12)",
      borderWidth: 1,
      borderColor: Colors.border.gold,
      borderRadius: 16,
      padding: 2,
    },
  };

  const variantInner: Record<Variant, object> = {
    primary: {
      backgroundColor: Colors.accent.emerald,
      borderRadius: 14,
      // Inner highlight — liquid glass refraction (design-taste skill)
      shadowColor: Colors.accent.emerald,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    secondary: {
      backgroundColor: "rgba(253, 246, 227, 0.1)",
      borderRadius: 14,
    },
    ghost: {
      borderRadius: 14,
    },
    gold: {
      backgroundColor: Colors.gold.primary,
      borderRadius: 14,
      shadowColor: Colors.gold.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
  };

  const labelColor: Record<Variant, string> = {
    primary: Colors.parchment.primary,
    secondary: Colors.text.primary,
    ghost: Colors.text.secondary,
    gold: Colors.bg.primary,
  };

  return StyleSheet.create({
    outerShell: {
      ...(variantOuter[variant] as object),
      opacity: disabled ? 0.45 : 1,
    },
    innerCore: {
      ...(variantInner[variant] as object),
      paddingHorizontal: pad,
      paddingVertical: pad * 0.7,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    label: {
      color: labelColor[variant],
      fontSize,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
  });
};
