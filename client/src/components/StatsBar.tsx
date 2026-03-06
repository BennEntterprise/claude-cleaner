import type { Stats } from "shared/schemas.js";
import type { ActiveFilters, FilterKey } from "../types/filters";

interface StatsBarProps {
  stats: Stats;
  totalStats: Stats;
  isFiltering: boolean;
  activeFilters: ActiveFilters;
  onToggle: (key: FilterKey) => void;
  onClearAll: () => void;
}

interface StatCardConfig {
  filterKey: FilterKey | null;
  statKey: keyof Stats;
  label: string;
  activeClass: string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    filterKey: null,
    statKey: "totalScanned",
    label: "Projects Scanned",
    activeClass: "",
  },
  {
    filterKey: "hasClaudeDir",
    statKey: "withClaudeDir",
    label: ".claude/ dirs",
    activeClass: "stat--active-dir",
  },
  {
    filterKey: "hasClaudeMd",
    statKey: "withClaudeMd",
    label: "CLAUDE.md files",
    activeClass: "stat--active-md",
  },
  {
    filterKey: "hasPermissions",
    statKey: "withCustomPermissions",
    label: "Custom Permissions",
    activeClass: "stat--active-permissions",
  },
];

export function StatsBar({
  stats,
  totalStats,
  isFiltering,
  activeFilters,
  onToggle,
  onClearAll,
}: StatsBarProps) {
  return (
    <div className="stats-bar">
      {STAT_CARDS.map(({ filterKey, statKey, label, activeClass }) => {
        const isActive = filterKey !== null && activeFilters.has(filterKey);
        const classNames = [
          "stat",
          "stat--clickable",
          isActive ? activeClass : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={statKey}
            className={classNames}
            onClick={() =>
              filterKey !== null ? onToggle(filterKey) : onClearAll()
            }
            title={
              filterKey !== null
                ? `Filter by ${label}`
                : "Clear all filters"
            }
          >
            <div className="stat-value">
              {stats[statKey]}
              {isFiltering && filterKey !== null && (
                <span className="stat-total"> / {totalStats[statKey]}</span>
              )}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
