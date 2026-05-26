// src/services/standingsService.ts
// Logique métier : lecture PostgreSQL + sync depuis API-Football
import { prisma }       from '../lib/prisma';
import { footballApi }  from '../lib/apiFootball';

export const standingsService = {

  // ── Lecture depuis PostgreSQL ──────────────────────────────────────────────
  getFromDb: async (leagueId: number, season: number) => {
    const league = await prisma.league.findFirst({
      where: { id: leagueId, season },
    });
    if (!league) return null;

    const standings = await prisma.standing.findMany({
      where:   { leagueId, leagueSeason: season },
      orderBy: { rank: 'asc' },
      include: {
        team: {
          select: { id: true, name: true, shortName: true, logo: true },
        },
      },
    });

    return {
      league: {
        id:      league.id,
        name:    league.name,
        country: league.country,
        logo:    league.logo,
        season:  league.season,
      },
      standings: standings.map(s => ({
        rank:         s.rank,
        team:         s.team,
        points:       s.points,
        played:       s.played,
        won:          s.won,
        drawn:        s.drawn,
        lost:         s.lost,
        goalsFor:     s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff:     s.goalDiff,
        form:         s.form,
      })),
      updatedAt: standings[0]?.updatedAt ?? null,
    };
  },

  // ── Sync depuis API-Football → upsert PostgreSQL ───────────────────────────
  syncFromApi: async (leagueId: number, season: number) => {
    const apiStandings = await footballApi.getStandings(leagueId, season);
    if (!apiStandings.length) throw new Error('No data returned from API');

    // Assure que la ligue existe en DB
    await prisma.league.upsert({
      where:  { id_season: { id: leagueId, season } },
      update: { updatedAt: new Date() },
      create: {
        id:      leagueId,
        name:    'Ligue 1',   // sera écrasé par les données API dans une prochaine étape
        country: 'France',
        season,
      },
    });

    let count = 0;

    // apiStandings[0] = groupe principal (1 seul groupe en Ligue 1)
    for (const standing of apiStandings[0]) {
      // Upsert équipe
      await prisma.team.upsert({
  where: { id: standing.team.id },  // ← juste l'id, Team a @id sur id
  update: { name: standing.team.name, logo: standing.team.logo },
  create: {
    id:       standing.team.id,
    name:     standing.team.name,
    logo:     standing.team.logo,
    leagueId: leagueId,
  },
});

      // Upsert classement
      await prisma.standing.upsert({
        where: { leagueId_leagueSeason_teamId: { leagueId, leagueSeason: season, teamId: standing.team.id } },
        update: {
          rank:         standing.rank,
          points:       standing.points,
          played:       standing.all.played,
          won:          standing.all.win,
          drawn:        standing.all.draw,
          lost:         standing.all.lose,
          goalsFor:     standing.all.goals.for,
          goalsAgainst: standing.all.goals.against,
          goalDiff:     standing.goalsDiff,
          form:         standing.form,
          updatedAt:    new Date(),
        },
        create: {
          leagueId,
          leagueSeason: season,
          teamId:       standing.team.id,
          rank:         standing.rank,
          points:       standing.points,
          played:       standing.all.played,
          won:          standing.all.win,
          drawn:        standing.all.draw,
          lost:         standing.all.lose,
          goalsFor:     standing.all.goals.for,
          goalsAgainst: standing.all.goals.against,
          goalDiff:     standing.goalsDiff,
          form:         standing.form,
        },
      });
      count++;
    }

    return {
      synced:  count,
      message: `${count} standings updated for league ${leagueId} season ${season}`,
    };
  },
};
