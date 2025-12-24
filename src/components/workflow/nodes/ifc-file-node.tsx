"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

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
      className={`relative min-w-[280px] rounded-lg border-2 bg-white shadow-md transition-all ${
        selected
          ? "border-zinc-900 shadow-lg"
          : "border-zinc-300 hover:border-zinc-400 hover:shadow-lg"
      }`}
    >
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
