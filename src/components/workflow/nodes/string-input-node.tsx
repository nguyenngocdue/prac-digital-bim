"use client";

import { Handle, Position } from "@xyflow/react";
import { Type, Copy, Check } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

/**
 * String Input Node - Node để người dùng nhập chuỗi text
 */

type StringInputNodeProps = {
  id: string;
  data: {
    label?: string;
    value?: string;
    placeholder?: string;
    multiline?: boolean;
  };
  selected?: boolean;
};

export const StringInputNode = memo(({ id, data, selected }: StringInputNodeProps) => {
  const { getNodeStatus, executionState, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];
  const [copied, setCopied] = useState(false);

  const statusColors = {
    idle: "border-indigo-500/50 from-indigo-950/40 to-indigo-950/20",
    pending: "border-yellow-500/50 from-yellow-950/40 to-yellow-950/20",
    running: "border-indigo-500/50 from-indigo-950/40 to-indigo-950/20 animate-pulse",
    success: "border-green-500/50 from-green-950/40 to-green-950/20",
    error: "border-red-500/50 from-red-950/40 to-red-950/20",
    skipped: "border-zinc-500/50 from-zinc-950/40 to-zinc-950/20",
  };

  const handleValueChange = (newValue: string) => {
    updateNodeData(id, { value: newValue });
  };

  const handleCopy = async () => {
    if (data.value) {
      await navigator.clipboard.writeText(data.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const characterCount = data.value?.length || 0;
  const wordCount = data.value?.trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <div
      className={`group relative min-w-[240px] rounded-lg border bg-gradient-to-b shadow-lg backdrop-blur-sm transition-all ${
        selected
          ? "border-indigo-400 shadow-indigo-500/50 ring-2 ring-indigo-400/30"
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
        className="h-3! w-3! border-2! border-indigo-500! bg-indigo-400! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400">
            {data.label || "String Input"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded p-1 transition-colors hover:bg-indigo-500/20"
            title="Copy text"
            disabled={!data.value}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-indigo-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-2">
        {/* Input Area */}
        {data.multiline !== false ? (
          <textarea
            value={data.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={data.placeholder || "Enter text..."}
            className="w-full min-h-2.5 px-2.5 py-1.5 text-xs rounded-lg border border-indigo-700/30 bg-zinc-900/80 text-indigo-100 placeholder:text-zinc-600 resize-y focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            spellCheck={false}
          />
        ) : (
          <input
            type="text"
            value={data.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={data.placeholder || "Enter text..."}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-indigo-700/30 bg-zinc-900/80 text-indigo-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            spellCheck={false}
          />
        )}

        {/* Statistics */}
        {data.value && (
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex gap-3">
              <span>{characterCount} chars</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            {data.multiline !== false && (
              <div className="flex items-center gap-1 text-zinc-600">
                <span>Shift+Enter for new line</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Panel - Only show when selected */}
      {selected && data.value && (
        <div className="absolute left-full top-0 ml-2 w-[200px] rounded-lg border border-indigo-500/30 bg-zinc-900/95 backdrop-blur-sm shadow-xl z-10">
          <div className="border-b border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
            <span className="text-xs font-semibold text-indigo-400">
              Quick Actions
            </span>
          </div>
          <div className="p-2 space-y-1">
            {[
              { label: "Clear", action: () => handleValueChange("") },
              { label: "Uppercase", action: () => handleValueChange(data.value?.toUpperCase() || "") },
              { label: "Lowercase", action: () => handleValueChange(data.value?.toLowerCase() || "") },
              { label: "Trim", action: () => handleValueChange(data.value?.trim() || "") },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full px-3 py-1.5 text-xs font-medium text-left rounded border border-indigo-700/30 bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-600/50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-indigo-500/30 bg-indigo-500/5 px-3 py-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-zinc-500">Output</span>
          <span className="text-indigo-400 font-medium">
            {data.value ? "String" : "Empty"}
          </span>
        </div>
      </div>
    </div>
  );
});

StringInputNode.displayName = "StringInputNode";
