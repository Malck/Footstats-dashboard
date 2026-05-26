// src/pages/ComparePage.tsx
import { useState }       from 'react';
import { useQuery }       from 'react-query';
import { fetchTeams }     from '../lib/api';
import CompareRadarChart  from '../components/charts/CompareRadarChart';

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

export default function ComparePage() {
  const [leagueId, setLeagueId] = useState(61);
  const [season,   setSeason]   = useState(2024);
  const [team1,    setTeam1]    = useState<number | ''>('');
  const [team2,    setTeam2]    = useState<number | ''>('');

  const { data: teams } = useQuery(
    ['teams', leagueId],
    () => fetchTeams(leagueId),
    { staleTime: 30 * 60 * 1000 },
  );

  // Reset équipes quand on change de ligue
  const handleLeagueChange = (id: number) => {
    setLeagueId(id);
    setTeam1('');
    setTeam2('');
  };

  return (
    <div className="page compare-page">
      <div className="page-header">
        <h1>Comparaison d'équipes</h1>
        <p>Sélectionnez une ligue, une saison et deux équipes</p>
      </div>

      {/* Filtres ligue + saison */}
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
          <select value={season} onChange={e => { setSeason(+e.target.value); setTeam1(''); setTeam2(''); }}>
            {SEASONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sélecteurs équipes */}
      <div className="compare-selectors">
        <div className="selector-group">
          <label>Équipe 1</label>
          <select value={team1} onChange={e => setTeam1(+e.target.value || '')}>
            <option value="">-- Choisir une équipe --</option>
            {teams?.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="vs-divider">VS</div>

        <div className="selector-group">
          <label>Équipe 2</label>
          <select value={team2} onChange={e => setTeam2(+e.target.value || '')}>
            <option value="">-- Choisir une équipe --</option>
            {teams?.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {team1 && team2 && team1 !== team2 ? (
        <CompareRadarChart team1Id={+team1} team2Id={+team2} season={season} />
      ) : (
        <div className="empty-state large">
          ⚽ Sélectionnez deux équipes différentes pour lancer la comparaison
        </div>
      )}
    </div>
  );
}