"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FC } from "react";
import { Rnd } from "react-rnd";
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
  const [showHeader, _setShowHeader] = useState(true);
  const [showCameraPanel, setShowCameraPanel] = useState(false);
  const [showIotOverlay, setShowIotOverlay] = useState(false);
  const [showGltfControls, setShowGltfControls] = useState(false);
  const [showGoogleTiles, setShowGoogleTiles] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const panelBoundsRef = useRef<HTMLDivElement | null>(null);
  const [rightDefaultX, setRightDefaultX] = useState<number | null>(null);

  const panelWidth = 280;

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

  useLayoutEffect(() => {
    if (!panelBoundsRef.current || rightDefaultX !== null) return;
    const boundsWidth = panelBoundsRef.current.clientWidth;
    setRightDefaultX(Math.max(boundsWidth - panelWidth, 0));
  }, [panelWidth, rightDefaultX]);

  const panelPaddingTop = showHeader
    ? isCompact
      ? "pt-16"
      : "pt-3"
    : "pt-2";

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
                <span className="rounded-full border viewer-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Autosave
                </span>
                <span className="viewer-muted hidden rounded-full border viewer-border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] sm:inline-flex">
                  {projectId ? `ID ${projectId.slice(0, 8)}` : "No Project"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHeader(false)}
                  className="flex items-center gap-1 rounded-full border viewer-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition hover:bg-white/60 dark:hover:bg-white/10"
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

        <div className={`relative flex-1 min-h-0 px-2 pb-2 ${panelPaddingTop}`}>
          <div className="absolute inset-0">
            <div className="viewer-panel viewer-panel-clear h-full w-full">
              <MiddlePanel
                showCameraPanel={showCameraPanel}
                showIotOverlay={showIotOverlay}
                showGltfControls={showGltfControls}
                showGoogleTiles={showGoogleTiles}
                onToggleGoogleTiles={() => setShowGoogleTiles((prev) => !prev)}
                onToggleCameraPanel={() => setShowCameraPanel((prev) => !prev)}
                onToggleIotOverlay={() => setShowIotOverlay((prev) => !prev)}
                onToggleGltfControls={() => setShowGltfControls((prev) => !prev)}
                onToggleLeftPanel={() => setShowLeftPanel((prev) => !prev)}
                onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
                showLeftPanel={showLeftPanel}
                showRightPanel={showRightPanel}
              />
            </div>
          </div>

          <div ref={panelBoundsRef} className="pointer-events-none absolute inset-0">
            {showLeftPanel && (
              <Rnd
                default={{ x: 0, y: 0, width: panelWidth, height: "100%" }}
                bounds="parent"
                enableResizing={false}
                dragHandleClassName="panel-drag-handle"
                className="pointer-events-auto"
              >
                <div className="viewer-panel viewer-panel-glass viewer-panel-enter flex h-full min-h-0 flex-col overflow-hidden rounded-2xl transition">
                  <div className="panel-drag-handle flex items-center justify-between border-b viewer-border bg-[var(--viewer-panel-strong)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] viewer-muted cursor-move" />
                  <div className="flex-1 min-h-0">
                    <LeftPanel projectId={projectId} />
                  </div>
                </div>
              </Rnd>
            )}

            {showRightPanel && rightDefaultX !== null && (
              <Rnd
                default={{ x: rightDefaultX, y: 0, width: panelWidth, height: "100%" }}
                bounds="parent"
                enableResizing={false}
                dragHandleClassName="panel-drag-handle"
                className="pointer-events-auto"
              >
                <div className="viewer-panel viewer-panel-glass viewer-panel-enter viewer-panel-delay-2 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl transition">
                  <div className="panel-drag-handle flex items-center justify-between border-b viewer-border bg-[var(--viewer-panel-strong)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] viewer-muted cursor-move" />
                  <div className="flex-1 min-h-0">
                    <RightPanel projectId={projectId} />
                  </div>
                </div>
              </Rnd>
            )}
          </div>
        </div>
      </div>
    </BoxProvider>
  );
};

export default PanelsLayout;
