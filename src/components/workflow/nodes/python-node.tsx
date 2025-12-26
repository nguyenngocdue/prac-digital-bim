"use client";

import { Handle, Position } from "@xyflow/react";
import { Code2, Play } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";

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
    status?: "idle" | "running" | "success" | "error";
  };
  selected?: boolean;
};

export const PythonNode = memo(({ id, data, selected }: PythonNodeProps) => {
  const statusColors = {
    idle: "border-orange-500/50 from-orange-950/40 to-orange-950/20",
    running: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
  };

  const status = data.status || "idle";

  return (
    <div
      className={`group relative min-w-[260px] rounded-lg border bg-gradient-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-orange-400 shadow-orange-500/50 ring-2 ring-orange-400/30"
          : statusColors[status]
      }`}
    >
      <NodeCloseButton nodeId={id} variant="orange" />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-400 hover:!scale-125 transition-transform"
        style={{ left: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-500/30 bg-orange-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">Python</span>
        </div>
        <div className="flex items-center gap-1.5">
          {status === "running" && (
            <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
          {status === "success" && (
            <div className="h-2 w-2 rounded-full bg-green-400" />
          )}
          {status === "error" && (
            <div className="h-2 w-2 rounded-full bg-red-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {data.code ? (
          <div className="rounded border border-orange-700/30 bg-zinc-900/80 p-3">
            <pre className="text-[10px] text-zinc-300 font-mono overflow-x-auto">
              {data.code}
            </pre>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded border border-dashed border-orange-700/30 bg-zinc-900/30">
            <div className="text-center">
              <div className="mb-2 text-4xl opacity-20">🐍</div>
              <p className="text-xs text-zinc-500">No code yet</p>
              <button className="mt-2 text-[10px] font-medium text-orange-400 hover:text-orange-300 transition-colors">
                Double-click to edit code
              </button>
            </div>
          </div>
        )}

        {data.label && (
          <div className="mt-2 text-xs text-zinc-400 truncate">{data.label}</div>
        )}

        {/* Run button */}
        <button className="mt-2 w-full rounded bg-orange-600/20 px-3 py-1.5 text-[11px] font-medium text-orange-400 transition-colors hover:bg-orange-600/30 active:bg-orange-600/40 flex items-center justify-center gap-1.5">
          <Play className="h-3 w-3" />
          Run Script
        </button>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-400 hover:!scale-125 transition-transform"
        style={{ right: -6 }}
      />
    </div>
  );
});

PythonNode.displayName = "PythonNode";
