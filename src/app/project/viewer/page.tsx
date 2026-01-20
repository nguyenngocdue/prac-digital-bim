"use client";

import { Suspense, useEffect, type FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PanelsLayout from "@/components/3d-viewers/layouts";
import { Button } from "@/components/ui/button";

/**
 * Project Detail Content Component
 */
const ProjectDetailContent: FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams ? searchParams.get("id") : null;

  if (!projectId) {
    return (
      <div className="viewer-shell flex h-full w-full items-center justify-center px-6">
        <div className="viewer-panel viewer-panel-strong viewer-panel-enter max-w-md rounded-2xl p-6 text-center">
          <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.3em]">
            Project viewer
          </div>
          <h2 className="mt-3 text-lg font-semibold">No project selected</h2>
          <p className="mt-2 text-sm viewer-muted">
            Choose a project to open its model, sensors, and live feeds.
          </p>
          <div className="mt-5 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/project">Go to projects</Link>
            </Button>
          </div>
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
  useEffect(() => {
    document.body.classList.add("viewer-lock");
    return () => {
      document.body.classList.remove("viewer-lock");
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="viewer-shell flex h-full w-full items-center justify-center">
          <div className="viewer-muted text-sm">Loading viewer workspace...</div>
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
};

export default AppProjectPage;
