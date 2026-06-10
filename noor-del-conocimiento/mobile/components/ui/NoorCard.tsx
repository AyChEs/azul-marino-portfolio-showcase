// Double-bezel (Doppelrand) card — high-end skill technique
// Outer shell: subtle bg + hairline border + padding
// Inner core: distinct bg + inner shadow + calculated radius
import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface NoorCardProps {
  children: React.ReactNode;
  style?: object;
  innerStyle?: object;
  variant?: "dark" | "light" | "gold";
}

const NoorCardBase: React.FC<NoorCardProps> = ({
  children,
  style,
  innerStyle,
  variant = "dark",
}) => {
  const s = cardStyles[variant];

  return (
    // Outer shell — subtle wrap that communicates elevation
    <View style={[s.outer, style]}>
      {/* Inner core — actual content container */}
      <View style={[s.inner, innerStyle]}>{children}</View>
    </View>
  );
};
export const NoorCard = React.memo(NoorCardBase);

const cardStyles = {
  dark: StyleSheet.create({
    outer: {
      backgroundColor: "rgba(253, 246, 227, 0.04)",
      borderWidth: 1,
      borderColor: Colors.border.subtle,
      borderRadius: 24,
      padding: 2,
    },
    inner: {
      backgroundColor: Colors.bg.secondary,
      borderRadius: 22,
      padding: 20,
      // Inset top highlight (liquid glass refraction)
      shadowColor: "rgba(255,255,255,0.08)",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  }),
  light: StyleSheet.create({
    outer: {
      backgroundColor: "rgba(10, 42, 26, 0.06)",
      borderWidth: 1,
      borderColor: "rgba(10, 42, 26, 0.1)",
      borderRadius: 24,
      padding: 2,
    },
    inner: {
      backgroundColor: Colors.parchment.primary,
      borderRadius: 22,
      padding: 20,
    },
  }),
  gold: StyleSheet.create({
    outer: {
      backgroundColor: "rgba(212, 175, 55, 0.08)",
      borderWidth: 1,
      borderColor: Colors.border.gold,
      borderRadius: 24,
      padding: 2,
    },
    inner: {
      backgroundColor: Colors.bg.secondary,
      borderRadius: 22,
      padding: 20,
    },
  }),
};
