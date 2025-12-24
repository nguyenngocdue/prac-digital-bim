"use client";

import { useState, type FC } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_CATEGORIES } from "@/data/workflow-nodes";
import type { NodeDefinition, NodeBadge } from "@/types/workflow";

type WorkflowSidebarProps = {
  onNodeDragStart: (node: NodeDefinition) => void;
};

/**
 * Badge Component
 */
const Badge: FC<{ type: NodeBadge }> = ({ type }) => {
  const badgeStyles = {
    WIP: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    New: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    Beta: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    Pro: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
        badgeStyles[type]
      )}
    >
      {type}
    </span>
  );
};

/**
 * Node Item Component
 */
const NodeItem: FC<{
  node: NodeDefinition;
  onDragStart: () => void;
}> = ({ node, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "group flex cursor-move items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "active:opacity-50"
      )}
    >
      {node.icon && <span className="text-base">{node.icon}</span>}
      <span className="flex-1 text-foreground">{node.label}</span>
      {node.badge && <Badge type={node.badge} />}
    </div>
  );
};

/**
 * Workflow Sidebar - Node palette with categories
 */
export const WorkflowSidebar: FC<WorkflowSidebarProps> = ({
  onNodeDragStart,
}) => {
  const [activeTab, setActiveTab] = useState<"nodes" | "presets">("nodes");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(NODE_CATEGORIES.map((c) => c.name))
  );

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex h-full w-52 flex-col border-r border-zinc-700 bg-zinc-900 text-zinc-100">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab("nodes")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "nodes"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          Nodes
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "presets"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          Presets
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "nodes" ? (
          <div className="py-2">
            {NODE_CATEGORIES.map((category) => {
              const isExpanded = expandedCategories.has(category.name);

              return (
                <div key={category.name} className="mb-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isExpanded ? "rotate-90" : ""
                      )}
                    />
                    {category.icon && (
                      <span className="text-sm">{category.icon}</span>
                    )}
                    <span className="flex-1">{category.name}</span>
                  </button>

                  {/* Category Nodes */}
                  {isExpanded && (
                    <div className="space-y-0.5 py-1">
                      {category.nodes.map((node) => (
                        <NodeItem
                          key={node.id}
                          node={node}
                          onDragStart={() => onNodeDragStart(node)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-zinc-400">
            <p>Presets coming soon...</p>
            <p className="mt-2 text-xs">
              Save and load workflow templates
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSidebar;
