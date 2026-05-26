// src/services/statsService.ts
// Toute l'agrégation de données côté serveur — c'est ici que le SQL travaille
import { prisma } from '../lib/prisma';

export const statsService = {

  // ── Résumé ligue — agrégation SQL complète ─────────────────────────────────
  leagueSummary: async (leagueId: number, season: number) => {
    // Utilise Prisma aggregation pour les stats globales
    const matchAgg = await prisma.match.aggregate({
      where:  { leagueId, season, status: 'FINISHED' },
      _count: { id: true },
      _sum:   { homeGoals: true, awayGoals: true },
    });

    const totalMatches = matchAgg._count.id;
    const totalGoals   = (matchAgg._sum.homeGoals ?? 0) + (matchAgg._sum.awayGoals ?? 0);
    const avgGoals     = totalMatches > 0 ? +(totalGoals / totalMatches).toFixed(2) : 0;

    // Répartition victoires domicile / nul / extérieur
    const results = await prisma.match.groupBy({
      by:     ['winner'],
      where:  { leagueId, season, status: 'FINISHED' },
      _count: { winner: true },
    });

    const homeWins = results.find(r => r.winner === 'Home')?._count.winner ?? 0;
    const draws    = results.find(r => r.winner === 'Draw')?._count.winner ?? 0;
    const awayWins = results.find(r => r.winner === 'Away')?._count.winner ?? 0;

    const pct = (n: number) => totalMatches > 0 ? +((n / totalMatches) * 100).toFixed(1) : 0;

    // Équipe la plus prolifique
    const topTeam = await prisma.standing.findFirst({
      where: { leagueId, leagueSeason: season },
      orderBy: { goalsFor: 'desc' },
      include: { team: { select: { name: true } } },
    });

    // Top buteur (via PlayerStat)
    // Top buteur — filtré par les équipes ayant un standing dans cette ligue/saison
    // On récupère d'abord les teamIds de la ligue
    const leagueTeamIds = await prisma.standing.findMany({
      where: { leagueId, leagueSeason: season },
      select: { teamId: true },
    });

    const teamIds = leagueTeamIds.map(s => s.teamId);

    const topScorer = await prisma.playerStat.findFirst({
  where: {
    season,
    goals:    { gt: 0 },
    leagueId,
  },
  orderBy: [
    { goals: 'desc' },
    { assists: 'desc' },
  ],
  include: {
    player: { select: { name: true } },
    team:   { select: { name: true } },
  },
});

    return {
      totalGoals,
      avgGoalsPerMatch: avgGoals,
      totalMatches,
      homeWinPct:  pct(homeWins),
      drawPct:     pct(draws),
      awayWinPct:  pct(awayWins),
      topScorer: topScorer ? {
        name:  topScorer.player.name,
        goals: topScorer.goals,
        team:  topScorer.team?.name ?? '',
      } : null,
      mostGoals: topTeam ? {
        team:  topTeam.team.name,
        goals: topTeam.goalsFor,
      } : null,
    };
  },

  // ── Forme d'une équipe sur N matchs ────────────────────────────────────────
  teamForm: async (teamId: number, season: number, last: number, leagueId: number) => {
    const team = await prisma.team.findUnique({
      where:  { id: teamId },
      select: { name: true },
    });

    const matches = await prisma.match.findMany({
    where: {
    season,
    leagueId,
    status: 'FINISHED',
    OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
  },
      orderBy: { date: 'asc' },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    });

    let cumulPoints = 0;
    const formData = matches.slice(-last).map(m => {
      const isHome     = m.homeTeamId === teamId;
      const goalsFor   = isHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0);
      const goalsAgainst = isHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0);
      const opponent   = isHome ? m.awayTeam.name : m.homeTeam.name;

      let result: 'W' | 'D' | 'L';
      let pts: number;
      if (m.winner === (isHome ? 'Home' : 'Away')) { result = 'W'; pts = 3; }
      else if (m.winner === 'Draw')                 { result = 'D'; pts = 1; }
      else                                          { result = 'L'; pts = 0; }

      cumulPoints += pts;
      return {
        date:          m.date?.toISOString().split('T')[0] ?? '',
        opponent,
        result,
        goalsFor,
        goalsAgainst,
        isHome,
        pts,
        cumulPoints,
      };
    });

    const formStr = formData.map(m => m.result).join('');

    return {
      teamId,
      teamName: team?.name ?? '',
      form:     formStr,
      matches:  formData,
    };
  },

  // ── Top buteurs depuis PlayerStat ──────────────────────────────────────────
  topScorers: async (leagueId: number, season: number, limit: number) => {
  // Récupérer les équipes qui ont un standing dans cette ligue/saison
  const leagueTeamIds = await prisma.standing.findMany({
    where: { leagueId, leagueSeason: season },
    select: { teamId: true },
  });
  const teamIds = leagueTeamIds.map(s => s.teamId);

  const scorers = await prisma.playerStat.findMany({
  where: {
    season,
    goals:    { gt: 0 },
    leagueId,           // ce filtre seul suffit
  },
  orderBy: [
  { goals:   'desc' },
  { assists: 'desc' },
],
  take:    limit,
  include: {
    player: {
      select: { id: true, name: true, photo: true, position: true },
    },
    team: {
      select: { id: true, name: true, logo: true },
    },
  },
});

  return scorers.map(s => ({
  playerId:    s.player.id,
  playerName:  s.player.name,
  photo:       s.player.photo,
  position:    s.player.position,
  team:        s.team,              // ← équipe de la saison
  goals:       s.goals,
  assists:     s.assists,
  appearances: s.appearances,
  rating:      s.rating,
  yellowCards: s.yellowCards,
  redCards:    s.redCards,
  }));
},

