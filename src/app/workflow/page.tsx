"use client";

import type { CSSProperties } from "react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowSidebar } from "@/components/workflow/workflow-sidebar";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { WorkflowProvider } from "@/components/workflow/workflow-provider";
import { NodeSettingsPanel } from "@/components/workflow/node-settings-panel";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-workflow-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-workflow-mono",
});

const workflowTheme: CSSProperties = {
  "--workflow-bg": "#f7f1e6",
  "--workflow-panel": "#fffaf2",
  "--workflow-panel-strong": "#f2e6d3",
  "--workflow-ink": "#1f2937",
  "--workflow-muted": "#6b7280",
  "--workflow-border": "#e2d2bf",
  "--workflow-accent": "#0f766e",
  "--workflow-accent-strong": "#0d9488",
  "--workflow-warm": "#c2410c",
  "--workflow-warm-strong": "#ea580c",
  "--workflow-shadow": "rgba(15, 23, 42, 0.12)",
  "--workflow-grid": "rgba(15, 118, 110, 0.16)",
  "--font-sans": "var(--font-workflow-sans)",
  "--font-mono": "var(--font-workflow-mono)",
} as CSSProperties;

export default function WorkflowPage() {
  return (
    <WorkflowProvider>
      <div
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} relative flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-[var(--workflow-bg)] font-sans text-[var(--workflow-ink)]`}
        style={workflowTheme}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 18%, rgba(15, 118, 110, 0.14), transparent 40%), radial-gradient(circle at 88% 16%, rgba(234, 88, 12, 0.16), transparent 42%), radial-gradient(circle at 18% 82%, rgba(15, 118, 110, 0.1), transparent 45%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                "linear-gradient(0deg, rgba(15, 118, 110, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.12) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        <WorkflowToolbar />

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 gap-4 overflow-hidden p-4">
          <WorkflowSidebar />

          {/* Canvas */}
          <WorkflowCanvas />

          {/* Node Settings Panel */}
          <NodeSettingsPanel />
        </div>
      </div>
    </WorkflowProvider>
  );
}
