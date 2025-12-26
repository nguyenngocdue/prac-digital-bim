"use client";

import { Handle, Position } from "@xyflow/react";
import { GitBranch, Check, X } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
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
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const statusColors = {
    idle: "border-violet-500/50 from-violet-950/40 to-violet-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-violet-500/50 from-violet-950/40 to-violet-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
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
      className={`group relative min-w-[280px] rounded-lg border bg-gradient-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-violet-400 shadow-violet-500/50 ring-2 ring-violet-400/30"
          : statusColors[executionStatus]
      }`}
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
        className="h-3! w-3! border-2! border-violet-500! bg-violet-400! hover:scale-125! transition-transform"
        style={{ left: -6 }}
      />

      {/* TRUE Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="h-3! w-3! border-2! border-green-500! bg-green-400! hover:scale-125! transition-transform"
        style={{ top: "35%", right: -6 }}
      />

      {/* FALSE Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="h-3! w-3! border-2! border-red-500! bg-red-400! hover:scale-125! transition-transform"
        style={{ top: "65%", right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-semibold text-violet-400">
            {data.label || "IF / ELSE"}
          </span>
        </div>
        {conditionResult !== null && (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            conditionResult 
              ? "bg-green-500/20 text-green-400" 
              : "bg-red-500/20 text-red-400"
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
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-900/50 border border-violet-700/30">
            <div className="text-[10px] text-zinc-500 mb-0.5">Input Value</div>
            <div className="text-xs text-violet-300 font-mono">
              {String(data.inputValue)}
            </div>
          </div>
        )}

        {/* Operator Selection */}
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">Condition</label>
          <select
            value={data.operator || ""}
            onChange={(e) => handleOperatorChange(e.target.value as ComparisonOperator)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-violet-700/30 bg-zinc-900/80 text-violet-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
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
            <label className="text-[10px] text-zinc-500 mb-1 block">Compare With</label>
            <input
              type="text"
              value={data.compareValue ?? ""}
              onChange={(e) => handleCompareValueChange(e.target.value)}
              placeholder="Enter value to compare..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-violet-700/30 bg-zinc-900/80 text-violet-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
          </div>
        )}

        {/* Outputs Legend */}
        <div className="flex items-center justify-between pt-1 border-t border-violet-700/30">
          <div className="flex items-center gap-1.5 text-[10px] text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>TRUE path</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span>FALSE path</span>
          </div>
        </div>
      </div>

      {/* Quick Conditions Panel - Only show when selected */}
      {selected && (
        <div className="absolute left-full top-0 ml-2 w-[200px] rounded-lg border border-violet-500/30 bg-zinc-900/95 backdrop-blur-sm shadow-xl z-10">
          <div className="border-b border-violet-500/30 bg-violet-500/10 px-3 py-2">
            <span className="text-xs font-semibold text-violet-400">
              Quick Conditions
            </span>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleOperatorChange("exists")}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-violet-700/30 bg-zinc-900/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
            >
              Check if exists
            </button>
            <button
              onClick={() => handleOperatorChange("isEmpty")}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-violet-700/30 bg-zinc-900/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
            >
              Check if empty
            </button>
            <button
              onClick={() => handleOperatorChange("==")}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-violet-700/30 bg-zinc-900/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
            >
              Check equality
            </button>
            <button
              onClick={() => handleOperatorChange(">")}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-violet-700/30 bg-zinc-900/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
            >
              Compare numbers
            </button>
            <button
              onClick={() => handleOperatorChange("contains")}
              className="w-full px-3 py-1.5 text-xs text-left rounded-md border border-violet-700/30 bg-zinc-900/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
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
