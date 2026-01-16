"use client";

import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { memo } from "react";

type NodeCloseButtonProps = {
  nodeId: string;
  variant?: "default" | "subtle" | "emerald" | "orange" | "cyan" | "purple" | "yellow";
  position?: "outside" | "inside";
  className?: string;
};

export const NodeCloseButton = memo(({ 
  nodeId, 
  variant = "default", 
  position = "inside",
  className = "" 
}: NodeCloseButtonProps) => {
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id: nodeId }] });
  };

  const variants = {
    default: {
      button:
        "bg-[var(--workflow-panel-strong)] hover:bg-[var(--workflow-warm)] border-[var(--workflow-border)] hover:border-[var(--workflow-warm)]",
      icon: "text-[var(--workflow-muted)] hover:text-white",
    },
    subtle: {
      button:
        "bg-white/80 hover:bg-[var(--workflow-warm)] border-[var(--workflow-border)] hover:border-[var(--workflow-warm)]",
      icon: "text-[var(--workflow-muted)] hover:text-white",
    },
    emerald: {
      button:
        "bg-emerald-500/15 hover:bg-[var(--workflow-warm)] border-emerald-200 hover:border-[var(--workflow-warm)]",
      icon: "text-emerald-700 hover:text-white",
    },
    orange: {
      button:
        "bg-orange-500/15 hover:bg-[var(--workflow-warm)] border-orange-200 hover:border-[var(--workflow-warm)]",
      icon: "text-orange-700 hover:text-white",
    },
    cyan: {
      button:
        "bg-teal-500/15 hover:bg-[var(--workflow-warm)] border-teal-200 hover:border-[var(--workflow-warm)]",
      icon: "text-teal-700 hover:text-white",
    },
    purple: {
      button:
        "bg-indigo-500/15 hover:bg-[var(--workflow-warm)] border-indigo-200 hover:border-[var(--workflow-warm)]",
      icon: "text-indigo-700 hover:text-white",
    },
    yellow: {
      button:
        "bg-amber-500/15 hover:bg-[var(--workflow-warm)] border-amber-200 hover:border-[var(--workflow-warm)]",
      icon: "text-amber-700 hover:text-white",
    },
  };

  const positionStyles = position === "outside" 
    ? "absolute -top-2 -right-2" 
    : "absolute top-1.5 right-1.5";

  const styles = variants[variant];

  return (
    <button
      onClick={handleDelete}
      className={`${positionStyles} opacity-0 group-hover:opacity-100 p-1 rounded-full transition-all duration-200 border z-10 ${styles.button} ${className}`}
      title="Delete node"
    >
      <X className={`w-3 h-3 ${styles.icon} transition-colors`} />
    </button>
  );
});

NodeCloseButton.displayName = "NodeCloseButton";