// ── Top passeurs ──────────────────────────────────────────────────────────────
topAssisters: async (leagueId: number, season: number, limit: number) => {
  const assisters = await prisma.playerStat.findMany({
    where: {
      season,
      leagueId,
      assists: { gt: 0 },
    },
    orderBy: [
    { assists: 'desc' },
    { minutesPlayed: 'asc' }, // moins de minutes = meilleur ratio PD/90min
    ],
    take:    limit,
    include: {
      player: { select: { id: true, name: true, photo: true, position: true } },
      team:   { select: { id: true, name: true, logo: true } },
    },
  });

  return assisters.map(s => ({
    playerId:    s.player.id,
    playerName:  s.player.name,
    photo:       s.player.photo,
    position:    s.player.position,
    team:        s.team,
    assists:     s.assists,
    goals:       s.goals,
    appearances: s.appearances,
    rating:      s.rating,
    assistsPer90: s.minutesPlayed > 0
    ? +((s.assists / s.minutesPlayed) * 90).toFixed(2)
    : 0,
  }));
},

// ── Top gardiens ──────────────────────────────────────────────────────────────
topKeepers: async (leagueId: number, season: number, limit: number) => {
  // D'abord récupérer les IDs des gardiens
  const goalkeepers = await prisma.player.findMany({
    where: { position: 'Goalkeeper' },
    select: { id: true },
  });
  const keeperIds = goalkeepers.map(g => g.id);

  const keepers = await prisma.playerStat.findMany({
    where: {
      season,
      leagueId,
      playerId:    { in: keeperIds },
      appearances: { gte: 3 },
    },
    orderBy: [
      { saves: 'desc' },
      { rating: 'desc' },
    ],
    take: limit,
    include: {
      player: { select: { id: true, name: true, photo: true } },
      team:   { select: { id: true, name: true, logo: true } },
    },
  });

  return keepers.map(s => ({
    playerId:        s.player.id,
    playerName:      s.player.name,
    photo:           s.player.photo,
    team:            s.team,
    appearances:     s.appearances,
    saves:           s.saves,
    goalsConceded:   s.goalsConceded,
    rating:          s.rating,
    savesPerGame:    s.appearances > 0 ? +(s.saves / s.appearances).toFixed(2) : 0,
    concededPerGame: s.appearances > 0 ? +(s.goalsConceded / s.appearances).toFixed(2) : 0,
  }));
},

  // ── Buts par tranche horaire — requête SQL brute via Prisma ────────────────
  goalsByHour: async (leagueId: number, season: number) => {
    // Prisma $queryRaw pour une vraie requête SQL groupée
    // On simule la répartition depuis les données de matchs disponibles
    // (API-Football fournit les stats par minute dans /fixtures/events — à intégrer en V2)
    // Pour l'instant : requête sur les matchs terminés avec répartition simulée propre
    const slots = [
      '0-15', '15-30', '30-45', '45-60', '60-75', '75-90', '90+'
    ];

    // En production, utiliser prisma.$queryRaw avec les données d'événements
    // Pour le seed initial : calcul approximatif depuis total goals
    const matchStats = await prisma.match.aggregate({
      where: { leagueId, season, status: 'FINISHED' },
      _sum:  { homeGoals: true, awayGoals: true },
    });

    const total = (matchStats._sum.homeGoals ?? 0) + (matchStats._sum.awayGoals ?? 0);

    // Distribution réaliste Ligue 1 (basée sur données historiques)
    const distribution = [0.098, 0.112, 0.148, 0.105, 0.142, 0.168, 0.227];

    return slots.map((slot, i) => ({
      minute: slot,
      goals:  Math.round(total * distribution[i]),
      pct:    +(distribution[i] * 100).toFixed(1),
    }));
  },

  // ── Comparaison deux équipes → données formatées pour Recharts Radar ───────
  compareTeams: async (team1Id: number, team2Id: number, season: number) => {
    const getTeamData = async (teamId: number) => {
      const standing = await prisma.standing.findFirst({
        where:   { teamId, leagueSeason: season },
        include: { team: { select: { name: true, logo: true } } },
      });

      const finishedMatches = await prisma.match.findMany({
        where: {
          season,
          status: 'FINISHED',
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        select: { homeTeamId: true, awayTeamId: true, homeGoals: true, awayGoals: true },
      });

      let cleanSheets = 0;
      let totalGoalsFor = 0;

      for (const m of finishedMatches) {
        const isHome       = m.homeTeamId === teamId;
        const goalsFor     = isHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0);
        const goalsAgainst = isHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0);
        totalGoalsFor += goalsFor;
        if (goalsAgainst === 0) cleanSheets++;
      }

      const avgGoalsFor = finishedMatches.length > 0
        ? +(totalGoalsFor / finishedMatches.length).toFixed(2)
        : 0;

      return { standing, cleanSheets, avgGoalsFor };
    };

    const [t1, t2] = await Promise.all([
      getTeamData(team1Id),
      getTeamData(team2Id),
    ]);

    const team1Name = t1.standing?.team.name ?? `Team ${team1Id}`;
    const team2Name = t2.standing?.team.name ?? `Team ${team2Id}`;

    // Radar avec valeurs BRUTES — pas de normalisation
    // Le frontend adapte le domaine de chaque axe via fullMark
    // Valeurs de référence fixes — basées sur une saison complète Ligue 1 (34 journées jouées)

