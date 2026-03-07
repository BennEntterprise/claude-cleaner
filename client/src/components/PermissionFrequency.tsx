import { useState } from "react";
import type {
  PermissionFrequencyResult,
  PermissionGroup,
} from "../hooks/usePermissionFrequency";

interface PermissionFrequencyProps {
  frequency: PermissionFrequencyResult;
}

function GroupSection({
  group,
  variant,
}: {
  group: PermissionGroup;
  variant: "allow" | "deny";
}) {
  const [open, setOpen] = useState(false);
  const isSingle = group.entries.length === 1;

  // For single-entry groups, render flat (no nesting)
  if (isSingle) {
    const entry = group.entries[0];
    return (
      <div className="permission-freq-row">
        <code>{entry.permission}</code>
        <span className="permission-freq-count">
          {entry.count} {entry.count === 1 ? "project" : "projects"}
        </span>
      </div>
    );
  }

  return (
    <div className={`permission-freq-group permission-freq-group-${variant}`}>
      <button
        className="permission-freq-group-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="permission-freq-arrow">{open ? "▼" : "▶"}</span>
        <code>{group.tool}</code>
        <span className="permission-freq-count">
          {group.entries.length} rules
        </span>
      </button>
      {open &&
        group.entries.map((entry) => (
          <div key={entry.permission} className="permission-freq-row permission-freq-row-nested">
            <code>{entry.permission}</code>
            <span className="permission-freq-count">
              {entry.count} {entry.count === 1 ? "project" : "projects"}
            </span>
          </div>
        ))}
    </div>
  );
}

function PermissionList({
  groups,
  variant,
}: {
  groups: PermissionGroup[];
  variant: "allow" | "deny";
}) {
  return (
    <div className={`permission-freq-section permission-freq-${variant}`}>
      <h4>{variant === "allow" ? "Allowed" : "Denied"}</h4>
      {groups.map((group) => (
        <GroupSection key={group.tool} group={group} variant={variant} />
      ))}
    </div>
  );
}

export function PermissionFrequency({ frequency }: PermissionFrequencyProps) {
  const [open, setOpen] = useState(false);
  const totalUnique =
    frequency.allow.reduce((s, g) => s + g.entries.length, 0) +
    frequency.deny.reduce((s, g) => s + g.entries.length, 0);

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
        <div className="permission-freq-body">
          {frequency.allow.length > 0 && (
            <PermissionList groups={frequency.allow} variant="allow" />
          )}
          {frequency.deny.length > 0 && (
            <PermissionList groups={frequency.deny} variant="deny" />
          )}
        </div>
      )}
    </div>
  );
}
