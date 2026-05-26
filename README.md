# ⚽ FootStats Dashboard

Application web full stack de statistiques football — classements, résultats, performances des joueurs et comparaisons d'équipes avec visualisation de données.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)](https://prisma.io)

**🔗 Demo :** https://footstats.vercel.app  
**📚 API Docs :** https://footstats-api.railway.app/api/docs

---

## ✨ Fonctionnalités

- 🏆 **Classements** — Ligue 1, Premier League, La Liga avec données en temps réel
- 📊 **Dashboard analytique** — KPIs agrégés côté serveur, statistiques de ligue
- 📈 **Forme des équipes** — Courbe d'évolution sur la saison (Recharts LineChart)
- ⚔️ **Comparaison d'équipes** — Graphique radar normalisé côte à côte
- ⚽ **Top buteurs** — Classement visuel avec podium (BarChart horizontal)
- 🕐 **Buts par tranche horaire** — Distribution temporelle des buts
- 📅 **Résultats & calendrier** — Filtres par statut, pagination
- 📱 **Responsive** — Optimisé mobile et desktop

---

## 🛠 Stack technique

| Couche | Technologie | Usage |
|--------|-------------|-------|
| **Frontend** | React 18 + TypeScript | Interface utilisateur |
| **Charts** | Recharts | LineChart, BarChart, RadarChart |
| **Routing** | React Router v6 | Navigation SPA |
| **Data fetching** | React Query | Cache, états de chargement |
| **Backend** | Node.js + Express | API REST |
| **Base de données** | PostgreSQL (Railway) | Stockage persistant |
| **ORM** | Prisma | Schéma typé, migrations |
| **API externe** | API-Football (RapidAPI) | Données football |
| **Docs API** | Swagger / OpenAPI 3.0 | Documentation interactive |
| **Déploiement** | Vercel (front) + Railway (back) | Production |

---

## 🏗 Architecture

```
footstats/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Schéma PostgreSQL (6 modèles)
│   └── src/
│       ├── server.ts              # Entry point Express
│       ├── lib/
│       │   ├── prisma.ts          # Client Prisma singleton
│       │   ├── apiFootball.ts     # Client API-Football
│       │   ├── swagger.ts         # Config Swagger/OpenAPI
│       │   └── seed.ts            # Script de peuplement DB
│       ├── routes/                # Déclarations routes + JSDoc Swagger
│       │   ├── standings.ts
│       │   ├── matches.ts
│       │   ├── stats.ts           # Endpoints agrégés
│       │   ├── teams.ts
│       │   ├── players.ts
│       │   └── leagues.ts
│       ├── controllers/           # Validation params + appel service
│       ├── services/              # Logique métier + requêtes PostgreSQL
│       └── middlewares/
│           └── errorHandler.ts
└── frontend/
    └── src/
        ├── App.tsx                # Router + QueryClient
        ├── lib/api.ts             # Client axios
        ├── pages/
        │   ├── DashboardPage.tsx  # Vue principale
        │   ├── TeamPage.tsx       # Fiche équipe
        │   ├── ComparePage.tsx    # Comparaison radar
        │   └── MatchesPage.tsx    # Résultats
        └── components/
            ├── charts/
            │   ├── TeamFormChart.tsx      # LineChart
            │   ├── CompareRadarChart.tsx  # RadarChart
            │   ├── TopScorersChart.tsx    # BarChart horizontal
            │   └── GoalsByHourChart.tsx   # BarChart
            └── ui/
                ├── StandingsTable.tsx
                └── LeagueSummaryCards.tsx
```

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js 18+
- Un compte [Railway](https://railway.app) (PostgreSQL gratuit)
- Une clé [API-Football](https://rapidapi.com/api-sports/api/api-football) (100 req/jour gratuit)

### 1. Cloner
```bash
git clone https://github.com/Malck/footstats-dashboard.git
cd footstats-dashboard
```

### 2. Backend
```bash
cd backend
npm install

# Copier et remplir les variables d'environnement
cp .env.example .env
# → Éditer .env avec DATABASE_URL et API_FOOTBALL_KEY

# Générer le client Prisma + appliquer les migrations
npx prisma migrate dev --name init
npx prisma generate

# Peupler la base depuis API-Football (Ligue 1 2024)
npm run seed

# Lancer le serveur
npm run dev
# → http://localhost:3001
# → http://localhost:3001/api/docs  (Swagger UI)
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📡 API REST — Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/standings/:leagueId` | Classement d'une ligue |
| POST | `/api/standings/:leagueId/sync` | Sync depuis API-Football |
| GET | `/api/matches?leagueId=61` | Liste des matchs (filtrés) |
| GET | `/api/stats/league/:id/summary` | KPIs agrégés de la ligue |
| GET | `/api/stats/team/:id/form` | Forme récente d'une équipe |
| GET | `/api/stats/league/:id/top-scorers` | Top buteurs |
| GET | `/api/stats/league/:id/goals-by-hour` | Distribution temporelle |
| GET | `/api/stats/compare?team1=85&team2=80` | Comparaison radar |
| GET | `/api/teams?leagueId=61` | Équipes d'une ligue |
| GET | `/api/players/:id` | Profil + stats d'un joueur |

📖 **Documentation complète interactive** : `/api/docs`

---

## 🗄 Schéma PostgreSQL

```
League ─┬─< Team ─┬─< Player ──< PlayerStat
        │         ├─< Standing
        │         └─< TeamStat
        ├─< Match (homeTeam, awayTeam)
        └─< Standing
```

---

## ☁️ Déploiement

**Backend → Railway**
```bash
# Dans Railway : New Project → GitHub repo → backend/
# Variables : DATABASE_URL (auto), API_FOOTBALL_KEY, FRONTEND_URL
```

**Frontend → Vercel**
```bash
# Dans Vercel : Import GitHub → frontend/
# Variable : VITE_API_URL=https://ton-backend.railway.app
```

---

## 👤 Auteur

**Malcolm Coutteel** — Développeur Full Stack  
[GitHub](https://github.com/Malck) · [LinkedIn](https://www.linkedin.com/in/malcolm-coutteel-x-dev-front-end-x-js-react/) · [Portfolio](https://malcolm-coutteel.netlify.app)
