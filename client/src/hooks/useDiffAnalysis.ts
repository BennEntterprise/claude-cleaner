import { useMemo } from "react";
import { structuredPatch } from "diff";
import type { GlobalConfig, ProjectInfo } from "shared/schemas.js";

export type PermissionKind = "allow" | "deny" | "ask";

export interface PermissionDiffEntry {
  permission: string;
  category: PermissionKind;
}

export interface PermissionDiffResult {
  projectOnly: PermissionDiffEntry[];
  redundant: PermissionDiffEntry[];
  globalOnly: PermissionDiffEntry[];
}

export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface TextDiffResult {
  hunks: DiffHunk[];
  addedCount: number;
  removedCount: number;
}

export interface ProjectDiff {
  projectName: string;
  projectPath: string;
  permissionDiff: PermissionDiffResult;
  textDiff: TextDiffResult | null;
  hasDifferences: boolean;
}

export interface DiffSummary {
  projectsWithPermDiffs: number;
  projectsWithTextDiffs: number;
  totalRedundant: number;
}

export interface DiffAnalysisResult {
  diffs: ProjectDiff[];
  summary: DiffSummary;
}

function buildGlobalPermissionSets(
  globalConfig: GlobalConfig,
): Record<PermissionKind, Set<string>> {
  const result: Record<PermissionKind, Set<string>> = {
    allow: new Set(),
    deny: new Set(),
    ask: new Set(),
  };

  for (const kind of ["allow", "deny", "ask"] as const) {
    for (const perm of globalConfig.settings?.permissions?.[kind] ?? []) {
      result[kind].add(perm);
    }
    for (const perm of globalConfig.settingsLocal?.permissions?.[kind] ?? []) {
      result[kind].add(perm);
    }
  }

  return result;
}

function computePermissionDiff(
  projectSettings: ProjectInfo["settings"],
  globalSets: Record<PermissionKind, Set<string>>,
): PermissionDiffResult {
  const projectOnly: PermissionDiffEntry[] = [];
  const redundant: PermissionDiffEntry[] = [];
  const globalOnly: PermissionDiffEntry[] = [];

  for (const kind of ["allow", "deny", "ask"] as const) {
    const projectPerms = new Set(
      projectSettings?.permissions?.[kind] ?? [],
    );
    const globalPerms = globalSets[kind];

    for (const perm of projectPerms) {
      if (globalPerms.has(perm)) {
        redundant.push({ permission: perm, category: kind });
      } else {
        projectOnly.push({ permission: perm, category: kind });
      }
    }

    for (const perm of globalPerms) {
      if (!projectPerms.has(perm)) {
        globalOnly.push({ permission: perm, category: kind });
      }
    }
  }

  return { projectOnly, redundant, globalOnly };
}

function computeTextDiff(
  projectContent: string | null,
  globalContent: string | null,
): TextDiffResult | null {
  if (!projectContent && !globalContent) return null;

  const patch = structuredPatch(
    "global CLAUDE.md",
    "project CLAUDE.md",
    globalContent ?? "",
    projectContent ?? "",
    undefined,
    undefined,
    { context: 3 },
  );

  const hunks: DiffHunk[] = patch.hunks.map((h) => ({
    header: `@@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@`,
    lines: h.lines.map((line) => {
      if (line.startsWith("+")) {
        return { type: "added" as const, content: line.slice(1) };
      }
      if (line.startsWith("-")) {
        return { type: "removed" as const, content: line.slice(1) };
      }
      return { type: "context" as const, content: line.startsWith(" ") ? line.slice(1) : line };
    }),
  }));

  const addedCount = hunks.reduce(
    (s, h) => s + h.lines.filter((l) => l.type === "added").length,
    0,
  );
  const removedCount = hunks.reduce(
    (s, h) => s + h.lines.filter((l) => l.type === "removed").length,
    0,
  );

  return { hunks, addedCount, removedCount };
}

export function useDiffAnalysis(
  projects: ProjectInfo[],
  globalConfig: GlobalConfig | null,
): DiffAnalysisResult {
  return useMemo(() => {
    if (!globalConfig) {
      return { diffs: [], summary: { projectsWithPermDiffs: 0, projectsWithTextDiffs: 0, totalRedundant: 0 } };
    }

    const globalSets = buildGlobalPermissionSets(globalConfig);

    const diffs: ProjectDiff[] = projects.map((project) => {
      const permissionDiff = computePermissionDiff(project.settings, globalSets);
      const textDiff = computeTextDiff(project.claudeMdContent, globalConfig.claudeMdContent);

      const hasPermDiffs =
        permissionDiff.projectOnly.length > 0 ||
        permissionDiff.redundant.length > 0 ||
        permissionDiff.globalOnly.length > 0;
      const hasTextDiffs = textDiff !== null && textDiff.hunks.length > 0;

      return {
        projectName: project.name,
        projectPath: project.path,
        permissionDiff,
        textDiff,
        hasDifferences: hasPermDiffs || hasTextDiffs,
      };
    });

    const summary: DiffSummary = {
      projectsWithPermDiffs: diffs.filter(
        (d) =>
          d.permissionDiff.projectOnly.length > 0 ||
          d.permissionDiff.redundant.length > 0 ||
          d.permissionDiff.globalOnly.length > 0,
      ).length,
      projectsWithTextDiffs: diffs.filter(
        (d) => d.textDiff !== null && d.textDiff.hunks.length > 0,
      ).length,
      totalRedundant: diffs.reduce(
        (s, d) => s + d.permissionDiff.redundant.length,
        0,
      ),
    };

    return { diffs, summary };
  }, [projects, globalConfig]);
}
