import { match } from "ts-pattern";
import { useScan } from "./hooks/useScan";
import { ScanForm } from "./components/ScanForm";
import { GlobalConfig } from "./components/GlobalConfig";
import { StatsBar } from "./components/StatsBar";
import { ProjectList } from "./components/ProjectList";

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
          <>
            <StatsBar stats={data.stats} />
            <ProjectList projects={data.projects} />
          </>
        ))
        .with({ status: "error" }, ({ message }) => (
          <div className="error-message">Error: {message}</div>
        ))
        .exhaustive()}
    </div>
  );
}
