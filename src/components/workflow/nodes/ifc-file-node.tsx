"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

type IFCFileNodeProps = {
  id: string;
  data: {
    label?: string;
    schema?: string;
    elements?: number;
    filePath?: string;
  };
  selected?: boolean;
};

export const IFCFileNode = memo(({ id, data, selected }: IFCFileNodeProps) => {
  const { getNodeStatus, executionState } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const statusStyles = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  return (
    <div
      className={`group relative min-w-[260px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-[var(--workflow-accent)] ring-2 ring-[var(--workflow-accent)]/20"
          : "hover:border-[var(--workflow-accent)]"
      } ${statusStyles[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="subtle" />
      {/* Input Handle - Điểm kết nối ở trên */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="h-3! w-3! border-2! border-amber-200! bg-amber-500! transition-transform"
        style={{ top: -6 }}
      />

      {/* Content - Chỉ hiển thị tên file */}
      <div className="flex items-center justify-center px-6 py-4">
        <span className="text-sm font-semibold text-[var(--workflow-ink)] text-center">
          {data.label || "untitled.ifc"}
        </span>
      </div>

      {/* Error message */}
      {executionStatus === "error" && nodeState?.error && (
        <div className="mx-4 mb-2 text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300">
          {nodeState.error}
        </div>
      )}

      {/* Output Handle - Điểm kết nối ở dưới */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="h-3! w-3! border-2! border-amber-200! bg-amber-500! transition-transform"
        style={{ bottom: -6 }}
      />
    </div>
  );
});

IFCFileNode.displayName = "IFCFileNode";
