"use client";
import { useSearchParams } from "next/navigation";
import View3dPanelsLayout from "@/components/3d-viewers/layouts";

type Props = {
  id?: string | null;
};

const ProjectDetail = ({ id }: Props) => {
  const searchParams = useSearchParams();
  const projectId = (() => {
    try {
      return id ?? (searchParams ? searchParams.get("id") : null);
    } catch {
      return id ?? null;
    }
  })();


  if (!projectId) {
    return (
      <div className="rounded-md border p-4 bg-card text-muted-foreground">No project selected.</div>
    );
  }

  return (
      <View3dPanelsLayout projectId={projectId} />
  );
};

export default ProjectDetail;
