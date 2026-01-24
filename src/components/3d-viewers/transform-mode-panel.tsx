"use client";
import { Move, RotateCw, Maximize2 } from "lucide-react";

interface TransformModePanelProps {
  mode: "translate" | "rotate" | "scale";
  onModeChange: (mode: "translate" | "rotate" | "scale") => void;
  selectedId: string | null;
}

export const TransformModePanel = ({
  mode,
  onModeChange,
  selectedId,
}: TransformModePanelProps) => {
  if (!selectedId) return null;

  const modes = [
    { key: "translate", label: "Move (G)", icon: Move, shortcut: "G" },
    { key: "rotate", label: "Rotate (R)", icon: RotateCw, shortcut: "R" },
    { key: "scale", label: "Scale (S)", icon: Maximize2, shortcut: "S" },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 z-40 -translate-x-1/2">
      <div className="viewer-panel viewer-panel-strong flex items-center gap-1 rounded-lg px-2 py-1.5 shadow-lg backdrop-blur">
        <span className="text-xs font-medium text-muted-foreground mr-2">
          Transform Mode:
        </span>
        {modes.map(({ key, label, icon: Icon, shortcut }) => (
          <button
            key={key}
            type="button"
            onClick={() => onModeChange(key)}
            title={label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              mode === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{key}</span>
            <span className="text-[10px] opacity-60">({shortcut})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
