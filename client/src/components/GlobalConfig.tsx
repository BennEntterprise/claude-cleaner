import type { GlobalConfig as GlobalConfigType } from "shared/schemas.js";

interface GlobalConfigProps {
  config: GlobalConfigType;
}

export function GlobalConfig({ config }: GlobalConfigProps) {
  return (
    <div className="global-config">
      <h2>~/.claude/ Global Config</h2>

      {config.claudeMdContent && (
        <div className="config-section">
          <h3>CLAUDE.md</h3>
          <pre>{config.claudeMdContent}</pre>
        </div>
      )}

      {config.settings && (
        <div className="config-section">
          <h3>settings.json</h3>
          <pre>{JSON.stringify(config.settings, null, 2)}</pre>
        </div>
      )}

      {config.settingsLocal && (
        <div className="config-section">
          <h3>settings.local.json</h3>
          <pre>{JSON.stringify(config.settingsLocal, null, 2)}</pre>
        </div>
      )}

      {!config.claudeMdContent && !config.settings && !config.settingsLocal && (
        <p className="no-config">No global configuration found.</p>
      )}
    </div>
  );
}
