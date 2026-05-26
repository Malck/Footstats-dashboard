// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import leagueRoutes    from './routes/leagues';
import teamRoutes      from './routes/teams';
import playerRoutes    from './routes/players';
import matchRoutes     from './routes/matches';
import standingRoutes  from './routes/standings';
import statsRoutes     from './routes/stats';

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rate limiting — 100 req/15min par IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// ─── SWAGGER DOCS ─────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
  customSiteTitle: 'FootStats API Docs',
}));

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/leagues',   leagueRoutes);
app.use('/api/teams',     teamRoutes);
app.use('/api/players',   playerRoutes);
app.use('/api/matches',   matchRoutes);
app.use('/api/standings', standingRoutes);
app.use('/api/stats',     statsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FootStats API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs\n`);
});

export default app;
