"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import View3dPanelsLayout from "@/components/3d-viewers/view3d-panels-layout";

type Props = {
  id?: string | null;
};

const ProjectDetail = ({ id }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = React.useState<string | null>(id ?? null);

  React.useEffect(() => {
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
