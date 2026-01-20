"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEffect, useState, type FC } from "react";
import { ChevronDown, ChevronUp, Grid2X2 } from "lucide-react";
import LeftPanel from "./left-panel";
import MiddlePanel from "./middle-panel";
import RightPanel from "./right-panel";
import { BoxProvider } from "@/app/contexts/box-context";

type PanelsLayoutProps = {
  projectId?: string;
};

/**
 * Panels Layout - Main 3-column resizable layout for 3D viewer
 */
const PanelsLayout: FC<PanelsLayoutProps> = ({ projectId }) => {
  const [isCompact, setIsCompact] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showCameraPanel, setShowCameraPanel] = useState(true);
  const [showIotOverlay, setShowIotOverlay] = useState(true);
  const [showGltfControls, setShowGltfControls] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsCompact(mediaQuery.matches);
    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const direction = isCompact ? "vertical" : "horizontal";
  const sizes = isCompact
    ? { left: 28, middle: 52, right: 20 }
    : { left: 22, middle: 56, right: 22 };
  const panelPaddingTop = showHeader
    ? isCompact
      ? "pt-24"
      : "pt-6"
    : "pt-4";
  const handleClassName = [
    "group relative flex items-center justify-center bg-transparent transition-colors",
    "after:content-[''] after:rounded-full after:bg-[var(--viewer-border)] after:transition-colors",
    "hover:after:bg-[var(--viewer-accent)]",
    isCompact
      ? "h-3 w-full cursor-row-resize after:h-[2px] after:w-16"
      : "h-full w-3 cursor-col-resize after:h-16 after:w-[2px]",
  ].join(" ");

  return (
    <BoxProvider projectId={projectId}>
      <div className="viewer-shell flex h-full w-full flex-col overflow-hidden">
        {/* <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-[min(90vw,720px)] -translate-x-1/2">
          {showHeader ? (
            <div className="pointer-events-auto viewer-panel viewer-panel-strong viewer-panel-enter flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                  <Grid2X2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.3em]">
                    Project Viewer
                  </div>
                  <div className="text-base font-semibold">Spatial Operations</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="viewer-chip rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Live
                </span>
                <span className="rounded-full border border-[var(--viewer-border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Autosave
                </span>
                <span className="viewer-muted hidden rounded-full border border-[var(--viewer-border)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] sm:inline-flex">
                  {projectId ? `ID ${projectId.slice(0, 8)}` : "No Project"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHeader(false)}
                  className="flex items-center gap-1 rounded-full border border-[var(--viewer-border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition hover:bg-white/60 dark:hover:bg-white/10"
                >
                  Hide
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowHeader(true)}
                className="pointer-events-auto viewer-panel viewer-panel-strong rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] shadow-lg"
              >
                Project Viewer
                <ChevronDown className="ml-2 inline-block h-3 w-3" />
              </button>
            </div>
          )}
        </div> */}

        <div className={`flex-1 min-h-0 px-4 pb-4 ${panelPaddingTop}`}>
          <PanelGroup direction={direction} className="h-full w-full min-h-0">
            {/* Left Panel - Tools and Controls */}
            <Panel defaultSize={sizes.left} minSize={isCompact ? 18 : 12}>
              <div className="viewer-panel viewer-panel-enter h-full min-h-0 overflow-hidden rounded-2xl">
                <LeftPanel
                  projectId={projectId}
                  showCameraPanel={showCameraPanel}
                  onToggleCameraPanel={() => setShowCameraPanel((prev) => !prev)}
                  showIotOverlay={showIotOverlay}
                  onToggleIotOverlay={() => setShowIotOverlay((prev) => !prev)}
                  showGltfControls={showGltfControls}
                  onToggleGltfControls={() => setShowGltfControls((prev) => !prev)}
                />
              </div>
            </Panel>

            <PanelResizeHandle className={handleClassName} />

            {/* Middle Panel - 3D Viewport */}
            <Panel defaultSize={sizes.middle} minSize={isCompact ? 35 : 30}>
              <div className="viewer-panel viewer-panel-enter viewer-panel-delay-1 h-full min-h-0 overflow-hidden rounded-2xl">
                <MiddlePanel
                  showCameraPanel={showCameraPanel}
                  showIotOverlay={showIotOverlay}
                  showGltfControls={showGltfControls}
                />
              </div>
            </Panel>

            <PanelResizeHandle className={handleClassName} />

            {/* Right Panel - Properties */}
            <Panel defaultSize={sizes.right} minSize={isCompact ? 16 : 12}>
              <div className="viewer-panel viewer-panel-enter viewer-panel-delay-2 h-full min-h-0 overflow-hidden rounded-2xl">
                <RightPanel projectId={projectId} />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </BoxProvider>
  );
};

export default PanelsLayout;
