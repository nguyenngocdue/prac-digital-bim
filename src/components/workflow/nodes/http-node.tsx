"use client";

import { Handle, Position } from "@xyflow/react";
import { Globe, Plus } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
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
    GET: "text-emerald-400",
    POST: "text-amber-400",
    PUT: "text-blue-400",
    PATCH: "text-purple-400",
    DELETE: "text-red-400",
  };

  const statusStyles = {
    idle: "border-zinc-700",
    pending: "border-yellow-500/50",
    running: "border-blue-500/50 animate-pulse",
    success: "border-green-500/50",
    error: "border-red-500/50",
    skipped: "border-zinc-600 opacity-60",
  };

  const handleAddNextNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add next node functionality
    console.log("Add next node from:", id);
  };

  return (
    <div
      className={`group relative min-w-[200px] rounded-lg border-2 bg-[#1a1f2e] shadow-lg transition-all ${
        selected
          ? "border-blue-500 shadow-blue-500/30 ring-2 ring-blue-500/20"
          : statusStyles[executionStatus]
      }`}
    >
      <NodeCloseButton nodeId={id} variant="subtle" />
      <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="h-3! w-3! border-2! border-zinc-600! bg-zinc-500! hover:bg-zinc-400! transition-colors"
        style={{ left: -6 }}
      />

      {/* Content */}
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-rose-500">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-200">HTTP</span>
        </div>

        {/* Method & URL Preview */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-mono font-bold ${methodColors[method]}`}>
            {method}
          </span>
          <span className="text-zinc-500 truncate max-w-[120px]">
            {url || "No URL"}
          </span>
        </div>
      </div>

      {/* Add Next Node Button */}
      <button
        onClick={handleAddNextNode}
        className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-zinc-600! bg-zinc-500! hover:bg-zinc-400! transition-colors"
        style={{ right: -6 }}
      />

      {/* Error message */}
      {executionStatus === "error" && nodeState?.error && (
        <div className="mx-3 mb-3 text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
          {nodeState.error}
        </div>
      )}
    </div>
  );
});

HttpNode.displayName = "HttpNode";
