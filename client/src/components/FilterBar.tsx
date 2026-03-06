import type { ActiveFilters, FilterKey } from "../types/filters";
import { FILTER_LABELS } from "../types/filters";

interface FilterBarProps {
  activeFilters: ActiveFilters;
  onRemove: (key: FilterKey) => void;
  onClearAll: () => void;
}

export function FilterBar({
  activeFilters,
  onRemove,
  onClearAll,
}: FilterBarProps) {
  if (activeFilters.size === 0) return null;

  return (
    <div className="filter-bar">
      <span className="filter-bar-label">Filtering by:</span>
      {[...activeFilters].map((key) => (
        <button
          key={key}
          className="filter-chip"
          onClick={() => onRemove(key)}
          title={`Remove "${FILTER_LABELS[key]}" filter`}
        >
          {FILTER_LABELS[key]}
          <span className="filter-chip-x">&times;</span>
        </button>
      ))}
      <button className="filter-clear" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
