"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { Box, Loader2, Map, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeCloseButton } from "./node-close-button";
import { NodeExecutionBadge } from "./node-execution-badge";
import { useWorkflow } from "../workflow-provider";

type LoaderStatus = "waiting" | "loading" | "ready" | "error";

type IfcLoaderNodeProps = {
  id: string;
  data: {
    label?: string;
    status?: LoaderStatus;
    fileName?: string;
    fileUrl?: string;
    modelId?: string;
    fragmentsCount?: number;
    itemsWithGeometry?: number;
    boundingBox?: { min: number[]; max: number[] };
    lastLoadedAt?: string;
    error?: string;
  };
  selected?: boolean;
};

export const IfcLoaderNode = memo(({ id, data, selected }: IfcLoaderNodeProps) => {
  const { getNodeStatus, executionState } = useWorkflow();
  const executionStatus = getNodeStatus(id);
  const nodeState = executionState.nodeStates[id];

  const loaderStatus: LoaderStatus =
    data.status ||
    (executionStatus === "running" ? "loading" : executionStatus === "error" ? "error" : "waiting");

  const statusStyles: Record<LoaderStatus, string> = {
    waiting: "ring-1 ring-teal-200/70",
    loading: "ring-2 ring-sky-200/70 animate-pulse",
    ready: "ring-2 ring-emerald-200/70",
    error: "ring-2 ring-rose-200/70",
  };

  const statusCopy: Record<LoaderStatus, string> = {
    waiting: "Waiting for IFC…",
    loading: "Converting with IfcLoader…",
    ready: "Fragments model ready",
    error: "IFC load failed",
  };

  const resolvedFileName =
    data.fileName ||
    ((nodeState?.output as any)?.fileName as string | undefined) ||
    (data.fileUrl ? data.fileUrl.split("/").pop() : undefined);

  const errorMessage = data.error || nodeState?.error;

  return (
    <div
      className={cn(
        "group relative min-w-[320px] max-w-[520px] rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all",
        selected
          ? "border-teal-300 ring-2 ring-teal-200/70"
          : "hover:border-teal-200",
        statusStyles[loaderStatus]
      )}
    >
      <NodeCloseButton nodeId={id} variant="cyan" />
      <NodeExecutionBadge status={executionStatus} duration={nodeState?.duration} />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="!w-3.5 !h-3.5 !bg-teal-500 !border-[3px] !border-teal-200 hover:!scale-110 transition-transform !rounded-full"
        style={{ left: -8, top: "50%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="model"
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-[3px] !border-emerald-200 hover:!scale-110 transition-transform !rounded-full"
        style={{ right: -8, top: "50%" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-200">
          <PackageOpen className="h-5 w-5 text-teal-700" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--workflow-ink)]">
            {data.label || "IfcLoader"}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
            Core · Fragments
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--workflow-border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)]">
          <Loader2
            className={cn("h-3.5 w-3.5", loaderStatus === "loading" ? "animate-spin" : "opacity-60")}
          />
          <span>{statusCopy[loaderStatus]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 px-4 py-3 text-sm text-[var(--workflow-ink)]">
        <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-teal-700" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
                  File
                </span>
                <span className="font-semibold text-[var(--workflow-ink)]">
                  {resolvedFileName || "No file selected"}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
                loaderStatus === "ready"
                  ? "border-emerald-200 text-emerald-700 bg-emerald-500/10"
                  : "border-teal-200 text-teal-700 bg-teal-500/10"
              )}
            >
              {loaderStatus === "ready" ? "Ready" : "IFC"}
            </span>
          </div>
          {data.fileUrl && (
            <p className="mt-1 text-[11px] text-[var(--workflow-muted)] break-all">
              {data.fileUrl}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBlock
            label="Fragments"
            value={
              data.fragmentsCount ??
              (nodeState?.output as any)?.fragmentsCount ??
              "—"
            }
          />
          <StatBlock
            label="Items w/ geometry"
            value={
              data.itemsWithGeometry ??
              (nodeState?.output as any)?.itemsWithGeometry ??
              "—"
            }
          />
        </div>

        {data.boundingBox && (
          <div className="rounded-xl border border-teal-200 bg-teal-500/10 px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
              <Map className="h-3.5 w-3.5" />
              Bounding Box
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-teal-700">
              <span>Min: {data.boundingBox.min.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
              <span>Max: {data.boundingBox.max.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
            </div>
          </div>
        )}

        {data.lastLoadedAt && (
          <p className="text-[11px] text-[var(--workflow-muted)]">
            Loaded at {new Date(data.lastLoadedAt).toLocaleTimeString()}
          </p>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
});

IfcLoaderNode.displayName = "IfcLoaderNode";

function StatBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
        {label}
      </span>
      <div className="text-lg font-semibold text-[var(--workflow-ink)]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
