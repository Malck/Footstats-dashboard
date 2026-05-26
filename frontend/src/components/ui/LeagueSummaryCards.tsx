// src/components/ui/LeagueSummaryCards.tsx
import { useQuery }          from 'react-query';
import { fetchLeagueSummary } from '../../lib/api';
import { KpiSkeleton } from '../ui/SkeletonCard';


interface Props { leagueId: number; season?: number; }

export default function LeagueSummaryCards({ leagueId, season = 2024 }: Props) {
  const { data, isLoading } = useQuery(
    ['league-summary', leagueId, season],
    () => fetchLeagueSummary(leagueId, season),
    { staleTime: 5 * 60 * 1000 },
  );

  if (isLoading) return <KpiSkeleton />;

  const cards = [
    { label: 'Buts marqués',       value: data.totalGoals,            icon: '⚽', color: '#38bdf8' },
    { label: 'Moy. buts/match',    value: data.avgGoalsPerMatch,      icon: '📊', color: '#a78bfa' },
    { label: 'Matchs joués',       value: data.totalMatches,          icon: '🏟️', color: '#34d399' },
    { label: '% victoires domicile',value: `${data.homeWinPct}%`,     icon: '🏠', color: '#f59e0b' },
    { label: '% victoires extérieur',value: `${data.awayWinPct}%`,   icon: '✈️', color: '#f87171' },
    { label: '% nuls',              value: `${data.drawPct}%`,        icon: '🤝', color: '#94a3b8' },
  ];

  return (
    <div className="kpi-grid">
      {cards.map(c => (
        <div key={c.label} className="kpi-card">
          <span className="kpi-icon">{c.icon}</span>
          <div>
            <div className="kpi-value" style={{ color: c.color }}>{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </div>
        </div>
      ))}

      {data.topScorer && (
        <div className="kpi-card kpi-highlight">
          <span className="kpi-icon">🥇</span>
          <div>
            <div className="kpi-value" style={{ color: '#f59e0b' }}>{data.topScorer.goals} buts</div>
            <div className="kpi-label">Meilleur buteur</div>
            <div className="kpi-sub">{data.topScorer.name} — {data.topScorer.team}</div>
          </div>
        </div>
      )}

      {data.mostGoals && (
        <div className="kpi-card kpi-highlight">
          <span className="kpi-icon">🏆</span>
          <div>
            <div className="kpi-value" style={{ color: '#38bdf8' }}>{data.mostGoals.goals} buts</div>
            <div className="kpi-label">Attaque la + prolifique</div>
            <div className="kpi-sub">{data.mostGoals.team}</div>
          </div>
        </div>
      )}
    </div>
  );
}
