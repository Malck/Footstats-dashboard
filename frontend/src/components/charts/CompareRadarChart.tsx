// src/components/charts/CompareRadarChart.tsx
import { useQuery }          from 'react-query';
import { fetchCompareTeams } from '../../lib/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

interface Props {
  team1Id: number;
  team2Id: number;
  season?: number;
}

export default function CompareRadarChart({ team1Id, team2Id, season = 2024 }: Props) {
  const { data, isLoading, error } = useQuery(
    ['compare', team1Id, team2Id, season],
    () => fetchCompareTeams(team1Id, team2Id, season),
    { staleTime: 5 * 60 * 1000, enabled: team1Id !== team2Id },
  );

  if (isLoading) return <div className="loading">Calcul de la comparaison...</div>;
  if (error)     return <div className="error">Erreur de chargement</div>;
  if (!data)     return null;

  const { team1, team2, radar } = data;
  const t1Name = team1.name;
  const t2Name = team2.name;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="compare-teams-header">
          <div className="compare-team">
            {team1.logo && <img src={team1.logo} alt={t1Name} />}
            <span style={{ color: '#38bdf8' }}>{t1Name}</span>
          </div>
          <span className="vs-badge">VS</span>
          <div className="compare-team">
            {team2.logo && <img src={team2.logo} alt={t2Name} />}
            <span style={{ color: '#a78bfa' }}>{t2Name}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={radar} margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          {/* Axe radial caché — chaque stat a son propre fullMark */}
          <PolarRadiusAxis
  angle={90}
  domain={[0, 100]}
  tick={false}
  axisLine={false}
/>
          <Radar
            name={t1Name}
            dataKey={t1Name}
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name={t2Name}
            dataKey={t2Name}
            stroke="#a78bfa"
            fill="#a78bfa"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
          <Tooltip
  content={({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0]?.payload;
    const isDefense = label === 'Défense';
    return (
      <div style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 8, padding: '8px 12px', fontSize: 13,
      }}>
        <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.stroke, margin: '2px 0' }}>
            {p.name} : <strong>
              {isDefense
                ? `${i === 0 ? entry._raw1 : entry._raw2} buts encaissés`
                : i === 0 ? entry._raw1 : entry._raw2
              }
            </strong>
          </p>
        ))}
      </div>
    );
  }}
/>
        </RadarChart>
      </ResponsiveContainer>

      {/* Stats brutes sous le radar */}
      <div className="compare-stats-grid">
        {[
          { label: 'Points',          t1: team1.points,       t2: team2.points },
          { label: 'Buts marqués',    t1: team1.goalsFor,     t2: team2.goalsFor },
          { label: 'Buts encaissés',  t1: team1.goalsAgainst, t2: team2.goalsAgainst, invert: true },
          { label: 'Victoires',       t1: team1.wins,         t2: team2.wins },
          { label: 'Clean sheets',    t1: team1.cleanSheets,  t2: team2.cleanSheets },
          { label: 'Moy. buts/match', t1: team1.avgGoalsFor,  t2: team2.avgGoalsFor },
        ].map(stat => {
          const t1Wins = stat.invert ? stat.t1 < stat.t2 : stat.t1 > stat.t2;
          const t2Wins = stat.invert ? stat.t2 < stat.t1 : stat.t2 > stat.t1;
          return (
            <div key={stat.label} className="compare-stat-row">
              <span className={`stat-val ${t1Wins ? 'winner' : ''}`} style={{ color: '#38bdf8' }}>
                {stat.t1}
              </span>
              <span className="stat-label">{stat.label}</span>
              <span className={`stat-val ${t2Wins ? 'winner' : ''}`} style={{ color: '#a78bfa' }}>
                {stat.t2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}