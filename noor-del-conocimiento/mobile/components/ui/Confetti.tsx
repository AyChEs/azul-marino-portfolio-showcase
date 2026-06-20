import React, { useEffect, useMemo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { prefersReducedMotion } from "../../lib/feedback";

const { width: W, height: H } = Dimensions.get("window");
const COLORS = [
  "#E9C46A",
  "#F4A261",
  "#E76F51",
  "#2A9D8F",
  "#16A34A",
  "#C084FC",
  "#60A5FA",
];
const COUNT = 40;

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
}

export const Confetti: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * W,
      y: -60 - Math.random() * 200,
      size: 4 + Math.random() * 10,
      color: COLORS[i % COLORS.length] ?? "#E9C46A",
      delay: Math.random() * 600,
      duration: 2000 + Math.random() * 2000,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 60,
    }));
  }, []);

  // Respect the user's reduced-motion preference: skip the celebration entirely.
  if (prefersReducedMotion()) return null;

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </Animated.View>
  );
};

const Particle: React.FC<Particle> = ({ x, size, color, delay, duration, rotation, drift }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(H + 100, { duration, easing: Easing.linear }),
        1,
        false
      )
    );
    translateX.value = withDelay(
      delay,
      withTiming(drift, { duration, easing: Easing.inOut(Easing.quad) })
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotation + 720, { duration, easing: Easing.linear }),
        1,
        false
      )
    );
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size * 1.4,
          backgroundColor: color,
          borderRadius: size * 0.3,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  particle: {
    position: "absolute",
  },
});
