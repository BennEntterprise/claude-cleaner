import { useState, useCallback } from "react";
import type { ScanResponse, GlobalConfig } from "shared/schemas.js";

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "results"; data: ScanResponse }
  | { status: "error"; message: string };

export function useScan() {
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);

  const scan = useCallback(async (directories: string[]) => {
    setState({ status: "scanning" });
    try {
      const [scanRes, globalRes] = await Promise.all([
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directories }),
        }),
        fetch("/api/global-config"),
      ]);

      if (!scanRes.ok) {
        const err = await scanRes.json();
        throw new Error(err.error?.formErrors?.[0] ?? "Scan failed");
      }

      const data: ScanResponse = await scanRes.json();
      const global: GlobalConfig = await globalRes.json();

      setGlobalConfig(global);
      setState({ status: "results", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, []);

  return { state, globalConfig, scan } as const;
}
