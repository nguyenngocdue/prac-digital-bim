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
      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-700"
    >
      <span>{selectedModel}</span>
      <ChevronDown className="w-3 h-3" />
    </button>

    {isOpen && (
      <div className="absolute bottom-full left-0 mb-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 min-w-[120px]">
        {AI_MODELS.map((model) => (
          <button
            key={model}
            onClick={() => onSelect(model)}
            className={cn(
              "w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors first:rounded-t-lg last:rounded-b-lg",
              selectedModel === model ? "text-emerald-400" : "text-zinc-400"
            )}
          >
            {model}
          </button>
        ))}
      </div>
    )}
  </div>
);
