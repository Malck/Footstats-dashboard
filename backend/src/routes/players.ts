// src/routes/players.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Détail d'un joueur avec ses statistiques
 *     description: Retourne le profil du joueur et toutes ses stats pour la saison.
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *     responses:
 *       200:
 *         description: Joueur avec stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerStats'
 *       404:
 *         description: Joueur introuvable
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id     = parseInt(req.params.id);
    const season = parseInt(req.query.season as string) || 2024;
    if (isNaN(id)) throw new AppError('Invalid player id', 400);

    const player = await prisma.player.findUnique({
      where:   { id },
      include: {
        team:  { select: { id: true, name: true, logo: true } },
        stats: { where: { season } },
      },
    });
    if (!player) throw new AppError(`Player ${id} not found`, 404);
    res.json(player);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Liste des joueurs d'une équipe
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [Goalkeeper, Defender, Midfielder, Attacker]
 *     responses:
 *       200:
 *         description: Liste des joueurs
 */
router.get('/', async (req, res, next) => {
  try {
    const teamId   = parseInt(req.query.teamId as string);
    const season   = parseInt(req.query.season as string) || 2024;
    const position = req.query.position as string | undefined;
    if (isNaN(teamId)) throw new AppError('teamId is required', 400);

    const players = await prisma.player.findMany({
      where: {
        teamId,
        ...(position && { position }),
      },
      include: { stats: { where: { season } } },
      orderBy: { name: 'asc' },
    });
    res.json(players);
  } catch (err) { next(err); }
});

export default router;
