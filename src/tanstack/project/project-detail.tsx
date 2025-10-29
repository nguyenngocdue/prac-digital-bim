"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

const ProjectDetail = () => {
  const navigate: any = useNavigate();
  const [projectId, setProjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      // expect .../project/:id
      const id = parts.length > 1 ? parts[parts.length - 1] : null;
      setProjectId(id);
    } catch {
      setProjectId(null);
    }
  }, []);

  if (!projectId) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Project</h2>
          <div className="rounded-md border p-4 bg-card text-muted-foreground">No project selected.</div>
          <div className="mt-4">
            <Button onClick={() => navigate(`/project`)} variant="ghost" size="sm">Back to projects</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Project</h2>
        <div className="rounded-md border p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-2">Project ID</p>
          <pre className="break-all">{projectId}</pre>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={() => navigate(`/project`)} variant="outline" size="sm">Back to projects</Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
