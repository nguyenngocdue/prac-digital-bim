"use client";

import {
  Play,
  Square,
  Save,
  Upload,
  Download,
  Settings,
  Eye,
  EyeOff,
  MessageSquare,
  RotateCcw,
  Loader2,
  Workflow,
} from "lucide-react";
import { useWorkflow } from "./workflow-provider";

export function WorkflowToolbar() {
  const { 
    showViewer, 
    setShowViewer, 
    showChat, 
    setShowChat,
    isRunning,
    executeWorkflow,
    stopExecution,
    resetExecution,
    executionState,
  } = useWorkflow();

  const handleRun = async () => {
    console.log("Starting workflow execution...");
    const result = await executeWorkflow();
    console.log("Workflow execution result:", result);
  };

  const statusLabel = executionState.status === "idle" ? "ready" : executionState.status;
  const statusStyles = {
    idle: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    pending: "bg-amber-500/10 text-amber-700 border-amber-200",
    running: "bg-sky-500/10 text-sky-700 border-sky-200",
    success: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    error: "bg-rose-500/10 text-rose-700 border-rose-200",
    skipped: "bg-slate-500/10 text-slate-600 border-slate-200",
  } as const;

  return (
    <div className="relative z-10 mx-4 mt-4 flex items-center justify-between rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/80 px-4 py-3 shadow-[0_18px_40px_var(--workflow-shadow)] backdrop-blur animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--workflow-accent)] text-white shadow-[0_10px_20px_rgba(15,118,110,0.25)]">
          <Workflow className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--workflow-muted)]">
            Workflow Studio
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--workflow-ink)]">Flowboard</span>
            <span className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-ink)]">
              Draft
            </span>
          </div>
        </div>
        <div
          className={`ml-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            statusStyles[executionState.status]
          }`}
        >
          {executionState.status === "running" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <button 
            onClick={stopExecution}
            className="flex items-center gap-2 rounded-full bg-[var(--workflow-warm)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_25px_rgba(194,65,12,0.3)] transition hover:bg-[var(--workflow-warm-strong)]"
          >
            <Square className="h-3.5 w-3.5" />
            <span>Stop</span>
          </button>
        ) : (
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 rounded-full bg-[var(--workflow-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_25px_rgba(15,118,110,0.25)] transition hover:bg-[var(--workflow-accent-strong)]"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run</span>
          </button>
        )}
        <button 
          onClick={resetExecution}
          className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--workflow-ink)] transition hover:bg-[var(--workflow-panel)]"
          title="Reset Execution"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-5 w-px bg-[var(--workflow-border)]" />
        <div className="flex items-center gap-1 rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel)] px-1 py-1 shadow-sm">
          <button className="rounded-full p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]">
            <Save className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-full p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]">
            <Upload className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-full p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowViewer(!showViewer)}
          className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            showViewer
              ? "border-[var(--workflow-accent)] bg-[var(--workflow-accent)]/15 text-[var(--workflow-accent)]"
              : "border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
          }`}
        >
          {showViewer ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            showChat
              ? "border-[var(--workflow-warm)] bg-[var(--workflow-warm)]/15 text-[var(--workflow-warm)]"
              : "border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>
        <button className="rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
