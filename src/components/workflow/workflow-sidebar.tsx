"use client";

import { NODE_CATEGORIES } from "@/data/workflow-nodes";
import type { NodeDefinition } from "@/types/workflow";

export function WorkflowSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-[260px] border-r border-zinc-800 bg-[#0f1419]">
      {/* Header */}
      <div className="flex border-b border-zinc-800">
        <button className="flex-1 border-r border-zinc-800 bg-[#1a1f2e] px-4 py-3 text-sm font-medium text-zinc-200">
          Nodes
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300">
          Presets
        </button>
      </div>

      {/* Categories */}
      <div className="overflow-y-auto p-3" style={{ height: "calc(100vh - 12rem)" }}>
        {NODE_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.name} className="mb-3">
              {/* Category Header */}
              <div className="mb-2 flex items-center gap-2 px-2">
                {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 text-blue-400" />}
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {category.name}
                </h3>
              </div>

              {/* Nodes - Always expanded */}
              <div className="space-y-1">
                {category.nodes.map((node) => (
                  <NodeItem key={node.id} node={node} onDragStart={onDragStart} />
                ))}
              </div>
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
  const Icon = node.icon;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      className="group relative cursor-move rounded-md border border-dashed border-zinc-700/50 bg-transparent px-3 py-2.5 transition-all hover:border-zinc-600 hover:bg-zinc-800/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-300" />}
          <span className="text-sm font-medium text-zinc-300">{node.label}</span>
        </div>
        {node.badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            node.badge === "New"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-orange-500/20 text-orange-400"
          }`}>
            {node.badge}
          </span>
        )}
      </div>
    </div>
  );
}
