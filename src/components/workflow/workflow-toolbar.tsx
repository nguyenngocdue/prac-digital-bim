"use client";

import { Play, Square, Save, Upload, Download, Settings, Eye, EyeOff, MessageSquare, RotateCcw, Loader2, Workflow } from "lucide-react";
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

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
          <Workflow className="h-4 w-4" />
          <span>Workflow</span>
        </div>
        {/* Execution Status */}
        {executionState.status !== "idle" && (
          <div className={`ml-4 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${
            executionState.status === "running" ? "bg-yellow-500/20 text-yellow-400" :
            executionState.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
            executionState.status === "error" ? "bg-red-500/20 text-red-400" :
            "bg-zinc-500/20 text-zinc-400"
          }`}>
            {executionState.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
            <span className="capitalize">{executionState.status}</span>
          </div>
        )}
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <button 
            onClick={stopExecution}
            className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500"
          >
            <Square className="h-3 w-3" />
            <span>Stop</span>
          </button>
        ) : (
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <Play className="h-3 w-3" />
            <span>Run</span>
          </button>
        )}
        <button 
          onClick={resetExecution}
          className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          title="Reset Execution"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <div className="mx-1 h-4 w-px bg-zinc-700" />
        <button className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700">
          <Save className="h-3 w-3" />
        </button>
        <button className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700">
          <Upload className="h-3 w-3" />
        </button>
        <button className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700">
          <Download className="h-3 w-3" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowViewer(!showViewer)}
          className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
            showViewer
              ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          {showViewer ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
            showChat
              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          <MessageSquare className="h-3 w-3" />
        </button>
        <button className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700">
          <Settings className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
