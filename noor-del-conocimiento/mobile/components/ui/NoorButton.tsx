// Primary button — Direction D: editorial serif-italic labels on emerald/gold,
// spring press feedback (scale 0.97), double-bezel shell.
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
import { Fonts } from "../../constants/fonts";
import { Spring } from "../../constants/motion";
import { feedback } from "../../lib/feedback";

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
  /** Serif italic label (CTAs like "Empezar viaje →"). Default true for md/lg. */
  serif?: boolean;
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
  serif,
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const useSerif = serif ?? size !== "sm";
  const styles = getStyles(variant, size, disabled, useSerif);

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={() => {
        feedback.tap();
        scale.value = withSpring(0.97, Spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Spring.press);
      }}
      style={[animatedStyle, styles.outerShell, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <View style={styles.innerCore}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "gold" ? Colors.bg.primary : Colors.parchment.primary}
          />
        ) : (
          <Text style={[styles.label, isRTL && { textAlign: "right" }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

export const NoorButton = React.memo(NoorButtonBase);

const getStyles = (variant: Variant, size: Size, disabled: boolean, useSerif: boolean) => {
  const padV = { sm: 9, md: 13, lg: 16 }[size];
  const padH = { sm: 16, md: 22, lg: 28 }[size];
  const fontSize = { sm: 13, md: 17, lg: 19 }[size];

  const inner: Record<Variant, object> = {
    primary: {
      backgroundColor: Colors.accent.emerald,
      shadowColor: Colors.accent.emerald,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    gold: {
      backgroundColor: Colors.gold.cta,
      shadowColor: Colors.gold.cta,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    secondary: {
      backgroundColor: "rgba(253, 246, 227, 0.08)",
      borderWidth: 1,
      borderColor: Colors.border.medium,
    },
    ghost: { backgroundColor: "transparent" },
  };

  const labelColor: Record<Variant, string> = {
    primary: Colors.text.onAccent,
    gold: Colors.bg.primary,
    secondary: Colors.parchment.primary,
    ghost: Colors.text.secondary,
  };

  return StyleSheet.create({
    outerShell: {
      borderRadius: 18,
      opacity: disabled ? 0.45 : 1,
    },
    innerCore: {
      minHeight: 44,
      borderRadius: 18,
      paddingVertical: padV,
      paddingHorizontal: padH,
      alignItems: "center",
      justifyContent: "center",
      ...inner[variant],
    },
    label: {
      fontFamily: useSerif ? Fonts.serifItalic : Fonts.bodySemiBold,
      fontStyle: useSerif ? "italic" : "normal",
      fontSize,
      color: labelColor[variant],
      letterSpacing: useSerif ? 0.3 : 0.2,
    },
  });
};
