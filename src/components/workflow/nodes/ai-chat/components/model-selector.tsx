"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_MODELS } from "../constants";
import type { ModelSelectorProps } from "../types";

export const ModelSelector = ({
  selectedModel,
  isOpen,
  onToggle,
  onSelect,
}: ModelSelectorProps) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-1 rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
    >
      <span>{selectedModel}</span>
      <ChevronDown className="w-3 h-3" />
    </button>

    {isOpen && (
      <div className="absolute bottom-full left-0 mb-1 rounded-xl border border-[var(--workflow-border)] bg-white/95 shadow-xl z-20 min-w-[120px]">
        {AI_MODELS.map((model) => (
          <button
            key={model}
            onClick={() => onSelect(model)}
            className={cn(
              "w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--workflow-panel-strong)] transition-colors first:rounded-t-lg last:rounded-b-lg",
              selectedModel === model ? "text-emerald-700 font-semibold" : "text-[var(--workflow-muted)]"
            )}
          >
            {model}
          </button>
        ))}
      </div>
    )}
  </div>
);
