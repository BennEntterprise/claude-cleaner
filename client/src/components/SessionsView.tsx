import { useEffect } from "react";
import { match } from "ts-pattern";
import type { SessionsResponse, EnrichedSession } from "shared/schemas.js";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

function SessionStats({ stats }: { stats: SessionsResponse["stats"] }) {
  return (
    <div className="session-stats">
      <div className="stat">
        <div className="stat-value">{stats.totalSessions}</div>
        <div className="stat-label">Sessions</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.projectsWithSessions}</div>
        <div className="stat-label">Projects</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.avgMessagesPerSession}</div>
        <div className="stat-label">Avg Messages</div>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: EnrichedSession }) {
  return (
    <div className="session-card">
      <div className="session-card-header">
        <span className="session-card-project">{session.projectName}</span>
        {session.gitBranch && (
          <span className="badge badge-sessions">{session.gitBranch}</span>
        )}
      </div>
      <div className="session-card-prompt">
        {truncate(session.firstPrompt, 150)}
      </div>
      <div className="session-card-meta">
        <span>{session.messageCount} messages</span>
        <span>Created {formatDate(session.created)}</span>
        <span>Modified {formatDate(session.modified)}</span>
      </div>
    </div>
  );
}

export function SessionsView({
  state,
  projectPaths,
  onFetch,
}: {
  state:
    | { status: "idle" }
    | { status: "loading" }
    | { status: "loaded"; data: SessionsResponse }
    | { status: "error"; message: string };
  projectPaths: string[];
  onFetch: (paths: string[]) => void;
}) {
  useEffect(() => {
    if (state.status === "idle" && projectPaths.length > 0) {
      onFetch(projectPaths);
    }
  }, [state.status, projectPaths, onFetch]);

  return match(state)
    .with({ status: "idle" }, () => (
      <p className="status-message">Select the Sessions tab after scanning to view session data.</p>
    ))
    .with({ status: "loading" }, () => (
      <p className="status-message">
        <span className="spinner" />
        Loading sessions...
      </p>
    ))
    .with({ status: "loaded" }, ({ data }) =>
      data.sessions.length === 0 ? (
        <p className="status-message">No sessions found for the scanned projects.</p>
      ) : (
        <>
          <SessionStats stats={data.stats} />
          <div className="session-list">
            {data.sessions.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        </>
      ),
    )
    .with({ status: "error" }, ({ message }) => (
      <div className="error-message">Error: {message}</div>
    ))
    .exhaustive();
}
