// src/routes/matches.ts
import { Router } from 'express';
import { getMatches, getMatchById, syncMatches } from '../controllers/matchesController';

const router = Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Liste des matchs
 *     description: Retourne les matchs filtrés par ligue, saison, statut ou équipe.
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [FINISHED, NOT_STARTED, FIRST_HALF, HALFTIME, SECOND_HALF]
 *         description: Filtrer par statut du match
 *       - in: query
 *         name: teamId
 *         schema: { type: integer }
 *         description: Filtrer par équipe (domicile ou extérieur)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Liste de matchs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:   { type: integer }
 *                 page:    { type: integer }
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 */
router.get('/', getMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Détail d'un match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détail du match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match introuvable
 */
router.get('/:id', getMatchById);

/**
 * @swagger
 * /api/matches/sync:
 *   post:
 *     summary: Synchroniser les matchs depuis API-Football
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leagueId, season]
 *             properties:
 *               leagueId: { type: integer, example: 61 }
 *               season:   { type: integer, example: 2024 }
 *               from:     { type: string, example: "2024-08-01" }
 *               to:       { type: string, example: "2025-05-31" }
 *     responses:
 *       200:
 *         description: Synchronisation réussie
 */
router.post('/sync', syncMatches);

export default router;
