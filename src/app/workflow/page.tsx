"use client";

import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowSidebar } from "@/components/workflow/workflow-sidebar";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { WorkflowProvider } from "@/components/workflow/workflow-provider";
import { NodeSettingsPanel } from "@/components/workflow/node-settings-panel";

export default function WorkflowPage() {
  return (
    <WorkflowProvider>
      <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-zinc-950">
        {/* Toolbar */}
        <WorkflowToolbar />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkflowSidebar />

          {/* Canvas */}
          <WorkflowCanvas />

          {/* Node Settings Panel */}
          <NodeSettingsPanel />
        </div>
      </div>
    </WorkflowProvider>
  );
}
