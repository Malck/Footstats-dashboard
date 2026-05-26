import { useQuery }        from 'react-query';
import { fetchTopKeepers } from '../../lib/api';

interface Props { leagueId: number; season?: number; }

export default function TopKeepersChart({ leagueId, season = 2024 }: Props) {
  const { data, isLoading, error } = useQuery(
    ['top-keepers', leagueId, season],
    () => fetchTopKeepers(leagueId, season),
    { staleTime: 10 * 60 * 1000 },
  );

  if (isLoading) return <div className="loading">Chargement des gardiens...</div>;
  if (error)     return <div className="error">Erreur de chargement</div>;
  if (!data?.length) return <div className="empty-state">Aucune donnée disponible</div>;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>🧤 Top Gardiens</h3>
        <span className="chart-sub">Classement par arrêts — Saison {season}/{season + 1}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
        {data.map((k: any, i: number) => (
          <div key={k.playerId} style={{
            display: 'grid',
            gridTemplateColumns: '32px 36px 20px 1fr auto auto auto',
            alignItems: 'center', gap: '.8rem',
            padding: '.7rem 1rem',
            background: 'var(--bg)',
            border: `1px solid ${i === 0 ? 'rgba(245,158,11,.3)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{
              fontWeight: 800, fontSize: '1rem', textAlign: 'center',
              color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--muted)',
            }}>#{i + 1}</span>

            {k.photo
              ? <img src={k.photo} alt={k.playerName}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)' }} />
            }

            {k.team?.logo
              ? <img src={k.team.logo} alt={k.team.name}
                  style={{ width: 20, height: 20, objectFit: 'contain' }} />
              : <div style={{ width: 20 }} />
            }

            <div>
              <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{k.playerName}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{k.team?.name} · {k.appearances} matchs</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1rem' }}>{k.saves}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>arrêts</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '.95rem' }}>{k.goalsConceded}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>encaissés</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '.95rem' }}>
                {k.rating ? k.rating.toFixed(2) : '—'}
              </div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>rating</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}