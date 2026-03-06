import { match } from "ts-pattern";
import type { ScanResponse } from "shared/schemas.js";
import { useScan } from "./hooks/useScan";
import { useProjectFilter } from "./hooks/useProjectFilter";
import { ScanForm } from "./components/ScanForm";
import { GlobalConfig } from "./components/GlobalConfig";
import { StatsBar } from "./components/StatsBar";
import { FilterBar } from "./components/FilterBar";
import { ProjectList } from "./components/ProjectList";

function FilteredResults({ data }: { data: ScanResponse }) {
  const { activeFilters, filtered, filteredStats, isFiltering, toggle, clearAll } =
    useProjectFilter(data.projects, data.stats);

  return (
    <>
      <StatsBar
        stats={filteredStats}
        totalStats={data.stats}
        isFiltering={isFiltering}
        activeFilters={activeFilters}
        onToggle={toggle}
        onClearAll={clearAll}
      />
      <FilterBar
        activeFilters={activeFilters}
        onRemove={toggle}
        onClearAll={clearAll}
      />
      <ProjectList
        projects={filtered}
        isFiltering={isFiltering}
        activeFilters={activeFilters}
        onToggleFilter={toggle}
      />
    </>
  );
}

export default function App() {
  const { state, globalConfig, scan } = useScan();

  return (
    <div className="app">
      <h1>Claude Cleaner <span>v0.1</span></h1>

      <ScanForm onScan={scan} disabled={state.status === "scanning"} />

      {globalConfig && <GlobalConfig config={globalConfig} />}

      {match(state)
        .with({ status: "idle" }, () => (
          <p className="status-message">
            Enter a parent directory above and click Scan to discover Claude
            configurations across your projects.
          </p>
        ))
        .with({ status: "scanning" }, () => (
          <p className="status-message">
            <span className="spinner" />
            Scanning directories...
          </p>
        ))
        .with({ status: "results" }, ({ data }) => (
          <FilteredResults data={data} />
        ))
        .with({ status: "error" }, ({ message }) => (
          <div className="error-message">Error: {message}</div>
        ))
        .exhaustive()}
    </div>
  );
}
