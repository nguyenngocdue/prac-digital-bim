"use client";

import { Handle, Position } from "@xyflow/react";
import { Hash, RotateCcw, Percent, Minus } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

/**
 * Number Input Node - Node để người dùng nhập số
 */

type NumberInputNodeProps = {
  id: string;
  data: {
    label?: string;
    value?: number;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
  };
  selected?: boolean;
};

export const NumberInputNode = memo(({ id, data, selected }: NumberInputNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const statusColors = {
    idle: "border-emerald-500/50 from-emerald-950/40 to-emerald-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-emerald-500/50 from-emerald-950/40 to-emerald-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
  };

  const handleValueChange = (newValue: string) => {
    const numValue = newValue === "" ? undefined : parseFloat(newValue);
    updateNodeData(id, { value: numValue });
  };

  const handleRound = () => {
    if (data.value !== undefined) {
      updateNodeData(id, { value: Math.round(data.value) });
    }
  };

  const handleAbs = () => {
    if (data.value !== undefined) {
      updateNodeData(id, { value: Math.abs(data.value) });
    }
  };

  const handleNegate = () => {
    if (data.value !== undefined) {
      updateNodeData(id, { value: -data.value });
    }
  };

  const handleSquare = () => {
    if (data.value !== undefined) {
      updateNodeData(id, { value: data.value * data.value });
    }
  };

  const handleSqrt = () => {
    if (data.value !== undefined && data.value >= 0) {
      updateNodeData(id, { value: Math.sqrt(data.value) });
    }
  };

  const handleReset = () => {
    updateNodeData(id, { value: 0 });
  };

  const hasValue = data.value !== undefined && data.value !== null;

  return (
    <div
      className={`group relative min-w-[240px] rounded-lg border bg-gradient-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-emerald-400 shadow-emerald-500/50 ring-2 ring-emerald-400/30"
          : statusColors[executionStatus]
      }`}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-emerald-500! bg-emerald-400! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            {data.label || "Number Input"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-2">
        {/* Input Area */}
        <input
          type="number"
          value={data.value ?? ""}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={data.placeholder || "Enter number..."}
          min={data.min}
          max={data.max}
          step={data.step || 1}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-700/30 bg-zinc-900/80 text-emerald-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />

        {/* Constraints Info */}
        {(data.min !== undefined || data.max !== undefined || data.step !== undefined) && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            {data.min !== undefined && (
              <span>Min: {data.min}</span>
            )}
            {data.max !== undefined && (
              <span>Max: {data.max}</span>
            )}
            {data.step !== undefined && (
              <span>Step: {data.step}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions Panel - Only show when selected and has value */}
      {selected && hasValue && (
        <div className="absolute left-full top-0 ml-2 w-[180px] rounded-lg border border-emerald-500/30 bg-zinc-900/95 backdrop-blur-sm shadow-xl z-10">
          <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <span className="text-xs font-semibold text-emerald-400">
              Operations
            </span>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={handleRound}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <Percent className="h-3 w-3" />
              Round
            </button>
            <button
              onClick={handleAbs}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <span className="font-mono text-[10px]">|x|</span>
              Absolute
            </button>
            <button
              onClick={handleNegate}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <Minus className="h-3 w-3" />
              Negate
            </button>
            <button
              onClick={handleSquare}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <span className="font-mono text-[10px]">x²</span>
              Square
            </button>
            <button
              onClick={handleSqrt}
              disabled={data.value !== undefined && data.value < 0}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-[10px]">√x</span>
              Square Root
            </button>
            <div className="border-t border-emerald-700/30 my-1" />
            <button
              onClick={handleReset}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-emerald-700/30 bg-zinc-900/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to 0
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

NumberInputNode.displayName = "NumberInputNode";
