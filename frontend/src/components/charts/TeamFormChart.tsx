// src/components/charts/TeamFormChart.tsx
import { useQuery }         from 'react-query';
import { fetchTeamForm }    from '../../lib/api';
import { ChartSkeleton } from '../ui/SkeletonCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

interface Props {
  teamId:   number;
  season?:  number;
  last?:    number;
  leagueId?: number;
}

const resultColor = { W: '#22c55e', D: '#f59e0b', L: '#ef4444' };

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = resultColor[payload.result as 'W' | 'D' | 'L'] ?? '#6b7280';
  return <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{d.date}</p>
      <p style={{ color: '#f1f5f9', fontWeight: 600 }}>
        {d.isHome ? 'vs' : '@'} {d.opponent}
      </p>
      <p style={{ color: resultColor[d.result as 'W' | 'D' | 'L'], fontWeight: 700, fontSize: 15 }}>
        {d.result} — {d.goalsFor}-{d.goalsAgainst}
      </p>
      <p style={{ color: '#94a3b8' }}>Points cumulés : <strong style={{ color: '#38bdf8' }}>{d.cumulPoints}</strong></p>
    </div>
  );
};

export default function TeamFormChart({ teamId, season = 2024, last = 10, leagueId = 61 }: Props) {
  const { data, isLoading, error } = useQuery(
    ['team-form', teamId, season, last, leagueId],
    () => fetchTeamForm(teamId, season, last, leagueId),
    { staleTime: 5 * 60 * 1000 },
  );

  if (isLoading) return <ChartSkeleton />;
  if (error)     return <div className="error">Erreur de chargement</div>;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Forme — {data.teamName}</h3>
        <span className="form-string">{data.form}</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data.matches} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={v => v.slice(5)} // MM-DD
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#334155" />
          <Line
            type="monotone"
            dataKey="cumulPoints"
            stroke="#38bdf8"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
            name="Points cumulés"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Légende résultats */}
      <div className="form-legend">
        {Object.entries(resultColor).map(([r, c]) => (
          <span key={r} style={{ color: c }}>
            <span className="legend-dot" style={{ background: c }}></span>
            {r === 'W' ? 'Victoire' : r === 'D' ? 'Nul' : 'Défaite'}
          </span>
        ))}
      </div>
    </div>
  );
}
