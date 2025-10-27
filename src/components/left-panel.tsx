"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const LeftPanel = () => {
  const router = useRouter();

  const openRandomProject = () => {
    let id = "";
    try {
      id = (typeof crypto !== "undefined" && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2, 10);
    } catch {
      id = Math.random().toString(36).slice(2, 10);
    }

    router.push(`/project?id=${id}`);
  };

  return (
    <div className="h-full p-4 bg-card text-foreground">
      <h2 className="mb-2 text-sm font-medium">Left Panel</h2>
      <div className="text-sm text-muted-foreground mb-4">Tools, layers, or scene graph go here.</div>
      <div className="mt-4">
        <Button onClick={openRandomProject} variant="default" size="sm">Open random project</Button>
      </div>
    </div>
  );
}

export default LeftPanel;
