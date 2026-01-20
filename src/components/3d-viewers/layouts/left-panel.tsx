"use client";

import { useRouter } from "next/navigation";
import type { FC } from "react";
import { Activity, Box, Camera, Grid2X2, Map, RefreshCw, Search, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBoxContext } from "@/app/contexts/box-context";

type LeftPanelProps = {
  projectId?: string;
  showCameraPanel: boolean;
  onToggleCameraPanel: () => void;
  showIotOverlay: boolean;
  onToggleIotOverlay: () => void;
  showGltfControls: boolean;
  onToggleGltfControls: () => void;
};

/**
 * Left Panel - Tools and scene controls
 */
const LeftPanel: FC<LeftPanelProps> = ({
  projectId,
  showCameraPanel,
  onToggleCameraPanel,
  showIotOverlay,
  onToggleIotOverlay,
  showGltfControls,
  onToggleGltfControls,
}) => {
  const router = useRouter();
  const { creationMode, setCreationMode } = useBoxContext();
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pb-4 pt-5">
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
        <div className="space-y-6 px-5 py-4">
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
                onClick={() => setCreationMode(!creationMode)}
                variant={creationMode ? "secondary" : "outline"}
                size="sm"
                className="justify-start"
              >
                <Box className="h-4 w-4" />
                {creationMode ? "Click on canvas to place box" : "Create a box"}
              </Button>
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
              Overlays
            </h3>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={onToggleCameraPanel}
                className="flex w-full items-center justify-between rounded-xl border viewer-border viewer-panel-strong px-3 py-2 text-xs font-semibold transition hover:bg-white/40 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                  Cameras panel
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    showCameraPanel
                      ? "viewer-chip"
                      : "border viewer-border viewer-muted"
                  }`}
                >
                  {showCameraPanel ? "On" : "Off"}
                </span>
              </button>
              <button
                type="button"
                onClick={onToggleIotOverlay}
                className="flex w-full items-center justify-between rounded-xl border viewer-border viewer-panel-strong px-3 py-2 text-xs font-semibold transition hover:bg-white/40 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  IoT Sensors
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    showIotOverlay
                      ? "viewer-chip"
                      : "border viewer-border viewer-muted"
                  }`}
                >
                  {showIotOverlay ? "On" : "Off"}
                </span>
              </button>
              <button
                type="button"
                onClick={onToggleGltfControls}
                className="flex w-full items-center justify-between rounded-xl border viewer-border viewer-panel-strong px-3 py-2 text-xs font-semibold transition hover:bg-white/40 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                    <Upload className="h-3.5 w-3.5" />
                  </span>
                  Import GLTF
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    showGltfControls
                      ? "viewer-chip"
                      : "border viewer-border viewer-muted"
                  }`}
                >
                  {showGltfControls ? "On" : "Off"}
                </span>
              </button>
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
