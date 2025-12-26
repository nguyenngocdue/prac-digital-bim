"use client";

import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { memo } from "react";

type NodeCloseButtonProps = {
  nodeId: string;
  variant?: "default" | "subtle" | "emerald" | "orange";
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
      button: "bg-zinc-700/80 hover:bg-red-500 border-zinc-600 hover:border-red-400",
      icon: "text-zinc-400 hover:text-white",
    },
    subtle: {
      button: "bg-zinc-200 hover:bg-red-500 border-zinc-300 hover:border-red-500",
      icon: "text-zinc-600 hover:text-white",
    },
    emerald: {
      button: "bg-emerald-700/50 hover:bg-red-500 border-emerald-600/50 hover:border-red-400",
      icon: "text-white/80 hover:text-white",
    },
    orange: {
      button: "bg-orange-700/50 hover:bg-red-500 border-orange-600/50 hover:border-red-400",
      icon: "text-orange-200 hover:text-white",
    },
  };

  const positionStyles = position === "outside" 
    ? "absolute -top-2 -right-2" 
    : "absolute top-1.5 right-1.5";

  const styles = variants[variant];

  return (
    <button
      onClick={handleDelete}
      className={`${positionStyles} opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 border z-10 ${styles.button} ${className}`}
      title="Delete node"
    >
      <X className={`w-3 h-3 ${styles.icon} transition-colors`} />
    </button>
  );
});

NodeCloseButton.displayName = "NodeCloseButton";
