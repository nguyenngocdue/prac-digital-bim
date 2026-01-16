"use client";

import { Handle, Position } from "@xyflow/react";
import { Code2, Play } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

/**
 * Python Node - Node để chạy Python code
 * 
 * Có input và output handles để kết nối với các nodes khác
 */

type PythonNodeProps = {
  id: string;
  data: {
    label?: string;
    code?: string;
  };
  selected?: boolean;
};

export const PythonNode = memo(({ id, data, selected }: PythonNodeProps) => {
  const { getNodeStatus, executionState, executeFromNode } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  const handleRunNode = async () => {
    await executeFromNode(id);
  };

  return (
    <div
      className={`group relative min-w-[260px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-orange-400 ring-2 ring-orange-400/20"
          : "hover:border-orange-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="orange" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="h-3! w-3! border-2! border-orange-200! bg-orange-500! hover:scale-125! transition-transform"
        style={{ left: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-200 bg-orange-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-orange-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Python</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {data.code ? (
          <div className="rounded-xl border border-orange-200 bg-white/80 p-3">
            <pre className="text-[10px] text-[var(--workflow-ink)] font-mono overflow-x-auto">
              {data.code}
            </pre>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/70">
            <div className="text-center">
              <div className="mb-2 text-4xl opacity-20">🐍</div>
              <p className="text-xs text-[var(--workflow-muted)]">No code yet</p>
              <button className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600 hover:text-orange-500 transition-colors">
                Double-click to edit code
              </button>
            </div>
          </div>
        )}

        {data.label && (
          <div className="mt-2 text-xs text-[var(--workflow-muted)] truncate">{data.label}</div>
        )}

        {/* Run button */}
        <button 
          onClick={handleRunNode}
          disabled={executionStatus === "running" || executionStatus === "pending"}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-700 transition-colors hover:bg-orange-500/20 active:bg-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-3 w-3" />
          {executionStatus === "running" ? "Running..." : "Run Script"}
        </button>

        {/* Error message */}
        {executionStatus === "error" && nodeState?.error && (
          <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
            {nodeState.error}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-orange-200! bg-orange-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />
    </div>
  );
});

PythonNode.displayName = "PythonNode";
