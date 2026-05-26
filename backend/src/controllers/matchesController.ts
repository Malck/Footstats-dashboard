// src/controllers/matchesController.ts
import { Request, Response, NextFunction } from 'express';
import { matchesService } from '../services/matchesService';
import { AppError }       from '../middlewares/errorHandler';

export const getMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.query.leagueId as string);
    const season   = parseInt(req.query.season   as string) || 2024;
    const status   = req.query.status as string | undefined;
    const teamId   = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    const limit    = parseInt(req.query.limit    as string) || 20;
    const page     = parseInt(req.query.page     as string) || 1;

    if (isNaN(leagueId)) throw new AppError('leagueId is required', 400);

    const data = await matchesService.getMatches({ leagueId, season, status, teamId, limit, page });
    res.json(data);
  } catch (err) { next(err); }
};

export const getMatchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError('Invalid match id', 400);
    const match = await matchesService.getById(id);
    if (!match) throw new AppError(`Match ${id} not found`, 404);
    res.json(match);
  } catch (err) { next(err); }
};

export const syncMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leagueId, season, from, to } = req.body;
    if (!leagueId || !season) throw new AppError('leagueId and season are required', 400);
    const result = await matchesService.syncFromApi({ leagueId, season, from, to });
    res.json(result);
  } catch (err) { next(err); }
};
