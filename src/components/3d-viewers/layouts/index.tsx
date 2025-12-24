"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { FC } from "react";
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
  return (
    <BoxProvider projectId={projectId}>
      <div className="min-h-0 h-full w-full overflow-hidden border bg-background/50 shadow-sm">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Tools and Controls */}
          <Panel defaultSize={20} minSize={10}>
            <div className="h-full border-r border-zinc-200 dark:border-zinc-700">
              <LeftPanel />
            </div>
          </Panel>

          <PanelResizeHandle className="h-full w-2 cursor-col-resize bg-transparent hover:bg-accent/20" />

          {/* Middle Panel - 3D Viewport */}
          <Panel defaultSize={60} minSize={30}>
            <div className="h-full">
              <MiddlePanel />
            </div>
          </Panel>

          <PanelResizeHandle className="h-full w-2 cursor-col-resize bg-transparent hover:bg-accent/20" />

          {/* Right Panel - Properties */}
          <Panel defaultSize={20} minSize={10}>
            <div className="h-full border-l border-zinc-200 p-3 dark:border-zinc-700">
              <RightPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </BoxProvider>
  );
};

export default PanelsLayout;
