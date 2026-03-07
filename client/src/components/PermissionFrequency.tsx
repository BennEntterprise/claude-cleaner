import { useState } from "react";
import type {
  PermissionFrequencyResult,
  PermissionGroup,
  PermissionKind,
} from "../hooks/usePermissionFrequency";

interface PermissionFrequencyProps {
  frequency: PermissionFrequencyResult;
}

const SECTION_LABELS: Record<PermissionKind, string> = {
  allow: "Allowed",
  deny: "Denied",
  ask: "Ask",
};

function GroupSection({
  group,
  variant,
}: {
  group: PermissionGroup;
  variant: PermissionKind;
}) {
  const [open, setOpen] = useState(false);
  const isSingle = group.entries.length === 1;

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

function PermissionSection({
  groups,
  variant,
}: {
  groups: PermissionGroup[];
  variant: PermissionKind;
}) {
  const [open, setOpen] = useState(false);
  const entryCount = groups.reduce((s, g) => s + g.entries.length, 0);

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
      {open && (groups.length > 0
        ? groups.map((group) => (
            <GroupSection key={group.tool} group={group} variant={variant} />
          ))
        : <span className="permission-freq-empty">None</span>
      )}
    </div>
  );
}

export function PermissionFrequency({ frequency }: PermissionFrequencyProps) {
  const [open, setOpen] = useState(false);
  const totalUnique = (["allow", "deny", "ask"] as const).reduce(
    (s, k) => s + frequency[k].reduce((gs, g) => gs + g.entries.length, 0),
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
        <div className="permission-freq-body">
          <PermissionSection groups={frequency.allow} variant="allow" />
          <PermissionSection groups={frequency.deny} variant="deny" />
          <PermissionSection groups={frequency.ask} variant="ask" />
        </div>
      )}
    </div>
  );
}
