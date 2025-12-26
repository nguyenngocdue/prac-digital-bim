"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
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
    pending: "ring-2 ring-yellow-400/50",
    running: "ring-2 ring-blue-400/50 animate-pulse",
    success: "ring-2 ring-green-400/50",
    error: "ring-2 ring-red-400/50",
    skipped: "opacity-60",
  };

  return (
    <div
      className={`group relative min-w-[280px] rounded-lg border-2 bg-amber-300 shadow-md transition-all ${
        selected
          ? "border-zinc-900 shadow-lg"
          : "border-zinc-300 hover:border-zinc-400 hover:shadow-lg"
      } ${statusStyles[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="subtle" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}
      
      {/* Input Handle - Điểm kết nối ở trên */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="transition-transform bg-amber-700"
        style={{ top: -6 }}
      />

      {/* Content - Chỉ hiển thị tên file */}
      <div className="px-6 py-4 flex items-center justify-center">
        <span className="text-sm font-medium text-zinc-900 text-center">
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
        className="transition-transform bg-amber-700"
        style={{ bottom: -6 }}
      />
    </div>
  );
});

IFCFileNode.displayName = "IFCFileNode";
