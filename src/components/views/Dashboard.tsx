import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../../hooks/useTournament';

export default function Dashboard() {
  const { state, actions, computed } = useTournament();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.tournamentName);

  const finishedMatches = state.matches.filter(m => m.status === 'finished');
  const liveMatch = state.matches.find(m => m.status === 'live');

  function saveName() {
    if (nameInput.trim()) actions.updateTournamentName(nameInput.trim());
    setEditingName(false);
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero banner */}
      <div className="ir-gradient rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  className="bg-white/20 text-white placeholder-white/60 border border-white/40 rounded-lg px-3 py-1.5 text-2xl font-bold w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-ir-gold"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="bg-ir-gold text-ir-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameInput(state.tournamentName); }}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingName(true); setNameInput(state.tournamentName); }}
                className="text-left group"
              >
                <h1 className="text-3xl md:text-4xl font-black leading-tight group-hover:underline underline-offset-4">
                  {state.tournamentName}
                </h1>
                <p className="text-white/70 text-sm mt-1">Toca para editar el nombre</p>
              </button>
            )}
          </div>
          <div className="text-6xl">⚽</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Jugadores', value: state.players.length, icon: '👥' },
            { label: 'Equipos', value: state.teams.length, icon: '🧩' },
            { label: 'Partidos', value: finishedMatches.length, icon: '🏆' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-white/70 text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live match alert */}
      {liveMatch && (() => {
        const home = state.teams.find(t => t.id === liveMatch.homeTeamId);
        const away = state.teams.find(t => t.id === liveMatch.awayTeamId);
        return (
          <Link to="/partido" className="block">
            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 flex items-center justify-between gap-4 card-hover cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="animate-pulse text-red-500 font-black text-sm bg-red-100 px-2 py-0.5 rounded-full">🔴 EN VIVO</span>
                <span className="font-bold text-gray-800">{home?.name} vs {away?.name}</span>
              </div>
              <div className="font-black text-2xl text-ir-dark">
                {liveMatch.homeScore} – {liveMatch.awayScore}
              </div>
            </div>
          </Link>
        );
      })()}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            to: '/jugadores',
            icon: '👥',
            title: 'Registrar Jugadores',
            desc: `${state.players.length} jugadores registrados. Mínimo 10 para generar equipos.`,
            color: 'bg-blue-500',
          },
          {
            to: '/equipos',
            icon: '🧩',
            title: 'Gestionar Equipos',
            desc: state.teams.length > 0 ? `${state.teams.length} equipos generados` : 'Genera equipos equilibrados por edad',
            color: 'bg-ir-blue',
          },
          {
            to: '/partido',
            icon: '⚽',
            title: 'Registrar Partido',
            desc: state.teams.length >= 2 ? 'Registra goles en tiempo real' : 'Necesitas al menos 2 equipos',
            color: 'bg-ir-gold',
          },
          {
            to: '/clasificacion',
            icon: '🏆',
            title: 'Clasificación',
            desc: finishedMatches.length > 0 ? `Tabla de ${state.teams.length} equipos · Máximos goleadores` : 'Aquí verás la tabla al finalizar partidos',
            color: 'bg-purple-500',
          },
        ].map(card => (
          <Link key={card.to} to={card.to} className="block">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover flex items-start gap-4">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{card.title}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Top scorers preview */}
      {computed.topScorers.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚽</span> Máximos Goleadores
          </h2>
          <div className="space-y-2">
            {computed.topScorers.slice(0, 5).map((scorer, i) => {
              const team = state.teams.find(t => t.id === scorer.teamId);
              return (
                <div key={scorer.playerId} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-ir-gold text-ir-dark' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-gray-800">{scorer.name}</span>
                  {team && <span className="text-xs text-gray-500">{team.name}</span>}
                  <span className="font-black text-ir-blue">{scorer.goals} ⚽</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent matches */}
      {finishedMatches.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Últimos Partidos
          </h2>
          <div className="space-y-2">
            {[...finishedMatches].reverse().slice(0, 4).map(m => {
              const home = state.teams.find(t => t.id === m.homeTeamId);
              const away = state.teams.find(t => t.id === m.awayTeamId);
              return (
                <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-700 flex-1 text-right">{home?.name}</span>
                  <span className="font-black text-base text-ir-dark mx-4 w-12 text-center">
                    {m.homeScore} – {m.awayScore}
                  </span>
                  <span className="font-medium text-gray-700 flex-1">{away?.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
