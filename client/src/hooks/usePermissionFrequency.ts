import { useMemo } from "react";
import type { ProjectInfo } from "shared/schemas.js";

export type PermissionKind = "allow" | "deny" | "ask";

export interface PermissionEntry {
  permission: string;
  count: number;
  projectNames: string[];
}

export interface PermissionTreeNode {
  label: string;
  children: PermissionTreeNode[];
  entries: PermissionEntry[];
  totalEntryCount: number;
}

export type PermissionFrequencyResult = Record<PermissionKind, PermissionTreeNode[]>;

/** Extract the tool name prefix from a permission string. */
function extractTool(permission: string): string {
  const parenIdx = permission.indexOf("(");
  if (parenIdx !== -1) return permission.slice(0, parenIdx);

  if (permission.startsWith("mcp__")) {
    const parts = permission.split("__");
    return parts.length >= 2 ? `${parts[0]}__${parts[1]}` : permission;
  }

  return permission;
}

/** Extract argument tokens from inside the parentheses.
 *  `Bash(npm install:*)` -> ["npm", "install", "*"]
 *  `WebFetch(domain:github.com)` -> ["domain", "github.com"]
 *  `WebSearch` -> []
 */
function extractArgTokens(permission: string): string[] {
  const open = permission.indexOf("(");
  const close = permission.lastIndexOf(")");
  if (open === -1 || close === -1) return [];
  return permission.slice(open + 1, close).split(/[\s:]+/).filter(Boolean);
}

/** Recursively build sub-groups from arg tokens. */
function buildSubtree(
  entries: PermissionEntry[],
  tokenIndex: number,
  remainingDepth: number,
): { children: PermissionTreeNode[]; leafEntries: PermissionEntry[] } {
  if (remainingDepth <= 0) {
    return { children: [], leafEntries: entries };
  }

  const grouped = new Map<string, PermissionEntry[]>();
  const ungrouped: PermissionEntry[] = [];

  for (const entry of entries) {
    const tokens = extractArgTokens(entry.permission);
    if (tokenIndex < tokens.length) {
      const key = tokens[tokenIndex];
      const list = grouped.get(key) ?? [];
      list.push(entry);
      grouped.set(key, list);
    } else {
      ungrouped.push(entry);
    }
  }

  const children: PermissionTreeNode[] = [];
  for (const [label, groupEntries] of [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const sub = buildSubtree(groupEntries, tokenIndex + 1, remainingDepth - 1);
    children.push({
      label,
      children: sub.children,
      entries: sub.leafEntries.sort((a, b) =>
        a.permission.localeCompare(b.permission),
      ),
      totalEntryCount: groupEntries.length,
    });
  }

  return {
    children,
    leafEntries: ungrouped.sort((a, b) =>
      a.permission.localeCompare(b.permission),
    ),
  };
}

function groupPermissions(
  projects: ProjectInfo[],
  key: PermissionKind,
  depth: number,
): PermissionTreeNode[] {
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

  const allEntries: PermissionEntry[] = [...counts.entries()].map(
    ([permission, { count, projectNames }]) => ({
      permission,
      count,
      projectNames,
    }),
  );

  // Group by tool name (always depth 1)
  const toolGroups = new Map<string, PermissionEntry[]>();
  for (const entry of allEntries) {
    const tool = extractTool(entry.permission);
    const list = toolGroups.get(tool) ?? [];
    list.push(entry);
    toolGroups.set(tool, list);
  }

  return [...toolGroups.entries()]
    .map(([tool, entries]) => {
      const sub = buildSubtree(entries, 0, depth - 1);
      return {
        label: tool,
        children: sub.children,
        entries: sub.leafEntries.sort((a, b) =>
          a.permission.localeCompare(b.permission),
        ),
        totalEntryCount: entries.length,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function usePermissionFrequency(
  projects: ProjectInfo[],
  depth: number,
): PermissionFrequencyResult {
  return useMemo(
    () => ({
      allow: groupPermissions(projects, "allow", depth),
      deny: groupPermissions(projects, "deny", depth),
      ask: groupPermissions(projects, "ask", depth),
    }),
    [projects, depth],
  );
}
