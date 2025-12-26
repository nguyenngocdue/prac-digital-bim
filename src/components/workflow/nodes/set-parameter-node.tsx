"use client";

import { Handle, Position } from "@xyflow/react";
import { Plus, X, Edit } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

/**
 * Set Parameter Node - Thiết lập giá trị parameter cho BIM element
 * Tương tự Element.SetParameterByName trong Dynamo
 */

type ParameterValue = {
  name: string;
  value: string | number;
  type?: "string" | "number" | "boolean";
};

type SetParameterNodeProps = {
  id: string;
  data: {
    label?: string;
    parameters?: ParameterValue[];
    autoApply?: boolean;
  };
  selected?: boolean;
};

export const SetParameterNode = memo(({ id, data, selected }: SetParameterNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newParam, setNewParam] = useState({ name: "", value: "" });

  const parameters = data.parameters || [];

  const statusColors = {
    idle: "border-blue-500/50 from-blue-950/40 to-blue-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-blue-500/50 from-blue-950/40 to-blue-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
  };

  const handleAddParameter = () => {
    if (newParam.name.trim() && newParam.value.trim()) {
      const updatedParams = [...parameters, {
        name: newParam.name.trim(),
        value: newParam.value.trim(),
      }];
      updateNodeData(id, { parameters: updatedParams });
      setNewParam({ name: "", value: "" });
      setIsAdding(false);
    }
  };

  const handleUpdateParameter = (index: number) => {
    if (newParam.name.trim() && newParam.value.trim()) {
      const updatedParams = [...parameters];
      updatedParams[index] = {
        name: newParam.name.trim(),
        value: newParam.value.trim(),
      };
      updateNodeData(id, { parameters: updatedParams });
      setNewParam({ name: "", value: "" });
      setEditingIndex(null);
    }
  };

  const handleRemoveParameter = (index: number) => {
    const updatedParams = parameters.filter((_, i) => i !== index);
    updateNodeData(id, { parameters: updatedParams });
  };

  const handleEditParameter = (index: number) => {
    const param = parameters[index];
    if (param) {
      setNewParam({ name: param.name, value: String(param.value) });
      setEditingIndex(index);
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingIndex !== null) {
        handleUpdateParameter(editingIndex);
      } else {
        handleAddParameter();
      }
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setEditingIndex(null);
      setNewParam({ name: "", value: "" });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewParam({ name: "", value: "" });
  };

  return (
    <div
      className={`group relative min-w-[280px] rounded-lg border bg-linear-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-blue-400 shadow-blue-500/50 ring-2 ring-blue-400/30"
          : statusColors[executionStatus]
      }`}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      />

      {/* Input Handle - Element */}
      <Handle
        type="target"
        position={Position.Left}
        id="element"
        className="h-3! w-3! border-2! border-blue-500! bg-blue-400! hover:scale-125! transition-transform"
        style={{ left: -6, top: 32 }}
      />

      {/* Input Handle - Parameter Name */}
      <Handle
        type="target"
        position={Position.Left}
        id="parameterName"
        className="h-3! w-3! border-2! border-blue-500! bg-blue-400! hover:scale-125! transition-transform"
        style={{ left: -6, top: 60 }}
      />

      {/* Input Handle - Value */}
      <Handle
        type="target"
        position={Position.Left}
        id="value"
        className="h-3! w-3! border-2! border-blue-500! bg-blue-400! hover:scale-125! transition-transform"
        style={{ left: -6, top: 88 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-blue-500! bg-blue-400! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/30 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">
            {data.label || "Set Parameter"}
          </span>
        </div>
        <span className="text-[9px] text-blue-600 font-medium">
          BIM
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-blue-500/50" />
            <span>element</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-blue-500/50" />
            <span>parameterName</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-blue-500/50" />
            <span>value</span>
          </div>
        </div>

        {/* Parameters List */}
        {parameters.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-500 font-medium">
              Parameters to Set:
            </div>
            {parameters.map((param, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-md border border-blue-700/30 bg-blue-900/20 px-2 py-1.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-300 font-medium truncate">
                    {param.name}
                  </div>
                  <div className="text-[10px] text-blue-400/70">
                    = {String(param.value)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditParameter(index)}
                    className="p-0.5 rounded hover:bg-blue-500/20 text-zinc-500 hover:text-blue-400 transition-colors"
                    title="Edit parameter"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveParameter(index)}
                    className="p-0.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove parameter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Parameter Form */}
        {(isAdding || editingIndex !== null) ? (
          <div className="space-y-2 rounded-lg border border-blue-600/50 bg-blue-900/20 p-2">
            <input
              type="text"
              value={newParam.name}
              onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
              onKeyDown={handleKeyPress}
              placeholder="Parameter name..."
              className="w-full px-2 py-1 text-xs rounded border border-blue-600/50 bg-zinc-900/80 text-blue-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <input
              type="text"
              value={newParam.value}
              onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
              onKeyDown={handleKeyPress}
              placeholder="Value..."
              className="w-full px-2 py-1 text-xs rounded border border-blue-600/50 bg-zinc-900/80 text-blue-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-1">
              <button
                onClick={editingIndex !== null ? () => handleUpdateParameter(editingIndex) : handleAddParameter}
                className="flex-1 px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {editingIndex !== null ? "Update" : "Add"}
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] rounded border border-blue-700/30 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Parameter</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-blue-500/30 bg-blue-500/5 px-3 py-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-zinc-500">Output</span>
          <span className="text-blue-400 font-medium">
            {parameters.length > 0 
              ? `${parameters.length} parameters`
              : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
});

SetParameterNode.displayName = "SetParameterNode";
