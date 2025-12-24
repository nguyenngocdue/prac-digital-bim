"use client";

import { Suspense, type FC } from "react";
import { useSearchParams } from "next/navigation";
import PanelsLayout from "@/components/3d-viewers/layouts";

/**
 * Project Detail Content Component
 */
const ProjectDetailContent: FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams ? searchParams.get("id") : null;

  if (!projectId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-md border bg-card p-4 text-muted-foreground">
          No project selected.
        </div>
      </div>
    );
  }

  return <PanelsLayout projectId={projectId} />;
};

/**
 * Project Viewer page - Display 3D viewer for a specific project
 */
const AppProjectPage: FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
};

export default AppProjectPage;
