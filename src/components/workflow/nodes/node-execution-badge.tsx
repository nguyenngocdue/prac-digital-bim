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
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/20",
    label: "Idle",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    label: "Pending",
  },
  running: {
    icon: Loader2,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    label: "Running",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    label: "Success",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    label: "Error",
  },
  skipped: {
    icon: SkipForward,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/20",
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
        "absolute -top-2 -right-2 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium shadow-lg",
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
