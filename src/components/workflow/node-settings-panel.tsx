"use client";

import { useWorkflow } from "./workflow-provider";
import { HttpPanel } from "./panels/http-panel";

/**
 * Node Settings Panel - Hiển thị panel cấu hình khi click vào node
 * Hiện tại chỉ hỗ trợ HTTP node
 */
export function NodeSettingsPanel() {
  const { selectedNode, setSelectedNode } = useWorkflow();

  const handleClose = () => {
    setSelectedNode(null);
  };

  if (selectedNode && selectedNode.type === "http") {
    return <HttpPanel nodeId={selectedNode.id} onClose={handleClose} />;
  }

  const title = selectedNode ? "Inspector" : "No node selected";
  const description = selectedNode
    ? "This node does not have settings yet."
    : "Select a node to view and edit its settings.";

  return (
    <div className="workflow-surface w-full shrink-0 h-full min-h-0 flex flex-col rounded-md border workflow-border shadow-sm animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between border-b workflow-border px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] workflow-muted">
            {title}
          </div>
          <div className="mt-1 text-sm font-semibold workflow-ink">
            Workflow Inspector
          </div>
        </div>
        {selectedNode && (
          <button
            onClick={handleClose}
            className="rounded-full border workflow-border workflow-surface-strong px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] workflow-muted transition workflow-ink-hover"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-1 min-h-0 flex-col px-4 py-3">
        <div className="flex-1 overflow-y-auto overscroll-contain rounded-md border border-dashed workflow-border workflow-surface-strong p-4 text-sm workflow-muted">
          {description}
        </div>
      </div>
    </div>
  );
}
