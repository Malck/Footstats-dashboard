// src/routes/teams.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Liste des équipes d'une ligue
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         required: true
 *         schema: { type: integer }
 *         example: 61
 *     responses:
 *       200:
 *         description: Liste des équipes
 */
router.get('/', async (req, res, next) => {
  try {
    const leagueId = parseInt(req.query.leagueId as string);
    if (isNaN(leagueId)) throw new AppError('leagueId is required', 400);
    const teams = await prisma.team.findMany({
      where:   { leagueId },
      orderBy: { name: 'asc' },
      select:  { id: true, name: true, shortName: true, logo: true, founded: true },
    });
    res.json(teams);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Détail d'une équipe avec ses stats
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 85
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *         example: 2024
 *     responses:
 *       200:
 *         description: Équipe avec statistiques
 *       404:
 *         description: Équipe introuvable
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id       = parseInt(req.params.id);
    const season   = parseInt(req.query.season as string) || 2024;
    const leagueId = parseInt(req.query.leagueId as string) || 61;
    if (isNaN(id)) throw new AppError('Invalid id', 400);

    const team = await prisma.team.findUnique({
  where:   { id },
  include: {
    stats:     { where: { season } },
    standings: { where: { leagueSeason: season, leagueId } },
  },
});
    if (!team) throw new AppError(`Team ${id} not found`, 404);

    // Joueurs depuis PlayerStat pour la bonne saison ET la bonne ligue
    const playerStats = await prisma.playerStat.findMany({
      where: {
        teamId:   id,
        season,
        leagueId,
      },
      include: {
        player: {
          select: { id: true, name: true, position: true, photo: true },
        },
      },
      orderBy: { goals: 'desc' },
    });

    const players = playerStats.map(ps => ({
      id:       ps.player.id,
      name:     ps.player.name,
      position: ps.player.position,
      photo:    ps.player.photo,
      goals:    ps.goals,
      assists:  ps.assists,
      rating:   ps.rating,
    }));

    res.json({ ...team, players });
  } catch (err) { next(err); }
});

export default router;
