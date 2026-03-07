import { z } from "zod";

// --- Request schemas ---

export const ScanRequestSchema = z.object({
  directories: z.array(z.string().min(1)).min(1),
});
export type ScanRequest = z.infer<typeof ScanRequestSchema>;

// --- Claude settings schemas ---

export const PermissionsSchema = z.object({
  allow: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  ask: z.array(z.string()).optional(),
});
export type Permissions = z.infer<typeof PermissionsSchema>;

export const SettingsSchema = z.object({
  permissions: PermissionsSchema.optional(),
}).passthrough();
export type Settings = z.infer<typeof SettingsSchema>;

// --- Scan result schemas ---

export const ProjectInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  hasClaudeDir: z.boolean(),
  hasClaudeMd: z.boolean(),
  settings: SettingsSchema.nullable(),
  claudeMdContent: z.string().nullable(),
  sessionCount: z.number(),
});
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

export const StatsSchema = z.object({
  totalScanned: z.number(),
  withClaudeDir: z.number(),
  withClaudeMd: z.number(),
  withCustomPermissions: z.number(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const ScanResponseSchema = z.object({
  projects: z.array(ProjectInfoSchema),
  stats: StatsSchema,
});
export type ScanResponse = z.infer<typeof ScanResponseSchema>;

// --- Global config schema ---

export const ConfigSourceSchema = z.object({
  label: z.string(),
  path: z.string(),
  settings: SettingsSchema.nullable(),
});
export type ConfigSource = z.infer<typeof ConfigSourceSchema>;

export const GlobalConfigSchema = z.object({
  claudeMdContent: z.string().nullable(),
  settings: SettingsSchema.nullable(),
  settingsLocal: SettingsSchema.nullable(),
  sources: z.array(ConfigSourceSchema),
});
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
