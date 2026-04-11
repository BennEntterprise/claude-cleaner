import { useState } from "react";
import type { GlobalConfig, ProjectInfo } from "shared/schemas.js";
import {
  useDiffAnalysis,
  type ProjectDiff,
  type PermissionDiffEntry,
  type DiffHunk,
} from "../hooks/useDiffAnalysis";

interface DiffViewProps {
  projects: ProjectInfo[];
  globalConfig: GlobalConfig | null;
}

const CATEGORY_LABELS = { allow: "Allowed", deny: "Denied", ask: "Ask" } as const;

function PermissionDiffList({
  entries,
  variant,
  label,
}: {
  entries: PermissionDiffEntry[];
  variant: "project-only" | "redundant" | "global-only";
  label: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="diff-perm-section">
      <h5 className={`diff-perm-heading diff-perm-heading--${variant}`}>
        {label} ({entries.length})
      </h5>
      {entries.map((entry) => (
        <div key={`${entry.category}-${entry.permission}`} className={`diff-perm-entry diff-perm-entry--${variant}`}>
          <code>{entry.permission}</code>
          <span className="diff-perm-category">{CATEGORY_LABELS[entry.category]}</span>
        </div>
      ))}
    </div>
  );
}

function TextDiffSection({ hunks }: { hunks: DiffHunk[] }) {
  if (hunks.length === 0) return null;

  return (
    <div className="diff-text-section">
      <h5 className="diff-text-heading">CLAUDE.md</h5>
      <pre className="diff-text-block">
        {hunks.map((hunk, hi) => (
          <div key={hi} className="diff-text-hunk">
            <div className="diff-text-hunk-header">{hunk.header}</div>
            {hunk.lines.map((line, li) => (
              <div key={li} className={`diff-text-line diff-text-line--${line.type}`}>
                <span className="diff-text-prefix">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                {line.content}
              </div>
            ))}
          </div>
        ))}
      </pre>
    </div>
  );
}

function ProjectDiffCard({ diff }: { diff: ProjectDiff }) {
  const [open, setOpen] = useState(false);
  const { permissionDiff, textDiff } = diff;

  const badges: string[] = [];
  if (permissionDiff.projectOnly.length > 0) badges.push(`${permissionDiff.projectOnly.length} project-only`);
  if (permissionDiff.redundant.length > 0) badges.push(`${permissionDiff.redundant.length} redundant`);
  if (textDiff && textDiff.hunks.length > 0) badges.push(`+${textDiff.addedCount}/-${textDiff.removedCount} lines`);

  return (
    <div className="diff-card">
      <div className="diff-card-header" onClick={() => setOpen(!open)}>
        <span className="diff-card-arrow">{open ? "▼" : "▶"}</span>
        <span className="diff-card-name">{diff.projectName}</span>
        {badges.map((b) => (
          <span key={b} className="diff-card-badge">{b}</span>
        ))}
        <span className="diff-card-path">{diff.projectPath}</span>
      </div>
      {open && (
        <div className="diff-card-body">
          <PermissionDiffList
            entries={permissionDiff.projectOnly}
            variant="project-only"
            label="Project-only permissions"
          />
          <PermissionDiffList
            entries={permissionDiff.redundant}
            variant="redundant"
            label="Redundant permissions (also in global)"
          />
          <PermissionDiffList
            entries={permissionDiff.globalOnly}
            variant="global-only"
            label="Global-only permissions (not in project)"
          />
          {textDiff && <TextDiffSection hunks={textDiff.hunks} />}
        </div>
      )}
    </div>
  );
}

export function DiffView({ projects, globalConfig }: DiffViewProps) {
  const { diffs, summary } = useDiffAnalysis(projects, globalConfig);

  if (!globalConfig) {
    return (
      <p className="status-message">
        No global configuration found to compare against.
      </p>
    );
  }

  const withDiffs = diffs.filter((d) => d.hasDifferences);

  if (withDiffs.length === 0) {
    return (
      <p className="status-message">
        All projects match the global configuration.
      </p>
    );
  }

  return (
    <div className="diff-view">
      <div className="diff-summary">
        <div className="diff-summary-stat">
          <span className="diff-summary-value">{summary.projectsWithPermDiffs}</span>
          <span className="diff-summary-label">with perm diffs</span>
        </div>
        <div className="diff-summary-stat">
          <span className="diff-summary-value">{summary.projectsWithTextDiffs}</span>
          <span className="diff-summary-label">with text diffs</span>
        </div>
        <div className="diff-summary-stat">
          <span className="diff-summary-value">{summary.totalRedundant}</span>
          <span className="diff-summary-label">redundant perms</span>
        </div>
      </div>
      <div className="diff-list">
        {withDiffs.map((diff) => (
          <ProjectDiffCard key={diff.projectPath} diff={diff} />
        ))}
      </div>
    </div>
  );
}
