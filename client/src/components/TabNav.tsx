import type { TabKey } from "../types/tabs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  { key: "sessions", label: "Sessions" },
];

export function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-nav-item${activeTab === tab.key ? " tab-nav-item--active" : ""}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
