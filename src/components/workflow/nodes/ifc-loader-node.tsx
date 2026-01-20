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
    waiting: "",
    loading: "workflow-border-accent",
    ready: "workflow-border-accent",
    error: "workflow-border-warm",
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
        "workflow-surface workflow-shadow group relative min-w-[320px] max-w-[520px] rounded-2xl border workflow-border transition-all",
        selected
          ? "workflow-border-accent workflow-outline-accent"
          : "workflow-border-accent-hover",
        statusStyles[loaderStatus]
      )}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      <NodeExecutionBadge status={executionStatus} duration={nodeState?.duration} />

      <Handle
        type="target"
        position={Position.Left}
        id="file"
        className="workflow-handle-accent !w-3.5 !h-3.5 !border-[3px] hover:!scale-110 transition-transform !rounded-full"
        style={{ left: -8, top: "50%" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="model"
        className="workflow-handle-warm !w-3.5 !h-3.5 !border-[3px] hover:!scale-110 transition-transform !rounded-full"
        style={{ right: -8, top: "50%" }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b workflow-border workflow-surface-strong px-4 py-3 rounded-t-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border workflow-border-accent workflow-accent-tint">
          <PackageOpen className="h-5 w-5 workflow-accent" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold workflow-ink">
            {data.label || "IfcLoader"}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] workflow-muted">
            Core · Fragments
          </span>
        </div>
        <div className="workflow-surface-glass ml-auto flex max-w-full items-center gap-2 rounded-full border workflow-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] workflow-ink">
          <Loader2
            className={cn("h-3.5 w-3.5", loaderStatus === "loading" ? "animate-spin" : "opacity-60")}
          />
          <span className="max-w-[200px] truncate">{statusCopy[loaderStatus]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 px-4 py-3 text-sm workflow-ink">
        <div className="rounded-xl border workflow-border workflow-surface-strong px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 workflow-accent" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.18em] workflow-muted">
                  File
                </span>
                <span className="font-semibold workflow-ink">
                  {resolvedFileName || "No file selected"}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
                loaderStatus === "ready"
                  ? "workflow-border-accent workflow-accent-tint workflow-accent"
                  : "workflow-border workflow-surface-glass workflow-muted"
              )}
            >
              {loaderStatus === "ready" ? "Ready" : "IFC"}
            </span>
          </div>
          {data.fileUrl && (
            <p className="mt-1 text-[11px] workflow-muted break-all">
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
          <div className="rounded-xl border workflow-border-accent workflow-accent-tint px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] workflow-accent">
              <Map className="h-3.5 w-3.5" />
              Bounding Box
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] workflow-accent">
              <span>Min: {data.boundingBox.min.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
              <span>Max: {data.boundingBox.max.map((v) => v.toFixed?.(3) ?? v).join(", ")}</span>
            </div>
          </div>
        )}

        {data.lastLoadedAt && (
          <p className="text-[11px] workflow-muted">
            Loaded at {new Date(data.lastLoadedAt).toLocaleTimeString()}
          </p>
        )}

        {errorMessage && (
          <div className="rounded-xl border workflow-border-warm workflow-warm-tint px-3 py-2 text-xs workflow-warm">
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
    <div className="rounded-xl border workflow-border workflow-surface-strong px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.18em] workflow-muted">
        {label}
      </span>
      <div className="text-lg font-semibold workflow-ink">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
