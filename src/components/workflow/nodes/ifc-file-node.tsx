"use client";

import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";

export function IFCFileNode({ data }: any) {
  return (
    <div className="group relative min-w-[200px] rounded-lg border border-blue-500/50 bg-blue-950/30 shadow-lg backdrop-blur-sm transition-all hover:border-blue-400 hover:shadow-blue-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-blue-500/30 bg-blue-500/10 px-3 py-2">
        <FileText className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-semibold text-blue-400">IFC File</span>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-2 text-sm font-medium text-zinc-200">
          {data.label || "untitled.ifc"}
        </div>
        <div className="space-y-1 text-[10px] text-zinc-400">
          <div className="flex justify-between">
            <span>Schema:</span>
            <span className="font-medium text-zinc-300">{data.schema || "IFC2X3"}</span>
          </div>
          <div className="flex justify-between">
            <span>Elements:</span>
            <span className="font-medium text-zinc-300">{data.elements || 0}</span>
          </div>
        </div>
        <button className="mt-2 w-full rounded bg-blue-600/20 px-2 py-1 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-600/30">
          View Details
        </button>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-400"
      />
    </div>
  );
}
