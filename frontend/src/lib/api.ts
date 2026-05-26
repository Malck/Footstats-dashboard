// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});
// ─── STANDINGS ────────────────────────────────────────────────────────────────
export const fetchStandings = (leagueId: number, season = 2024) =>
  api.get(`/standings/${leagueId}`, { params: { season } }).then(r => r.data);

// ─── MATCHES ──────────────────────────────────────────────────────────────────
export const fetchMatches = (params: {
  leagueId: number;
  season?:  number;
  status?:  string;
  teamId?:  number;
  limit?:   number;
  page?:    number;
}) => api.get('/matches', { params }).then(r => r.data);

// ─── STATS ────────────────────────────────────────────────────────────────────
export const fetchLeagueSummary = (leagueId: number, season = 2024) =>
  api.get(`/stats/league/${leagueId}/summary`, { params: { season } }).then(r => r.data);

export const fetchTeamForm = (teamId: number, season = 2024, last = 10, leagueId = 61) =>
  api.get(`/stats/team/${teamId}/form`, { params: { season, last, leagueId } }).then(r => r.data);

export const fetchTopScorers = (leagueId: number, season = 2024, limit = 10) =>
  api.get(`/stats/league/${leagueId}/top-scorers`, { params: { season, limit } }).then(r => r.data);

export const fetchGoalsByHour = (leagueId: number, season = 2024) =>
  api.get(`/stats/league/${leagueId}/goals-by-hour`, { params: { season } }).then(r => r.data);

export const fetchCompareTeams = (team1: number, team2: number, season = 2024) =>
  api.get('/stats/compare', { params: { team1, team2, season } }).then(r => r.data);

// ─── TEAMS ────────────────────────────────────────────────────────────────────
export const fetchTeams = (leagueId: number) =>
  api.get('/teams', { params: { leagueId } }).then(r => r.data);

export const fetchTeam = (id: number, season = 2024, leagueId = 61) =>
  api.get(`/teams/${id}`, { params: { season, leagueId } }).then(r => r.data);

// ─── PLAYERS ──────────────────────────────────────────────────────────────────
export const fetchPlayer = (id: number, season = 2024) =>
  api.get(`/players/${id}`, { params: { season } }).then(r => r.data);

export const fetchTopAssisters = (leagueId: number, season = 2024, limit = 10) =>
  api.get(`/stats/league/${leagueId}/top-assisters`, { params: { season, limit } }).then(r => r.data);

export const fetchTopKeepers = (leagueId: number, season = 2024, limit = 5) =>
  api.get(`/stats/league/${leagueId}/top-keepers`, { params: { season, limit } }).then(r => r.data);