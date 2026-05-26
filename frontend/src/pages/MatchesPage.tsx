import { useState }     from 'react';
import { useQuery }     from 'react-query';
import { fetchMatches } from '../lib/api';
import { fetchTeams } from '../lib/api';
import { MatchListSkeleton } from '../components/ui/SkeletonCard';

const LEAGUES = [
  { id: 61,  name: 'Ligue 1',        flag: '🇫🇷' },
  { id: 39,  name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 140, name: 'La Liga',        flag: '🇪🇸' },
];

const SEASONS = [
  { value: 2024, label: '2024/2025' },
  { value: 2023, label: '2023/2024' },
  { value: 2022, label: '2022/2023' },
];

const STATUS_OPTIONS = [
  { value: '',            label: 'Tous' },
];

const statusBadge: Record<string, { label: string; color: string }> = {
  FINISHED:    { label: 'FT',  color: '#64748b' },
  NOT_STARTED: { label: 'NS',  color: '#38bdf8' },
  FIRST_HALF:  { label: '1H',  color: '#22c55e' },
  HALFTIME:    { label: 'HT',  color: '#f59e0b' },
  SECOND_HALF: { label: '2H',  color: '#22c55e' },
  POSTPONED:   { label: 'PST', color: '#f87171' },
};

export default function MatchesPage() {
  const [leagueId, setLeagueId] = useState(61);
  const [season,   setSeason]   = useState(2024);
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);
  const [teamId, setTeamId] = useState<number | ''>('');

  const { data: teams } = useQuery(
        ['teams', leagueId],
        () => fetchTeams(leagueId),
        { staleTime: 30 * 60 * 1000 },
  );

  const { data, isLoading } = useQuery(
    ['matches', leagueId, season, teamId, page],
    () => fetchMatches({ leagueId, season, teamId: teamId || undefined, status: status || undefined, limit: 20, page }),
    { staleTime: 2 * 60 * 1000, keepPreviousData: true },
  );

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  const handleLeagueChange = (id: number) => {
    setLeagueId(id);
    setTeamId('');
    setPage(1);
    setStatus('');
  };

  const handleSeasonChange = (s: number) => {
    setSeason(s);
    setPage(1);
    setStatus('');
  };

  return (
    <div className="page matches-page">
      <div className="page-header">
        <h1>Résultats</h1>
      </div>

      {/* Sélecteurs ligue + saison */}
      <div className="page-controls">
        <div className="control-group">
          <label>Ligue</label>
          <div className="league-tabs">
            {LEAGUES.map(l => (
              <button
                key={l.id}
                className={`league-tab ${leagueId === l.id ? 'active' : ''}`}
                onClick={() => handleLeagueChange(l.id)}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <label>Saison</label>
          <select value={season} onChange={e => handleSeasonChange(+e.target.value)}>
            {SEASONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres statut 
      <div className="matches-filters">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-btn ${status === opt.value ? 'active' : ''}`}
            onClick={() => { setStatus(opt.value); setPage(1); }}
          >
            {opt.label}
          </button>
        ))}
      </div> */}

      <div className="control-group" style={{ marginTop: '0' }}>
  <label>Équipe</label>
  <select 
    value={teamId} 
    onChange={e => { setTeamId(+e.target.value || ''); setPage(1); }}
  >
    <option value="">Toutes les équipes</option>
    {teams?.map((t: any) => (
      <option key={t.id} value={t.id}>{t.name}</option>
    ))}
  </select>
</div>

      {/* Liste matchs */}
      {isLoading ? ( <MatchListSkeleton count={8} /> 
      ) : (
        <>
          <div className="matches-list">
            {data?.matches.map((m: any) => {
              const badge  = statusBadge[m.status] ?? { label: m.status, color: '#64748b' };
              const isLive = ['FIRST_HALF','HALFTIME','SECOND_HALF','EXTRA_TIME'].includes(m.status);
              return (
                <div key={m.id} className={`match-row ${isLive ? 'match-live' : ''}`}>
                  <span className="match-date">
                    {m.date ? new Date(m.date).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short',
                    }) : '—'}
                  </span>

                  <div className="match-teams">
                    <div className="match-team home">
                      {m.homeTeam.logo && <img src={m.homeTeam.logo} alt="" />}
                      <span>{m.homeTeam.name}</span>
                    </div>

                    <div className="match-score">
                      {m.status === 'NOT_STARTED' ? (
                        <span className="score-time">
                          {m.date ? new Date(m.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit', minute: '2-digit',
                          }) : '—'}
                        </span>
                      ) : (
                        <span className={`score ${isLive ? 'score-live' : ''}`}>
                          {m.homeGoals ?? 0} – {m.awayGoals ?? 0}
                        </span>
                      )}
                      <span
                        className="status-badge"
                        style={{ background: badge.color + '22', color: badge.color }}
                      >
                        {isLive && m.elapsed ? `${m.elapsed}'` : badge.label}
                      </span>
                    </div>

                    <div className="match-team away">
                      {m.awayTeam.logo && <img src={m.awayTeam.logo} alt="" />}
                      <span>{m.awayTeam.name}</span>
                    </div>
                  </div>

                  {m.round && (
                    <span className="match-round">
                      {m.round.replace('Regular Season - ', 'J')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="page-btn"
              >← Préc.</button>
              <span>{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="page-btn"
              >Suiv. →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}