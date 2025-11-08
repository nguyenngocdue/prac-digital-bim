"use client";
import { Button } from "@/components/ui/button";
import { useBoxContext } from "../../../app/contexts/box-context";
import { useNavigate } from "@tanstack/react-router";

const LeftPanel = () => {
  // useNavigate is provided by the TanStack Router mounted at the app root
  const navigate: any = useNavigate();

  const openRandomProject = () => {
    let id = "";
    try {
      id = (typeof crypto !== "undefined" && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2, 10);
    } catch {
      id = Math.random().toString(36).slice(2, 10);
    }

  // navigate to the project detail route
  navigate(`/project/${id}`);
  };

  const { creationMode, setCreationMode } = useBoxContext();

  return (
    <div className="h-full p-4 bg-background/50 text-foreground">
      <h2 className="mb-2 text-sm font-medium">Left Panel</h2>
      <div className="text-sm text-muted-foreground mb-4">Tools, layers, or scene graph go here.</div>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={openRandomProject} variant="default" size="sm">Open random project</Button>
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
}

export default LeftPanel;
