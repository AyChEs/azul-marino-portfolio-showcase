// Unified feedback: haptics (+ optional sound) gated by user prefs.
//
// Reads a synchronous snapshot of prefs (set from SettingsContext) so the hot
// path — tapping an answer — never awaits storage. Haptics are no-ops on web
// and on devices without a taptic engine; failures are swallowed.
//
// Sound is intentionally lazy and optional: if no audio assets are bundled the
// sound calls become no-ops, so the feature ships without blocking on assets.
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import type { AppPrefs } from "./types";

let snapshot: AppPrefs = { sound: true, haptics: true, reducedMotion: false };

export function setFeedbackPrefs(prefs: AppPrefs): void {
  snapshot = prefs;
}

export function prefersReducedMotion(): boolean {
  return snapshot.reducedMotion;
}

const canHaptic = Platform.OS === "ios" || Platform.OS === "android";

function impact(style: Haptics.ImpactFeedbackStyle): void {
  if (!snapshot.haptics || !canHaptic) return;
  Haptics.impactAsync(style).catch(() => {});
}

function notify(type: Haptics.NotificationFeedbackType): void {
  if (!snapshot.haptics || !canHaptic) return;
  Haptics.notificationAsync(type).catch(() => {});
}

// ── Semantic feedback events ────────────────────────────────────────────────

export const feedback = {
  tap(): void {
    impact(Haptics.ImpactFeedbackStyle.Light);
  },
  select(): void {
    impact(Haptics.ImpactFeedbackStyle.Medium);
  },
  correct(): void {
    notify(Haptics.NotificationFeedbackType.Success);
    playSound("correct");
  },
  incorrect(): void {
    notify(Haptics.NotificationFeedbackType.Error);
    playSound("incorrect");
  },
  warning(): void {
    notify(Haptics.NotificationFeedbackType.Warning);
  },
  victory(): void {
    notify(Haptics.NotificationFeedbackType.Success);
    playSound("victory");
  },
};

// ── Optional sound layer ────────────────────────────────────────────────────
// Kept behind a lazy require so the bundle works whether or not expo-audio and
// the audio assets are present. Wire real players here when assets land.

type SoundName = "correct" | "incorrect" | "victory";

function playSound(_name: SoundName): void {
  if (!snapshot.sound) return;
  // No audio assets bundled yet — no-op. When assets are added, load and play
  // them here (expo-audio), still gated by `snapshot.sound`.
}
