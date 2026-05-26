// src/components/ui/StandingsTable.tsx
import { useQuery } from 'react-query';
import { fetchStandings } from '../../lib/api';
import { StandingsSkeleton } from '../ui/SkeletonCard';

interface Props {
  leagueId: number;
  season?:  number;
  onSelectTeam?: (teamId: number) => void;
}

export default function StandingsTable({ leagueId, season = 2024, onSelectTeam }: Props) {
  const { data, isLoading, error } = useQuery(
    ['standings', leagueId, season],
    () => fetchStandings(leagueId, season),
    { staleTime: 5 * 60 * 1000 },
  );

  if (isLoading) return <StandingsSkeleton />;
  if (error || !data || (Array.isArray(data) && !data.length)) {
  return (
    <div className="empty-state">
      Aucune donnée disponible
    </div>
  );
}

  const { standings, league } = data;

  const formColor = (r: string) => {
    if (r === 'W') return 'form-w';
    if (r === 'D') return 'form-d';
    return 'form-l';
  };

  return (
    <div className="standings-wrap">
      <div className="standings-header">
        {league.logo && <img src={league.logo} alt={league.name} className="league-logo" />}
        <h2>{league.name} <span>{season}/{season + 1}</span></h2>
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
              <th title="Différence de buts">+/-</th>
              <th title="Points" className="pts-col">Pts</th>
              <th title="Forme récente">Forme</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s: any) => (
              <tr
                key={s.team.id}
                className={onSelectTeam ? 'clickable' : ''}
                onClick={() => onSelectTeam?.(s.team.id)}
              >
                <td className="rank">{s.rank}</td>
                <td className="team-cell-td">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
