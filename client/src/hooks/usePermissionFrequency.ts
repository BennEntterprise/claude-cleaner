import { useMemo } from "react";
import type { ProjectInfo } from "shared/schemas.js";

export type PermissionKind = "allow" | "deny" | "ask";

export interface PermissionEntry {
  permission: string;
  count: number;
  projectNames: string[];
}

export interface PermissionGroup {
  tool: string;
  entries: PermissionEntry[];
  totalCount: number;
}

export type PermissionFrequencyResult = Record<PermissionKind, PermissionGroup[]>;

/** Extract the tool name prefix from a permission string.
 *  - `Bash(npm install:*)` -> `Bash`
 *  - `WebSearch` -> `WebSearch`
 *  - `mcp__backlog__task_create` -> `mcp__backlog`
 */
function extractTool(permission: string): string {
  const parenIdx = permission.indexOf("(");
  if (parenIdx !== -1) return permission.slice(0, parenIdx);

  // MCP tools: take first two segments (e.g. mcp__backlog)
  if (permission.startsWith("mcp__")) {
    const parts = permission.split("__");
    return parts.length >= 2 ? `${parts[0]}__${parts[1]}` : permission;
  }

  return permission;
}

function groupPermissions(
  projects: ProjectInfo[],
  key: PermissionKind,
): PermissionGroup[] {
  const counts = new Map<string, { count: number; projectNames: string[] }>();
  for (const project of projects) {
    const perms = project.settings?.permissions?.[key];
    if (!perms) continue;
    for (const perm of perms) {
      const existing = counts.get(perm);
      if (existing) {
        existing.count++;
        existing.projectNames.push(project.name);
      } else {
        counts.set(perm, { count: 1, projectNames: [project.name] });
      }
    }
  }

  // Group entries by tool prefix
  const groups = new Map<string, PermissionEntry[]>();
  for (const [permission, { count, projectNames }] of counts) {
    const tool = extractTool(permission);
    const list = groups.get(tool) ?? [];
    list.push({ permission, count, projectNames });
    groups.set(tool, list);
  }

  // Sort entries within each group alphabetically, sort groups alphabetically
  return [...groups.entries()]
    .map(([tool, entries]) => {
      entries.sort((a, b) => a.permission.localeCompare(b.permission));
      return {
        tool,
        entries,
        totalCount: entries.reduce((sum, e) => sum + e.count, 0),
      };
    })
    .sort((a, b) => a.tool.localeCompare(b.tool));
}

export function usePermissionFrequency(
  projects: ProjectInfo[],
): PermissionFrequencyResult {
  return useMemo(
    () => ({
      allow: groupPermissions(projects, "allow"),
      deny: groupPermissions(projects, "deny"),
      ask: groupPermissions(projects, "ask"),
    }),
    [projects],
  );
}
