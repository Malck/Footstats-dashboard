// src/App.tsx
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage  from './pages/DashboardPage';
import TeamPage       from './pages/TeamPage';
import ComparePage    from './pages/ComparePage';
import MatchesPage    from './pages/MatchesPage';
import ChampionsLeaguePage from './pages/ChampionsLeaguePage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <div className="header-inner">
              <div className="brand">
                <span className="brand-icon">⚽</span>
                <span className="brand-name">FootStats</span>
                <span className="brand-tag">Dashboard</span>
              </div>
              <nav className="main-nav">
                <NavLink to="/"         end>Dashboard</NavLink>
                <NavLink to="/matches"     >Matchs</NavLink>
                <NavLink to="/compare"     >Comparaison</NavLink>
              </nav>
            </div>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/"          element={<DashboardPage />} />
              <Route path="/team/:id"  element={<TeamPage />} />
              <Route path="/compare"   element={<ComparePage />} />
              <Route path="/matches"   element={<MatchesPage />} />
              <Route path="/champions-league" element={<ChampionsLeaguePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <span>FootStats Dashboard</span>
            <span>Data: API-Football • Built with React + Recharts + PostgreSQL</span>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
