// src/lib/seed.ts
import 'dotenv/config';
import { prisma } from './prisma';
import { footballApi } from './apiFootball';

const LEAGUES = [
  { id: 61, name: 'Ligue 1', country: 'France' },
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 2, name: 'UEFA Champions League', country: 'World' },
];

const ALL_SEASONS = [2022, 2023, 2024, 2025];

const TARGET_LEAGUE = process.env.LEAGUE ? parseInt(process.env.LEAGUE) : null;
const LEAGUE_TO_SEED = TARGET_LEAGUE
  ? LEAGUES.find(l => l.id === TARGET_LEAGUE) ?? LEAGUES[0]
  : LEAGUES[0];

const TARGET_SEASON = process.env.SEASON ? parseInt(process.env.SEASON) : 2024;
const SEASONS_TO_SEED = [TARGET_SEASON];

const SEASON_DATES: Record<number, { from: string; to: string }> = {
  2022: { from: '2022-07-01', to: '2023-06-30' },
  2023: { from: '2023-07-01', to: '2024-06-30' },
  2024: { from: '2024-07-01', to: '2025-06-30' },
  2025: { from: '2025-07-01', to: '2026-06-30' },
};

async function seedLeague(leagueId: number, leagueName: string, country: string, season: number) {
  console.log(`\n📊 Seeding ${leagueName} ${season}/${season + 1}...`);

  // 1. Upsert League
  await prisma.league.upsert({
    where: { id_season: { id: leagueId, season } },
    update: { name: leagueName, country },
    create: { id: leagueId, name: leagueName, country, season },
  });
  console.log(`  ✅ League upserted`);

  // 2. Standings
  console.log(`  🔄 Fetching standings...`);
  let standings: any[][] = [];
  try {
    standings = await footballApi.getStandings(leagueId, season);
  } catch {
    console.log(`  ⚠️ No standings for ${leagueName} ${season}`);
    return;
  }

  if (!standings[0]?.length) {
    console.log(`  ⚠️ No standing data returned`);
    return;
  }

  for (const standing of standings[0]) {
    // Team upsert
    await prisma.team.upsert({
      where: { id: standing.team.id },
      update: { name: standing.team.name, logo: standing.team.logo },
      create: {
        id: standing.team.id,
        name: standing.team.name,
        logo: standing.team.logo,
        leagueId,
      },
    });

    // Standing upsert
    await prisma.standing.upsert({
      where: { leagueId_leagueSeason_teamId: { leagueId, leagueSeason: season, teamId: standing.team.id } },
      update: {
        rank: standing.rank,
        points: standing.points,
        played: standing.all.played,
        won: standing.all.win,
        drawn: standing.all.draw,
        lost: standing.all.lose,
        goalsFor: standing.all.goals.for,
        goalsAgainst: standing.all.goals.against,
        goalDiff: standing.goalsDiff,
        form: standing.form,
      },
      create: {
        leagueId,
        leagueSeason: season,
        teamId: standing.team.id,
        rank: standing.rank,
        points: standing.points,
        played: standing.all.played,
        won: standing.all.win,
        drawn: standing.all.draw,
        lost: standing.all.lose,
        goalsFor: standing.all.goals.for,
        goalsAgainst: standing.all.goals.against,
        goalDiff: standing.goalsDiff,
        form: standing.form,
      },
    });
  }
  console.log(`  ✅ ${standings[0].length} standings synced`);

  // Nettoyer les PlayerStat orphelines pour cette ligue/saison
// = joueurs assignés à cette ligue mais dont l'équipe n'a pas de standing ici
console.log(`  🧹 Cleaning orphaned player stats...`);
const validTeamIds = standings[0].map((s: any) => s.team.id);

await prisma.playerStat.deleteMany({
  where: {
    season,
    leagueId,
    teamId: { notIn: validTeamIds },
  },
});
console.log(`  ✅ Orphaned stats cleaned`);

  // 3. Top Scorers
  console.log(`  🔄 Fetching top scorers...`);
  await new Promise(r => setTimeout(r, 1200));
  let scorers: any[] = [];
  try {
  scorers = await footballApi.getTopScorers(leagueId, season);
  console.log(`  📊 API returned ${scorers.length} scorers`);
} catch (e) {
  console.log(`  ⚠️ Could not fetch scorers:`, e);
}

  for (const entry of scorers) {
    const { player, statistics } = entry;
    const stat = statistics[0];
    if (!stat) continue;

    await prisma.team.upsert({
    where:  { id: stat.team.id },
    update: { name: stat.team.name, logo: stat.team.logo },
    create: {
      id:       stat.team.id,
      name:     stat.team.name,
      logo:     stat.team.logo,
      leagueId: leagueId,
    },
  });

    // Player upsert
    await prisma.player.upsert({
      where: { id: player.id },
      update: { name: player.name, photo: player.photo, position: stat.games.position },
      create: {
        id: player.id,
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        age: player.age,
        nationality: player.nationality,
        photo: player.photo,
        position: stat.games.position,
        teamId: stat.team.id,
      },
    });

    // PlayerStat upsert corrigé
    await prisma.playerStat.upsert({
      where: { playerId_season_leagueId: { playerId: player.id, season, leagueId } },
      update: {
        player: { connect: { id: player.id } },
        team: { connect: { id: stat.team.id } },
        league: { connect: { id_season: { id: leagueId, season } } },
        appearances: stat.games.appearances,
        lineups: stat.games.lineups,
        minutesPlayed: stat.games.minutes,
        goals: stat.goals.total ?? 0,
        assists: stat.goals.assists ?? 0,
        shots: stat.shots.total ?? 0,
        shotsOnTarget: stat.shots.on ?? 0,
        passes: stat.passes.total ?? 0,
        passAccuracy: stat.passes.accuracy ? parseFloat(stat.passes.accuracy) : null,
        dribbles: stat.dribbles.attempts ?? 0,
        dribblesSuccess: stat.dribbles.success ?? 0,
        tackles: stat.tackles.total ?? 0,
        interceptions: stat.tackles.interceptions ?? 0,
        yellowCards: stat.cards.yellow,
        redCards: stat.cards.red,
        rating: stat.games.rating ? parseFloat(stat.games.rating) : null,
      },
      create: {
        player: { connect: { id: player.id } },
        team: { connect: { id: stat.team.id } },
        league: { connect: { id_season: { id: leagueId, season } } },
        appearances: stat.games.appearances,
        lineups: stat.games.lineups,
        minutesPlayed: stat.games.minutes,
        goals: stat.goals.total ?? 0,
        assists: stat.goals.assists ?? 0,
        shots: stat.shots.total ?? 0,
        shotsOnTarget: stat.shots.on ?? 0,
        passes: stat.passes.total ?? 0,
        passAccuracy: stat.passes.accuracy ? parseFloat(stat.passes.accuracy) : null,
        dribbles: stat.dribbles.attempts ?? 0,
        dribblesSuccess: stat.dribbles.success ?? 0,
        tackles: stat.tackles.total ?? 0,
        interceptions: stat.tackles.interceptions ?? 0,
        yellowCards: stat.cards.yellow,
        redCards: stat.cards.red,
        rating: stat.games.rating ? parseFloat(stat.games.rating) : null,
      },
    });
  }
  console.log(`  ✅ ${scorers.length} players synced`);

  // 3bis. Top passeurs
console.log(`  🔄 Fetching top assisters...`);
await new Promise(r => setTimeout(r, 1200));

let assisters: any[] = [];
try {
  assisters = await footballApi.getTopAssisters(leagueId, season);
} catch {
  console.log(`  ⚠️ Could not fetch assisters`);
}

for (const entry of assisters) {
  const { player, statistics } = entry;
  const stat = statistics[0];
  if (!stat) continue;

  await prisma.team.upsert({
    where:  { id: stat.team.id },
    update: { name: stat.team.name, logo: stat.team.logo },
    create: {
      id:       stat.team.id,
      name:     stat.team.name,
      logo:     stat.team.logo,
      leagueId: leagueId,
    },
  });

  await prisma.player.upsert({
    where:  { id: player.id },
    update: { name: player.name, photo: player.photo, position: stat.games.position },
    create: {
      id:          player.id,
      name:        player.name,
      firstname:   player.firstname,
      lastname:    player.lastname,
      age:         player.age,
      nationality: player.nationality,
      photo:       player.photo,
      position:    stat.games.position,
      teamId:      stat.team.id,
    },
  });

  await prisma.playerStat.upsert({
    where:  { playerId_season_leagueId: { playerId: player.id, season, leagueId } },
    update: {
      team:            { connect: { id: stat.team.id } },
      assists:         stat.goals.assists ?? 0,
      goals:           stat.goals.total ?? 0,
      appearances:     stat.games.appearances,
      minutesPlayed:   stat.games.minutes,
      yellowCards:     stat.cards.yellow,
      redCards:        stat.cards.red,
      rating:          stat.games.rating ? parseFloat(stat.games.rating) : null,
    },
    create: {
      player:          { connect: { id: player.id } },
      team:            { connect: { id: stat.team.id } },
      league:          { connect: { id_season: { id: leagueId, season } } },
      assists:         stat.goals.assists ?? 0,
      goals:           stat.goals.total ?? 0,
      appearances:     stat.games.appearances,
      lineups:         stat.games.lineups,
      minutesPlayed:   stat.games.minutes,
      yellowCards:     stat.cards.yellow,
      redCards:        stat.cards.red,
      rating:          stat.games.rating ? parseFloat(stat.games.rating) : null,
    },
  });
}
console.log(`  ✅ ${assisters.length} assisters synced`);



// 3bis. Gardiens — saves et buts encaissés
console.log(`  🔄 Fetching goalkeepers...`);
await new Promise(r => setTimeout(r, 1200));

let keepers: any[] = [];
try {
  keepers = await footballApi.getGoalkeepers(leagueId, season);
} catch {
  console.log(`  ⚠️ Could not fetch goalkeepers`);
}

for (const entry of keepers) {
  const { player, statistics } = entry;
  const stat = statistics[0];
  if (!stat || stat.games.position !== 'Goalkeeper') continue;

  await prisma.player.upsert({
    where:  { id: player.id },
    update: { name: player.name, photo: player.photo, position: 'Goalkeeper' },
    create: {
      id:          player.id,
      name:        player.name,
      firstname:   player.firstname,
      lastname:    player.lastname,
      age:         player.age,
      nationality: player.nationality,
      photo:       player.photo,
      position:    'Goalkeeper',
      teamId:      stat.team.id,
    },
  });

  await prisma.playerStat.upsert({
    where:  { playerId_season_leagueId: { playerId: player.id, season, leagueId } },
    update: {
      team:         { connect: { id: stat.team.id } },
      appearances:  stat.games.appearances,
      minutesPlayed:stat.games.minutes,
      goals:        stat.goals.total ?? 0,
      assists:      stat.goals.assists ?? 0,
      yellowCards:  stat.cards.yellow,
      redCards:     stat.cards.red,
      rating:       stat.games.rating ? parseFloat(stat.games.rating) : null,
      saves:        stat.goals?.saves ?? 0,
      goalsConceded:stat.goals?.conceded ?? 0,
    },
    create: {
  player:        { connect: { id: player.id } },
  team:          { connect: { id: stat.team.id } },
  league:        { connect: { id_season: { id: leagueId, season } } },
  // ← pas de "season" ici, Prisma le prend depuis league
  appearances:   stat.games.appearances,
  lineups:       stat.games.lineups,
  minutesPlayed: stat.games.minutes,
  goals:         stat.goals.total ?? 0,
  assists:       stat.goals.assists ?? 0,
  yellowCards:   stat.cards.yellow,
  redCards:      stat.cards.red,
  rating:        stat.games.rating ? parseFloat(stat.games.rating) : null,
  saves:         stat.goals?.saves ?? 0,
  goalsConceded: stat.goals?.conceded ?? 0,
},
  });
}
console.log(`  ✅ ${keepers.length} goalkeepers synced`);

  // 4. Matches
  console.log(`  🔄 Fetching matches...`);
  await new Promise(r => setTimeout(r, 1200));

  const dates = SEASON_DATES[season] ?? { from: `${season}-07-01`, to: `${season + 1}-06-30` };
  let matches: any[] = [];
  try {
    matches = await footballApi.getMatches({ league: leagueId, season, from: dates.from, to: dates.to });
  } catch {
    console.log(`  ⚠️ Could not fetch matches`);
  }

  const statusMap: Record<string, any> = {
    'FT': 'FINISHED', 'AET': 'FINISHED', 'PEN': 'FINISHED',
    'NS': 'NOT_STARTED', '1H': 'FIRST_HALF', 'HT': 'HALFTIME',
    '2H': 'SECOND_HALF', 'ET': 'EXTRA_TIME', 'P': 'PENALTY',
    'PST': 'POSTPONED', 'CANC': 'CANCELLED', 'ABD': 'ABANDONED',
  };

  let matchCount = 0;
  for (const m of matches) {
    const status = statusMap[m.fixture.status.short] ?? 'NOT_STARTED';
    const winner = m.teams.home.winner === true ? 'Home'
                 : m.teams.away.winner === true ? 'Away'
                 : m.goals.home !== null ? 'Draw' : null;

    try {
  // Upsert équipes avant le match pour éviter les FK violations
  await prisma.team.upsert({
    where:  { id: m.teams.home.id },
    update: { name: m.teams.home.name, logo: m.teams.home.logo },
    create: { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo, leagueId },
  });
  await prisma.team.upsert({
    where:  { id: m.teams.away.id },
    update: { name: m.teams.away.name, logo: m.teams.away.logo },
    create: { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo, leagueId },
  });

  await prisma.match.upsert({
    where: { id: m.fixture.id },
    update: { status, homeGoals: m.goals.home, awayGoals: m.goals.away, winner },
    create: {
      id:           m.fixture.id,
      leagueId,
      leagueSeason: season,
      season,
      round:        m.league.round,
      date:         m.fixture.date ? new Date(m.fixture.date) : null,
      status,
      homeTeamId:   m.teams.home.id,
      awayTeamId:   m.teams.away.id,
      homeGoals:    m.goals.home,
      awayGoals:    m.goals.away,
      elapsed:      m.fixture.status.elapsed,
      venue:        m.fixture.venue.name,
      winner,
    },
  });
  matchCount++;
} catch {
  // skip si autre erreur inattendue
}
  }
  console.log(`  ✅ ${matchCount} matches synced`);
}

async function main() {
  console.log('🌱 Starting FootStats seed...');
  console.log(`   League : ${LEAGUE_TO_SEED.name} (${LEAGUE_TO_SEED.id})`);
  console.log(`   Season : ${TARGET_SEASON}\n`);

  await seedLeague(LEAGUE_TO_SEED.id, LEAGUE_TO_SEED.name, LEAGUE_TO_SEED.country, TARGET_SEASON);

  console.log('\n✅ Seed complete!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());