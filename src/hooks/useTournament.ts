import { useState, useEffect, useCallback } from 'react';
import { TournamentState, Player, Match, Goal, StandingRow, TopScorer } from '../types';
import { generateBalancedTeams } from '../utils/teamGenerator';

const STORAGE_KEY = 'islam-relief-tournament-v1';

const initialState: TournamentState = {
  tournamentName: 'Torneo Benéfico Islam Relief',
  players: [],
  teams: [],
  matches: [],
};

export function useTournament() {
  const [state, setState] = useState<TournamentState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((updater: (prev: TournamentState) => TournamentState) => {
    setState(updater);
  }, []);

  const addPlayer = useCallback(
    (name: string, age: number): Player => {
      const player: Player = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: name.trim(),
        age,
      };
      update(prev => ({ ...prev, players: [...prev.players, player] }));
      return player;
    },
    [update],
  );

  const removePlayer = useCallback(
    (id: string) => {
      update(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== id),
        teams: prev.teams.map(t => ({ ...t, playerIds: t.playerIds.filter(pid => pid !== id) })),
      }));
    },
    [update],
  );

  const generateTeams = useCallback(() => {
    const teams = generateBalancedTeams(state.players, 5);
    const playerTeamMap = new Map<string, string>();
    teams.forEach(team => team.playerIds.forEach(pid => playerTeamMap.set(pid, team.id)));
    update(prev => ({
      ...prev,
      teams,
      players: prev.players.map(p => ({ ...p, teamId: playerTeamMap.get(p.id) })),
    }));
  }, [state.players, update]);

  const renameTeam = useCallback(
    (teamId: string, name: string) => {
      update(prev => ({
        ...prev,
        teams: prev.teams.map(t => (t.id === teamId ? { ...t, name } : t)),
      }));
    },
    [update],
  );

  const createMatch = useCallback(
    (homeTeamId: string, awayTeamId: string): string => {
      const match: Match = {
        id: `m-${Date.now()}`,
        homeTeamId,
        awayTeamId,
        homeScore: 0,
        awayScore: 0,
        status: 'live',
        goals: [],
        createdAt: new Date().toISOString(),
      };
      update(prev => ({ ...prev, matches: [...prev.matches, match] }));
      return match.id;
    },
    [update],
  );

  const addGoal = useCallback(
    (matchId: string, teamId: string, playerId: string, playerName: string) => {
      const goal: Goal = {
        id: `g-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        playerId,
        playerName,
        teamId,
        matchId,
      };
      update(prev => ({
        ...prev,
        matches: prev.matches.map(m => {
          if (m.id !== matchId) return m;
          const isHome = m.homeTeamId === teamId;
          return {
            ...m,
            homeScore: isHome ? m.homeScore + 1 : m.homeScore,
            awayScore: !isHome ? m.awayScore + 1 : m.awayScore,
            goals: [...m.goals, goal],
          };
        }),
      }));
    },
    [update],
  );

  const removeGoal = useCallback(
    (matchId: string, teamId: string) => {
      update(prev => ({
        ...prev,
        matches: prev.matches.map(m => {
          if (m.id !== matchId) return m;
          const isHome = m.homeTeamId === teamId;
          const lastGoalIdx = [...m.goals].reverse().findIndex(g => g.teamId === teamId);
          if (lastGoalIdx === -1) return m;
          const realIdx = m.goals.length - 1 - lastGoalIdx;
          return {
            ...m,
            homeScore: isHome ? Math.max(0, m.homeScore - 1) : m.homeScore,
            awayScore: !isHome ? Math.max(0, m.awayScore - 1) : m.awayScore,
            goals: m.goals.filter((_, i) => i !== realIdx),
          };
        }),
      }));
    },
    [update],
  );

  const finishMatch = useCallback(
    (matchId: string) => {
      update(prev => ({
        ...prev,
        matches: prev.matches.map(m =>
          m.id === matchId ? { ...m, status: 'finished', finishedAt: new Date().toISOString() } : m,
        ),
      }));
    },
    [update],
  );

  const updateTournamentName = useCallback(
    (name: string) => {
      update(prev => ({ ...prev, tournamentName: name }));
    },
    [update],
  );

  const resetTournament = useCallback(() => {
    setState(initialState);
  }, []);

  // Computed standings
  const standings: StandingRow[] = state.teams
    .map(team => {
      const played = state.matches.filter(
        m => m.status === 'finished' && (m.homeTeamId === team.id || m.awayTeamId === team.id),
      );
      let won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;
      played.forEach(m => {
        const isHome = m.homeTeamId === team.id;
        const my = isHome ? m.homeScore : m.awayScore;
        const opp = isHome ? m.awayScore : m.homeScore;
        gf += my; ga += opp;
        if (my > opp) won++;
        else if (my === opp) drawn++;
        else lost++;
      });
      return { team, played: played.length, won, drawn, lost, gf, ga, gd: gf - ga, points: won * 3 + drawn };
    })
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

  // Computed top scorers
  const topScorers: TopScorer[] = (() => {
    const map = new Map<string, TopScorer>();
    state.matches.forEach(m =>
      m.goals.forEach(g => {
        const entry = map.get(g.playerId);
        if (entry) entry.goals++;
        else map.set(g.playerId, { playerId: g.playerId, name: g.playerName, goals: 1, teamId: g.teamId });
      }),
    );
    return [...map.values()].sort((a, b) => b.goals - a.goals);
  })();

  const getPlayerById = (id: string) => state.players.find(p => p.id === id);
  const getTeamById = (id: string) => state.teams.find(t => t.id === id);

  return {
    state,
    actions: {
      addPlayer,
      removePlayer,
      generateTeams,
      renameTeam,
      createMatch,
      addGoal,
      removeGoal,
      finishMatch,
      updateTournamentName,
      resetTournament,
    },
    computed: { standings, topScorers, getPlayerById, getTeamById },
  };
}
