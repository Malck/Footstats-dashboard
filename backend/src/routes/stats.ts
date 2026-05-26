// src/routes/stats.ts
import { Router } from 'express';
import {
  getLeagueSummary,
  getTeamForm,
  getTopScorers,
  getTopAssisters,
  getTopKeepers,
  getGoalsByHour,
  compareTeams,
} from '../controllers/statsController';

const router = Router();

/**
 * @swagger
 * /api/stats/league/{leagueId}/summary:
 *   get:
 *     summary: Résumé statistique d'une ligue
 *     description: >
 *       Données agrégées côté serveur — total de buts, moyenne par match,
 *       équipe la plus performante, résultats globaux (victoires/nuls/défaites).
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *     responses:
 *       200:
 *         description: Résumé statistique
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalGoals:       { type: integer, example: 892 }
 *                 avgGoalsPerMatch: { type: number,  example: 2.7 }
 *                 totalMatches:     { type: integer, example: 330 }
 *                 homeWinPct:       { type: number,  example: 44.2 }
 *                 drawPct:          { type: number,  example: 25.1 }
 *                 awayWinPct:       { type: number,  example: 30.7 }
 *                 topScorer:
 *                   type: object
 *                   properties:
 *                     name:  { type: string, example: "Ousmane Dembélé" }
 *                     goals: { type: integer, example: 22 }
 *                     team:  { type: string, example: "Paris Saint-Germain" }
 *                 mostGoals:
 *                   type: object
 *                   properties:
 *                     team:  { type: string, example: "Paris Saint-Germain" }
 *                     goals: { type: integer, example: 87 }
 */
router.get('/league/:leagueId/summary', getLeagueSummary);

/**
 * @swagger
 * /api/stats/team/{teamId}/form:
 *   get:
 *     summary: Forme récente d'une équipe
 *     description: >
 *       Résultats des N derniers matchs avec évolution des points cumulés.
 *       Parfait pour un graphique en courbe de forme sur la saison.
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: integer }
 *         example: 85
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: last
 *         schema: { type: integer, default: 10 }
 *         description: Nombre de derniers matchs à retourner
 *     responses:
 *       200:
 *         description: Forme de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:   { type: integer }
 *                 teamName: { type: string }
 *                 form:     { type: string, example: "WWDLW" }
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:       { type: string, format: date }
 *                       opponent:   { type: string }
 *                       result:     { type: string, enum: [W, D, L] }
 *                       goalsFor:   { type: integer }
 *                       goalsAgainst: { type: integer }
 *                       isHome:     { type: boolean }
 *                       cumulPoints: { type: integer }
 */
router.get('/team/:teamId/form', getTeamForm);

/**
 * @swagger
 * /api/stats/league/{leagueId}/top-scorers:
 *   get:
 *     summary: Top buteurs d'une ligue
 *     description: Classement des meilleurs buteurs et passeurs décisifs de la saison.
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Top buteurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerStats'
 */
router.get('/league/:leagueId/top-scorers', getTopScorers);

/**
 * @swagger
 * /api/stats/league/{leagueId}/top-assisters:
 *   get:
 *     summary: Top passeurs d'une ligue
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Top passeurs
 */
router.get('/league/:leagueId/top-assisters', getTopAssisters);

/**
 * @swagger
 * /api/stats/league/{leagueId}/top-keepers:
 *   get:
 *     summary: Top gardiens (saves, buts encaissés, rating)
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200:
 *         description: Top gardiens
 */
router.get('/league/:leagueId/top-keepers', getTopKeepers);

/**
 * @swagger
 * /api/stats/league/{leagueId}/goals-by-hour:
 *   get:
 *     summary: Répartition des buts par tranche horaire
 *     description: >
 *       Nombre de buts marqués par tranche de 15 minutes (0-15, 15-30, 30-45, etc.).
 *       Idéal pour un graphique en barres — heatmap temporelle.
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *     responses:
 *       200:
 *         description: Buts par tranche horaire
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   minute: { type: string, example: "0-15" }
 *                   goals:  { type: integer, example: 87 }
 *                   pct:    { type: number,  example: 9.8 }
 */
router.get('/league/:leagueId/goals-by-hour', getGoalsByHour);

/**
 * @swagger
 * /api/stats/compare:
 *   get:
 *     summary: Comparaison de deux équipes
 *     description: >
 *       Stats côte à côte de deux équipes pour la saison en cours.
 *       Retourne les données formatées pour un graphique radar.
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: team1
 *         required: true
 *         schema: { type: integer }
 *         example: 85
 *       - in: query
 *         name: team2
 *         required: true
 *         schema: { type: integer }
 *         example: 80
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *     responses:
 *       200:
 *         description: Comparaison des deux équipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team1: { $ref: '#/components/schemas/TeamStats' }
 *                 team2: { $ref: '#/components/schemas/TeamStats' }
 *                 radar:
 *                   type: array
 *                   description: Données formatées pour Recharts RadarChart
 *                   items:
 *                     type: object
 *                     properties:
 *                       stat:  { type: string, example: "Buts marqués" }
 *                       team1: { type: number }
 *                       team2: { type: number }
 */
router.get('/compare', compareTeams);

export default router;
