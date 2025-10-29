"use client";
import React from "react";

const ProjectClientPage = () => {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setId(params.get("id"));
    } catch {
      setId(null);
    }
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Project (client route)</h2>
        {id ? (
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Project ID (from query)</p>
            <pre className="break-all">{id}</pre>
          </div>
        ) : (
          <div className="rounded-md border p-4 bg-card text-muted-foreground">No project id provided. Pass ?id=UUID</div>
        )}
      </div>
    </div>
  );
}

export default ProjectClientPage;
