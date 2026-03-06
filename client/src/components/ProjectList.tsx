import { useState } from "react";
import type { ProjectInfo } from "shared/schemas.js";
import type { ActiveFilters, FilterKey } from "../types/filters";
import { ProjectDetail } from "./ProjectDetail";

interface ProjectListProps {
  projects: ProjectInfo[];
  isFiltering: boolean;
  activeFilters: ActiveFilters;
  onToggleFilter: (key: FilterKey) => void;
}

export function ProjectList({
  projects,
  isFiltering,
  activeFilters,
  onToggleFilter,
}: ProjectListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (projects.length === 0) {
    return (
      <p className="status-message">
        {isFiltering
          ? "No projects match the current filters."
          : "No projects found in the scanned directories."}
      </p>
    );
  }

  const badgeClick = (e: React.MouseEvent, key: FilterKey) => {
    e.stopPropagation();
    onToggleFilter(key);
  };

  return (
    <div className="project-list">
      {projects.map((project) => (
        <div className="project-item" key={project.path}>
          <div className="project-header" onClick={() => toggle(project.path)}>
            <span className="project-name">{project.name}</span>
            {project.hasClaudeDir && (
              <span
                className={`badge badge-dir${activeFilters.has("hasClaudeDir") ? " badge--active" : ""}`}
                onClick={(e) => badgeClick(e, "hasClaudeDir")}
              >
                .claude/
              </span>
            )}
            {project.hasClaudeMd && (
              <span
                className={`badge badge-md${activeFilters.has("hasClaudeMd") ? " badge--active" : ""}`}
                onClick={(e) => badgeClick(e, "hasClaudeMd")}
              >
                CLAUDE.md
              </span>
            )}
            {project.sessionCount > 0 && (
              <span
                className={`badge badge-sessions${activeFilters.has("hasSessions") ? " badge--active" : ""}`}
                onClick={(e) => badgeClick(e, "hasSessions")}
              >
                {project.sessionCount} session
                {project.sessionCount !== 1 ? "s" : ""}
              </span>
            )}
            {project.settings?.permissions && (
              <span
                className={`badge badge-permissions${activeFilters.has("hasPermissions") ? " badge--active" : ""}`}
                onClick={(e) => badgeClick(e, "hasPermissions")}
              >
                permissions
              </span>
            )}
            <span className="project-path">{project.path}</span>
          </div>
          {expanded.has(project.path) && <ProjectDetail project={project} />}
        </div>
      ))}
    </div>
  );
}
