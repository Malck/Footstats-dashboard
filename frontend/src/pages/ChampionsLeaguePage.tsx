import { useState }    from 'react';
import { useQuery }    from 'react-query';
import { fetchStandings, fetchMatches } from '../lib/api';

const UCL_LEAGUE_ID = 2;
const UCL_SEASON    = 2024;

// Couleur selon le rang
const getRankStyle = (rank: number) => {
  if (rank <= 8)  return { color: '#22c55e', label: '1/8 direct' };
  if (rank <= 24) return { color: '#f59e0b', label: 'Barrage' };
  return { color: '#ef4444', label: 'Éliminé' };
};

// Rounds à afficher dans les brackets
const ROUNDS = [
  { key: 'Round of 16',      label: '8èmes de finale' },
  { key: 'Quarter-finals',   label: 'Quarts de finale' },
  { key: 'Semi-finals',      label: 'Demi-finales' },
  { key: 'Final',            label: 'Finale' },
];

export default function ChampionsLeaguePage() {
  const [tab, setTab] = useState<'table' | 'brackets'>('table');

  const { data: standingsData, isLoading: loadingStandings } = useQuery(
    ['standings', UCL_LEAGUE_ID, UCL_SEASON],
    () => fetchStandings(UCL_LEAGUE_ID, UCL_SEASON),
    { staleTime: 10 * 60 * 1000 },
  );

  const { data: matchesData, isLoading: loadingMatches } = useQuery(
    ['ucl-matches', UCL_LEAGUE_ID, UCL_SEASON],
    () => fetchMatches({ leagueId: UCL_LEAGUE_ID, season: UCL_SEASON, limit: 200, page: 1 }),
    { staleTime: 10 * 60 * 1000 },
  );

  // Grouper les matchs par round
  const matchesByRound = (matchesData?.matches ?? []).reduce((acc: any, m: any) => {
    const round = m.round ?? 'Unknown';
    if (!acc[round]) acc[round] = [];
    acc[round].push(m);
    return acc;
  }, {});

  // Grouper les matchs par confrontation (même deux équipes = aller + retour)
  const groupMatchesByTie = (matches: any[]) => {
    const ties: Record<string, any[]> = {};
    matches.forEach(m => {
      const key = [m.homeTeam.id, m.awayTeam.id].sort().join('-');
      if (!ties[key]) ties[key] = [];
      ties[key].push(m);
    });
    return Object.values(ties);
  };

  return (
    <div className="page ucl-page">
      {/* Header */}
      <div className="ucl-header">
        <img
          src="https://media.api-sports.io/football/leagues/2.png"
          alt="UEFA Champions League"
          style={{ width: 48, height: 48, objectFit: 'contain' }}
        />
        <div>
          <h1>UEFA Champions League</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Saison 2024/2025</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="ucl-tabs">
        <button
          className={`ucl-tab ${tab === 'table' ? 'active' : ''}`}
          onClick={() => setTab('table')}
        >
          🏆 Tableau phase de ligue
        </button>
        <button
          className={`ucl-tab ${tab === 'brackets' ? 'active' : ''}`}
          onClick={() => setTab('brackets')}
        >
          ⚔️ Phase à élimination
        </button>
      </div>

      {/* ── TABLEAU ── */}
      {tab === 'table' && (
        <div className="ucl-table-wrap">
          {loadingStandings ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {/* Légende */}
              <div className="ucl-legend">
                <span><span className="legend-dot" style={{ background: '#22c55e' }} /> 1-8 : Qualifiés directement en 8èmes</span>
                <span><span className="legend-dot" style={{ background: '#f59e0b' }} /> 9-24 : Barrages</span>
                <span><span className="legend-dot" style={{ background: '#ef4444' }} /> 25-36 : Éliminés</span>
              </div>

              <div className="table-scroll">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="team-col">Équipe</th>
                      <th title="Matchs joués">J</th>
                      <th title="Victoires">V</th>
                      <th title="Nuls">N</th>
                      <th title="Défaites">D</th>
                      <th title="Buts pour">BP</th>
                      <th title="Buts contre">BC</th>
                      <th title="Différence">+/-</th>
                      <th className="pts-col">Pts</th>
                      <th>Forme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsData?.standings.map((s: any) => {
                      const { color } = getRankStyle(s.rank);
                      const formColor = (r: string) =>
                        r === 'W' ? 'form-w' : r === 'D' ? 'form-d' : 'form-l';
                      return (
                        <tr key={s.team.id}>
                          <td className="rank" style={{ borderLeft: `3px solid ${color}` }}>
                            {s.rank}
                          </td>
                          <td className="team-cell-td" style={{ borderLeft: `3px solid ${color}` }}>
  <div className="team-cell">
    {s.team.logo && <img src={s.team.logo} alt={s.team.name} className="team-logo-sm" />}
    <span>{s.team.name}</span>
  </div>
</td>
                          <td>{s.played}</td>
                          <td>{s.won}</td>
                          <td>{s.drawn}</td>
                          <td>{s.lost}</td>
                          <td>{s.goalsFor}</td>
                          <td>{s.goalsAgainst}</td>
                          <td className={s.goalDiff > 0 ? 'positive' : s.goalDiff < 0 ? 'negative' : ''}>
                            {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                          </td>
                          <td className="pts-col"><strong>{s.points}</strong></td>
                          <td>
  <div className="form-col">
    {s.form?.split('').map((r: string, i: number) => (
      <span key={i} className={`form-dot ${formColor(r)}`}>{r}</span>
    ))}
  </div>
</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BRACKETS ── */}
      {tab === 'brackets' && (
        <div className="ucl-brackets">
          {loadingMatches ? (
            <div className="loading">Chargement des matchs...</div>
          ) : (
            ROUNDS.map(round => {
              const roundMatches = matchesByRound[round.key] ?? [];
              if (!roundMatches.length) return null;
              const ties = groupMatchesByTie(roundMatches);

              return (
                <div key={round.key} className="ucl-round">
                  <h2 className="ucl-round-title">{round.label}</h2>
                  <div className="ucl-ties">
                    {ties.map((tie: any[], i: number) => {
  // Trier aller/retour par date
  const sorted = [...tie].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const leg1 = sorted[0]; // aller
  const leg2 = sorted[1]; // retour

  // Équipe "domicile" de l'aller = équipe A
  const teamA = leg1.homeTeam;
  const teamB = leg1.awayTeam;

  // Score cumulé
  let scoreA = 0, scoreB = 0;
  sorted.forEach(m => {
    if (m.homeTeam.id === teamA.id) {
      scoreA += m.homeGoals ?? 0;
      scoreB += m.awayGoals ?? 0;
    } else {
      scoreA += m.awayGoals ?? 0;
      scoreB += m.homeGoals ?? 0;
    }
  });

  // Vérifier s'il y a des tirs au but
  const penaltyMatch = sorted.find(
    m => m.score?.penalty?.home !== null && m.score?.penalty?.home !== undefined
  );

  const winner = scoreA > scoreB ? teamA.id
               : scoreB > scoreA ? teamB.id
               : penaltyMatch?.winner === 'Home'
                 ? (penaltyMatch.homeTeam.id === teamA.id ? teamA.id : teamB.id)
                 : penaltyMatch?.winner === 'Away'
                 ? (penaltyMatch.awayTeam.id === teamA.id ? teamA.id : teamB.id)
                 : null;

  return (
    <div key={i} className="ucl-tie">
      {/* Score global centré */}
      <div className="tie-global">
        <div className={`tie-team ${winner === teamA.id ? 'tie-winner' : winner ? 'tie-loser' : ''}`}>
          <img src={teamA.logo} alt={teamA.name} className="tie-logo" />
          <span>{teamA.name}</span>
        </div>

        <div className="tie-score-center">
          <span className={winner === teamA.id ? 'score-win' : 'score-lose'}>{scoreA}</span>
          <span className="tie-sep"> — </span>
          <span className={winner === teamB.id ? 'score-win' : 'score-lose'}>{scoreB}</span>
          {penaltyMatch && (
            <div className="tie-pen-note">
              tab: {penaltyMatch.score.penalty.home}-{penaltyMatch.score.penalty.away}
            </div>
          )}
        </div>

        <div className={`tie-team tie-team-right ${winner === teamB.id ? 'tie-winner' : winner ? 'tie-loser' : ''}`}>
          <span>{teamB.name}</span>
          <img src={teamB.logo} alt={teamB.name} className="tie-logo" />
        </div>
      </div>

      {/* Détail aller / retour */}
      <div className="tie-legs">
        {sorted.map((m: any, li: number) => (
          <div key={m.id} className="tie-leg">
            <span className="leg-venue">{li === 0 ? 'Aller' : 'Retour'}</span>
            <span className="leg-teams">
              {m.homeTeam.name}
              <strong style={{ margin: '0 .4rem', color: 'var(--text)' }}>
                {m.homeGoals ?? '?'} — {m.awayGoals ?? '?'}
              </strong>
              {m.awayTeam.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
})}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}