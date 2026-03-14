import type { Express } from "express";
import { ScanRequestSchema, SessionsRequestSchema } from "shared/schemas.js";
import { scanDirectories, getGlobalConfig, getSessionsForProjects } from "../services/scanner.js";

export function registerRoutes(app: Express) {
  app.post("/api/scan", async (req, res) => {
    const parsed = ScanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const result = await scanDirectories(parsed.data.directories);
    res.json(result);
  });

  app.get("/api/global-config", async (_req, res) => {
    const config = await getGlobalConfig();
    res.json(config);
  });

  app.post("/api/sessions", async (req, res) => {
    const parsed = SessionsRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const result = await getSessionsForProjects(parsed.data.projectPaths);
    res.json(result);
  });
}
