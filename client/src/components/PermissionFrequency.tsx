import { useState } from "react";
import type { PermissionFrequencyResult } from "../hooks/usePermissionFrequency";

interface PermissionFrequencyProps {
  frequency: PermissionFrequencyResult;
}

function PermissionList({
  entries,
  variant,
}: {
  entries: PermissionFrequencyResult["allow"];
  variant: "allow" | "deny";
}) {
  return (
    <div className={`permission-freq-section permission-freq-${variant}`}>
      <h4>{variant === "allow" ? "Allowed" : "Denied"}</h4>
      {entries.map((entry) => (
        <div key={entry.permission} className="permission-freq-row">
          <code>{entry.permission}</code>
          <span className="permission-freq-count">
            {entry.count} {entry.count === 1 ? "project" : "projects"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PermissionFrequency({ frequency }: PermissionFrequencyProps) {
  const [open, setOpen] = useState(false);
  const hasEntries = frequency.allow.length > 0 || frequency.deny.length > 0;

  if (!hasEntries) return null;

  return (
    <div className="permission-freq">
      <button
        className="permission-freq-toggle"
        onClick={() => setOpen(!open)}
      >
        <span className="permission-freq-arrow">{open ? "▼" : "▶"}</span>
        Permission Frequency
        <span className="permission-freq-badge">
          {frequency.allow.length + frequency.deny.length} unique
        </span>
      </button>
      {open && (
        <div className="permission-freq-body">
          {frequency.allow.length > 0 && (
            <PermissionList entries={frequency.allow} variant="allow" />
          )}
          {frequency.deny.length > 0 && (
            <PermissionList entries={frequency.deny} variant="deny" />
          )}
        </div>
      )}
    </div>
  );
}
