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
    <div className="flex h-full w-[280px] flex-col rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/80 shadow-[0_18px_40px_var(--workflow-shadow)] backdrop-blur animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Header */}
      <div className="border-b border-[var(--workflow-border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--workflow-muted)]">
              Library
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--workflow-ink)]">
              Node Bank
            </div>
          </div>
          <span className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--workflow-ink)]">
            {totalResults}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab("nodes")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeTab === "nodes"
                ? "bg-[var(--workflow-accent)] text-white shadow-[0_10px_20px_rgba(15,118,110,0.25)]"
                : "border border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
            }`}
          >
            Nodes
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeTab === "presets"
                ? "bg-[var(--workflow-warm)] text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]"
                : "border border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-[var(--workflow-border)] p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--workflow-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] py-2 pl-9 pr-9 text-xs font-medium text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] transition focus:border-[var(--workflow-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--workflow-accent)]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel)] hover:text-[var(--workflow-ink)]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "presets" ? (
          <div className="rounded-2xl border border-dashed border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)]/70 p-6 text-center">
            <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--workflow-muted)]">
              Presets
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--workflow-ink)]">
              No presets yet
            </p>
            <p className="mt-1 text-xs text-[var(--workflow-muted)]">
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
                      <CategoryIcon className="h-4 w-4 text-[var(--workflow-accent)]" />
                    )}
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--workflow-ink)]">
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--workflow-muted)]">
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
            <Search className="mb-2 h-8 w-8 text-[var(--workflow-border)]" />
            <p className="text-sm font-semibold text-[var(--workflow-ink)]">
              No nodes found
            </p>
            <p className="mt-1 text-xs text-[var(--workflow-muted)]">
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
  const accent = accentMap[node.category] || "bg-[var(--workflow-accent)]";
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      className="group relative cursor-move rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)]/70 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-[var(--workflow-accent)] hover:bg-[var(--workflow-panel)] hover:shadow-[0_10px_18px_rgba(15,23,42,0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-1.5 rounded-full ${accent}`} />
          <div>
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-[var(--workflow-muted)] group-hover:text-[var(--workflow-ink)]" />}
              <span className="text-sm font-semibold text-[var(--workflow-ink)]">
                {node.label}
              </span>
            </div>
            {node.description && (
              <p className="mt-1 text-[11px] text-[var(--workflow-muted)]">
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
