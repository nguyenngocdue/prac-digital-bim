"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  createdAt: string;
};

const STORAGE_KEY = "projects_v1";

const ProjectIndex = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");

  const persist = (items: Project[]) => {
    setProjects(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjects(JSON.parse(raw));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const createProject = () => {
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 10);
    const p: Project = { id, name: name || `Project ${id.slice(0, 6)}`, createdAt: new Date().toISOString() };
    persist([p, ...projects]);
    setName("");
    // navigate to the new project detail via query param under /app
    router.push(`project/viewer?id=${id}`);
  };

  const openProject = (id: string) => {
    router.push(`project/viewer?id=${id}`);
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>

        <div className="mb-4 flex gap-2">
          <input className="flex-1 rounded-md border px-3 py-2 bg-card text-foreground" placeholder="Project name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createProject} variant="default" size="sm">Create</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-md border p-4 bg-card text-muted-foreground">No projects yet. Create one above.</div>
          ) : (
            projects.map((p) => (
              <div key={p.id} onClick={() => openProject(p.id)} className="cursor-pointer rounded-md border p-4 bg-card hover:shadow-lg">
                <div className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="text-lg font-medium mt-1">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-2 break-all">{p.id}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectIndex;
