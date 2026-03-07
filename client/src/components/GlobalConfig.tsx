import { useState } from "react";
import type { GlobalConfig as GlobalConfigType } from "shared/schemas.js";

interface GlobalConfigProps {
  config: GlobalConfigType;
}

export function GlobalConfig({ config }: GlobalConfigProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="global-config">
      <h2>~/.claude/ Global Config</h2>

      {config.sources.length > 0 && (
        <div className="config-provenance">
          <button
            className="config-provenance-toggle"
            onClick={() => setSourcesOpen(!sourcesOpen)}
          >
            <span className="permission-freq-arrow">
              {sourcesOpen ? "▼" : "▶"}
            </span>
            Composed from {config.sources.length} source
            {config.sources.length === 1 ? "" : "s"}
          </button>
          {sourcesOpen && (
            <div className="config-provenance-list">
              {config.sources.map((source) => (
                <div key={source.path} className="config-provenance-item">
                  <span className="config-provenance-label">
                    {source.label}
                  </span>
                  <code className="config-provenance-path">{source.path}</code>
                  {source.settings?.permissions && (
                    <div className="config-provenance-perms">
                      {source.settings.permissions.allow?.length
                        ? `${source.settings.permissions.allow.length} allow`
                        : null}
                      {source.settings.permissions.ask?.length
                        ? `${source.settings.permissions.ask.length} ask`
                        : null}
                      {source.settings.permissions.deny?.length
                        ? `${source.settings.permissions.deny.length} deny`
                        : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
