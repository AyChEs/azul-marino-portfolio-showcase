// Lifeline tile — Direction D: gold-bordered tile, Arabic name (El Messiri),
// latin effect below, count badge top-right.
import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import { Spring } from "../../constants/motion";
import { feedback } from "../../lib/feedback";

interface LifelineTileProps {
  name: string;         // translated label (e.g. "50/50")
  arabicName: string;   // الفُرقان · الصَّبر · الهِجرة
  effect: string;       // "50/50" · "+15s" · "Saltar"
  count: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LifelineTileBase: React.FC<LifelineTileProps> = ({
  name,
  arabicName,
  effect,
  count,
  onPress,
  disabled = false,
}) => {
  const unusable = disabled || count <= 0;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={unusable ? undefined : onPress}
      onPressIn={() => {
        if (!unusable) { feedback.tap(); scale.value = withSpring(0.96, Spring.press); }
      }}
      onPressOut={() => {
        if (!unusable) scale.value = withSpring(1, Spring.press);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${name} — ${arabicName} — ${effect}`}
      accessibilityState={{ disabled: unusable }}
      style={[animatedStyle, styles.tile, unusable && styles.unusable]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
      <Text style={styles.arabic}>{arabicName}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.effect}>{effect}</Text>
    </AnimatedPressable>
  );
};

export const LifelineTile = React.memo(LifelineTileBase);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    backgroundColor: "rgba(212, 175, 55, 0.07)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 1,
  },
  unusable: { opacity: 0.35 },
  badge: {
    position: "absolute",
    top: -7,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: Colors.gold.cta,
    alignItems: "center",
    justifyContent: "center",
    // Subtle gold glow so the count reads as a "charge" you spend.
    shadowColor: Colors.gold.cta,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.bg.primary },
  // Arabic name is the hero — largest, gold, El Messiri.
  arabic: { fontFamily: Fonts.arabic, fontSize: 16, color: Colors.gold.light, lineHeight: 24 },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  effect: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 11,
    color: Colors.gold.dusty,
    marginTop: 1,
  },
});
