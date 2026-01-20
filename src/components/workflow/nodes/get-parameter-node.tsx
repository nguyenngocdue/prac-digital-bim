"use client";

import { Handle, Position } from "@xyflow/react";
import { Settings, Plus, X } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

/**
 * Get Parameter Node - Trích xuất giá trị parameter từ BIM element
 * Tương tự Element.GetParameterValueByName trong Dynamo
 */

type ParameterItem = {
  name: string;
  value: string | number | null;
  type?: string;
};

type GetParameterNodeProps = {
  id: string;
  data: {
    label?: string;
    parameterNames?: string[];
    extractedParameters?: ParameterItem[];
    autoExtract?: boolean;
  };
  selected?: boolean;
};

export const GetParameterNode = memo(({ id, data, selected }: GetParameterNodeProps) => {
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const [newParamName, setNewParamName] = useState("");
  const [isAddingParam, setIsAddingParam] = useState(false);

  const parameterNames = data.parameterNames || [];
  const extractedParameters = data.extractedParameters || [];

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  const handleAddParameter = () => {
    if (newParamName.trim()) {
      const updatedParams = [...parameterNames, newParamName.trim()];
      updateNodeData(id, { parameterNames: updatedParams });
      setNewParamName("");
      setIsAddingParam(false);
    }
  };

  const handleRemoveParameter = (index: number) => {
    const updatedParams = parameterNames.filter((_, i) => i !== index);
    updateNodeData(id, { parameterNames: updatedParams });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddParameter();
    } else if (e.key === "Escape") {
      setIsAddingParam(false);
      setNewParamName("");
    }
  };

  return (
    <div
      className={`group relative min-w-[280px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-amber-400 ring-2 ring-amber-400/20"
          : "hover:border-amber-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="yellow" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Input Handle - Element */}
      <Handle
        type="target"
        position={Position.Left}
        id="element"
        className="h-3! w-3! border-2! border-amber-200! bg-amber-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 32 }}
      />

      {/* Input Handle - Parameter Name */}
      <Handle
        type="target"
        position={Position.Left}
        id="parameterName"
        className="h-3! w-3! border-2! border-amber-200! bg-amber-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 60 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-amber-200! bg-amber-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 bg-amber-500/10 px-3 py-2 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {data.label || "Get Parameter"}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          BIM
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>element</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>parameterName</span>
          </div>
        </div>

        {/* Parameter Names List */}
        {parameterNames.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
              Parameters to Extract:
            </div>
            {parameterNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-500/10 px-2 py-1.5"
              >
                <span className="text-xs font-semibold text-amber-700 truncate">
                  {name}
                </span>
                <button
                  onClick={() => handleRemoveParameter(index)}
                  className="rounded-full p-0.5 text-[var(--workflow-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                  title="Remove parameter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Parameter */}
        {isAddingParam ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={newParamName}
              onChange={(e) => setNewParamName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newParamName.trim()) {
                  setIsAddingParam(false);
                }
              }}
              placeholder="Parameter name..."
              className="flex-1 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-amber-300"
              autoFocus
            />
            <button
              onClick={handleAddParameter}
              className="rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-amber-400"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingParam(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-500/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 transition-colors hover:bg-amber-500/20"
          >
            <Plus className="h-3 w-3" />
            <span>Add Parameter</span>
          </button>
        )}

        {/* Extracted Values Display */}
        {extractedParameters.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
              Extracted Values:
            </div>
            <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 p-2 space-y-1">
              {extractedParameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-[10px]"
                >
                  <span className="text-[var(--workflow-muted)]">{param.name}:</span>
                  <span className="text-amber-700 font-semibold">
                    {param.value !== null ? String(param.value) : "null"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-amber-200 bg-amber-500/5 px-3 py-1.5 rounded-b-2xl">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--workflow-muted)]">Output</span>
          <span className="text-amber-700 font-semibold uppercase tracking-[0.16em]">
            {extractedParameters.length > 0 
              ? `${extractedParameters.length} values`
              : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
});

GetParameterNode.displayName = "GetParameterNode";
