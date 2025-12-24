"use client";

import { Handle, Position } from "@xyflow/react";
import { Code2 } from "lucide-react";

export function PythonNode({ data }: any) {
  return (
    <div className="group relative min-w-[240px] rounded-lg border border-orange-500/50 bg-orange-950/30 shadow-lg backdrop-blur-sm transition-all hover:border-orange-400 hover:shadow-orange-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-orange-500/30 bg-orange-500/10 px-3 py-2">
        <Code2 className="h-4 w-4 text-orange-400" />
        <span className="text-xs font-semibold text-orange-400">Python</span>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex h-32 items-center justify-center rounded border border-orange-700/30 bg-zinc-900/50">
          <div className="text-center">
            <div className="mb-2 text-4xl opacity-20">🐍</div>
            <p className="mb-2 text-xs text-zinc-500">No code yet</p>
            <button className="text-[10px] font-medium text-orange-400 hover:text-orange-300">
              Double-click to edit code
            </button>
          </div>
        </div>
        {data.label && (
          <div className="mt-2 text-xs text-zinc-400">{data.label}</div>
        )}
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-400"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-orange-500 !bg-orange-400"
      />
    </div>
  );
}
