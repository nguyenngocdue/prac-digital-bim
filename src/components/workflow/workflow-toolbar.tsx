"use client";

import type { FC } from "react";
import { 
  Play, 
  Save, 
  Trash2, 
  File, 
  Edit3, 
  Eye, 
  HelpCircle,
  Workflow,
  GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";

type WorkflowToolbarProps = {
  onRun?: () => void;
  onSave?: () => void;
  onClear?: () => void;
  nodeCount?: number;
  edgeCount?: number;
};

/**
 * Menu Button Component
 */
const MenuButton: FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ 
  icon, 
  label,
  onClick 
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Workflow Toolbar - Top action bar with menu and controls
 */
export const WorkflowToolbar: FC<WorkflowToolbarProps> = ({
  onRun,
  onSave,
  onClear,
  nodeCount = 0,
  edgeCount = 0,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-zinc-100">
      {/* Left: Brand & Menu */}
      <div className="flex items-center gap-3">
        {/* Menu */}
        <nav className="flex items-center gap-0.5">
          <MenuButton icon={<File className="h-3.5 w-3.5" />} label="File" />
          <MenuButton icon={<Edit3 className="h-3.5 w-3.5" />} label="Edit" />
          <MenuButton icon={<Eye className="h-3.5 w-3.5" />} label="View" />
          <MenuButton icon={<HelpCircle className="h-3.5 w-3.5" />} label="Help" />
        </nav>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-6 rounded-lg bg-zinc-800/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-zinc-400">Nodes:</span>
          <span className="text-sm font-semibold text-zinc-200">{nodeCount}</span>
        </div>
        <div className="h-4 w-px bg-zinc-700" />
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-zinc-400">Edges:</span>
          <span className="text-sm font-semibold text-zinc-200">{edgeCount}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {onSave && (
          <Button
            onClick={onSave}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        )}
        {onClear && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        )}
        {onRun && (
          <Button
            onClick={onRun}
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/30"
          >
            <Play className="h-4 w-4" />
            <span>Run</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkflowToolbar;
