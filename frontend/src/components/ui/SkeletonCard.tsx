// src/components/ui/SkeletonCard.tsx

// KPI Cards
export function KpiSkeleton() {
  return (
    <div className="kpi-grid-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="kpi-card-skeleton skeleton" />
      ))}
    </div>
  );
}

// Standings Table
export function StandingsSkeleton() {
  return (
    <div className="standings-skeleton">
      <div className="standings-skeleton-header skeleton" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="standings-skeleton-row skeleton" />
      ))}
    </div>
  );
}

// Chart (bar/line)
export function ChartSkeleton({ height = 8 }: { height?: number }) {
  const heights = [60, 85, 45, 100, 70, 55, 90, 40, 75, 65].slice(0, height);
  return (
    <div className="chart-skeleton">
      <div className="chart-skeleton-title skeleton" />
      <div className="chart-skeleton-bars">
        {heights.map((h, i) => (
          <div
            key={i}
            className="chart-skeleton-bar skeleton"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Player list (top scorers / assisters)
export function PlayerListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="chart-card">
      <div className="chart-skeleton-title skeleton" style={{ marginBottom: '1rem' }} />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="player-skeleton">
          <div className="player-skeleton-avatar skeleton" />
          <div style={{ flex: 1 }}>
            <div className="player-skeleton-name skeleton" />
            <div className="player-skeleton-team skeleton" />
          </div>
          <div className="player-skeleton-stat skeleton" />
        </div>
      ))}
    </div>
  );
}

// Match list
export function MatchListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="match-skeleton-row skeleton" />
      ))}
    </div>
  );
}