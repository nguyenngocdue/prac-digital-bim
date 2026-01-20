"use client";

import { Handle, Position } from "@xyflow/react";
import { Hash, RotateCcw, Percent, Minus } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
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
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
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
      className={`group relative min-w-[240px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-400/20"
          : "hover:border-emerald-300"
      } ${statusColors[executionStatus]}`}
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
        className="h-3! w-3! border-2! border-emerald-200! bg-emerald-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-500/10 px-2.5 py-2 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
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
          className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200 transition-all"
        />

        {/* Constraints Info */}
        {(data.min !== undefined || data.max !== undefined || data.step !== undefined) && (
          <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--workflow-muted)]">
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
        <div className="absolute left-full top-0 ml-2 w-[190px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/95 backdrop-blur-sm shadow-xl z-10">
          <div className="border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-ink)]">
              Operations
            </span>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={handleRound}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300"
            >
              <Percent className="h-3 w-3" />
              Round
            </button>
            <button
              onClick={handleAbs}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300"
            >
              <span className="font-mono text-[10px]">|x|</span>
              Absolute
            </button>
            <button
              onClick={handleNegate}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300"
            >
              <Minus className="h-3 w-3" />
              Negate
            </button>
            <button
              onClick={handleSquare}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300"
            >
              <span className="font-mono text-[10px]">x²</span>
              Square
            </button>
            <button
              onClick={handleSqrt}
              disabled={data.value !== undefined && data.value < 0}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="font-mono text-[10px]">√x</span>
              Square Root
            </button>
            <div className="my-1 border-t border-[var(--workflow-border)]" />
            <button
              onClick={handleReset}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-all hover:border-emerald-300"
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
