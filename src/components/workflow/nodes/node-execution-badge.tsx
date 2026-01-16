"use client";

import { CheckCircle, XCircle, Loader2, Clock, SkipForward } from "lucide-react";
import type { ExecutionStatus } from "../execution/types";
import { cn } from "@/lib/utils";

type NodeExecutionBadgeProps = {
  status: ExecutionStatus;
  duration?: number;
  className?: string;
};

const statusConfig: Record<
  ExecutionStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  idle: {
    icon: Clock,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10 border-slate-200",
    label: "Idle",
  },
  pending: {
    icon: Clock,
    color: "text-amber-700",
    bgColor: "bg-amber-500/10 border-amber-200",
    label: "Pending",
  },
  running: {
    icon: Loader2,
    color: "text-sky-700",
    bgColor: "bg-sky-500/10 border-sky-200",
    label: "Running",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-700",
    bgColor: "bg-emerald-500/10 border-emerald-200",
    label: "Success",
  },
  error: {
    icon: XCircle,
    color: "text-rose-700",
    bgColor: "bg-rose-500/10 border-rose-200",
    label: "Error",
  },
  skipped: {
    icon: SkipForward,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10 border-slate-200",
    label: "Skipped",
  },
};

export function NodeExecutionBadge({
  status,
  duration,
  className,
}: NodeExecutionBadgeProps) {
  if (status === "idle") return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "absolute -top-2 -right-2 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm",
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          status === "running" && "animate-spin"
        )}
      />
      {duration !== undefined && status === "success" && (
        <span>{(duration / 1000).toFixed(1)}s</span>
      )}
    </div>
  );
}
