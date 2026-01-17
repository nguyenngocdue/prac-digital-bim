"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BackgroundVariant } from "@xyflow/react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowSidebar } from "@/components/workflow/workflow-sidebar";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { WorkflowProvider, useWorkflow } from "@/components/workflow/workflow-provider";
import { NodeSettingsPanel } from "@/components/workflow/node-settings-panel";
import { cn } from "@/lib/utils";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-workflow-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-workflow-mono",
});

type WorkflowThemePreset = {
  id: string;
  label: string;
  preview: string;
  tokens: CSSProperties;
};

type WorkflowBackgroundPreset = {
  id: string;
  label: string;
  preview: string;
  canvasVariant: BackgroundVariant;
  canvasGap: number;
  canvasSize: number;
  layers: Array<{
    className: string;
    style: CSSProperties;
  }>;
};

const baseTokens: CSSProperties = {
  "--font-sans": "var(--font-workflow-sans)",
  "--font-mono": "var(--font-workflow-mono)",
} as CSSProperties;

const workflowThemes: WorkflowThemePreset[] = [
  {
    id: "dynamo",
    label: "Dynamo",
    preview: "linear-gradient(135deg, #f2f2f2, #fdfdfd 55%, #ededed)",
    tokens: {
      "--workflow-bg": "#efefef",
      "--workflow-canvas": "#fdfdfd",
      "--workflow-panel": "#f8f8f8",
      "--workflow-panel-strong": "#ededed",
      "--workflow-ink": "#1c1c1c",
      "--workflow-muted": "#5f5f5f",
      "--workflow-border": "#d0d0d0",
      "--workflow-accent": "#3b86c4",
      "--workflow-accent-strong": "#2f6b9e",
      "--workflow-accent-soft": "rgba(59, 134, 196, 0.18)",
      "--workflow-warm": "#e28a3b",
      "--workflow-warm-strong": "#c9702d",
      "--workflow-shadow": "rgba(0, 0, 0, 0.12)",
      "--workflow-grid": "rgba(0, 0, 0, 0.08)",
      "--workflow-spot-a": "rgba(59, 134, 196, 0.12)",
      "--workflow-spot-b": "rgba(226, 138, 59, 0.14)",
      "--workflow-spot-c": "rgba(0, 0, 0, 0.06)",
      "--workflow-overlay-grid": "rgba(0, 0, 0, 0.08)",
      "--workflow-dots": "rgba(0, 0, 0, 0.12)",
      "--workflow-chrome": "#2f3033",
      "--workflow-chrome-muted": "#3a3b3f",
      "--workflow-chrome-ink": "#f2f2f2",
      "--workflow-chrome-border": "#45464a",
      "--workflow-sidebar": "#2a2b2f",
      "--workflow-sidebar-ink": "#e6e6e6",
      "--workflow-sidebar-muted": "#b2b2b2",
      "--workflow-sidebar-border": "#3f4044",
      "--workflow-statusbar": "#2b2c30",
    } as CSSProperties,
  },
  {
    id: "linen",
    label: "Linen",
    preview: "linear-gradient(135deg, #f7f1e6, #fffaf2 55%, #f2e6d3)",
    tokens: {
      "--workflow-bg": "#f7f1e6",
      "--workflow-canvas": "#fffdf9",
      "--workflow-panel": "#fffaf2",
      "--workflow-panel-strong": "#f2e6d3",
      "--workflow-ink": "#1f2937",
      "--workflow-muted": "#6b7280",
      "--workflow-border": "#e2d2bf",
      "--workflow-accent": "#0f766e",
      "--workflow-accent-strong": "#0d9488",
      "--workflow-accent-soft": "rgba(15, 118, 110, 0.2)",
      "--workflow-warm": "#c2410c",
      "--workflow-warm-strong": "#ea580c",
      "--workflow-shadow": "rgba(15, 23, 42, 0.12)",
      "--workflow-grid": "rgba(15, 118, 110, 0.16)",
      "--workflow-spot-a": "rgba(15, 118, 110, 0.16)",
      "--workflow-spot-b": "rgba(234, 88, 12, 0.18)",
      "--workflow-spot-c": "rgba(15, 118, 110, 0.12)",
      "--workflow-overlay-grid": "rgba(15, 118, 110, 0.18)",
      "--workflow-dots": "rgba(15, 118, 110, 0.22)",
      "--workflow-chrome": "#2e2a26",
      "--workflow-chrome-muted": "#3a342f",
      "--workflow-chrome-ink": "#f9f5ef",
      "--workflow-chrome-border": "#4a433c",
      "--workflow-sidebar": "#282421",
      "--workflow-sidebar-ink": "#efe9e1",
      "--workflow-sidebar-muted": "#c9bfb3",
      "--workflow-sidebar-border": "#40372f",
      "--workflow-statusbar": "#26221f",
    } as CSSProperties,
  },
  {
    id: "noir",
    label: "Noir",
    preview: "linear-gradient(135deg, #0f1118, #1b2030 55%, #171a23)",
    tokens: {
      "--workflow-bg": "#0f1118",
      "--workflow-canvas": "#151821",
      "--workflow-panel": "#171a23",
      "--workflow-panel-strong": "#1f2430",
      "--workflow-ink": "#f1f5f9",
      "--workflow-muted": "#9aa3b2",
      "--workflow-border": "#2a2f3a",
      "--workflow-accent": "#38bdf8",
      "--workflow-accent-strong": "#0ea5e9",
      "--workflow-accent-soft": "rgba(56, 189, 248, 0.2)",
      "--workflow-warm": "#f97316",
      "--workflow-warm-strong": "#fb923c",
      "--workflow-shadow": "rgba(2, 6, 23, 0.6)",
      "--workflow-grid": "rgba(148, 163, 184, 0.28)",
      "--workflow-spot-a": "rgba(56, 189, 248, 0.2)",
      "--workflow-spot-b": "rgba(249, 115, 22, 0.22)",
      "--workflow-spot-c": "rgba(148, 163, 184, 0.14)",
      "--workflow-overlay-grid": "rgba(148, 163, 184, 0.22)",
      "--workflow-dots": "rgba(148, 163, 184, 0.32)",
      "--workflow-chrome": "#0c0f16",
      "--workflow-chrome-muted": "#131723",
      "--workflow-chrome-ink": "#f8fafc",
      "--workflow-chrome-border": "#232838",
      "--workflow-sidebar": "#0f1320",
      "--workflow-sidebar-ink": "#e2e8f0",
      "--workflow-sidebar-muted": "#9aa3b2",
      "--workflow-sidebar-border": "#262b3a",
      "--workflow-statusbar": "#0e111b",
    } as CSSProperties,
  },
  {
    id: "atlas",
    label: "Atlas",
    preview: "linear-gradient(135deg, #e7edf4, #f5f8fc 55%, #dbe6f1)",
    tokens: {
      "--workflow-bg": "#e7edf4",
      "--workflow-canvas": "#f9fbff",
      "--workflow-panel": "#f5f8fc",
      "--workflow-panel-strong": "#dbe6f1",
      "--workflow-ink": "#0f172a",
      "--workflow-muted": "#64748b",
      "--workflow-border": "#cbd5e1",
      "--workflow-accent": "#2563eb",
      "--workflow-accent-strong": "#1d4ed8",
      "--workflow-accent-soft": "rgba(37, 99, 235, 0.2)",
      "--workflow-warm": "#e11d48",
      "--workflow-warm-strong": "#be123c",
      "--workflow-shadow": "rgba(15, 23, 42, 0.16)",
      "--workflow-grid": "rgba(37, 99, 235, 0.18)",
      "--workflow-spot-a": "rgba(37, 99, 235, 0.16)",
      "--workflow-spot-b": "rgba(225, 29, 72, 0.16)",
      "--workflow-spot-c": "rgba(37, 99, 235, 0.08)",
      "--workflow-overlay-grid": "rgba(37, 99, 235, 0.18)",
      "--workflow-dots": "rgba(37, 99, 235, 0.26)",
      "--workflow-chrome": "#1f2937",
      "--workflow-chrome-muted": "#273241",
      "--workflow-chrome-ink": "#f8fafc",
      "--workflow-chrome-border": "#374151",
      "--workflow-sidebar": "#1b2431",
      "--workflow-sidebar-ink": "#e2e8f0",
      "--workflow-sidebar-muted": "#a3b1c2",
      "--workflow-sidebar-border": "#334155",
      "--workflow-statusbar": "#1a2330",
    } as CSSProperties,
  },
  {
    id: "emerald",
    label: "Emerald",
    preview: "linear-gradient(135deg, #d1fae5, #ecfdf5 55%, #a7f3d0)",
    tokens: {
      "--workflow-bg": "#d1fae5",
      "--workflow-canvas": "#f0fdf4",
      "--workflow-panel": "#ecfdf5",
      "--workflow-panel-strong": "#d1fae5",
      "--workflow-ink": "#064e3b",
      "--workflow-muted": "#047857",
      "--workflow-border": "#a7f3d0",
      "--workflow-accent": "#059669",
      "--workflow-accent-strong": "#047857",
      "--workflow-accent-soft": "rgba(5, 150, 105, 0.2)",
      "--workflow-warm": "#ea580c",
      "--workflow-warm-strong": "#c2410c",
      "--workflow-shadow": "rgba(6, 78, 59, 0.12)",
      "--workflow-grid": "rgba(5, 150, 105, 0.16)",
      "--workflow-spot-a": "rgba(5, 150, 105, 0.16)",
      "--workflow-spot-b": "rgba(234, 88, 12, 0.18)",
      "--workflow-spot-c": "rgba(5, 150, 105, 0.1)",
      "--workflow-overlay-grid": "rgba(5, 150, 105, 0.18)",
      "--workflow-dots": "rgba(5, 150, 105, 0.24)",
      "--workflow-chrome": "#022c22",
      "--workflow-chrome-muted": "#064e3b",
      "--workflow-chrome-ink": "#f0fdf4",
      "--workflow-chrome-border": "#065f46",
      "--workflow-sidebar": "#014737",
      "--workflow-sidebar-ink": "#d1fae5",
      "--workflow-sidebar-muted": "#6ee7b7",
      "--workflow-sidebar-border": "#047857",
      "--workflow-statusbar": "#022c22",
    } as CSSProperties,
  },
  {
    id: "violet",
    label: "Violet",
    preview: "linear-gradient(135deg, #ede9fe, #f5f3ff 55%, #ddd6fe)",
    tokens: {
      "--workflow-bg": "#ede9fe",
      "--workflow-canvas": "#faf5ff",
      "--workflow-panel": "#f5f3ff",
      "--workflow-panel-strong": "#ede9fe",
      "--workflow-ink": "#4c1d95",
      "--workflow-muted": "#6d28d9",
      "--workflow-border": "#ddd6fe",
      "--workflow-accent": "#7c3aed",
      "--workflow-accent-strong": "#6d28d9",
      "--workflow-accent-soft": "rgba(124, 58, 237, 0.2)",
      "--workflow-warm": "#dc2626",
      "--workflow-warm-strong": "#b91c1c",
      "--workflow-shadow": "rgba(76, 29, 149, 0.14)",
      "--workflow-grid": "rgba(124, 58, 237, 0.16)",
      "--workflow-spot-a": "rgba(124, 58, 237, 0.16)",
      "--workflow-spot-b": "rgba(220, 38, 38, 0.16)",
      "--workflow-spot-c": "rgba(124, 58, 237, 0.1)",
      "--workflow-overlay-grid": "rgba(124, 58, 237, 0.18)",
      "--workflow-dots": "rgba(124, 58, 237, 0.24)",
      "--workflow-chrome": "#2e1065",
      "--workflow-chrome-muted": "#4c1d95",
      "--workflow-chrome-ink": "#faf5ff",
      "--workflow-chrome-border": "#5b21b6",
      "--workflow-sidebar": "#3b0764",
      "--workflow-sidebar-ink": "#ede9fe",
      "--workflow-sidebar-muted": "#c4b5fd",
      "--workflow-sidebar-border": "#6d28d9",
      "--workflow-statusbar": "#2e1065",
    } as CSSProperties,
  },
  {
    id: "sunset",
    label: "Sunset",
    preview: "linear-gradient(135deg, #fed7aa, #ffedd5 55%, #fdba74)",
    tokens: {
      "--workflow-bg": "#fed7aa",
      "--workflow-canvas": "#fff7ed",
      "--workflow-panel": "#ffedd5",
      "--workflow-panel-strong": "#fed7aa",
      "--workflow-ink": "#7c2d12",
      "--workflow-muted": "#9a3412",
      "--workflow-border": "#fdba74",
      "--workflow-accent": "#ea580c",
      "--workflow-accent-strong": "#c2410c",
      "--workflow-accent-soft": "rgba(234, 88, 12, 0.2)",
      "--workflow-warm": "#dc2626",
      "--workflow-warm-strong": "#b91c1c",
      "--workflow-shadow": "rgba(124, 45, 18, 0.14)",
      "--workflow-grid": "rgba(234, 88, 12, 0.16)",
      "--workflow-spot-a": "rgba(234, 88, 12, 0.18)",
      "--workflow-spot-b": "rgba(220, 38, 38, 0.18)",
      "--workflow-spot-c": "rgba(251, 146, 60, 0.14)",
      "--workflow-overlay-grid": "rgba(234, 88, 12, 0.18)",
      "--workflow-dots": "rgba(234, 88, 12, 0.26)",
      "--workflow-chrome": "#431407",
      "--workflow-chrome-muted": "#7c2d12",
      "--workflow-chrome-ink": "#fff7ed",
      "--workflow-chrome-border": "#9a3412",
      "--workflow-sidebar": "#431407",
      "--workflow-sidebar-ink": "#fed7aa",
      "--workflow-sidebar-muted": "#fdba74",
      "--workflow-sidebar-border": "#c2410c",
      "--workflow-statusbar": "#431407",
    } as CSSProperties,
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: "linear-gradient(135deg, #cffafe, #ecfeff 55%, #a5f3fc)",
    tokens: {
      "--workflow-bg": "#cffafe",
      "--workflow-canvas": "#f0fdfa",
      "--workflow-panel": "#ecfeff",
      "--workflow-panel-strong": "#cffafe",
      "--workflow-ink": "#134e4a",
      "--workflow-muted": "#0f766e",
      "--workflow-border": "#a5f3fc",
      "--workflow-accent": "#0891b2",
      "--workflow-accent-strong": "#0e7490",
      "--workflow-accent-soft": "rgba(8, 145, 178, 0.2)",
      "--workflow-warm": "#f59e0b",
      "--workflow-warm-strong": "#d97706",
      "--workflow-shadow": "rgba(19, 78, 74, 0.12)",
      "--workflow-grid": "rgba(8, 145, 178, 0.16)",
      "--workflow-spot-a": "rgba(8, 145, 178, 0.18)",
      "--workflow-spot-b": "rgba(245, 158, 11, 0.16)",
      "--workflow-spot-c": "rgba(6, 182, 212, 0.14)",
      "--workflow-overlay-grid": "rgba(8, 145, 178, 0.18)",
      "--workflow-dots": "rgba(8, 145, 178, 0.26)",
      "--workflow-chrome": "#042f2e",
      "--workflow-chrome-muted": "#134e4a",
      "--workflow-chrome-ink": "#f0fdfa",
      "--workflow-chrome-border": "#115e59",
      "--workflow-sidebar": "#042f2e",
      "--workflow-sidebar-ink": "#cffafe",
      "--workflow-sidebar-muted": "#5eead4",
      "--workflow-sidebar-border": "#0f766e",
      "--workflow-statusbar": "#042f2e",
    } as CSSProperties,
  },
  {
    id: "rose",
    label: "Rose",
    preview: "linear-gradient(135deg, #fecdd3, #ffe4e6 55%, #fda4af)",
    tokens: {
      "--workflow-bg": "#fecdd3",
      "--workflow-canvas": "#fff1f2",
      "--workflow-panel": "#ffe4e6",
      "--workflow-panel-strong": "#fecdd3",
      "--workflow-ink": "#881337",
      "--workflow-muted": "#9f1239",
      "--workflow-border": "#fda4af",
      "--workflow-accent": "#e11d48",
      "--workflow-accent-strong": "#be123c",
      "--workflow-accent-soft": "rgba(225, 29, 72, 0.2)",
      "--workflow-warm": "#ea580c",
      "--workflow-warm-strong": "#c2410c",
      "--workflow-shadow": "rgba(136, 19, 55, 0.14)",
      "--workflow-grid": "rgba(225, 29, 72, 0.16)",
      "--workflow-spot-a": "rgba(225, 29, 72, 0.18)",
      "--workflow-spot-b": "rgba(234, 88, 12, 0.16)",
      "--workflow-spot-c": "rgba(251, 113, 133, 0.14)",
      "--workflow-overlay-grid": "rgba(225, 29, 72, 0.18)",
      "--workflow-dots": "rgba(225, 29, 72, 0.26)",
      "--workflow-chrome": "#4c0519",
      "--workflow-chrome-muted": "#881337",
      "--workflow-chrome-ink": "#fff1f2",
      "--workflow-chrome-border": "#9f1239",
      "--workflow-sidebar": "#4c0519",
      "--workflow-sidebar-ink": "#fecdd3",
      "--workflow-sidebar-muted": "#fda4af",
      "--workflow-sidebar-border": "#be123c",
      "--workflow-statusbar": "#4c0519",
    } as CSSProperties,
  },
  {
    id: "forest",
    label: "Forest",
    preview: "linear-gradient(135deg, #bbf7d0, #dcfce7 55%, #86efac)",
    tokens: {
      "--workflow-bg": "#bbf7d0",
      "--workflow-canvas": "#f0fdf4",
      "--workflow-panel": "#dcfce7",
      "--workflow-panel-strong": "#bbf7d0",
      "--workflow-ink": "#14532d",
      "--workflow-muted": "#15803d",
      "--workflow-border": "#86efac",
      "--workflow-accent": "#16a34a",
      "--workflow-accent-strong": "#15803d",
      "--workflow-accent-soft": "rgba(22, 163, 74, 0.2)",
      "--workflow-warm": "#ca8a04",
      "--workflow-warm-strong": "#a16207",
      "--workflow-shadow": "rgba(20, 83, 45, 0.12)",
      "--workflow-grid": "rgba(22, 163, 74, 0.16)",
      "--workflow-spot-a": "rgba(22, 163, 74, 0.18)",
      "--workflow-spot-b": "rgba(202, 138, 4, 0.16)",
      "--workflow-spot-c": "rgba(74, 222, 128, 0.14)",
      "--workflow-overlay-grid": "rgba(22, 163, 74, 0.18)",
      "--workflow-dots": "rgba(22, 163, 74, 0.26)",
      "--workflow-chrome": "#052e16",
      "--workflow-chrome-muted": "#14532d",
      "--workflow-chrome-ink": "#f0fdf4",
      "--workflow-chrome-border": "#166534",
      "--workflow-sidebar": "#052e16",
      "--workflow-sidebar-ink": "#bbf7d0",
      "--workflow-sidebar-muted": "#4ade80",
      "--workflow-sidebar-border": "#15803d",
      "--workflow-statusbar": "#052e16",
    } as CSSProperties,
  },
  {
    id: "midnight",
    label: "Midnight",
    preview: "linear-gradient(135deg, #1e1b4b, #312e81 55%, #4338ca)",
    tokens: {
      "--workflow-bg": "#1e1b4b",
      "--workflow-canvas": "#312e81",
      "--workflow-panel": "#3730a3",
      "--workflow-panel-strong": "#4338ca",
      "--workflow-ink": "#e0e7ff",
      "--workflow-muted": "#a5b4fc",
      "--workflow-border": "#4338ca",
      "--workflow-accent": "#6366f1",
      "--workflow-accent-strong": "#4f46e5",
      "--workflow-accent-soft": "rgba(99, 102, 241, 0.25)",
      "--workflow-warm": "#f59e0b",
      "--workflow-warm-strong": "#d97706",
      "--workflow-shadow": "rgba(30, 27, 75, 0.5)",
      "--workflow-grid": "rgba(99, 102, 241, 0.22)",
      "--workflow-spot-a": "rgba(99, 102, 241, 0.22)",
      "--workflow-spot-b": "rgba(245, 158, 11, 0.18)",
      "--workflow-spot-c": "rgba(129, 140, 248, 0.16)",
      "--workflow-overlay-grid": "rgba(99, 102, 241, 0.2)",
      "--workflow-dots": "rgba(99, 102, 241, 0.3)",
      "--workflow-chrome": "#1e1b4b",
      "--workflow-chrome-muted": "#312e81",
      "--workflow-chrome-ink": "#e0e7ff",
      "--workflow-chrome-border": "#4338ca",
      "--workflow-sidebar": "#1e1b4b",
      "--workflow-sidebar-ink": "#c7d2fe",
      "--workflow-sidebar-muted": "#818cf8",
      "--workflow-sidebar-border": "#4338ca",
      "--workflow-statusbar": "#1e1b4b",
    } as CSSProperties,
  },
  {
    id: "amber",
    label: "Amber",
    preview: "linear-gradient(135deg, #fef3c7, #fef9c3 55%, #fde68a)",
    tokens: {
      "--workflow-bg": "#fef3c7",
      "--workflow-canvas": "#fffbeb",
      "--workflow-panel": "#fef9c3",
      "--workflow-panel-strong": "#fef3c7",
      "--workflow-ink": "#78350f",
      "--workflow-muted": "#92400e",
      "--workflow-border": "#fde68a",
      "--workflow-accent": "#d97706",
      "--workflow-accent-strong": "#b45309",
      "--workflow-accent-soft": "rgba(217, 119, 6, 0.2)",
      "--workflow-warm": "#dc2626",
      "--workflow-warm-strong": "#b91c1c",
      "--workflow-shadow": "rgba(120, 53, 15, 0.12)",
      "--workflow-grid": "rgba(217, 119, 6, 0.16)",
      "--workflow-spot-a": "rgba(217, 119, 6, 0.18)",
      "--workflow-spot-b": "rgba(220, 38, 38, 0.16)",
      "--workflow-spot-c": "rgba(252, 211, 77, 0.14)",
      "--workflow-overlay-grid": "rgba(217, 119, 6, 0.18)",
      "--workflow-dots": "rgba(217, 119, 6, 0.24)",
      "--workflow-chrome": "#451a03",
      "--workflow-chrome-muted": "#78350f",
      "--workflow-chrome-ink": "#fffbeb",
      "--workflow-chrome-border": "#92400e",
      "--workflow-sidebar": "#451a03",
      "--workflow-sidebar-ink": "#fef3c7",
      "--workflow-sidebar-muted": "#fde68a",
      "--workflow-sidebar-border": "#b45309",
      "--workflow-statusbar": "#451a03",
    } as CSSProperties,
  },
];

