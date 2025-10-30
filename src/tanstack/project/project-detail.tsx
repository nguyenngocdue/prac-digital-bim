"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import View3dPanelsLayout from "@/components/3d-viewers";

type Props = {
  id?: string | null;
};

const ProjectDetail = ({ id }: Props) => {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string | null>(id ?? null);

  useEffect(() => {
    if (projectId) return;
    try {
      const fromQuery = searchParams?.get("id");
      setProjectId(fromQuery);
    } catch {
      setProjectId(null);
    }
  }, [projectId, searchParams]);


  if (!projectId) {
    return (
      <div className="rounded-md border p-4 bg-card text-muted-foreground">No project selected.</div>
    );
  }

  return (
    <View3dPanelsLayout />
  );
};

export default ProjectDetail;
