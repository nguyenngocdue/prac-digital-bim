"use client";

import { useState } from "react";
import { NODE_CATEGORIES } from "@/data/workflow-nodes";
import type { NodeDefinition } from "@/types/workflow";
import { ChevronDown, ChevronRight } from "lucide-react";

export function WorkflowSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Geometry", "Data"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-[220px] border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Nodes</h2>
        <p className="mt-1 text-xs text-zinc-500">Drag to canvas</p>
      </div>

      {/* Categories */}
      <div className="overflow-y-auto p-2" style={{ height: "calc(100vh - 12rem)" }}>
        {NODE_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.name);
          return (
            <div key={category.name} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <span className="flex items-center gap-1.5">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {/* Nodes */}
              {isExpanded && (
                <div className="mt-1 space-y-1 pl-2">
                  {category.nodes.map((node) => (
                    <NodeItem key={node.id} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeItem({
  node,
  onDragStart,
}: {
  node: NodeDefinition;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      className="group relative cursor-move rounded border border-zinc-800 bg-zinc-900 px-2 py-2 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{node.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-300">{node.label}</span>
            {node.badge && (
              <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${
                node.badge === "New"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
                {node.badge}
              </span>
            )}
          </div>
          {node.description && (
            <p className="mt-0.5 text-[10px] text-zinc-500">{node.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