const workflowBackgrounds: WorkflowBackgroundPreset[] = [
  {
    id: "dynamo-grid",
    label: "Classic Grid",
    preview:
      "linear-gradient(0deg, var(--workflow-overlay-grid) 1px, transparent 1px) 0 0 / 10px 10px",
    canvasVariant: BackgroundVariant.Lines,
    canvasGap: 48,
    canvasSize: 1,
    layers: [],
  },
  {
    id: "glow-grid",
    label: "Glow Grid",
    preview: "linear-gradient(135deg, var(--workflow-spot-a), var(--workflow-spot-b))",
    canvasVariant: BackgroundVariant.Lines,
    canvasGap: 42,
    canvasSize: 1,
    layers: [
      {
        className: "absolute inset-0 opacity-80",
        style: {
          backgroundImage:
            "radial-gradient(circle at 12% 18%, var(--workflow-spot-a), transparent 40%), radial-gradient(circle at 88% 16%, var(--workflow-spot-b), transparent 42%), radial-gradient(circle at 18% 82%, var(--workflow-spot-c), transparent 45%)",
        },
      },
    ],
  },
  {
    id: "signal-mesh",
    label: "Signal Mesh",
    preview:
      "linear-gradient(135deg, var(--workflow-spot-a), transparent 60%), linear-gradient(45deg, var(--workflow-overlay-grid) 1px, transparent 1px) 0 0 / 10px 10px, linear-gradient(-45deg, var(--workflow-overlay-grid) 1px, transparent 1px) 0 0 / 10px 10px",
    canvasVariant: BackgroundVariant.Cross,
    canvasGap: 52,
    canvasSize: 6,
    layers: [
      {
        className: "absolute inset-0 opacity-80",
        style: {
          backgroundImage:
            "radial-gradient(circle at 16% 18%, var(--workflow-spot-a), transparent 45%), radial-gradient(circle at 82% 22%, var(--workflow-spot-b), transparent 55%)",
        },
      },
    ],
  },
];

