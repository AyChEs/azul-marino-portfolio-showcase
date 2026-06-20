import { findNextMajlisTurn, isMajlisGameOver } from "../lib/majlisLogic";
import type { Player } from "../lib/types";

const makePlayer = (id: string, overrides: Partial<Player> = {}): Player => ({
  id,
  name: id,
  score: 0,
  lives: 3,
  lifelines: { fiftyFifty: 2, extraTime: 2, skip: 1 },
  isEliminated: false,
  ...overrides,
});

describe("findNextMajlisTurn", () => {
  it("returns next player in round-robin", () => {
    const players = [makePlayer("a"), makePlayer("b"), makePlayer("c")];
    expect(findNextMajlisTurn(0, players, {})).toBe(1);
    expect(findNextMajlisTurn(1, players, {})).toBe(2);
    expect(findNextMajlisTurn(2, players, {})).toBe(0);
  });

  it("skips eliminated players", () => {
    const players = [makePlayer("a"), makePlayer("b", { isEliminated: true }), makePlayer("c")];
    expect(findNextMajlisTurn(0, players, {})).toBe(2);
  });

  it("skips players who exhausted their questions", () => {
    const players = [makePlayer("a"), makePlayer("b"), makePlayer("c")];
    const answered = { b: 5 };
    expect(findNextMajlisTurn(0, players, answered)).toBe(2);
  });

  it("returns null when all players exhausted or eliminated", () => {
    const players = [makePlayer("a", { isEliminated: true }), makePlayer("b")];
    const answered = { b: 5 };
    expect(findNextMajlisTurn(0, players, answered)).toBeNull();
  });

  it("wraps around the array", () => {
    const players = [makePlayer("a"), makePlayer("b"), makePlayer("c")];
    expect(findNextMajlisTurn(2, players, {})).toBe(0);
  });
});

describe("isMajlisGameOver", () => {
  it("returns false when game just started", () => {
    const players = [makePlayer("a"), makePlayer("b"), makePlayer("c")];
    expect(isMajlisGameOver(players, {})).toBe(false);
  });

  it("returns true when only one player alive", () => {
    const players = [
      makePlayer("a"),
      makePlayer("b", { isEliminated: true }),
      makePlayer("c", { isEliminated: true }),
    ];
    expect(isMajlisGameOver(players, {})).toBe(true);
  });

  it("returns true when all alive players finished their questions", () => {
    const players = [makePlayer("a"), makePlayer("b")];
    const answered = { a: 5, b: 5 };
    expect(isMajlisGameOver(players, answered)).toBe(true);
  });

  it("returns false when alive players still have questions", () => {
    const players = [makePlayer("a"), makePlayer("b")];
    const answered = { a: 3, b: 5 };
    expect(isMajlisGameOver(players, answered)).toBe(false);
  });

  it("handles single player correctly", () => {
    const players = [makePlayer("a")];
    expect(isMajlisGameOver(players, {})).toBe(true);
  });
});
