import { useMemo } from "react";
import type { ProjectInfo } from "shared/schemas.js";

export interface PermissionEntry {
  permission: string;
  count: number;
}

export interface PermissionFrequencyResult {
  allow: PermissionEntry[];
  deny: PermissionEntry[];
}

function countPermissions(
  projects: ProjectInfo[],
  key: "allow" | "deny",
): PermissionEntry[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    const perms = project.settings?.permissions?.[key];
    if (!perms) continue;
    for (const perm of perms) {
      counts.set(perm, (counts.get(perm) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([permission, count]) => ({ permission, count }))
    .sort((a, b) => b.count - a.count);
}

export function usePermissionFrequency(
  projects: ProjectInfo[],
): PermissionFrequencyResult {
  return useMemo(
    () => ({
      allow: countPermissions(projects, "allow"),
      deny: countPermissions(projects, "deny"),
    }),
    [projects],
  );
}
