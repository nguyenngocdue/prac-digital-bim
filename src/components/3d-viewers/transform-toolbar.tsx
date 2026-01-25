"use client";
import { Move, RotateCw, Expand } from "lucide-react";
import type { TransformMode } from "@/app/contexts/box-context";

interface TransformToolbarProps {
  mode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  show: boolean;
}

const modes = [
  { key: "translate" as const, label: "Move", icon: Move, shortcut: "G" },
  { key: "rotate" as const, label: "Rotate", icon: RotateCw, shortcut: "R" },
  { key: "scale" as const, label: "Scale", icon: Expand, shortcut: "S" },
] as const;

export const TransformToolbar = ({
  mode,
  onModeChange,
  show,
}: TransformToolbarProps) => {
  // Keyboard shortcuts are handled in viewer.tsx to also enable editMode

  if (!show) return null;

  return (
    <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2">
      <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/80 bg-slate-800/95 p-1 shadow-xl backdrop-blur-sm">
        {modes.map(({ key, label, icon: Icon, shortcut }) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onModeChange(key)}
              title={`${label} (${shortcut})`}
              className={`group relative flex items-center gap-2 rounded px-2 py-1.5 text-xs font-medium transition-all duration-100 ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {/* Show label with shortcut when active */}
              {isActive && (
                <span className="whitespace-nowrap pr-1">
                  {label} ({shortcut})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