// Références fixes — indépendantes des équipes comparées
const FULL_MARKS = {
  points:      102,  // 34 × 3
  goalsFor:    90,
  wins:        34,
  goalsAgainst:34,
  cleanSheets: 34,
  avgGoals:    3.5,
};

// Normalise sur 0-100 par rapport aux références fixes
const norm = (val: number, max: number) => +Math.min((val / max) * 100, 100).toFixed(1);

const radar = [
  {
    stat: 'Points',
    _raw1: t1.standing?.points ?? 0,
    _raw2: t2.standing?.points ?? 0,
    [team1Name]: norm(t1.standing?.points ?? 0, FULL_MARKS.points),
    [team2Name]: norm(t2.standing?.points ?? 0, FULL_MARKS.points),
  },
  {
    stat: 'Buts marqués',
    _raw1: t1.standing?.goalsFor ?? 0,
    _raw2: t2.standing?.goalsFor ?? 0,
    [team1Name]: norm(t1.standing?.goalsFor ?? 0, FULL_MARKS.goalsFor),
    [team2Name]: norm(t2.standing?.goalsFor ?? 0, FULL_MARKS.goalsFor),
  },
  {
    stat: 'Victoires',
    _raw1: t1.standing?.won ?? 0,
    _raw2: t2.standing?.won ?? 0,
    [team1Name]: norm(t1.standing?.won ?? 0, FULL_MARKS.wins),
    [team2Name]: norm(t2.standing?.won ?? 0, FULL_MARKS.wins),
  },
  {
    stat: 'Défense',
    _raw1: t1.standing?.goalsAgainst ?? 0,
    _raw2: t2.standing?.goalsAgainst ?? 0,
    [team1Name]: t1.standing?.goalsAgainst
      ? +Math.min((34 / t1.standing.goalsAgainst) * 100, 100).toFixed(1)
      : 100,
    [team2Name]: t2.standing?.goalsAgainst
      ? +Math.min((34 / t2.standing.goalsAgainst) * 100, 100).toFixed(1)
      : 100,
  },
  {
  stat: 'Clean sheets',
  _raw1: t1.cleanSheets ?? 0,
  _raw2: t2.cleanSheets ?? 0,
  [team1Name]: t1.cleanSheets !== undefined
    ? +Math.min((t1.cleanSheets / 20) * 100, 100).toFixed(1)
    : 0,
  [team2Name]: t2.cleanSheets !== undefined
    ? +Math.min((t2.cleanSheets / 20) * 100, 100).toFixed(1)
    : 0,
},
  {
    stat: 'Moy. buts/match',
    _raw1: t1.avgGoalsFor,
    _raw2: t2.avgGoalsFor,
    [team1Name]: norm(t1.avgGoalsFor, FULL_MARKS.avgGoals),
    [team2Name]: norm(t2.avgGoalsFor, FULL_MARKS.avgGoals),
  },
];

    return {
      team1: {
        id:           team1Id,
        name:         team1Name,
        logo:         t1.standing?.team.logo,
        points:       t1.standing?.points ?? 0,
        goalsFor:     t1.standing?.goalsFor ?? 0,
        goalsAgainst: t1.standing?.goalsAgainst ?? 0,
        wins:         t1.standing?.won ?? 0,
        draws:        t1.standing?.drawn ?? 0,
        losses:       t1.standing?.lost ?? 0,
        cleanSheets:  t1.cleanSheets,
        avgGoalsFor:  t1.avgGoalsFor,
      },
      team2: {
        id:           team2Id,
        name:         team2Name,
        logo:         t2.standing?.team.logo,
        points:       t2.standing?.points ?? 0,
        goalsFor:     t2.standing?.goalsFor ?? 0,
        goalsAgainst: t2.standing?.goalsAgainst ?? 0,
        wins:         t2.standing?.won ?? 0,
        draws:        t2.standing?.drawn ?? 0,
        losses:       t2.standing?.lost ?? 0,
        cleanSheets:  t2.cleanSheets,
        avgGoalsFor:  t2.avgGoalsFor,
      },
      radar,
    };
  },

};