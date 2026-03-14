import { useState, useMemo } from "react";
import { match } from "ts-pattern";
import type { ScanResponse, GlobalConfig as GlobalConfigType } from "shared/schemas.js";
import type { TabKey } from "./types/tabs";
import { useScan } from "./hooks/useScan";
import { useProjectFilter } from "./hooks/useProjectFilter";
import { useSessions } from "./hooks/useSessions";
import { ScanForm } from "./components/ScanForm";
import { GlobalConfig } from "./components/GlobalConfig";
import { StatsBar } from "./components/StatsBar";
import { TabNav } from "./components/TabNav";
import { FilterBar } from "./components/FilterBar";
import { ProjectList } from "./components/ProjectList";
import { PermissionFrequency } from "./components/PermissionFrequency";
import { SessionsView } from "./components/SessionsView";

function ResultsTabs({
  data,
  globalConfig,
}: {
  data: ScanResponse;
  globalConfig: GlobalConfigType | null;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { activeFilters, filtered, filteredStats, isFiltering, toggle, clearAll } =
    useProjectFilter(data.projects, data.stats);

  const sessions = useSessions();

  const projectPaths = useMemo(
    () => data.projects.map((p) => p.path),
    [data.projects],
  );

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
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {match(activeTab)
        .with("overview", () => (
          <>
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
        ))
        .with("permissions", () => (
          <PermissionFrequency projects={filtered} globalConfig={globalConfig} />
        ))
        .with("sessions", () => (
          <SessionsView
            state={sessions.state}
            projectPaths={projectPaths}
            onFetch={sessions.fetchSessions}
          />
        ))
        .exhaustive()}
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
          <ResultsTabs data={data} globalConfig={globalConfig} />
        ))
        .with({ status: "error" }, ({ message }) => (
          <div className="error-message">Error: {message}</div>
        ))
        .exhaustive()}
    </div>
  );
}
