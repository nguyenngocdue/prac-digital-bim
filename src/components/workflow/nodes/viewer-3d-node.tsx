"use client";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import { memo } from "react";
import { Box, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

interface Viewer3DNodeData {
  label?: string;
  status?: "waiting" | "loading" | "ready" | "error";
  modelUrl?: string;
}

interface Viewer3DNodeProps {
  id: string;
  data: Viewer3DNodeData;
  selected: boolean;
}

export const Viewer3DNode = memo(
  ({ id, data, selected }: Viewer3DNodeProps) => {
    const { getNodeStatus, executionState } = useWorkflow();
    const executionStatus = getNodeStatus(id);
    const nodeState = executionState.nodeStates[id];

    const status = data.status || "waiting";

    const statusStyles = {
      idle: "",
      pending: "ring-2 ring-yellow-400/50",
      running: "ring-2 ring-cyan-400/50 animate-pulse",
      success: "ring-2 ring-green-400/50",
      error: "ring-2 ring-red-400/50",
      skipped: "opacity-60",
    };

    const statusText = {
      waiting: "Waiting for connection...",
      loading: "Loading model...",
      ready: "Model loaded",
      error: "Failed to load model",
    };

    const statusDotColor = {
      waiting: "bg-zinc-500",
      loading: "bg-cyan-400 animate-pulse",
      ready: "bg-green-400",
      error: "bg-red-400",
    };

    return (
      <div
        className={cn(
          "group relative h-full w-full min-w-[380px] min-h-[340px] rounded-lg transition-all flex flex-col",
          "bg-zinc-950 border-2",
          selected
            ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            : "border-cyan-500/50 hover:border-cyan-400/70",
          statusStyles[executionStatus]
        )}
      >
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 rounded-br-lg" />

        <NodeResizer
          minWidth={380}
          minHeight={340}
          isVisible={selected}
          lineClassName="!border-cyan-400"
          handleClassName="!w-2.5 !h-2.5 !bg-cyan-400 !border-cyan-600 !rounded-full"
        />

        <NodeCloseButton nodeId={id} variant="cyan" />
        <NodeExecutionBadge
          status={executionStatus}
          duration={nodeState?.duration}
        />

        {/* Handles - Input (Left) */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-4 !h-4 !bg-cyan-400 !border-[3px] !border-cyan-600 hover:!scale-110 transition-transform !rounded-full"
          style={{ left: -8, top: "50%" }}
        />

        {/* Handles - Output (Right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-4 !h-4 !bg-cyan-400 !border-[3px] !border-cyan-600 hover:!scale-110 transition-transform !rounded-full"
          style={{ right: -8, top: "50%" }}
        />

        {/* Header */}
        <header className="px-4 py-3 flex items-center gap-2.5 bg-gradient-to-r from-cyan-600/20 to-cyan-500/10 border-b border-cyan-500/30">
          <div className="p-1.5 bg-cyan-500/20 rounded-lg">
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-cyan-400">
            {data.label || "3D Viewer"}
          </span>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* 3D Icon */}
          <div className="mb-6 p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Box className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-cyan-400 mb-3">
            3D Viewer Ready
          </h3>

          {/* Description */}
          <p className="text-sm text-zinc-400 text-center max-w-[280px] leading-relaxed mb-6">
            Connect an IFC file or geometry data to start visualizing your
            building model in 3D
          </p>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-2 h-2 rounded-full", statusDotColor[status])} />
            <span className="text-xs text-zinc-500">{statusText[status]}</span>
          </div>

          {/* Play Button Hint */}
          <div className="flex items-center gap-2 text-zinc-600">
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-xs">Press play to see the model</span>
          </div>
        </div>

        {/* Footer with subtle grid pattern */}
        <div className="absolute bottom-3 right-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-cyan-500/30"
          >
            <path
              d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Viewer3DNode.displayName = "Viewer3DNode";
