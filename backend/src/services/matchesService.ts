// src/services/matchesService.ts
import { prisma }      from '../lib/prisma';
import { footballApi } from '../lib/apiFootball';
import { MatchStatus } from '@prisma/client';

// Map statuts API-Football → enum Prisma
const statusMap: Record<string, MatchStatus> = {
  'TBD': 'NOT_STARTED', 'NS': 'NOT_STARTED',
  '1H':  'FIRST_HALF',  'HT': 'HALFTIME',
  '2H':  'SECOND_HALF', 'ET': 'EXTRA_TIME',
  'P':   'PENALTY',     'FT': 'FINISHED',
  'AET': 'FINISHED',    'PEN':'FINISHED',
  'PST': 'POSTPONED',   'CANC':'CANCELLED',
  'ABD': 'ABANDONED',
};

export const matchesService = {

  getMatches: async (params: {
    leagueId: number;
    season:   number;
    status?:  string;
    teamId?:  number;
    limit:    number;
    page:     number;
  }) => {
    const { leagueId, season, status, teamId, limit, page } = params;
    const skip = (page - 1) * limit;

    const where: any = { leagueId, season };
    if (status)  where.status = status as MatchStatus;
    if (teamId)  where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];

    const [total, matches] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } },
        },
      }),
    ]);

    return { total, page, limit, matches };
  },

  getById: async (id: number) => {
    return prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
        league:   { select: { id: true, name: true, country: true } },
      },
    });
  },

  syncFromApi: async (params: {
    leagueId: number;
    season:   number;
    from?:    string;
    to?:      string;
  }) => {
    const { leagueId, season, from, to } = params;

    const apiMatches = await footballApi.getMatches({
      league: leagueId,
      season,
      ...(from && { from }),
      ...(to   && { to }),
    });

    let count = 0;
    for (const m of apiMatches) {
      const status = statusMap[m.fixture.status.short] ?? 'NOT_STARTED';

      // S'assurer que les équipes existent
      for (const side of ['home', 'away'] as const) {
        await prisma.team.upsert({
          where:  { id: m.teams[side].id },
          update: { name: m.teams[side].name, logo: m.teams[side].logo },
          create: { id: m.teams[side].id, name: m.teams[side].name, logo: m.teams[side].logo, leagueId },
        });
      }

      const winner = m.teams.home.winner === true  ? 'Home'
                   : m.teams.away.winner === true  ? 'Away'
                   : m.goals.home !== null         ? 'Draw'
                   : null;

      await prisma.match.upsert({
        where:  { id: m.fixture.id },
        update: {
          status,
          homeGoals: m.goals.home,
          awayGoals: m.goals.away,
          elapsed:   m.fixture.status.elapsed,
          winner,
          updatedAt: new Date(),
        },
        create: {
          id:         m.fixture.id,
          leagueId,
          season,
          round:      m.league.round,
          date:       m.fixture.date ? new Date(m.fixture.date) : null,
          status,
          homeTeamId: m.teams.home.id,
          awayTeamId: m.teams.away.id,
          homeGoals:  m.goals.home,
          awayGoals:  m.goals.away,
          elapsed:    m.fixture.status.elapsed,
          venue:      m.fixture.venue.name,
          winner,
        },
      });
      count++;
    }

    return { synced: count, message: `${count} matches synced` };
  },
};
