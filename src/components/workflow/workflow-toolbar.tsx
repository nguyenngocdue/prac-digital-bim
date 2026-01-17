"use client";

import { useMemo, useState } from "react";
import {
  Play,
  Square,
  Save,
  Upload,
  Download,
  Settings,
  RotateCcw,
  Loader2,
  Workflow,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow } from "./workflow-provider";

type ThemeOption = {
  id: string;
  label: string;
  preview: string;
};

type BackgroundOption = {
  id: string;
  label: string;
  preview: string;
};

type WorkflowToolbarProps = {
  themes: ThemeOption[];
  backgrounds: BackgroundOption[];
  activeTheme: string;
  activeBackground: string;
  onThemeChange: (id: string) => void;
  onBackgroundChange: (id: string) => void;
};

export function WorkflowToolbar({
  themes,
  backgrounds,
  activeTheme,
  activeBackground,
  onThemeChange,
  onBackgroundChange,
}: WorkflowToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    isRunning,
    executeWorkflow,
    stopExecution,
    resetExecution,
    executionState,
    showSidebar,
    setShowSidebar,
    showInspector,
    setShowInspector,
  } = useWorkflow();

  const menuItems = useMemo(
    () => ["File", "Edit", "View", "Packages", "Help"],
    []
  );

  const quickActions = useMemo(
    () => [
      { icon: Save, label: "Save" },
      { icon: Upload, label: "Import" },
      { icon: Download, label: "Export" },
    ],
    []
  );

  const handleRun = async () => {
    const result = await executeWorkflow();
    return result;
  };

  const statusLabel = executionState.status === "idle" ? "ready" : executionState.status;
  const statusStyles = {
    idle: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
    pending: "bg-amber-400/10 text-amber-200 border-amber-400/30",
    running: "bg-sky-400/10 text-sky-200 border-sky-400/30",
    success: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
    error: "bg-rose-400/10 text-rose-200 border-rose-400/30",
    skipped: "bg-slate-400/10 text-slate-200 border-slate-400/30",
  } as const;

  return (
    <div className="relative z-20 w-full">
      <div className="workflow-chrome flex items-center justify-between border-b workflow-chrome-border px-4 py-2 text-[10px] uppercase tracking-[0.24em] workflow-sidebar-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] workflow-chrome-ink">
            <Workflow className="h-4 w-4" />
            <span>Dynamo</span>
          </div>
          <nav className="flex items-center gap-3">
            {menuItems.map((item) => (
              <button
                key={item}
                className="workflow-sidebar-muted transition workflow-chrome-ink-hover"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 rounded-md border workflow-chrome-border workflow-chrome-muted px-2 py-1 text-[9px] uppercase tracking-[0.2em] workflow-chrome-ink">
            Extensions
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-1 rounded-full border workflow-chrome-border workflow-chrome-muted px-2 py-1 text-[9px] font-semibold workflow-chrome-ink">
            <Bell className="h-3 w-3" />
            <span>1</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b workflow-chrome-border workflow-chrome-muted px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="workflow-chrome flex items-center gap-2 rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Home
          </div>
          <div className="flex items-center gap-2 border-l workflow-chrome-border pl-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              aria-pressed={showSidebar}
              title={showSidebar ? "Hide left panel" : "Show left panel"}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition",
                showSidebar
                  ? "workflow-border-accent workflow-accent workflow-accent-tint"
                  : "workflow-chrome-border workflow-chrome workflow-sidebar-muted workflow-chrome-ink-hover"
              )}
            >
              {showSidebar ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setShowInspector(!showInspector)}
              aria-pressed={showInspector}
              title={showInspector ? "Hide right panel" : "Show right panel"}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition",
                showInspector
                  ? "workflow-border-accent workflow-warm workflow-warm-tint"
                  : "workflow-chrome-border workflow-chrome workflow-sidebar-muted workflow-chrome-ink-hover"
              )}
            >
              {showInspector ? (
                <PanelRightOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelRightClose className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusStyles[executionState.status]}`}
          >
            {executionState.status === "running" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            <span>{statusLabel}</span>
          </div>
          {isRunning ? (
            <button
              onClick={stopExecution}
              className="flex items-center gap-2 rounded-md workflow-warm-bg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition workflow-warm-strong-hover"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-2 rounded-md workflow-accent-bg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition workflow-accent-strong-hover"
            >
              <Play className="h-3.5 w-3.5" />
              Run
            </button>
          )}
          <button
            onClick={resetExecution}
            className="rounded-md border workflow-chrome-border workflow-chrome px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] workflow-chrome-ink transition workflow-chrome-muted-hover"
            title="Reset Execution"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-5 w-px workflow-chrome-border-bg" />
          <div className="flex items-center gap-1 rounded-md border workflow-chrome-border workflow-chrome px-1 py-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="rounded-md p-2 workflow-sidebar-muted transition workflow-chrome-muted-hover workflow-chrome-ink-hover"
                title={action.label}
              >
                <action.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-md border workflow-chrome-border workflow-chrome px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] workflow-chrome-ink transition workflow-chrome-muted-hover">
            <Download className="h-3.5 w-3.5" />
            Export as Image
          </button>
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              aria-pressed={settingsOpen}
              className={cn(
                "rounded-md border workflow-chrome-border workflow-chrome px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] workflow-chrome-ink transition workflow-chrome-muted-hover",
                settingsOpen && "workflow-border-accent"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-xl border workflow-border workflow-surface-glass workflow-shadow p-4 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.26em] workflow-muted">
                  Theme
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onThemeChange(theme.id)}
                      aria-pressed={activeTheme === theme.id}
                      className={cn(
                        "group rounded-lg border px-2 py-2 text-left transition",
                        activeTheme === theme.id
                          ? "workflow-border-accent workflow-surface-strong"
                          : "workflow-border workflow-surface workflow-border-accent-hover"
                      )}
                    >
                      <span
                        className="block h-8 w-full rounded-md shadow-inner"
                        style={{ background: theme.preview }}
                      />
                      <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.16em] workflow-muted workflow-ink-on-hover">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] workflow-muted">
                  Background
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {backgrounds.map((background) => (
                    <button
                      key={background.id}
                      type="button"
                      onClick={() => onBackgroundChange(background.id)}
                      aria-pressed={activeBackground === background.id}
                      className={cn(
                        "group rounded-lg border px-2 py-2 text-left transition",
                        activeBackground === background.id
                          ? "workflow-border-warm workflow-surface-strong"
                          : "workflow-border workflow-surface workflow-border-warm-hover"
                      )}
                    >
                      <span
                        className="block h-8 w-full rounded-md shadow-inner"
                        style={{ background: background.preview }}
                      />
                      <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.16em] workflow-muted workflow-ink-on-hover">
                        {background.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
