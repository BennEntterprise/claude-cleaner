import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { ProjectInfo, Stats, Settings } from "shared/schemas.js";

const CLAUDE_MD_MAX_LENGTH = 2000;

function encodePath(projectPath: string): string {
  // ~/.claude/projects/ uses the absolute path with separators replaced by hyphens
  // e.g. /Users/kyle/code/my-project -> -Users-kyle-code-my-project
  return projectPath.replace(/\//g, "-");
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonSafe(filePath: string): Promise<unknown | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readTextSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function countSessions(projectPath: string): Promise<number> {
  const encoded = encodePath(projectPath);
  const sessionsDir = path.join(os.homedir(), ".claude", "projects", encoded);

  try {
    const entries = await fs.readdir(sessionsDir);
    // Session files are .jsonl files
    return entries.filter((e) => e.endsWith(".jsonl")).length;
  } catch {
    return 0;
  }
}

async function scanProject(projectPath: string): Promise<ProjectInfo> {
  const name = path.basename(projectPath);
  const claudeDir = path.join(projectPath, ".claude");
  const claudeMdPath = path.join(projectPath, "CLAUDE.md");
  const settingsPath = path.join(claudeDir, "settings.local.json");

  const [hasClaudeDir, hasClaudeMd, settingsRaw, claudeMdRaw, sessionCount] =
    await Promise.all([
      fileExists(claudeDir),
      fileExists(claudeMdPath),
      readJsonSafe(settingsPath),
      readTextSafe(claudeMdPath),
      countSessions(projectPath),
    ]);

  const settings = settingsRaw as Settings | null;
  const claudeMdContent = claudeMdRaw
    ? claudeMdRaw.length > CLAUDE_MD_MAX_LENGTH
      ? claudeMdRaw.slice(0, CLAUDE_MD_MAX_LENGTH) + "\n... (truncated)"
      : claudeMdRaw
    : null;

  return {
    name,
    path: projectPath,
    hasClaudeDir,
    hasClaudeMd,
    settings,
    claudeMdContent,
    sessionCount,
  };
}

export async function scanDirectories(
  directories: string[]
): Promise<{ projects: ProjectInfo[]; stats: Stats }> {
  const allProjects: ProjectInfo[] = [];

  for (const dir of directories) {
    let entries: string[];
    try {
      const dirEntries = await fs.readdir(dir, { withFileTypes: true });
      entries = dirEntries
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => path.join(dir, e.name));
    } catch (err) {
      console.error(`Failed to read directory ${dir}:`, err);
      continue;
    }

    const results = await Promise.allSettled(entries.map(scanProject));

    for (const result of results) {
      if (result.status === "fulfilled") {
        allProjects.push(result.value);
      }
    }
  }

  allProjects.sort((a, b) => a.name.localeCompare(b.name));

  const stats: Stats = {
    totalScanned: allProjects.length,
    withClaudeDir: allProjects.filter((p) => p.hasClaudeDir).length,
    withClaudeMd: allProjects.filter((p) => p.hasClaudeMd).length,
    withCustomPermissions: allProjects.filter(
      (p) =>
        p.settings?.permissions &&
        ((p.settings.permissions.allow?.length ?? 0) > 0 ||
          (p.settings.permissions.deny?.length ?? 0) > 0)
    ).length,
  };

  return { projects: allProjects, stats };
}

export async function getGlobalConfig() {
  const claudeHome = path.join(os.homedir(), ".claude");

  const [claudeMdContent, settings, settingsLocal] = await Promise.all([
    readTextSafe(path.join(claudeHome, "CLAUDE.md")),
    readJsonSafe(path.join(claudeHome, "settings.json")) as Promise<Settings | null>,
    readJsonSafe(path.join(claudeHome, "settings.local.json")) as Promise<Settings | null>,
  ]);

  return { claudeMdContent, settings, settingsLocal };
}
