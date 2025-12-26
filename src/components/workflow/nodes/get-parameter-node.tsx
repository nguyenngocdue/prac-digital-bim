"use client";

import { Handle, Position } from "@xyflow/react";
import { Settings, Plus, X } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
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
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];
  const [newParamName, setNewParamName] = useState("");
  const [isAddingParam, setIsAddingParam] = useState(false);

  const parameterNames = data.parameterNames || [];
  const extractedParameters = data.extractedParameters || [];

  const statusColors = {
    idle: "border-amber-500/50 from-amber-950/40 to-amber-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-amber-500/50 from-amber-950/40 to-amber-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
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
      className={`group relative min-w-[280px] rounded-lg border bg-linear-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-amber-400 shadow-amber-500/50 ring-2 ring-amber-400/30"
          : statusColors[executionStatus]
      }`}
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
        className="h-3! w-3! border-2! border-amber-500! bg-amber-400! hover:scale-125! transition-transform"
        style={{ left: -6, top: 32 }}
      />

      {/* Input Handle - Parameter Name */}
      <Handle
        type="target"
        position={Position.Left}
        id="parameterName"
        className="h-3! w-3! border-2! border-amber-500! bg-amber-400! hover:scale-125! transition-transform"
        style={{ left: -6, top: 60 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-amber-500! bg-amber-400! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {data.label || "Get Parameter"}
          </span>
        </div>
        <span className="text-[9px] text-amber-600 font-medium">
          BIM
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-amber-500/50" />
            <span>element</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-amber-500/50" />
            <span>parameterName</span>
          </div>
        </div>

        {/* Parameter Names List */}
        {parameterNames.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-500 font-medium">
              Parameters to Extract:
            </div>
            {parameterNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-md border border-amber-700/30 bg-amber-900/20 px-2 py-1.5"
              >
                <span className="text-xs text-amber-300 font-medium truncate">
                  {name}
                </span>
                <button
                  onClick={() => handleRemoveParameter(index)}
                  className="p-0.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
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
              className="flex-1 px-2 py-1 text-xs rounded border border-amber-600/50 bg-zinc-900/80 text-amber-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <button
              onClick={handleAddParameter}
              className="px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingParam(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] rounded border border-amber-700/30 bg-amber-900/20 hover:bg-amber-900/30 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Parameter</span>
          </button>
        )}

        {/* Extracted Values Display */}
        {extractedParameters.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-500 font-medium">
              Extracted Values:
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-zinc-900/80 p-2 space-y-1">
              {extractedParameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-[10px]"
                >
                  <span className="text-zinc-400">{param.name}:</span>
                  <span className="text-amber-300 font-medium">
                    {param.value !== null ? String(param.value) : "null"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-amber-500/30 bg-amber-500/5 px-3 py-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-zinc-500">Output</span>
          <span className="text-amber-400 font-medium">
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
