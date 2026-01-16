"use client";

import { Handle, Position } from "@xyflow/react";
import { Globe, Plus } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

/**
 * HTTP Node - Node để gọi HTTP requests
 */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpNodeProps = {
  id: string;
  data: {
    label?: string;
    method?: HttpMethod;
    url?: string;
    timeout?: number;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: string;
  };
  selected?: boolean;
};

export const HttpNode = memo(({ id, data, selected }: HttpNodeProps) => {
  const { getNodeStatus, executionState } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const method = data.method || "GET";
  const url = data.url || "";

  const methodColors: Record<HttpMethod, string> = {
    GET: "text-emerald-700",
    POST: "text-amber-700",
    PUT: "text-sky-700",
    PATCH: "text-indigo-700",
    DELETE: "text-rose-700",
  };

  const statusStyles = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  const handleAddNextNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add next node functionality
    console.log("Add next node from:", id);
  };

  return (
    <div
      className={`group relative min-w-[220px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-[var(--workflow-warm)] ring-2 ring-[var(--workflow-warm)]/20"
          : "hover:border-[var(--workflow-warm)]"
      } ${statusStyles[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="subtle" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="h-3! w-3! border-2! border-rose-200! bg-rose-500! hover:bg-rose-400! transition-colors"
        style={{ left: -6 }}
      />

      {/* Content */}
      <div className="px-4 py-3">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--workflow-warm)] text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]">
            <Globe className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--workflow-ink)]">HTTP</span>
        </div>

        {/* Method & URL Preview */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-0.5 font-mono font-bold ${methodColors[method]}`}>
            {method}
          </span>
          <span className="text-[var(--workflow-muted)] truncate max-w-[120px]">
            {url || "No URL"}
          </span>
        </div>
      </div>

      {/* Add Next Node Button */}
      <button
        onClick={handleAddNextNode}
        className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--workflow-accent)] text-white shadow-lg transition-colors opacity-0 group-hover:opacity-100 hover:bg-[var(--workflow-accent-strong)]"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-rose-200! bg-rose-500! hover:bg-rose-400! transition-colors"
        style={{ right: -6 }}
      />

      {/* Error message */}
      {executionStatus === "error" && nodeState?.error && (
        <div className="mx-3 mb-3 rounded-xl border border-rose-200 bg-rose-500/10 p-2 text-xs text-rose-700">
          {nodeState.error}
        </div>
      )}
    </div>
  );
});

HttpNode.displayName = "HttpNode";
