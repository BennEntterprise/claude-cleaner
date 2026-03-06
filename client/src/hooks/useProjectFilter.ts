import { useState, useMemo, useCallback } from "react";
import type { ProjectInfo, Stats } from "shared/schemas.js";
import type { FilterKey, ActiveFilters } from "../types/filters";

const PREDICATES: Record<FilterKey, (p: ProjectInfo) => boolean> = {
  hasClaudeDir: (p) => p.hasClaudeDir,
  hasClaudeMd: (p) => p.hasClaudeMd,
  hasPermissions: (p) => p.settings?.permissions !== undefined,
  hasSessions: (p) => p.sessionCount > 0,
};

export function useProjectFilter(projects: ProjectInfo[], totalStats: Stats) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(new Set());

  const toggle = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  const filtered = useMemo(() => {
    if (activeFilters.size === 0) return projects;
    return projects.filter((p) =>
      [...activeFilters].every((key) => PREDICATES[key](p)),
    );
  }, [projects, activeFilters]);

  const filteredStats: Stats = useMemo(() => {
    if (activeFilters.size === 0) return totalStats;
    return {
      totalScanned: filtered.length,
      withClaudeDir: filtered.filter((p) => p.hasClaudeDir).length,
      withClaudeMd: filtered.filter((p) => p.hasClaudeMd).length,
      withCustomPermissions: filtered.filter(
        (p) => p.settings?.permissions !== undefined,
      ).length,
    };
  }, [filtered, activeFilters.size, totalStats]);

  return {
    activeFilters,
    filtered,
    filteredStats,
    isFiltering: activeFilters.size > 0,
    toggle,
    clearAll,
  } as const;
}
