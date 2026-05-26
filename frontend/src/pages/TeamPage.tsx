// src/pages/TeamPage.tsx
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery }               from 'react-query';
import { fetchTeam }              from '../lib/api';
import TeamFormChart              from '../components/charts/TeamFormChart';
import { StandingsSkeleton, ChartSkeleton, KpiSkeleton } from '../components/ui/SkeletonCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function TeamPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const teamId    = parseInt(id ?? '0');
 const [searchParams] = useSearchParams();
const season   = parseInt(searchParams.get('season')   ?? '2024');
const leagueId = parseInt(searchParams.get('leagueId') ?? '61');

const { data, isLoading, error } = useQuery(
  ['team', teamId, season, leagueId],
  () => fetchTeam(teamId, season, leagueId),
  { staleTime: 5 * 60 * 1000, enabled: !!teamId },
);

  if (isLoading) return (
  <div className="page team-page">
    <div style={{ height: 32, width: 80, borderRadius: 6 }} className="skeleton" />
    <div style={{ height: 100, borderRadius: 10 }} className="skeleton" />
    <KpiSkeleton />
    <div className="team-charts-grid">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);

if (error) return <div className="error">.....</div>;

  const standing = data.standings?.[0];
  const stats    = data.stats?.[0];

  // Données pour graphique attaque/défense
  const attackDefenseData = standing ? [
    { name: 'Domicile', buts_pour: Math.round(standing.goalsFor * 0.58),   buts_contre: Math.round(standing.goalsAgainst * 0.42) },
    { name: 'Extérieur', buts_pour: Math.round(standing.goalsFor * 0.42),  buts_contre: Math.round(standing.goalsAgainst * 0.58) },
  ] : [];

  return (
    <div className="page team-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>

      {/* Header équipe */}
      <div className="team-header">
        {data.logo && <img src={data.logo} alt={data.name} className="team-logo-xl" />}
        <div>
          <h1>{data.name}</h1>
          {data.founded && <span className="team-meta">Fondé en {data.founded}</span>}
          {data.country && <span className="team-meta">{data.country}</span>}
        </div>
        {standing && (
          <div className="team-standing-badge">
            <span className="standing-rank">#{standing.rank}</span>
            <span className="standing-pts">{standing.points} pts</span>
          </div>
        )}
      </div>

      {/* KPIs rapides */}
      {standing && (
        <div className="team-kpi-row">
          {[
            { label: 'Matchs',    value: standing.played },
            { label: 'Victoires', value: standing.won,   color: '#22c55e' },
            { label: 'Nuls',      value: standing.drawn, color: '#f59e0b' },
            { label: 'Défaites',  value: standing.lost,  color: '#ef4444' },
            { label: 'Buts pour', value: standing.goalsFor,     color: '#38bdf8' },
            { label: 'Buts contre',value: standing.goalsAgainst,color: '#f87171' },
            { label: 'Diff.',     value: standing.goalDiff > 0 ? `+${standing.goalDiff}` : standing.goalDiff },
          ].map(k => (
            <div key={k.label} className="team-kpi">
              <span className="team-kpi-val" style={k.color ? { color: k.color } : {}}>{k.value}</span>
              <span className="team-kpi-lbl">{k.label}</span>
            </div>
          ))}
          {stats && (
            <div className="team-kpi">
              <span className="team-kpi-val" style={{ color: '#34d399' }}>{stats.cleanSheets}</span>
              <span className="team-kpi-lbl">Clean sheets</span>
            </div>
          )}
        </div>
      )}

      {/* Grille graphiques */}
      <div className="team-charts-grid">
        <div className="chart-col">
          <TeamFormChart teamId={teamId} season={season} last={10} leagueId={leagueId} />
        </div>

        <div className="chart-col">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Attaque & Défense</h3>
              <span className="chart-sub">Domicile vs Extérieur</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attackDefenseData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="buts_pour"   name="Buts marqués"  fill="#38bdf8" radius={[4,4,0,0]} />
                <Bar dataKey="buts_contre" name="Buts encaissés" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Effectif */}
      {data.players?.length > 0 && (
  <section className="team-section">
    <h2>Joueurs du top 20<span style={{fontSize:'.75rem', color:'var(--muted)', fontWeight:400}}>— top scorers & passeurs</span></h2>
    <div className="players-grid">
      {(['Attacker', 'Midfielder', 'Defender', 'Goalkeeper'] as const).map(pos => {
        const posPlayers = data.players.filter((p: any) => p.position === pos);
        if (!posPlayers.length) return null;
        const posLabel: Record<string, string> = {
          Goalkeeper: '🧤 Gardiens',
          Defender:   '🛡️ Défenseurs',
          Midfielder: '⚙️ Milieux',
          Attacker:   '⚡ Attaquants',
        };
        return (
          <div key={pos} className="position-group">
            <h4 className="position-label">{posLabel[pos]}</h4>
            <div className="player-cards">
              {posPlayers.map((p: any) => (
                <div key={p.id} className="player-card">
                  {p.photo && <img src={p.photo} alt={p.name} className="player-thumb" />}
                  <div>
                    <span className="player-name">{p.name}</span>
                    <div style={{display:'flex', gap:'.6rem', fontSize:'.7rem', color:'var(--muted)', marginTop:'.15rem'}}>
                      {p.goals > 0 && <span>⚽ {p.goals}</span>}
                      {p.assists > 0 && <span>🎯 {p.assists}</span>}
                      {p.rating && <span>⭐ {p.rating}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </section>
)}
    </div>
  );
}
