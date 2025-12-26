"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { NODE_CATEGORIES } from "@/data/workflow-nodes";
import type { NodeDefinition } from "@/types/workflow";

export function WorkflowSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  // Filter nodes based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return NODE_CATEGORIES;
    }

    const query = searchQuery.toLowerCase();
    return NODE_CATEGORIES.map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.description?.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query)
      ),
    })).filter((category) => category.nodes.length > 0);
  }, [searchQuery]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.nodes.length,
    0
  );

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

      {/* Search Bar */}
      <div className="border-b border-zinc-800 bg-[#0f1419] p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-md border border-zinc-700/50 bg-zinc-900/50 py-1.5 pl-8 pr-8 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-[10px] text-zinc-500">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="overflow-y-auto p-3" style={{ height: "calc(100vh - 15rem)" }}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.name} className="mb-3">
                {/* Category Header */}
                <div className="mb-2 flex items-center gap-2 px-2">
                  {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 text-blue-400" />}
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    {category.name}
                  </h3>
                  <span className="text-[10px] text-zinc-600">
                    ({category.nodes.length})
                  </span>
                </div>

                {/* Nodes - Always expanded */}
                <div className="space-y-1">
                  {category.nodes.map((node) => (
                    <NodeItem 
                      key={node.id} 
                      node={node} 
                      onDragStart={onDragStart}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">No nodes found</p>
            <p className="text-xs text-zinc-600 mt-1">
              Try a different search term
            </p>
          </div>
        )}
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
