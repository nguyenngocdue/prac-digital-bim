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
    <div className="w-80 shrink-0 rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/85 p-4 shadow-[0_18px_40px_var(--workflow-shadow)] backdrop-blur animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--workflow-muted)]">
            {title}
          </div>
          <div className="mt-1 text-sm font-semibold text-[var(--workflow-ink)]">
            Workflow Inspector
          </div>
        </div>
        {selectedNode && (
          <button
            onClick={handleClose}
            className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] transition hover:text-[var(--workflow-ink)]"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)]/70 p-4 text-sm text-[var(--workflow-muted)]">
        {description}
      </div>
    </div>
  );
}
