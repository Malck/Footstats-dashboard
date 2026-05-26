// src/lib/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FootStats Dashboard API',
      version: '1.0.0',
      description: `
## API REST pour le FootStats Dashboard

Données de football agrégées depuis API-Football, stockées en PostgreSQL.

**Fonctionnalités :**
- 🏆 Classements par ligue et saison
- ⚽ Résultats et calendrier des matchs
- 👥 Statistiques des joueurs et équipes
- 📊 Données agrégées côté serveur

**Ligue par défaut :** Ligue 1 France (ID: 61), Saison 2024
      `,
      contact: {
        name: 'Malcolm Coutteel',
        url: 'https://github.com/Malck',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Développement local',
      },
      {
        url: 'https://footstats-api.railway.app',
        description: 'Production (Railway)',
      },
    ],
    tags: [
      { name: 'Leagues',   description: 'Ligues de football' },
      { name: 'Standings', description: 'Classements par ligue' },
      { name: 'Matches',   description: 'Matchs et résultats' },
      { name: 'Teams',     description: 'Équipes et statistiques' },
      { name: 'Players',   description: 'Joueurs et statistiques' },
      { name: 'Stats',     description: 'Statistiques agrégées' },
    ],
    components: {
      schemas: {
        League: {
          type: 'object',
          properties: {
            id:      { type: 'integer', example: 61 },
            name:    { type: 'string',  example: 'Ligue 1' },
            country: { type: 'string',  example: 'France' },
            logo:    { type: 'string',  example: 'https://...' },
            season:  { type: 'integer', example: 2024 },
          },
        },
        Standing: {
          type: 'object',
          properties: {
            rank:         { type: 'integer', example: 1 },
            team:         { type: 'object',  properties: { id: { type: 'integer' }, name: { type: 'string' }, logo: { type: 'string' } } },
            points:       { type: 'integer', example: 72 },
            played:       { type: 'integer', example: 30 },
            won:          { type: 'integer', example: 22 },
            drawn:        { type: 'integer', example: 6 },
            lost:         { type: 'integer', example: 2 },
            goalsFor:     { type: 'integer', example: 68 },
            goalsAgainst: { type: 'integer', example: 20 },
            goalDiff:     { type: 'integer', example: 48 },
            form:         { type: 'string',  example: 'WWDWW' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 123456 },
            date:      { type: 'string',  format: 'date-time' },
            status:    { type: 'string',  example: 'FINISHED' },
            homeTeam:  { type: 'object',  properties: { id: { type: 'integer' }, name: { type: 'string' }, logo: { type: 'string' } } },
            awayTeam:  { type: 'object',  properties: { id: { type: 'integer' }, name: { type: 'string' }, logo: { type: 'string' } } },
            homeGoals: { type: 'integer', example: 2 },
            awayGoals: { type: 'integer', example: 1 },
            round:     { type: 'string',  example: 'Regular Season - 28' },
          },
        },
        TeamStats: {
          type: 'object',
          properties: {
            teamId:          { type: 'integer' },
            teamName:        { type: 'string' },
            season:          { type: 'integer' },
            goalsFor:        { type: 'integer' },
            goalsAgainst:    { type: 'integer' },
            avgGoalsFor:     { type: 'number', format: 'float' },
            avgGoalsAgainst: { type: 'number', format: 'float' },
            cleanSheets:     { type: 'integer' },
            wins:            { type: 'integer' },
            draws:           { type: 'integer' },
            losses:          { type: 'integer' },
          },
        },
        PlayerStats: {
          type: 'object',
          properties: {
            playerId:       { type: 'integer' },
            playerName:     { type: 'string' },
            team:           { type: 'string' },
            goals:          { type: 'integer' },
            assists:        { type: 'integer' },
            appearances:    { type: 'integer' },
            rating:         { type: 'number' },
            yellowCards:    { type: 'integer' },
            redCards:       { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error:   { type: 'string', example: 'Resource not found' },
            message: { type: 'string', example: 'League with id 99 does not exist' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
