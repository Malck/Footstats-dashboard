// src/pages/DashboardPage.tsx
import { useState }          from 'react';
import LeagueSummaryCards    from '../components/ui/LeagueSummaryCards';
import StandingsTable        from '../components/ui/StandingsTable';
import TopScorersChart       from '../components/charts/TopScorersChart';
import TopAssistersChart     from '../components/charts/TopAssistersChart';
import TopKeepersChart       from '../components/charts/TopKeepersChart';
import GoalsByHourChart      from '../components/charts/GoalsByHourChart';
import TeamFormChart         from '../components/charts/TeamFormChart';
import { useNavigate }       from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

// Ligues disponibles
const LEAGUES = [
  { id: 61,  name: 'Ligue 1',        flag: '🇫🇷' },
  { id: 39,  name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 140, name: 'La Liga',        flag: '🇪🇸' },
  { id: 2,   name: 'Champions League', flag: '🏆' },
];

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leagueId, setLeagueId] = useState(
  parseInt(searchParams.get('leagueId') ?? '61')
);
const [season, setSeason] = useState(
  parseInt(searchParams.get('season') ?? '2024')
);
  const [focusTeam, setFocusTeam]   = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="page dashboard-page">

      {/* Filtres */}
      <div className="page-controls">
        <div className="control-group">
          <div className="league-tabs">
            {LEAGUES.map(l => (
              <button
                key={l.id}
                className={`league-tab ${leagueId === l.id ? 'active' : ''}`}
                onClick={() => { 
  setLeagueId(l.id); 
  setFocusTeam(null);
  setSearchParams({ leagueId: String(l.id), season: String(season) });
}}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <label>Saison</label>
          <select value={season} onChange={e => {
  setSeason(+e.target.value);
  setSearchParams({ leagueId: String(leagueId), season: e.target.value });
}}>
            <option value={2024}>2024/2025</option>
            <option value={2023}>2023/2024</option>
            <option value={2022}>2022/2023</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <section className="dashboard-section">
        <h2 className="section-title">Vue d'ensemble</h2>
        <LeagueSummaryCards leagueId={leagueId} season={season} />
      </section>
     {leagueId === 2 && (
  <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '.5rem 0' }}>
    <button
      className="btn-secondary"
      onClick={() => navigate('/champions-league')}
    >
      🏆 Voir le tableau & brackets complets →
    </button>
  </div>
)}

      {/* Grille principale */}
      <div className="dashboard-grid">

        {/* Classement */}
        <section className="dashboard-section col-span-2">
          <h2 className="section-title">Classement</h2>
          <StandingsTable
            leagueId={leagueId}
            season={season}
            onSelectTeam={id => setFocusTeam(id)}
          />
        </section>

        {/* Forme équipe + Goals by hour — même colonne */}
<section className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
  <div>
    <h2 className="section-title">
      {focusTeam ? 'Forme de l\'équipe' : 'Sélectionnez une équipe'}
    </h2>
    {focusTeam ? (
      <>
        <TeamFormChart teamId={focusTeam} season={season} last={10} leagueId={leagueId} />
        <button
          className="btn-secondary"
          onClick={() => navigate(`/team/${focusTeam}?season=${season}&leagueId=${leagueId}`)}
        >
          Voir la fiche complète →
        </button>
      </>
    ) : (
      <div className="empty-state">
        👆 Cliquez sur une équipe dans le classement pour voir sa forme
      </div>
    )}
  </div>

  <GoalsByHourChart leagueId={leagueId} season={season} />
</section>

{/* Top buteurs */}
<section className="dashboard-section col-span-2">
  <TopScorersChart leagueId={leagueId} season={season} limit={10} />
</section>

        <section className="dashboard-section col-span-2">
          <TopAssistersChart leagueId={leagueId} season={season} limit={10} />
          </section>


      </div>
    </div>
  );
}
