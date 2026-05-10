import { Player, Team, TeamColor } from '../types';

const TEAM_COLORS: TeamColor[] = ['red', 'blue', 'orange', 'purple', 'pink', 'cyan', 'yellow', 'indigo'];

export function generateBalancedTeams(players: Player[], teamSize = 5): Team[] {
  const numTeams = Math.floor(players.length / teamSize);
  if (numTeams < 1) return [];

  // Sort oldest to youngest for snake draft
  const sorted = [...players].sort((a, b) => b.age - a.age);

  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${Date.now()}-${i}`,
    name: `Equipo ${i + 1}`,
    playerIds: [],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
  }));

  // Snake draft: alternate direction each round for age balance
  let playerIndex = 0;
  let round = 0;

  while (playerIndex < numTeams * teamSize && playerIndex < sorted.length) {
    const indices =
      round % 2 === 0
        ? Array.from({ length: numTeams }, (_, i) => i)
        : Array.from({ length: numTeams }, (_, i) => numTeams - 1 - i);

    for (const teamIndex of indices) {
      if (playerIndex < numTeams * teamSize && playerIndex < sorted.length) {
        teams[teamIndex].playerIds.push(sorted[playerIndex].id);
        playerIndex++;
      }
    }
    round++;
  }

  return teams;
}

export function getTeamAverageAge(team: Team, players: Player[]): number {
  const teamPlayers = players.filter(p => team.playerIds.includes(p.id));
  if (teamPlayers.length === 0) return 0;
  return Math.round(teamPlayers.reduce((sum, p) => sum + p.age, 0) / teamPlayers.length);
}
