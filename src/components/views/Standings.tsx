import { useTournament } from '../../hooks/useTournament';
import { COLOR_STYLES } from './Teams';

export default function Standings() {
  const { state, computed } = useTournament();

  const hasData = state.matches.some(m => m.status === 'finished');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ir-dark">🏆 Clasificación</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tabla de posiciones · 3 pts victoria · 1 pt empate · 0 pts derrota
        </p>
      </div>

      {/* Standings table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 ir-gradient-card">
          <h2 className="font-bold text-white flex items-center gap-2">
            <span>📋</span> Tabla de Posiciones
          </h2>
        </div>

        {!hasData || state.teams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="font-bold text-gray-700 text-lg">Sin datos aún</h3>
            <p className="text-gray-400 text-sm mt-1">
              {state.teams.length === 0
                ? 'Genera equipos y juega partidos para ver la clasificación'
                : 'Finaliza al menos un partido para ver la clasificación'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-6">#</th>
                  <th className="px-4 py-3 text-left">Equipo</th>
                  <th className="px-4 py-3 text-center">PJ</th>
                  <th className="px-4 py-3 text-center">G</th>
                  <th className="px-4 py-3 text-center">E</th>
                  <th className="px-4 py-3 text-center">P</th>
                  <th className="px-4 py-3 text-center">GF</th>
                  <th className="px-4 py-3 text-center">GC</th>
                  <th className="px-4 py-3 text-center">DG</th>
                  <th className="px-4 py-3 text-center font-black text-ir-dark">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {computed.standings.map((row, i) => {
                  const colors = COLOR_STYLES[row.team.color];
                  return (
                    <tr
                      key={row.team.id}
                      className={`transition-colors ${i === 0 ? 'bg-ir-light' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          i === 0 ? 'bg-ir-gold text-ir-dark' :
                          i === 1 ? 'bg-gray-200 text-gray-700' :
                          i === 2 ? 'bg-amber-100 text-amber-800' :
                          'text-gray-400'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${colors.bg} flex-shrink-0`} />
                          <span className="font-semibold text-gray-800">{row.team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.played}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.won}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{row.drawn}</td>
                      <td className="px-4 py-3 text-center text-red-500">{row.lost}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.gf}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.ga}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-black text-base ${i === 0 ? 'text-ir-dark' : 'text-gray-800'}`}>
                          {row.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top scorers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-ir-dark">
          <h2 className="font-bold text-white flex items-center gap-2">
            <span>⚽</span> Máximos Goleadores
          </h2>
        </div>

        {computed.topScorers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">⚽</div>
            <p className="text-gray-400 text-sm">No hay goles registrados aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {computed.topScorers.map((scorer, i) => {
              const team = state.teams.find(t => t.id === scorer.teamId);
              const colors = team ? COLOR_STYLES[team.color] : null;
              return (
                <div key={scorer.playerId} className={`flex items-center gap-4 px-5 py-3 ${i === 0 ? 'bg-amber-50' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    i === 0 ? 'bg-ir-gold text-ir-dark' :
                    i === 1 ? 'bg-gray-200 text-gray-700' :
                    i === 2 ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{scorer.name}</p>
                    {team && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {colors && <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />}
                        <span className="text-xs text-gray-400">{team.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xl text-ir-dark">{scorer.goals}</span>
                    <span className="text-gray-400 text-sm">⚽</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-500 flex flex-wrap gap-4">
        {[
          ['PJ', 'Partidos jugados'],
          ['G', 'Ganados'],
          ['E', 'Empates'],
          ['P', 'Perdidos'],
          ['GF', 'Goles a favor'],
          ['GC', 'Goles en contra'],
          ['DG', 'Diferencia de goles'],
          ['Pts', 'Puntos'],
        ].map(([abbr, full]) => (
          <span key={abbr}><strong>{abbr}</strong> = {full}</span>
        ))}
      </div>
    </div>
  );
}
