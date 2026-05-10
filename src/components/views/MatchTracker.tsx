import { useState } from 'react';
import { useTournament } from '../../hooks/useTournament';
import { Match, Player } from '../../types';
import { COLOR_STYLES } from './Teams';

function GoalModal({
  title,
  players,
  onSelect,
  onClose,
}: {
  title: string;
  players: Player[];
  onSelect: (p: Player) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="ir-gradient p-4 rounded-t-2xl">
          <h3 className="text-white font-bold text-lg">⚽ ¿Quién marcó?</h3>
          <p className="text-white/70 text-sm">{title}</p>
        </div>
        <div className="p-4 space-y-3">
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue"
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ir-light transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-ir-blue text-white text-xs font-black flex items-center justify-center">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.age} años</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Sin resultados</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onFinish }: { match: Match; onFinish: () => void }) {
  const { state, actions } = useTournament();
  const [goalModal, setGoalModal] = useState<'home' | 'away' | null>(null);

  const home = state.teams.find(t => t.id === match.homeTeamId);
  const away = state.teams.find(t => t.id === match.awayTeamId);
  if (!home || !away) return null;

  const homePlayers = state.players.filter(p => home.playerIds.includes(p.id));
  const awayPlayers = state.players.filter(p => away.playerIds.includes(p.id));
  const homeColors = COLOR_STYLES[home.color];
  const awayColors = COLOR_STYLES[away.color];

  function handleGoal(side: 'home' | 'away', player: Player) {
    const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
    actions.addGoal(match.id, teamId, player.id, player.name);
    setGoalModal(null);
  }

  const homeGoals = match.goals.filter(g => g.teamId === match.homeTeamId);
  const awayGoals = match.goals.filter(g => g.teamId === match.awayTeamId);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="ir-gradient px-5 py-2 flex items-center justify-between">
          {match.status === 'live' ? (
            <span className="flex items-center gap-1.5 text-white text-sm font-bold">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              EN VIVO
            </span>
          ) : (
            <span className="text-white/70 text-sm font-medium">FINALIZADO</span>
          )}
          <span className="text-white/60 text-xs">
            {new Date(match.createdAt).toLocaleDateString('es-ES')}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <div className={`w-14 h-14 ${homeColors.bg} rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto shadow-md`}>
                {home.name.charAt(0)}
              </div>
              <p className="font-bold text-gray-800 mt-2 text-sm leading-tight">{home.name}</p>
            </div>

            <div className="text-center">
              <div className="score-display text-6xl font-black text-ir-dark">
                {match.homeScore} <span className="text-gray-300">–</span> {match.awayScore}
              </div>
            </div>

            <div className="text-center">
              <div className={`w-14 h-14 ${awayColors.bg} rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto shadow-md`}>
                {away.name.charAt(0)}
              </div>
              <p className="font-bold text-gray-800 mt-2 text-sm leading-tight">{away.name}</p>
            </div>
          </div>

          {match.status === 'live' && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setGoalModal('home')}
                  className={`${homeColors.bg} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm`}
                >
                  ⚽ Gol {home.name}
                </button>
                <button
                  onClick={() => actions.removeGoal(match.id, match.homeTeamId)}
                  disabled={match.homeScore === 0}
                  className="border border-gray-200 text-gray-500 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  ↩ Deshacer gol
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setGoalModal('away')}
                  className={`${awayColors.bg} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm`}
                >
                  ⚽ Gol {away.name}
                </button>
                <button
                  onClick={() => actions.removeGoal(match.id, match.awayTeamId)}
                  disabled={match.awayScore === 0}
                  className="border border-gray-200 text-gray-500 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  ↩ Deshacer gol
                </button>
              </div>
            </div>
          )}

          {match.goals.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Goleadores</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="space-y-1">
                  {homeGoals.map(g => (
                    <div key={g.id} className="flex items-center gap-1.5 text-sm">
                      <span className="text-xs">⚽</span>
                      <span className="text-gray-700">{g.playerName}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {awayGoals.map(g => (
                    <div key={g.id} className="flex items-center gap-1.5 text-sm justify-end">
                      <span className="text-gray-700">{g.playerName}</span>
                      <span className="text-xs">⚽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {match.status === 'live' && (
            <button
              onClick={onFinish}
              className="w-full mt-5 bg-ir-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
            >
              🏁 Finalizar Partido
            </button>
          )}
        </div>
      </div>

      {goalModal && (
        <GoalModal
          title={goalModal === 'home' ? home.name : away.name}
          players={goalModal === 'home' ? homePlayers : awayPlayers}
          onSelect={p => handleGoal(goalModal, p)}
          onClose={() => setGoalModal(null)}
        />
      )}
    </>
  );
}

export default function MatchTracker() {
  const { state, actions } = useTournament();
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [formError, setFormError] = useState('');

  const liveMatch = state.matches.find(m => m.status === 'live');
  const finishedMatches = [...state.matches.filter(m => m.status === 'finished')].reverse();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!homeId || !awayId) return setFormError('Selecciona ambos equipos.');
    if (homeId === awayId) return setFormError('Los equipos deben ser distintos.');
    actions.createMatch(homeId, awayId);
    setHomeId('');
    setAwayId('');
  }

  function handleFinish(matchId: string) {
    if (confirm('¿Dar por finalizado este partido?')) actions.finishMatch(matchId);
  }

  const availableTeams = state.teams;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ir-dark">⚽ Partido</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona el marcador en tiempo real e introduce los goleadores.</p>
      </div>

      {!liveMatch && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Nuevo Partido</h2>
          {availableTeams.length < 2 ? (
            <p className="text-gray-500 text-sm">Necesitas al menos 2 equipos. Ve a la sección <strong>Equipos</strong> para generarlos.</p>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipo Local</label>
                  <select
                    value={homeId}
                    onChange={e => setHomeId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue bg-white"
                  >
                    <option value="">Seleccionar equipo...</option>
                    {availableTeams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === awayId}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipo Visitante</label>
                  <select
                    value={awayId}
                    onChange={e => setAwayId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue bg-white"
                  >
                    <option value="">Seleccionar equipo...</option>
                    {availableTeams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === homeId}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <button
                type="submit"
                className="bg-ir-blue text-white font-bold px-6 py-2.5 rounded-xl hover:bg-ir-dark transition-colors flex items-center gap-2"
              >
                <span>▶</span> Iniciar Partido
              </button>
            </form>
          )}
        </div>
      )}

      {liveMatch && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-red-500 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Partido en curso
          </p>
          <MatchCard match={liveMatch} onFinish={() => handleFinish(liveMatch.id)} />
        </div>
      )}

      {finishedMatches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Partidos Finalizados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {finishedMatches.map(m => {
              const home = state.teams.find(t => t.id === m.homeTeamId);
              const away = state.teams.find(t => t.id === m.awayTeamId);
              const homeColors = home ? COLOR_STYLES[home.color] : null;
              const awayColors = away ? COLOR_STYLES[away.color] : null;
              return (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-end gap-2">
                    {homeColors && <span className={`w-3 h-3 rounded-full ${homeColors.bg}`} />}
                    <span className="font-semibold text-gray-700 text-sm">{home?.name}</span>
                  </div>
                  <div className="font-black text-lg text-ir-dark w-16 text-center">
                    {m.homeScore} – {m.awayScore}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {awayColors && <span className={`w-3 h-3 rounded-full ${awayColors.bg}`} />}
                    <span className="font-semibold text-gray-700 text-sm">{away?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!liveMatch && finishedMatches.length === 0 && availableTeams.length >= 2 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-3">⚽</div>
          <h3 className="font-bold text-gray-700 text-lg">Sin partidos aún</h3>
          <p className="text-gray-400 text-sm mt-1">Crea el primer partido usando el formulario de arriba</p>
        </div>
      )}
    </div>
  );
}
