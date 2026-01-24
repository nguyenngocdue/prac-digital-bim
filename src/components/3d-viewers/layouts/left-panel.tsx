"use client";

import { useRouter } from "next/navigation";
import type { FC } from "react";
import { Box, Building2, Grid2X2, Map, RefreshCw, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBoxContext } from "@/app/contexts/box-context";

type LeftPanelProps = {
  projectId?: string;
};

/**
 * Left Panel - Tools and scene controls
 */
const LeftPanel: FC<LeftPanelProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const {
    creationMode,
    setCreationMode,
    creationTool,
    setCreationTool,
    buildingOptions,
    setBuildingOptions,
    transformMode,
    setTransformMode,
    setDrawingPoints,
  } = useBoxContext();
  const projectLabel = projectId ? projectId.slice(0, 8) : "Unassigned";

  const layers = [
    { name: "Structure", detail: "Core + shell", count: "24", color: "bg-emerald-500" },
    { name: "MEP", detail: "HVAC + piping", count: "18", color: "bg-amber-500" },
    { name: "Sensors", detail: "IoT + cameras", count: "12", color: "bg-sky-500" },
  ];

  const openRandomProject = () => {
    let id = "";
    try {
      id =
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : Math.random().toString(36).slice(2, 10);
    } catch {
      id = Math.random().toString(36).slice(2, 10);
    }

    // Navigate to the project viewer with the new ID
    router.push(`/project/viewer?id=${id}`);
  };

  const toggleTool = (tool: "box" | "building") => {
    const isSame = creationMode && creationTool === tool;
    setCreationTool(tool);
    setCreationMode(!isSame);
  };

  const updateBuildingOption = <K extends keyof typeof buildingOptions>(key: K, value: (typeof buildingOptions)[K]) => {
    setBuildingOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.3em]">
              Workspace
            </div>
            <h2 className="mt-2 text-lg font-semibold">Scene Tools</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="viewer-chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Active
            </span>
            {creationMode && (
              <span className="rounded-full border border-amber-200 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                Placing
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border viewer-border viewer-panel-strong p-3">
          <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.26em]">
            Project ID
          </div>
          <div className="mt-1 font-mono text-sm">{projectLabel}</div>
          <div className="mt-3 flex items-center gap-2 text-xs viewer-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Autosave enabled</span>
          </div>
        </div>
      </div>

      <Separator className="viewer-border-bg" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-5 px-4 py-3">
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
                Quick actions
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Ready
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              <Button onClick={openRandomProject} variant="outline" size="sm" className="justify-start">
                <RefreshCw className="h-4 w-4" />
                Open random project
              </Button>
              <Button
                onClick={() => toggleTool("box")}
                variant={creationMode && creationTool === "box" ? "secondary" : "outline"}
                size="sm"
                className="justify-start"
              >
                <Box className="h-4 w-4" />
                {creationMode && creationTool === "box" ? "Click on canvas to place box" : "Create a box"}
              </Button>
              <Button
                onClick={() => toggleTool("building")}
                variant={creationMode && creationTool === "building" ? "secondary" : "outline"}
                size="sm"
                className="justify-start"
              >
                <Building2 className="h-4 w-4" />
                {creationMode && creationTool === "building"
                  ? "Click on canvas to place building"
                  : "Place a building"}
              </Button>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Building tool
            </h3>
            <div className="mt-3 grid gap-3 rounded-xl border viewer-border viewer-panel-strong p-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {[
                  { key: "rect", label: "Rectangle" },
                  { key: "l", label: "L Shape" },
                  { key: "u", label: "U Shape" },
                  { key: "c", label: "C Shape" },
                  { key: "h", label: "H Shape" },
                  { key: "v", label: "V Shape" },
                  { key: "m", label: "M Shape" },
                  { key: "custom", label: "Custom" },
                ].map((shape) => (
                  <button
                    key={shape.key}
                    type="button"
                    onClick={() => {
                      updateBuildingOption("shape", shape.key as typeof buildingOptions.shape);
                      if (shape.key === "custom") {
                        updateBuildingOption("drawingMode", true);
                      } else {
                        setDrawingPoints([]);
                        updateBuildingOption("drawingMode", false);
                      }
                      setCreationTool("building");
                      setCreationMode(true);
                    }}
                    className={`rounded-lg border px-2 py-1.5 text-left ${
                      buildingOptions.shape === shape.key
                        ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                        : "border-[var(--workflow-border)] bg-[var(--workflow-panel)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <label className="flex flex-col gap-1">
                  Width
                  <Input
                    value={buildingOptions.width}
                    onChange={(e) => updateBuildingOption("width", Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 text-xs"
                    type="number"
                    min={1}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Depth
                  <Input
                    value={buildingOptions.depth}
                    onChange={(e) => updateBuildingOption("depth", Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 text-xs"
                    type="number"
                    min={1}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Height
                  <Input
                    value={buildingOptions.height}
                    onChange={(e) => updateBuildingOption("height", Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 text-xs"
                    type="number"
                    min={1}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs">
                Thickness
                <Input
                  value={buildingOptions.thicknessRatio}
                  onChange={(e) =>
                    updateBuildingOption(
                      "thicknessRatio",
                      Math.min(0.9, Math.max(0.1, Number(e.target.value) || 0.3))
                    )
                  }
                  className="h-8 w-20 text-xs"
                  type="number"
                  step="0.05"
                  min={0.1}
                  max={0.9}
                />
              </label>

              <div className="grid gap-2 text-[11px]">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={buildingOptions.snapToGrid}
                    onChange={(e) => updateBuildingOption("snapToGrid", e.target.checked)}
                  />
                  Snap to grid
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={buildingOptions.snapToObjects}
                    onChange={(e) => updateBuildingOption("snapToObjects", e.target.checked)}
                  />
                  Snap to objects
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={buildingOptions.allowVertical}
                    onChange={(e) => updateBuildingOption("allowVertical", e.target.checked)}
                  />
                  Allow vertical planes
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex flex-col gap-1">
                  Grid size
                  <Input
                    value={buildingOptions.gridSize}
                    onChange={(e) => updateBuildingOption("gridSize", Math.max(0.1, Number(e.target.value) || 1))}
                    className="h-8 text-xs"
                    type="number"
                    step="0.1"
                    min={0.1}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Snap dist
                  <Input
                    value={buildingOptions.snapDistance}
                    onChange={(e) => updateBuildingOption("snapDistance", Math.max(0.1, Number(e.target.value) || 0.5))}
                    className="h-8 text-xs"
                    type="number"
                    step="0.1"
                    min={0.1}
                  />
                </label>
              </div>

              {buildingOptions.shape === "custom" && (
                <Button
                  variant={buildingOptions.drawingMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (buildingOptions.drawingMode) {
                      setDrawingPoints([]);
                    }
                    updateBuildingOption("drawingMode", !buildingOptions.drawingMode);
                  }}
                >
                  {buildingOptions.drawingMode ? "Drawing footprint (double click to finish)" : "Draw footprint"}
                </Button>
              )}

              <div className="flex flex-wrap gap-2 text-[11px]">
                {(["translate", "rotate", "scale"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransformMode(mode)}
                    className={`rounded-full border px-2 py-1 uppercase tracking-[0.18em] ${
                      transformMode === mode
                        ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                        : "border-[var(--workflow-border)] text-[var(--workflow-muted)]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
                Layers
              </h3>
              <span className="viewer-muted text-[10px] uppercase tracking-[0.2em]">Filter</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border viewer-border viewer-panel-strong px-2">
              <Search className="h-4 w-4 viewer-muted" />
              <Input
                placeholder="Structure, MEP, sensors"
                aria-label="Filter layers"
                className="h-8 border-0 bg-transparent px-0 text-xs focus-visible:ring-0"
              />
            </div>
            <div className="mt-3 space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.name}
                  className="flex items-center justify-between rounded-xl border viewer-border viewer-panel-strong px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${layer.color}`} />
                    <div>
                      <div className="text-sm font-semibold">{layer.name}</div>
                      <div className="text-[11px] viewer-muted">{layer.detail}</div>
                    </div>
                  </div>
                  <span className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {layer.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Tools
            </h3>
            <div className="mt-3 grid gap-2">
              <div className="rounded-xl border viewer-border viewer-panel-strong px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Grid2X2 className="h-4 w-4 viewer-muted" />
                  Grid + axes
                </div>
                <p className="mt-1 text-[11px] viewer-muted">Aligned to north. Scale in meters.</p>
              </div>
              <div className="rounded-xl border viewer-border viewer-panel-strong px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Map className="h-4 w-4 viewer-muted" />
                  Site context
                </div>
                <p className="mt-1 text-[11px] viewer-muted">Toggle Cesium to compare terrain.</p>
              </div>
              <div className="rounded-xl border viewer-border viewer-panel-strong px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Settings className="h-4 w-4 viewer-muted" />
                  System setup
                </div>
                <p className="mt-1 text-[11px] viewer-muted">Sensors and camera feeds.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Shortcuts
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] viewer-muted">
              <span className="rounded-full border viewer-border px-2 py-1">Esc exit</span>
              <span className="rounded-full border viewer-border px-2 py-1">Shift multiselect</span>
              <span className="rounded-full border viewer-border px-2 py-1">Click select</span>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LeftPanel;
