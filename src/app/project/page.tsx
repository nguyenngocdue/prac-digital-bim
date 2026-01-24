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
  const totalProjects = projects.length;
  const latestProject = projects[0];
  const latestProjectDate = latestProject
    ? new Date(latestProject.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No activity yet";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );
  const isBetween = (date: Date, start: Date, end: Date) =>
    date >= start && date < end;
  const isSameDay = (date: Date, target: Date) =>
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate();
  const latestProjects = projects.filter((project) =>
    isSameDay(new Date(project.createdAt), startOfToday)
  );
  const yesterdayProjects = projects.filter((project) =>
    isSameDay(new Date(project.createdAt), startOfYesterday)
  );
  const last7DaysProjects = projects.filter((project) =>
    isBetween(new Date(project.createdAt), startOfWeek, startOfYesterday)
  );

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
  };

  const openProject = (id: string) => {
    router.push(`/project/viewer?id=${id}`);
  };

  return (
    <div className="h-full min-h-screen overflow-y-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace Overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Project Hub
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Manage BIM initiatives, track updates, and launch new digital twin
              workspaces with confidence.
            </p>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-3 rounded-xl border bg-card p-4 text-sm shadow-sm lg:max-w-sm">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Total projects
              </p>
              <p className="mt-2 text-2xl font-semibold">{totalProjects}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Latest activity
              </p>
              <p className="mt-2 text-base font-semibold">
                {latestProjectDate}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Create a new project
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with a clear name or let the system generate one for you.
                </p>
              </div>
              <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                Auto-generated ID
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Project name</span>
                <input
                  className="h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  placeholder="Project name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                />
              </label>
              <Button onClick={createProject} className="h-11 px-6 text-sm">
                Create project
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: press Enter to launch immediately.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Fast start
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              Keep delivery moving
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Spin up a project, invite collaborators, and open the 3D viewer in
              seconds.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Always-on project history
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Instant viewer access
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Structured metadata
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {totalProjects} active
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            No projects yet. Create one to start your digital twin workspace.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Today
              </h3>
              {latestProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
                  No projects created today.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {latestProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="group cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {new Date(project.createdAt).toLocaleString()}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold transition group-hover:text-primary">
                            {project.name}
                          </h3>
                        </div>
                        <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                          Open
                        </span>
                      </div>
                      <div className="mt-4 rounded-lg border bg-background px-3 py-2 text-[11px] text-muted-foreground">
                        {project.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Yesterday
              </h3>
              {yesterdayProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
                  No projects created yesterday.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {yesterdayProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="group cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {new Date(project.createdAt).toLocaleString()}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold transition group-hover:text-primary">
                            {project.name}
                          </h3>
                        </div>
                        <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                          Open
                        </span>
                      </div>
                      <div className="mt-4 rounded-lg border bg-background px-3 py-2 text-[11px] text-muted-foreground">
                        {project.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                7 days ago
              </h3>
              {last7DaysProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
                  No projects created in the last 7 days.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {last7DaysProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="group cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {new Date(project.createdAt).toLocaleString()}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold transition group-hover:text-primary">
                            {project.name}
                          </h3>
                        </div>
                        <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                          Open
                        </span>
                      </div>
                      <div className="mt-4 rounded-lg border bg-background px-3 py-2 text-[11px] text-muted-foreground">
                        {project.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
