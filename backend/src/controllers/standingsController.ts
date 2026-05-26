// src/controllers/standingsController.ts
import { Request, Response, NextFunction } from 'express';
import { standingsService } from '../services/standingsService';
import { AppError } from '../middlewares/errorHandler';

export const getStandings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;

    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);

    const data = await standingsService.getFromDb(leagueId, season);
    if (!data) throw new AppError(`No standings found for league ${leagueId} season ${season}`, 404);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const syncStandings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;

    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);

    const result = await standingsService.syncFromApi(leagueId, season);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
