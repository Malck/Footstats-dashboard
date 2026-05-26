// src/components/charts/GoalsByHourChart.tsx
import { useQuery }        from 'react-query';
import { fetchGoalsByHour } from '../../lib/api';
import { ChartSkeleton } from '../ui/SkeletonCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Props { leagueId: number; season?: number; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      <p style={{ color: '#94a3b8' }}>Minute {label}</p>
      <p style={{ color: '#38bdf8', fontWeight: 700 }}>{payload[0].value} buts</p>
      <p style={{ color: '#64748b' }}>{payload[0].payload.pct}% des buts</p>
    </div>
  );
};

export default function GoalsByHourChart({ leagueId, season = 2024 }: Props) {
  const { data, isLoading, error } = useQuery(
    ['goals-by-hour', leagueId, season],
    () => fetchGoalsByHour(leagueId, season),
    { staleTime: 10 * 60 * 1000 },
  );

  if (isLoading) return <ChartSkeleton />;
  if (error || !data || (Array.isArray(data) && !data.length)) {
  return (
    <div className="empty-state">
      Aucune donnée disponible
    </div>
  );
}

  // Colorer les tranches — plus c'est tard, plus c'est chaud
  const getColor = (index: number) => {
    const colors = ['#1e40af','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#38bdf8'];
    return colors[index] ?? '#38bdf8';
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Buts par tranche de 15 minutes</h3>
        <span className="chart-sub">Saison {season}/{season + 1}</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="minute" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56,189,248,0.06)' }} />
          <Bar dataKey="goals" radius={[4, 4, 0, 0]}>
            {data.map((_: any, i: number) => (
              <Cell key={i} fill={getColor(i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