function WorkflowPageContent() {
  const [activeTheme, setActiveTheme] = useState(workflowThemes[0]?.id ?? 'dynamo');
  const [activeBackground, setActiveBackground] = useState(workflowBackgrounds[0]?.id ?? 'dynamo-grid');
  const { showSidebar, setShowSidebar, showInspector, setShowInspector } = useWorkflow();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHeight = document.body.style.height;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.height = previousHeight;
    };
  }, []);

  const theme =
    workflowThemes.find((item) => item.id === activeTheme) ?? workflowThemes[0]!;
  const background =
    workflowBackgrounds.find((item) => item.id === activeBackground) ??
    workflowBackgrounds[0]!;

  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} workflow-shell relative flex h-full min-h-0 w-full flex-col overflow-hidden font-sans transition-colors duration-500`}
      style={{ ...baseTokens, ...theme.tokens }}
    >
      <div className="pointer-events-none absolute inset-0">
        {background.layers.map((layer, index) => (
          <div
            key={`${background.id}-${index}`}
            className={layer.className}
            style={layer.style}
          />
        ))}
      </div>

      <WorkflowToolbar
        themes={workflowThemes}
        backgrounds={workflowBackgrounds}
        activeTheme={activeTheme}
        activeBackground={activeBackground}
        onThemeChange={setActiveTheme}
        onBackgroundChange={setActiveBackground}
      />

      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden p-3">
        <div
          className={cn(
            "relative h-full min-h-0 shrink-0 transition-[width,opacity,transform] duration-300 ease-out",
            showSidebar
              ? "mr-3 w-[280px] opacity-100 translate-x-0 overflow-visible"
              : "mr-0 w-0 opacity-0 -translate-x-2 overflow-hidden pointer-events-none"
          )}
          aria-hidden={!showSidebar}
        >
          <WorkflowSidebar />
        </div>

        <div className="relative flex-1 min-w-0 min-h-0">
          <WorkflowCanvas
            backgroundVariant={background.canvasVariant}
            backgroundGap={background.canvasGap}
            backgroundSize={background.canvasSize}
          />
          {!showSidebar && (
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border workflow-chrome-border workflow-chrome px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] workflow-chrome-ink transition workflow-chrome-muted-hover"
              aria-label="Show left panel"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          {!showInspector && (
            <button
              type="button"
              onClick={() => setShowInspector(true)}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border workflow-chrome-border workflow-chrome px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] workflow-chrome-ink transition workflow-chrome-muted-hover"
              aria-label="Show right panel"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className={cn(
            "relative h-full min-h-0 shrink-0 transition-[width,opacity,transform] duration-300 ease-out",
            showInspector
              ? "ml-3 w-80 opacity-100 translate-x-0 overflow-visible"
              : "ml-0 w-0 opacity-0 translate-x-2 overflow-hidden pointer-events-none"
          )}
          aria-hidden={!showInspector}
        >
          <NodeSettingsPanel />
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <WorkflowProvider>
      <WorkflowPageContent />
    </WorkflowProvider>
  );
}
