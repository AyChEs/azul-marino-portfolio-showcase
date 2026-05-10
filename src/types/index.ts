export interface Player {
  id: string;
  name: string;
  age: number;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  color: TeamColor;
}

export type TeamColor = 'red' | 'blue' | 'orange' | 'purple' | 'pink' | 'cyan' | 'yellow' | 'indigo';

export interface Goal {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  matchId: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  goals: Goal[];
  createdAt: string;
  finishedAt?: string;
}

export interface TournamentState {
  tournamentName: string;
  players: Player[];
  teams: Team[];
  matches: Match[];
}

export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface TopScorer {
  playerId: string;
  name: string;
  goals: number;
  teamId: string;
}
