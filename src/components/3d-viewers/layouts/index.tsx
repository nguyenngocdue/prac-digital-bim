"use client";

import { useEffect, useState, type FC } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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

  const panelPaddingTop = showHeader
    ? isCompact
      ? "pt-16"
      : "pt-3"
    : "pt-2";
  const hasBothSides = showLeftPanel && showRightPanel;
  const hasAnySide = showLeftPanel || showRightPanel;
  const sideDefaultSize = hasBothSides ? 20 : 25;
  const middleDefaultSize = hasBothSides ? 60 : hasAnySide ? 75 : 100;

  return (
    <BoxProvider projectId={projectId}>
      <div className="viewer-shell flex h-full w-full flex-col overflow-hidden">
        <div className={`relative flex-1 min-h-0 px-2 pb-2 ${panelPaddingTop}`}>
          <PanelGroup
            direction="horizontal"
            className="flex h-full min-h-0 w-full gap-2"
          >
            {showLeftPanel && (
              <Panel
                defaultSize={sideDefaultSize}
                minSize={15}
                maxSize={35}
                className="min-h-0"
              >
                <div className="viewer-panel viewer-panel-glass viewer-panel-enter flex h-full min-h-0 flex-col overflow-hidden rounded-sm transition">
                  <div className="panel-drag-handle flex items-center justify-between border-b viewer-border bg-[var(--viewer-panel-strong)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] viewer-muted cursor-col-resize" />
                  <div className="flex-1 min-h-0">
                    <LeftPanel projectId={projectId} />
                  </div>
                </div>
              </Panel>
            )}

            {showLeftPanel && (
              <PanelResizeHandle className="w-1 cursor-col-resize rounded-full bg-transparent transition hover:bg-cyan-300/30" />
            )}

            <Panel defaultSize={middleDefaultSize} minSize={40} className="min-h-0 w-full">
              <div className="viewer-panel viewer-panel-clear h-full min-h-0 overflow-hidden rounded-sm">
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
            </Panel>

            {showRightPanel && (
              <>
                <PanelResizeHandle className="w-1 cursor-col-resize rounded-full bg-transparent transition hover:bg-cyan-300/30" />
                <Panel
                  defaultSize={sideDefaultSize}
                  minSize={15}
                  maxSize={35}
                  className="min-h-0"
                >
                  <div className="viewer-panel viewer-panel-glass viewer-panel-enter viewer-panel-delay-2 flex h-full min-h-0 flex-col overflow-hidden rounded-sm transition">
                    <div className="panel-drag-handle flex items-center justify-between border-b viewer-border bg-[var(--viewer-panel-strong)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] viewer-muted cursor-col-resize" />
                    <div className="flex-1 min-h-0">
                      <RightPanel projectId={projectId} />
                    </div>
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
    </BoxProvider>
  );
};

export default PanelsLayout;
