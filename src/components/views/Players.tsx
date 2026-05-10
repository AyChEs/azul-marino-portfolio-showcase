import { useState } from 'react';
import { useTournament } from '../../hooks/useTournament';

export default function Players() {
  const { state, actions } = useTournament();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    const ageNum = parseInt(age);

    if (!trimmed) return setError('El nombre es obligatorio.');
    if (!age || isNaN(ageNum) || ageNum < 5 || ageNum > 80) return setError('Introduce una edad válida (5–80).');
    if (state.players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError('Ya existe un jugador con ese nombre.');
    }

    actions.addPlayer(trimmed, ageNum);
    setName('');
    setAge('');
  }

  const filtered = state.players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedByAge = [...filtered].sort((a, b) => a.age - b.age);
  const avgAge = state.players.length
    ? Math.round(state.players.reduce((s, p) => s + p.age, 0) / state.players.length)
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ir-dark">👥 Jugadores</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registra los participantes del torneo. Necesitas al menos 10 para generar 2 equipos.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Añadir jugador</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Edad"
            value={age}
            min={5}
            max={80}
            onChange={e => setAge(e.target.value)}
            className="w-24 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-ir-blue text-white font-bold px-6 py-2.5 rounded-xl hover:bg-ir-dark transition-colors flex items-center gap-2 justify-center"
          >
            <span>+</span> Añadir
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {state.players.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: state.players.length, icon: '👥' },
            { label: 'Edad media', value: `${avgAge} años`, icon: '📊' },
            { label: 'Equipos posibles', value: Math.floor(state.players.length / 5), icon: '🧩' },
          ].map(s => (
            <div key={s.label} className="bg-ir-light rounded-xl p-3 text-center">
              <div className="text-lg">{s.icon}</div>
              <div className="font-black text-ir-dark text-lg">{s.value}</div>
              <div className="text-xs text-ir-dark/70">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {state.players.length > 0 && (
        <input
          type="text"
          placeholder="🔍 Buscar jugador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ir-blue focus:border-transparent bg-white"
        />
      )}

      {state.players.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-3">👤</div>
          <h3 className="font-bold text-gray-700 text-lg">Sin jugadores aún</h3>
          <p className="text-gray-400 text-sm mt-1">Añade jugadores usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-700 text-sm">{filtered.length} jugador{filtered.length !== 1 ? 'es' : ''}</span>
            <span className="text-xs text-gray-400">ordenados por edad</span>
          </div>
          <div className="divide-y divide-gray-50">
            {sortedByAge
              .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .map((player, i) => {
                const team = player.teamId ? state.teams.find(t => t.id === player.teamId) : null;
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-ir-light text-ir-dark text-xs font-black flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{player.name}</p>
                      {team && (
                        <p className="text-xs text-ir-blue font-medium">{team.name}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {player.age} años
                    </span>
                    <button
                      onClick={() => actions.removePlayer(player.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar jugador"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {state.players.length < 10 && state.players.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>💡 Tip:</strong> Necesitas {10 - state.players.length} jugador{10 - state.players.length !== 1 ? 'es' : ''} más para poder generar equipos de 5 vs 5.
        </div>
      )}
    </div>
  );
}
