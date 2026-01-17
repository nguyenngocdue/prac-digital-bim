"use client";

import { Handle, Position } from "@xyflow/react";
import { Grid2X2, ToggleLeft, ToggleRight } from "lucide-react";
import { memo } from "react";
import { NodeCloseButton } from "./node-close-button";
import { useWorkflow } from "../workflow-provider";

type ExcelReadNodeProps = {
  id: string;
  data: {
    label?: string;
    sheetName?: string;
    range?: string;
    hasHeader?: boolean;
  };
  selected?: boolean;
};

export const ExcelReadNode = memo(({ id, data, selected }: ExcelReadNodeProps) => {
  const { getNodeStatus, updateNodeData } = useWorkflow();
  const executionStatus = getNodeStatus(id) as keyof typeof statusColors;

  const sheetName = data.sheetName ?? "Sheet1";
  const range = data.range ?? "A1:D10";
  const hasHeader = data.hasHeader ?? true;

  return (
    <div
      className={`group relative min-w-[260px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-400/20"
          : "hover:border-emerald-300"
      } ${statusColors[executionStatus]}`}
    >
      <NodeCloseButton nodeId={id} variant="emerald" />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="h-3! w-3! border-2! border-emerald-200! bg-emerald-500! hover:scale-125! transition-transform"
        style={{ left: -6, top: 40 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="table"
        className="h-3! w-3! border-2! border-emerald-200! bg-emerald-500! hover:scale-125! transition-transform"
        style={{ right: -6 }}
      />

      <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Grid2X2 className="h-4 w-4 text-emerald-700" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {data.label || "Excel Read"}
          </span>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          DATA
        </span>
      </div>

      <div className="space-y-3 p-3">
        <div className="space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
            Sheet Name
          </div>
          <input
            type="text"
            value={sheetName}
            onChange={(event) =>
              updateNodeData(id, { sheetName: event.target.value })
            }
            placeholder="Sheet1"
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-2 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-emerald-300"
          />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
            Range
          </div>
          <input
            type="text"
            value={range}
            onChange={(event) => updateNodeData(id, { range: event.target.value })}
            placeholder="A1:D10"
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2.5 py-2 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] focus:outline-none focus:border-emerald-300"
          />
        </div>

        <button
          type="button"
          onClick={() => updateNodeData(id, { hasHeader: !hasHeader })}
          className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
            hasHeader
              ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
              : "border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
          }`}
        >
          <span>Header Row</span>
          {hasHeader ? (
            <ToggleRight className="h-4 w-4" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </button>

        <div className="rounded-xl border border-emerald-200 bg-emerald-500/5 px-2.5 py-2 text-[10px] text-emerald-700">
          Output: table data from <span className="font-semibold">{sheetName}</span>{" "}
          ({range})
        </div>
      </div>
    </div>
  );
});

const statusColors = {
  idle: "",
  pending: "ring-2 ring-amber-400/40",
  running: "ring-2 ring-sky-400/40 animate-pulse",
  success: "ring-2 ring-emerald-400/40",
  error: "ring-2 ring-rose-400/40",
  skipped: "opacity-70",
};

ExcelReadNode.displayName = "ExcelReadNode";
