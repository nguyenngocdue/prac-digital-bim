"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch, Check, X } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

/**
 * IF/ELSE Node - Conditional logic branching
 */

type ComparisonOperator = 
  | "==" | "!=" | ">" | "<" | ">=" | "<="
  | "contains" | "startsWith" | "endsWith" 
  | "isEmpty" | "exists";

type IfElseNodeProps = {
  id: string;
  data: {
    label?: string;
    operator?: ComparisonOperator;
    compareValue?: string | number;
    inputValue?: any;
    lastResult?: boolean;
  };
  selected?: boolean;
};

export const IfElseNode = memo(({ id, data, selected }: IfElseNodeProps) => {
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

  const handleOperatorChange = (newOperator: ComparisonOperator) => {
    updateNodeData(id, { operator: newOperator });
  };

  const handleCompareValueChange = (newValue: string) => {
    updateNodeData(id, { compareValue: newValue });
  };

  // Evaluate condition
  const evaluateCondition = (): boolean | null => {
    const { inputValue, operator, compareValue } = data;
    
    if (!operator) return null;
    if (inputValue === undefined && operator !== "isEmpty" && operator !== "exists") {
      return null;
    }

    try {
      switch (operator) {
        case "==":
          return inputValue == compareValue;
        case "!=":
          return inputValue != compareValue;
        case ">":
          return Number(inputValue) > Number(compareValue);
        case "<":
          return Number(inputValue) < Number(compareValue);
        case ">=":
          return Number(inputValue) >= Number(compareValue);
        case "<=":
          return Number(inputValue) <= Number(compareValue);
        case "contains":
          return String(inputValue).includes(String(compareValue));
        case "startsWith":
          return String(inputValue).startsWith(String(compareValue));
        case "endsWith":
          return String(inputValue).endsWith(String(compareValue));
        case "isEmpty":
          return !inputValue || String(inputValue).trim() === "";
        case "exists":
          return inputValue !== undefined && inputValue !== null;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  };

  const conditionResult = data.lastResult ?? evaluateCondition();
  const needsCompareValue = data.operator && 
    !["isEmpty", "exists"].includes(data.operator);

  return (
    <div
      className={`group relative min-w-[280px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-slate-600 ring-2 ring-slate-500/20"
          : "hover:border-slate-400"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="purple" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="h-3! w-3! border-2! border-slate-300! bg-slate-600! hover:scale-125! transition-transform"
        style={{ left: -6 }}
      />

      {/* TRUE Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="h-3! w-3! border-2! border-emerald-200! bg-emerald-500! hover:scale-125! transition-transform"
        style={{ top: "35%", right: -6 }}
      />

      {/* FALSE Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="h-3! w-3! border-2! border-rose-200! bg-rose-500! hover:scale-125! transition-transform"
        style={{ top: "65%", right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-2 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-slate-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            {data.label || "IF / ELSE"}
          </span>
        </div>
        {conditionResult !== null && (
          <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            conditionResult 
              ? "border-emerald-200 bg-emerald-500/10 text-emerald-700" 
              : "border-rose-200 bg-rose-500/10 text-rose-700"
          }`}>
            {conditionResult ? (
              <>
                <Check className="h-2.5 w-2.5" />
                TRUE
              </>
            ) : (
              <>
                <X className="h-2.5 w-2.5" />
                FALSE
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-2">
        {/* Condition Display */}
        {data.inputValue !== undefined && (
          <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 px-2.5 py-1.5">
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
              Input Value
            </div>
            <div className="text-xs text-slate-700 font-mono">
              {String(data.inputValue)}
            </div>
          </div>
        )}

        {/* Operator Selection */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-1 block">
            Condition
          </label>
          <select
            value={data.operator || ""}
            onChange={(e) => handleOperatorChange(e.target.value as ComparisonOperator)}
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 text-xs text-[var(--workflow-ink)] focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
          >
            <option value="">Select operator...</option>
            <optgroup label="Comparison">
              <option value="==">Equals (==)</option>
              <option value="!=">Not Equals (!=)</option>
              <option value=">">Greater Than (&gt;)</option>
              <option value="<">Less Than (&lt;)</option>
              <option value=">=">Greater or Equal (&gt;=)</option>
              <option value="<=">Less or Equal (&lt;=)</option>
            </optgroup>
            <optgroup label="String">
              <option value="contains">Contains</option>
              <option value="startsWith">Starts With</option>
              <option value="endsWith">Ends With</option>
            </optgroup>
            <optgroup label="Check">
              <option value="isEmpty">Is Empty</option>
              <option value="exists">Exists</option>
            </optgroup>
          </select>
        </div>

        {/* Compare Value Input */}
        {needsCompareValue && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-1 block">
              Compare With
            </label>
            <input
              type="text"
              value={data.compareValue ?? ""}
              onChange={(e) => handleCompareValueChange(e.target.value)}
              placeholder="Enter value to compare..."
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
        )}

        {/* Outputs Legend */}
        <div className="flex items-center justify-between border-t border-[var(--workflow-border)] pt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span>True path</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
            <span>False path</span>
          </div>
        </div>
      </div>

      {/* Quick Conditions Panel - Only show when selected */}
      {selected && (
        <div className="absolute left-full top-0 z-10 ml-2 w-[200px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/95 backdrop-blur-sm shadow-xl">
          <div className="border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-ink)]">
              Quick Conditions
            </span>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleOperatorChange("exists")}
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs text-[var(--workflow-ink)] transition-all hover:border-slate-400"
            >
              Check if exists
            </button>
            <button
              onClick={() => handleOperatorChange("isEmpty")}
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs text-[var(--workflow-ink)] transition-all hover:border-slate-400"
            >
              Check if empty
            </button>
            <button
              onClick={() => handleOperatorChange("==")}
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs text-[var(--workflow-ink)] transition-all hover:border-slate-400"
            >
              Check equality
            </button>
            <button
              onClick={() => handleOperatorChange(">")}
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs text-[var(--workflow-ink)] transition-all hover:border-slate-400"
            >
              Compare numbers
            </button>
            <button
              onClick={() => handleOperatorChange("contains")}
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs text-[var(--workflow-ink)] transition-all hover:border-slate-400"
            >
              Search text
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

IfElseNode.displayName = "IfElseNode";
