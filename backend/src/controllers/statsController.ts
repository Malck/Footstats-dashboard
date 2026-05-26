// src/controllers/statsController.ts
import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';
import { AppError }     from '../middlewares/errorHandler';

export const getLeagueSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;
    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);
    res.json(await statsService.leagueSummary(leagueId, season));
  } catch (err) { next(err); }
};

export const getTeamForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teamId   = parseInt(req.params.teamId);
    const season   = parseInt(req.query.season   as string) || 2024;
    const last     = parseInt(req.query.last     as string) || 10;
    const leagueId = parseInt(req.query.leagueId as string) || 61;
    if (isNaN(teamId)) throw new AppError('Invalid teamId', 400);
    res.json(await statsService.teamForm(teamId, season, last, leagueId));
  } catch (err) { next(err); }
};

export const getTopScorers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;
    const limit    = parseInt(req.query.limit  as string) || 10;
    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);
    res.json(await statsService.topScorers(leagueId, season, limit));
  } catch (err) { next(err); }
};

export const getTopAssisters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;
    const limit    = parseInt(req.query.limit  as string) || 10;
    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);
    res.json(await statsService.topAssisters(leagueId, season, limit));
  } catch (err) { next(err); }
};

export const getTopKeepers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;
    const limit    = parseInt(req.query.limit  as string) || 8;
    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);
    res.json(await statsService.topKeepers(leagueId, season, limit));
  } catch (err) { next(err); }
};

export const getGoalsByHour = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const season   = parseInt(req.query.season as string) || 2024;
    if (isNaN(leagueId)) throw new AppError('Invalid leagueId', 400);
    res.json(await statsService.goalsByHour(leagueId, season));
  } catch (err) { next(err); }
};

export const compareTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team1  = parseInt(req.query.team1  as string);
    const team2  = parseInt(req.query.team2  as string);
    const season = parseInt(req.query.season as string) || 2024;
    if (isNaN(team1) || isNaN(team2)) throw new AppError('team1 and team2 are required', 400);
    if (team1 === team2)              throw new AppError('team1 and team2 must be different', 400);
    res.json(await statsService.compareTeams(team1, team2, season));
  } catch (err) { next(err); }
};
