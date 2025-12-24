"use client";

import { useRouter } from "next/navigation";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { useBoxContext } from "@/app/contexts/box-context";

/**
 * Left Panel - Tools and scene controls
 */
const LeftPanel: FC = () => {
  const router = useRouter();
  const { creationMode, setCreationMode } = useBoxContext();

  const openRandomProject = () => {
    let id = "";
    try {
      id =
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : Math.random().toString(36).slice(2, 10);
    } catch {
      id = Math.random().toString(36).slice(2, 10);
    }

    // Navigate to the project viewer with the new ID
    router.push(`/project/viewer?id=${id}`);
  };

  return (
    <div className="h-full bg-background/50 p-4 text-foreground">
      <h2 className="mb-2 text-sm font-medium">Left Panel</h2>
      <div className="mb-4 text-sm text-muted-foreground">
        Tools, layers, or scene graph go here.
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={openRandomProject} variant="default" size="sm">
          Open random project
        </Button>
        <Button
          onClick={() => setCreationMode(true)}
          variant={creationMode ? "secondary" : "outline"}
          size="sm"
        >
          {creationMode ? "Click on canvas to place box" : "Create a box"}
        </Button>
      </div>
    </div>
  );
};

export default LeftPanel;
