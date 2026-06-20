import type { Player } from "./types";
import { MAJLIS_QUESTIONS_PER_PLAYER } from "./gameLogic";

export const findNextMajlisTurn = (
  fromIdx: number,
  players: Player[],
  answered: Record<string, number>
): number | null => {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIdx + step) % n;
    const p = players[idx];
    if (!p.isEliminated && (answered[p.id] ?? 0) < MAJLIS_QUESTIONS_PER_PLAYER) {
      return idx;
    }
  }
  return null;
};

export const isMajlisGameOver = (players: Player[], answered: Record<string, number>): boolean => {
  const alive = players.filter((p) => !p.isEliminated);
  if (alive.length <= 1) return true;
  return players.every(
    (p) => p.isEliminated || (answered[p.id] ?? 0) >= MAJLIS_QUESTIONS_PER_PLAYER
  );
};
