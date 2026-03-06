import { useState } from "react";
import type { ProjectInfo } from "shared/schemas.js";
import { ProjectDetail } from "./ProjectDetail";

interface ProjectListProps {
  projects: ProjectInfo[];
}

export function ProjectList({ projects }: ProjectListProps) {
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
    return <p className="status-message">No projects found in the scanned directories.</p>;
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <div className="project-item" key={project.path}>
          <div className="project-header" onClick={() => toggle(project.path)}>
            <span className="project-name">{project.name}</span>
            {project.hasClaudeDir && <span className="badge badge-dir">.claude/</span>}
            {project.hasClaudeMd && <span className="badge badge-md">CLAUDE.md</span>}
            {project.sessionCount > 0 && (
              <span className="badge badge-sessions">
                {project.sessionCount} session{project.sessionCount !== 1 ? "s" : ""}
              </span>
            )}
            {project.settings?.permissions && (
              <span className="badge badge-permissions">permissions</span>
            )}
            <span className="project-path">{project.path}</span>
          </div>
          {expanded.has(project.path) && <ProjectDetail project={project} />}
        </div>
      ))}
    </div>
  );
}
