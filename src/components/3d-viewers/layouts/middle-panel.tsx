"use client";
import Viewer from "../viewer";

type MiddlePanelProps = {
  showCameraPanel: boolean;
  showIotOverlay: boolean;
  showGltfControls: boolean;
};

const MiddlePanel = ({ showCameraPanel, showIotOverlay, showGltfControls }: MiddlePanelProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.3em]">
            Viewport
          </div>
          <h3 className="text-sm font-semibold">3D workspace</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="viewer-chip rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
            Realtime
          </span>
          <span className="rounded-full border viewer-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
            Orbit controls
          </span>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-2xl border viewer-border bg-slate-950/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(16,185,129,0.12),transparent_45%)]" />
        <Viewer
          showCameraPanel={showCameraPanel}
          showIotOverlay={showIotOverlay}
          showGltfControls={showGltfControls}
        />
      </div>
    </div>
  );
}

export default MiddlePanel;
