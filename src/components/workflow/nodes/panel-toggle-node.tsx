"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LayoutPanelLeft,
} from "lucide-react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

type PanelToggleNodeProps = {
  id: string;
  data: {
    label?: string;
  };
  selected?: boolean;
};

export const PanelToggleNode = memo(({ id, data, selected }: PanelToggleNodeProps) => {
  const {
    getNodeStatus,
    showSidebar,
    setShowSidebar,
    showInspector,
    setShowInspector,
  } = useWorkflow();
  const executionStatus = getNodeStatus(id);

  const statusColors = {
    idle: "",
    pending: "ring-2 ring-amber-400/40",
    running: "ring-2 ring-sky-400/40 animate-pulse",
    success: "ring-2 ring-emerald-400/40",
    error: "ring-2 ring-rose-400/40",
    skipped: "opacity-70",
  };

  return (
    <div
      className={`group relative min-w-[240px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-[var(--workflow-accent)] ring-2 ring-[var(--workflow-accent-soft)]"
          : "hover:border-[var(--workflow-accent)]/60"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="cyan" />

      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="h-3! w-3! border-2! border-[var(--workflow-accent)]/40! bg-[var(--workflow-accent)]! transition-transform hover:scale-125!"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="h-3! w-3! border-2! border-[var(--workflow-accent)]/40! bg-[var(--workflow-accent)]! transition-transform hover:scale-125!"
        style={{ right: -6 }}
      />

      <div className="flex items-center justify-between border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2">
        <div className="flex items-center gap-2">
          <LayoutPanelLeft className="h-4 w-4 text-[var(--workflow-accent)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-ink)]">
            {data.label || "Panel Toggle"}
          </span>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-pressed={showSidebar}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
            showSidebar
              ? "border-[var(--workflow-accent)] bg-[var(--workflow-accent)]/15 text-[var(--workflow-accent)]"
              : "border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
          }`}
        >
          <span>Left Panel</span>
          {showSidebar ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowInspector(!showInspector)}
          aria-pressed={showInspector}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
            showInspector
              ? "border-[var(--workflow-warm)] bg-[var(--workflow-warm)]/15 text-[var(--workflow-warm)]"
              : "border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
          }`}
        >
          <span>Right Panel</span>
          {showInspector ? (
            <PanelRightOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelRightClose className="h-3.5 w-3.5" />
          )}
        </button>
        <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
          <span>{showSidebar ? "Left: Visible" : "Left: Hidden"}</span>
          <span>{showInspector ? "Right: Visible" : "Right: Hidden"}</span>
        </div>
      </div>
    </div>
  );
});

PanelToggleNode.displayName = "PanelToggleNode";
