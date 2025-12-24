"use client";

import { Handle, Position } from "@xyflow/react";
import { FileText, Eye } from "lucide-react";
import { memo } from "react";

/**
 * IFC File Node - Hiển thị thông tin file IFC
 * 
 * Cấu trúc Node cơ bản:
 * 1. Container - div bên ngoài với styling
 * 2. Header - Phần tiêu đề với icon và label
 * 3. Content - Nội dung chính của node
 * 4. Handle - Điểm kết nối với các nodes khác
 */

type IFCFileNodeProps = {
  data: {
    label?: string;
    schema?: string;
    elements?: number;
    filePath?: string;
  };
  selected?: boolean;
};

export const IFCFileNode = memo(({ data, selected }: IFCFileNodeProps) => {
  return (
    <div
      className={`group relative min-w-[220px] rounded-lg border bg-gradient-to-b from-blue-950/40 to-blue-950/20 shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-blue-400 shadow-blue-500/50 ring-2 ring-blue-400/30"
          : "border-blue-500/50 hover:border-blue-400 hover:shadow-blue-500/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/30 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">IFC File</span>
        </div>
        {/* Status indicator */}
        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* File name */}
        <div className="text-sm font-medium text-zinc-200 truncate">
          {data.label || "untitled.ifc"}
        </div>

        {/* File info */}
        <div className="space-y-1.5 text-[11px] text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Schema:</span>
            <span className="font-mono font-medium text-blue-400">
              {data.schema || "IFC2X3"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Elements:</span>
            <span className="font-mono font-medium text-zinc-300">
              {data.elements || 0}
            </span>
          </div>
          {data.filePath && (
            <div className="text-[10px] text-zinc-600 truncate">
              {data.filePath}
            </div>
          )}
        </div>

        {/* Actions */}
        <button className="w-full rounded bg-blue-600/20 px-3 py-1.5 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-600/30 active:bg-blue-600/40 flex items-center justify-center gap-1.5">
          <Eye className="h-3 w-3" />
          View Details
        </button>
      </div>

      {/* Output Handle - Điểm kết nối output */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-blue-400 hover:!scale-125 transition-transform"
        style={{ right: -6 }}
      />

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-lg bg-blue-500/0 transition-colors group-hover:bg-blue-500/5 pointer-events-none" />
    </div>
  );
});

IFCFileNode.displayName = "IFCFileNode";
