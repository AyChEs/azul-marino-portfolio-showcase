// Centralized motion system — one source of truth for easing curves, durations
// and spring configs across the app. Built on Emil Kowalski's animation
// principles: strong custom easing curves (the built-in ones are too weak),
// UI durations under ~300ms, ease-out for enter, springs only where things
// should feel alive. Replaces the ad-hoc per-component values that read as
// "AI default" motion (linear easing, random durations, a different spring
// in every file).
import { Easing, type WithSpringConfig, type WithTimingConfig } from "react-native-reanimated";

// ── Easing curves ───────────────────────────────────────────────────────────
// Reanimated's Easing.bezier mirrors CSS cubic-bezier. These are the strong
// variants Emil recommends over the anemic stock curves.
export const Ease = {
  // Strong ease-out — entrances, feedback, anything the user is watching.
  out: Easing.bezier(0.23, 1, 0.32, 1),
  // Strong ease-in-out — on-screen movement / morphs.
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  // iOS drawer curve (Ionic) — sheets, overlays sliding from an edge.
  drawer: Easing.bezier(0.32, 0.72, 0, 1),
  // Standard ease — hover/color changes only.
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  linear: Easing.linear,
} as const;

// ── Durations (ms) ──────────────────────────────────────────────────────────
// A deliberate scale, not arbitrary numbers. UI interactions stay < 300ms.
export const Duration = {
  press: 140,     // button / tile press feedback
  fast: 180,      // small popovers, chips, badges
  base: 240,      // dropdowns, option reveals
  slow: 320,      // modals, overlays, screen-level fades
  celebrate: 480, // rare, first-time delight (game-over reveal)
} as const;

// ── Spring presets ──────────────────────────────────────────────────────────
// Three intents, used everywhere instead of bespoke stiffness/damping pairs.
export const Spring = {
  // Snappy press response — buttons, answer options, tiles.
  press: { stiffness: 400, damping: 26, mass: 0.8 } satisfies WithSpringConfig,
  // Gentle settle — cards, content blocks entering.
  gentle: { stiffness: 140, damping: 18, mass: 0.9 } satisfies WithSpringConfig,
  // Subtle bounce — celebratory pops (score, achievement). Keep restraint.
  pop: { stiffness: 320, damping: 18, mass: 0.9 } satisfies WithSpringConfig,
} as const;

// ── Timing config helpers ───────────────────────────────────────────────────
export const timing = (
  duration: number = Duration.base,
  easing = Ease.out
): WithTimingConfig => ({ duration, easing });

// Enter is deliberate, exit is snappy — Emil's asymmetric enter/exit rule.
export const enterTiming = timing(Duration.base, Ease.out);
export const exitTiming = timing(Duration.fast, Ease.out);

// Stagger step between list items (keep short so the UI never feels slow).
export const STAGGER_STEP = 55;
