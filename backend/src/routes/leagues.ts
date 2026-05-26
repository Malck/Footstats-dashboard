// src/routes/leagues.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: Liste des ligues disponibles en base
 *     tags: [Leagues]
 *     responses:
 *       200:
 *         description: Ligues disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League'
 */
router.get('/', async (_req, res, next) => {
  try {
    const leagues = await prisma.league.findMany({ orderBy: { name: 'asc' } });
    res.json(leagues);
  } catch (err) { next(err); }
});

export default router;
