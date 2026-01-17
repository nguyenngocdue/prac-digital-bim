"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { NODE_CATEGORIES } from "@/data/workflow-nodes";
import type { NodeDefinition } from "@/types/workflow";

export function WorkflowSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"nodes" | "presets">("nodes");

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
    <div className="workflow-sidebar flex h-full min-h-0 w-full flex-col overflow-hidden border-r workflow-sidebar-border animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Header */}
      <div className="border-b workflow-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] workflow-sidebar-muted">
              Library
            </div>
            <div className="mt-1 text-sm font-semibold workflow-sidebar-ink">
              Node Bank
            </div>
          </div>
          <span className="rounded-md border workflow-sidebar-border workflow-chrome-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] workflow-sidebar-ink">
            {totalResults}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab("nodes")}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeTab === "nodes"
                ? "workflow-accent-bg text-white"
                : "border workflow-sidebar-border workflow-chrome-muted workflow-sidebar-muted workflow-sidebar-ink-hover"
            }`}
          >
            Nodes
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeTab === "presets"
                ? "workflow-warm-bg text-white"
                : "border workflow-sidebar-border workflow-chrome-muted workflow-sidebar-muted workflow-sidebar-ink-hover"
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b workflow-sidebar-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 workflow-sidebar-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-md border workflow-sidebar-border workflow-chrome-muted py-2 pl-9 pr-9 text-xs font-medium workflow-sidebar-ink placeholder:workflow-sidebar-muted transition focus:outline-none workflow-focus"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 workflow-sidebar-muted transition workflow-chrome-muted-hover workflow-sidebar-ink-hover"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] workflow-sidebar-muted">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3">
        {activeTab === "presets" ? (
          <div className="rounded-md border border-dashed workflow-sidebar-border workflow-chrome-muted p-6 text-center">
            <div className="text-[11px] uppercase tracking-[0.26em] workflow-sidebar-muted">
              Presets
            </div>
            <p className="mt-2 text-sm font-semibold workflow-sidebar-ink">
              No presets yet
            </p>
            <p className="mt-1 text-xs workflow-sidebar-muted">
              Save a workflow to appear here.
            </p>
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.name} className="mb-4">
                {/* Category Header */}
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    {CategoryIcon && (
                      <CategoryIcon className="h-4 w-4 workflow-accent" />
                    )}
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] workflow-sidebar-ink">
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] workflow-sidebar-muted">
                    {category.nodes.length}
                  </span>
                </div>

                {/* Nodes - Always expanded */}
                <div className="space-y-2">
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
            <Search className="mb-2 h-8 w-8 workflow-sidebar-muted" />
            <p className="text-sm font-semibold workflow-sidebar-ink">
              No nodes found
            </p>
            <p className="mt-1 text-xs workflow-sidebar-muted">
              Try a different search term.
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
  const accentMap: Record<string, string> = {
    Input: "bg-emerald-500",
    Geometry: "bg-sky-500",
    Data: "bg-amber-500",
    Output: "bg-rose-500",
    AI: "bg-teal-500",
  };
  const accent = accentMap[node.category] || "workflow-accent-bg";
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      className="group relative cursor-move rounded-md border workflow-border workflow-surface workflow-surface-hover workflow-border-accent-hover px-3 py-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(15,23,42,0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-1.5 rounded-full ${accent}`} />
          <div>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 workflow-muted workflow-ink-on-hover" />}
              <span className="text-sm font-semibold workflow-ink">
                {node.label}
              </span>
            </div>
            {node.description && (
              <p className="mt-1 text-[11px] workflow-muted">
                {node.description}
              </p>
            )}
          </div>
        </div>
        {node.badge && (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            node.badge === "New"
              ? "border-emerald-200 bg-emerald-500/15 text-emerald-700"
              : "border-amber-200 bg-amber-500/15 text-amber-700"
          }`}>
            {node.badge}
          </span>
        )}
      </div>
    </div>
  );
}
