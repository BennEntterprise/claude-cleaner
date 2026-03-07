import { useState } from "react";
import type { ProjectInfo } from "shared/schemas.js";
import {
  usePermissionFrequency,
  type PermissionTreeNode,
  type PermissionEntry,
  type PermissionKind,
} from "../hooks/usePermissionFrequency";

interface PermissionFrequencyProps {
  projects: ProjectInfo[];
}

const SECTION_LABELS: Record<PermissionKind, string> = {
  allow: "Allowed",
  deny: "Denied",
  ask: "Ask",
};

function EntryRow({
  entry,
  indent,
}: {
  entry: PermissionEntry;
  indent: number;
}) {
  return (
    <div
      className="permission-freq-row"
      style={{ paddingLeft: `${0.5 + indent}rem` }}
    >
      <code>{entry.permission}</code>
      <span
        className="permission-freq-count tooltip-trigger"
        data-tooltip={entry.projectNames.join("\n")}
      >
        {entry.count} {entry.count === 1 ? "project" : "projects"}
      </span>
    </div>
  );
}

function TreeNode({
  node,
  variant,
  indent,
}: {
  node: PermissionTreeNode;
  variant: PermissionKind;
  indent: number;
}) {
  const [open, setOpen] = useState(false);
  const isSingleLeaf =
    node.children.length === 0 && node.entries.length === 1;

  if (isSingleLeaf) {
    return <EntryRow entry={node.entries[0]} indent={indent} />;
  }

  return (
    <div className={`permission-freq-group permission-freq-group-${variant}`}>
      <button
        className="permission-freq-group-toggle"
        style={{ paddingLeft: `${0.5 + indent}rem` }}
        onClick={() => setOpen(!open)}
      >
        <span className="permission-freq-arrow">{open ? "▼" : "▶"}</span>
        <code>{node.label}</code>
        <span className="permission-freq-count">
          {node.totalEntryCount}{" "}
          {node.totalEntryCount === 1 ? "rule" : "rules"}
        </span>
      </button>
      {open && (
        <>
          {node.children.map((child) => (
            <TreeNode
              key={child.label}
              node={child}
              variant={variant}
              indent={indent + 1}
            />
          ))}
          {node.entries.map((entry) => (
            <EntryRow
              key={entry.permission}
              entry={entry}
              indent={indent + 1}
            />
          ))}
        </>
      )}
    </div>
  );
}

function PermissionSection({
  nodes,
  variant,
}: {
  nodes: PermissionTreeNode[];
  variant: PermissionKind;
}) {
  const [open, setOpen] = useState(false);
  const entryCount = nodes.reduce((s, n) => s + n.totalEntryCount, 0);

  return (
    <div className={`permission-freq-section permission-freq-${variant}`}>
      <button
        className="permission-freq-section-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="permission-freq-arrow">{open ? "▼" : "▶"}</span>
        <h4>{SECTION_LABELS[variant]}</h4>
        <span className="permission-freq-count">{entryCount} rules</span>
      </button>
      {open &&
        (nodes.length > 0 ? (
          nodes.map((node) => (
            <TreeNode
              key={node.label}
              node={node}
              variant={variant}
              indent={0}
            />
          ))
        ) : (
          <span className="permission-freq-empty">None</span>
        ))}
    </div>
  );
}

export function PermissionFrequency({ projects }: PermissionFrequencyProps) {
  const [open, setOpen] = useState(false);
  const [depth, setDepth] = useState(1);
  const frequency = usePermissionFrequency(projects, depth);

  const totalUnique = (["allow", "deny", "ask"] as const).reduce(
    (s, k) =>
      s + frequency[k].reduce((ns, n) => ns + n.totalEntryCount, 0),
    0,
  );

  if (totalUnique === 0) return null;

  return (
    <div className="permission-freq">
      <button
        className="permission-freq-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="permission-freq-arrow">{open ? "▼" : "▶"}</span>
        Permission Frequency
        <span className="permission-freq-badge">
          {totalUnique} unique
        </span>
      </button>
      {open && (
        <>
          <div className="permission-freq-depth">
            <span className="permission-freq-depth-label">Depth</span>
            <button
              className="permission-freq-depth-btn"
              onClick={() => setDepth((d) => Math.max(1, d - 1))}
              disabled={depth <= 1}
            >
              -
            </button>
            <span className="permission-freq-depth-value">{depth}</span>
            <button
              className="permission-freq-depth-btn"
              onClick={() => setDepth((d) => Math.min(5, d + 1))}
              disabled={depth >= 5}
            >
              +
            </button>
          </div>
          <div className="permission-freq-body">
            <PermissionSection nodes={frequency.allow} variant="allow" />
            <PermissionSection nodes={frequency.deny} variant="deny" />
            <PermissionSection nodes={frequency.ask} variant="ask" />
          </div>
        </>
      )}
    </div>
  );
}
