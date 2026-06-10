/**
 * Ephemeral in-memory session store for passing rich state between routes
 * (router params stay small/serializable). Cleared on app restart by design.
 */
import type { GameSettings, MajlisPlayer } from './types';

export interface SoloResult {
  score: number;
  accuracy: number;
  answered: number;
  newRecord: boolean;
  settings: GameSettings;
}

interface Session {
  settings: GameSettings | null;
  soloResult: SoloResult | null;
  majlisPlayers: MajlisPlayer[];
}

const session: Session = { settings: null, soloResult: null, majlisPlayers: [] };

export function setGameSettings(settings: GameSettings): void {
  session.settings = settings;
}
export function getGameSettings(): GameSettings | null {
  return session.settings;
}
export function setSoloResult(result: SoloResult): void {
  session.soloResult = result;
}
export function getSoloResult(): SoloResult | null {
  return session.soloResult;
}
export function setMajlisPlayers(players: MajlisPlayer[]): void {
  session.majlisPlayers = players;
}
export function getMajlisPlayers(): MajlisPlayer[] {
  return session.majlisPlayers;
}
