"use client";
import { Check, X } from "lucide-react";

interface EditControlsPanelProps {
  hasChanges: boolean;
  editMode: boolean;
  onApply: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export const EditControlsPanel = ({
  hasChanges,
  editMode,
  onApply,
  onCancel,
  onClose,
}: EditControlsPanelProps) => {
  if (!editMode || !hasChanges) return null;

  return (
    <div className="absolute top-4 left-1/2 z-40 -translate-x-1/2 ml-64">
      <div className="viewer-panel viewer-panel-strong flex items-center gap-2 rounded-md px-2 py-1.5 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => {
            onApply();
            onClose?.();
          }}
          title="Apply changes (Enter)"
          className="flex items-center gap-1.5 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg hover:from-green-600 hover:to-emerald-700 active:scale-95"
        >
          <Check className="h-3.5 w-3.5" />
          Apply
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          title="Cancel changes (Esc)"
          className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
};
