"use client";

import { useState, useEffect, type FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
  createdAt: string;
};

const STORAGE_KEY = "projects_v1";

/**
 * Project list page - Create and manage projects
 */
const ProjectPage: FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");

  const persist = (items: Project[]) => {
    setProjects(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProjects(JSON.parse(raw));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const createProject = () => {
    const id =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2, 10);

    const newProject: Project = {
      id,
      name: name.trim() || `Project ${id.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
    };

    persist([newProject, ...projects]);
    setName("");
    router.push(`/project/viewer?id=${id}`);
  };

  const openProject = (id: string) => {
    router.push(`/project/viewer?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-2xl font-semibold">Projects</h2>

        {/* Create Project Form */}
        <div className="mb-4 flex gap-2">
          <input
            className="flex-1 rounded-md border bg-card px-3 py-2 text-foreground"
            placeholder="Project name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createProject()}
          />
          <Button onClick={createProject} variant="default" size="sm">
            Create
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-md border bg-card p-4 text-muted-foreground">
              No projects yet. Create one above.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => openProject(project.id)}
                className="cursor-pointer rounded-md border bg-card p-4 transition-shadow hover:shadow-lg"
              >
                <div className="text-sm text-muted-foreground">
                  {new Date(project.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-lg font-medium">{project.name}</div>
                <div className="mt-2 break-all text-xs text-muted-foreground">
                  {project.id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
