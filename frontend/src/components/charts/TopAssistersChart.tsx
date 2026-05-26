import { useQuery }          from 'react-query';
import { fetchTopAssisters } from '../../lib/api';
import { PlayerListSkeleton } from '../ui/SkeletonCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface Props { leagueId: number; season?: number; limit?: number; }

export default function TopAssistersChart({ leagueId, season = 2024, limit = 10 }: Props) {
  const { data, isLoading, error } = useQuery(
    ['top-assisters', leagueId, season, limit],
    () => fetchTopAssisters(leagueId, season, limit),
    { staleTime: 10 * 60 * 1000 },
  );

  if (isLoading) return <PlayerListSkeleton count={10} />;
  if (error)     return <div className="error">Erreur de chargement</div>;
  if (!data?.length) return <div className="empty-state">Aucune donnée disponible</div>;

  const chartData = data.map((p: any) => ({
    name:    p.playerName.split(' ').pop(),
    full:    p.playerName,
    team:    p.team?.name ?? '',
    assists: p.assists,
    goals:   p.goals,
  }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>🎯 Top Passeurs</h3>
        <span className="chart-sub">Saison {season}/{season + 1}</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(value: number, name: string) => [value, name === 'assists' ? 'Passes déc.' : 'Buts']}
            labelFormatter={(_: any, payload: any) => payload?.[0]?.payload.full ?? ''}
          />
          <Bar dataKey="assists" radius={[0, 4, 4, 0]} name="assists">
            <LabelList dataKey="assists" position="right"
              style={{ fill: '#a78bfa', fontSize: 12, fontWeight: 700 }} />
            {chartData.map((_: any, i: number) => (
              <Cell key={i}
                fill={i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#a78bfa'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="podium">
        {data.slice(0, 3).map((p: any, i: number) => (
          <div key={p.playerId} className={`podium-item rank-${i + 1}`}>
            {p.photo && <img src={p.photo} alt={p.playerName} className="player-photo" />}
            <span className="podium-rank">#{i + 1}</span>
            <span className="podium-name">{p.playerName}</span>
            <span className="podium-team">{p.team?.name}</span>
            <span className="podium-goals">{p.assists} 🎯</span>
          </div>
        ))}
      </div>
    </div>
  );
}