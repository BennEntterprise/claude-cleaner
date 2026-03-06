import type { Stats } from "shared/schemas.js";

interface StatsBarProps {
  stats: Stats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <div className="stat-value">{stats.totalScanned}</div>
        <div className="stat-label">Projects Scanned</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.withClaudeDir}</div>
        <div className="stat-label">.claude/ dirs</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.withClaudeMd}</div>
        <div className="stat-label">CLAUDE.md files</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.withCustomPermissions}</div>
        <div className="stat-label">Custom Permissions</div>
      </div>
    </div>
  );
}
