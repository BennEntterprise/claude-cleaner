import type { ProjectInfo } from "shared/schemas.js";

interface ProjectDetailProps {
  project: ProjectInfo;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="project-detail">
      {project.settings && (
        <>
          <h4>Settings (settings.local.json)</h4>
          <pre>{JSON.stringify(project.settings, null, 2)}</pre>
        </>
      )}

      {project.claudeMdContent && (
        <>
          <h4>CLAUDE.md</h4>
          <pre>{project.claudeMdContent}</pre>
        </>
      )}

      {!project.settings && !project.claudeMdContent && (
        <p className="no-config">No Claude configuration in this project.</p>
      )}
    </div>
  );
}
