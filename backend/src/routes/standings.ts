// src/routes/standings.ts
import { Router } from 'express';
import { getStandings, syncStandings } from '../controllers/standingsController';

const router = Router();

/**
 * @swagger
 * /api/standings/{leagueId}:
 *   get:
 *     summary: Classement d'une ligue
 *     description: Retourne le classement complet d'une ligue pour une saison donnée, depuis la base PostgreSQL locale.
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "ID de la ligue (ex: 61 = Ligue 1, 39 = Premier League, 2 = Champions League)"
 *         example: 61
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         description: "Année de la saison (défaut: 2024)"
 *         example: 2024
 *     responses:
 *       200:
 *         description: Classement récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 league:
 *                   type: object
 *                   properties:
 *                     id:      { type: integer, example: 61 }
 *                     name:    { type: string,  example: "Ligue 1" }
 *                     country: { type: string,  example: "France" }
 *                     season:  { type: integer, example: 2024 }
 *                 standings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Standing'
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Ligue introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:leagueId', getStandings);

/**
 * @swagger
 * /api/standings/{leagueId}/sync:
 *   post:
 *     summary: Synchroniser le classement depuis API-Football
 *     description: Appelle l'API externe, met à jour PostgreSQL et retourne les données fraîches. À utiliser pour rafraîchir les données manuellement ou via un cron job.
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 61
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         example: 2024
 *     responses:
 *       200:
 *         description: Synchronisation réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:  { type: integer, example: 18 }
 *                 message: { type: string,  example: "18 standings updated for Ligue 1 2024" }
 *       500:
 *         description: Erreur API externe ou base de données
 */
router.post('/:leagueId/sync', syncStandings);

export default router;
