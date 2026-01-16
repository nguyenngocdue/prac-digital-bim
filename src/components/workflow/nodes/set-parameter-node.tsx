"use client";

import { Handle, Position } from "@xyflow/react";
import { Plus, X, Edit } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
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
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newParam, setNewParam] = useState({ name: "", value: "" });

  const parameters = data.parameters || [];

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
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
      className={`group relative min-w-[280px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-blue-400 ring-2 ring-blue-400/20"
          : "hover:border-blue-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      {/* <NodeExecutionBadge 
        status={executionStatus} 
        duration={nodeState?.duration} 
      /> */}

      {/* Input Handle - Element */}
      <Handle
        type="target"
        position={Position.Left}
        id="element"
        className="h-3! w-3! border-2! border-blue-200! bg-blue-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 32 }}
      />

      {/* Input Handle - Parameter Name */}
      <Handle
        type="target"
        position={Position.Left}
        id="parameterName"
        className="h-3! w-3! border-2! border-blue-200! bg-blue-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 60 }}
      />

      {/* Input Handle - Value */}
      <Handle
        type="target"
        position={Position.Left}
        id="value"
        className="h-3! w-3! border-2! border-blue-200! bg-blue-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 88 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-blue-200! bg-blue-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-200 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {data.label || "Set Parameter"}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-700">
          BIM
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Input Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>element</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>parameterName</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>value</span>
          </div>
        </div>

        {/* Parameters List */}
        {parameters.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
              Parameters to Set:
            </div>
            {parameters.map((param, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-500/10 px-2 py-1.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-blue-700 truncate">
                    {param.name}
                  </div>
                  <div className="text-[10px] text-blue-500/80">
                    = {String(param.value)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditParameter(index)}
                    className="rounded-full p-0.5 text-[var(--workflow-muted)] transition-colors hover:bg-blue-500/10 hover:text-blue-600"
                    title="Edit parameter"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveParameter(index)}
                    className="rounded-full p-0.5 text-[var(--workflow-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-600"
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
          <div className="space-y-2 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] p-2">
            <input
              type="text"
              value={newParam.name}
              onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
              onKeyDown={handleKeyPress}
              placeholder="Parameter name..."
              className="w-full rounded-lg border border-[var(--workflow-border)] bg-white/80 px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-blue-300"
              autoFocus
            />
            <input
              type="text"
              value={newParam.value}
              onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
              onKeyDown={handleKeyPress}
              placeholder="Value..."
              className="w-full rounded-lg border border-[var(--workflow-border)] bg-white/80 px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-blue-300"
            />
            <div className="flex gap-1">
              <button
                onClick={editingIndex !== null ? () => handleUpdateParameter(editingIndex) : handleAddParameter}
                className="flex-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-blue-400"
              >
                {editingIndex !== null ? "Update" : "Add"}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-500/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-500/20"
          >
            <Plus className="h-3 w-3" />
            <span>Add Parameter</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-blue-200 bg-blue-500/5 px-3 py-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--workflow-muted)]">Output</span>
          <span className="text-blue-700 font-semibold uppercase tracking-[0.16em]">
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
