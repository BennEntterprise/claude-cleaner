import { useState, useCallback } from "react";
import type { SessionsResponse } from "shared/schemas.js";

type SessionsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; data: SessionsResponse }
  | { status: "error"; message: string };

export function useSessions() {
  const [state, setState] = useState<SessionsState>({ status: "idle" });

  const fetchSessions = useCallback(async (projectPaths: string[]) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectPaths }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.formErrors?.[0] ?? "Failed to load sessions");
      }

      const data: SessionsResponse = await res.json();
      setState({ status: "loaded", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, fetchSessions, reset } as const;
}
