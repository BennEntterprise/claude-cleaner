export type FilterKey =
  | "hasClaudeDir"
  | "hasClaudeMd"
  | "hasPermissions"
  | "hasSessions";

export type ActiveFilters = Set<FilterKey>;

export const FILTER_LABELS: Record<FilterKey, string> = {
  hasClaudeDir: ".claude/ dirs",
  hasClaudeMd: "CLAUDE.md files",
  hasPermissions: "Custom Permissions",
  hasSessions: "Sessions",
};
