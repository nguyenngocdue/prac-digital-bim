"use client";

import { Handle, Position } from "@xyflow/react";
import { Type, Copy, Check } from "lucide-react";
import { memo, useState } from "react";
import { NodeCloseButton } from "./node-close-button";
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
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const [copied, setCopied] = useState(false);

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
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
      className={`group relative min-w-[240px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-400/20"
          : "hover:border-indigo-300"
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
        className="h-3! w-3! border-2! border-indigo-200! bg-indigo-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-200 bg-indigo-500/10 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
            {data.label || "String Input"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-full p-1 transition-colors hover:bg-indigo-500/20"
            title="Copy text"
            disabled={!data.value}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3 text-indigo-600" />
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
            className="w-full min-h-2.5 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] resize-y focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition-all"
            spellCheck={false}
          />
        ) : (
          <input
            type="text"
            value={data.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={data.placeholder || "Enter text..."}
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition-all"
            spellCheck={false}
          />
        )}

        {/* Statistics */}
        {data.value && (
          <div className="flex items-center justify-between text-[10px] font-medium text-[var(--workflow-muted)]">
            <div className="flex gap-3">
              <span>{characterCount} chars</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            {data.multiline !== false && (
              <div className="flex items-center gap-1 text-[var(--workflow-muted)]">
                <span>Shift+Enter for new line</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Panel - Only show when selected */}
      {selected && data.value && (
        <div className="absolute left-full top-0 ml-2 w-[200px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/95 backdrop-blur-sm shadow-xl z-10">
          <div className="border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-ink)]">
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
                className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)] transition-colors hover:border-indigo-300"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-indigo-200 bg-indigo-500/5 px-3 py-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--workflow-muted)]">Output</span>
          <span className="text-indigo-700 font-semibold uppercase tracking-[0.18em]">
            {data.value ? "String" : "Empty"}
          </span>
        </div>
      </div>
    </div>
  );
});

StringInputNode.displayName = "StringInputNode";
