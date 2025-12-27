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
    waiting: "border-cyan-500/50 from-slate-950/60 to-slate-900/30",
    loading: "border-blue-500/60 from-blue-950/50 to-slate-900/40 animate-pulse",
    ready: "border-emerald-500/60 from-emerald-950/40 to-slate-900/30",
    error: "border-rose-500/70 from-rose-950/50 to-slate-900/40",
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
        "group relative min-w-[320px] max-w-[520px] rounded-xl border-2 bg-gradient-to-br shadow-lg transition-all",
        selected
          ? "shadow-cyan-500/30 ring-2 ring-cyan-400/30"
          : "hover:border-cyan-400/60 hover:shadow-cyan-500/20",
        statusStyles[loaderStatus]
      )}
    >
      <NodeCloseButton nodeId={id} variant="cyan" />
      <NodeExecutionBadge status={executionStatus} duration={nodeState?.duration} />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-[3px] !border-cyan-700 hover:!scale-110 transition-transform !rounded-full"
        style={{ left: -8, top: "50%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="model"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-[3px] !border-emerald-700 hover:!scale-110 transition-transform !rounded-full"
        style={{ right: -8, top: "50%" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <PackageOpen className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-cyan-100">
            {data.label || "IfcLoader"}
          </span>
          <span className="text-[11px] uppercase tracking-[0.08em] text-cyan-400/80">
            Core · Fragments
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 border border-white/10">
          <Loader2
            className={cn("h-3.5 w-3.5", loaderStatus === "loading" ? "animate-spin" : "opacity-60")}
          />
          <span>{statusCopy[loaderStatus]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 px-4 py-3 text-sm text-zinc-200">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-cyan-300" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.08em] text-zinc-400">
                  File
                </span>
                <span className="font-medium text-white">
                  {resolvedFileName || "No file selected"}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                loaderStatus === "ready"
                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                  : "border-cyan-500/30 text-cyan-200 bg-cyan-500/10"
              )}
            >
              {loaderStatus === "ready" ? "Ready" : "IFC"}
            </span>
          </div>
          {data.fileUrl && (
            <p className="mt-1 text-[11px] text-zinc-400 break-all">
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
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
              <Map className="h-3.5 w-3.5" />
              Bounding Box
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-cyan-100">
              <span>Min: {data.boundingBox.min.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
              <span>Max: {data.boundingBox.max.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
            </div>
          </div>
        )}

        {data.lastLoadedAt && (
          <p className="text-[11px] text-zinc-500">
            Loaded at {new Date(data.lastLoadedAt).toLocaleTimeString()}
          </p>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
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
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.08em] text-zinc-400">
        {label}
      </span>
      <div className="text-lg font-semibold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
