// src/lib/apiFootball.ts
// Client HTTP pour l'API API-Football (RapidAPI)
import axios from 'axios';
import 'dotenv/config';

const apiClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY!,
  },
  timeout: 10_000,
});

// ─── TYPES BRUTS API-FOOTBALL ────────────────────────────────────────────────
export interface ApiStanding {
  rank:        number;
  team:        { id: number; name: string; logo: string };
  points:      number;
  goalsDiff:   number;
  group:       string;
  form:        string;
  status:      string;
  description: string | null;
  all:         { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export interface ApiMatch {
  fixture: {
    id:     number;
    date:   string;
    status: { short: string; long: string; elapsed: number | null };
    venue:  { name: string | null };
  };
  league: { id: number; season: number; round: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

export interface ApiPlayerStat {
  player: { id: number; name: string; firstname: string; lastname: string; age: number; nationality: string; photo: string };
  statistics: Array<{
    team:    { id: number; name: string };
    games:   { appearances: number; lineups: number; minutes: number; position: string; rating: string | null };
    goals:   { total: number | null; assists: number | null };
    shots:   { total: number | null; on: number | null };
    passes:  { total: number | null; accuracy: string | null };
    tackles: { total: number | null; interceptions: number | null };
    dribbles:{ attempts: number | null; success: number | null };
    cards:   { yellow: number; red: number };
  }>;
}

// ─── MÉTHODES API ─────────────────────────────────────────────────────────────
export const footballApi = {
  // Classement d'une ligue
  getStandings: async (leagueId: number, season: number): Promise<ApiStanding[][]> => {
    const res = await apiClient.get('/standings', {
      params: { league: leagueId, season },
    });
    return res.data.response?.[0]?.league?.standings ?? [];
  },

  // Matchs d'une ligue (avec filtre optionnel)
  getMatches: async (params: {
    league:  number;
    season:  number;
    team?:   number;
    status?: string;
    from?:   string; // YYYY-MM-DD
    to?:     string;
    round?:  string;
  }): Promise<ApiMatch[]> => {
    const res = await apiClient.get('/fixtures', { params });
    return res.data.response ?? [];
  },

  // Stats d'un joueur
  getPlayerStats: async (playerId: number, season: number): Promise<ApiPlayerStat | null> => {
    const res = await apiClient.get('/players', {
      params: { id: playerId, season },
    });
    return res.data.response?.[0] ?? null;
  },

  // Top buteurs d'une ligue
  /*
  getTopScorers: async (leagueId: number, season: number): Promise<ApiPlayerStat[]> => {
    const res = await apiClient.get('/players/topscorers', {
      params: { league: leagueId, season },
    });
    return res.data.response ?? [];
  },
*/
  getTopScorers: async (leagueId: number, season: number): Promise<ApiPlayerStat[]> => {
  const res = await apiClient.get('/players/topscorers', {
    params: { league: leagueId, season },
  });
  return res.data.response ?? [];
  },

  getTopAssisters: async (leagueId: number, season: number): Promise<ApiPlayerStat[]> => {
  const res = await apiClient.get('/players/topassists', {
    params: { league: leagueId, season },
  });
  return res.data.response ?? [];
  },

  //Gardien 
  getGoalkeepers: async (leagueId: number, season: number): Promise<ApiPlayerStat[]> => {
  const res = await apiClient.get('/players', {
    params: { league: leagueId, season, position: 'Goalkeeper', page: 1 },
  });
  return res.data.response ?? [];
  },

  // Stats d'une équipe
  getTeamStats: async (leagueId: number, season: number, teamId: number) => {
    const res = await apiClient.get('/teams/statistics', {
      params: { league: leagueId, season, team: teamId },
    });
    return res.data.response ?? null;
  },

  // Infos équipe
  getTeam: async (teamId: number) => {
    const res = await apiClient.get('/teams', { params: { id: teamId } });
    return res.data.response?.[0] ?? null;
  },
};
