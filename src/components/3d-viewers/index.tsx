"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LeftPanel from "./left-panel";
import MiddlePanel from "./middle-panel";
import RightPanel from "./right-panel";


const View3dPanelsLayout = () => {
  return (
    // Make the container flexible so it can fill its parent's height.
    // Use min-h-0 so flex children can shrink properly when nested inside
    // a flex column with overflow handling.
    <div className="w-full h-full min-h-0 border bg-background/50 overflow-hidden shadow-sm">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={20} minSize={10}>
          <div className="h-full border-r border-zinc-200 dark:border-zinc-700">
            <LeftPanel />
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 h-full cursor-col-resize bg-transparent hover:bg-accent/20" />

        <Panel defaultSize={60} minSize={30}>
          <div className="h-full">
            <MiddlePanel />
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 h-full cursor-col-resize bg-transparent hover:bg-accent/20" />

        <Panel defaultSize={20} minSize={10}>
          <div className="h-full border-l border-zinc-200 dark:border-zinc-700 p-3">
            <RightPanel />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default View3dPanelsLayout;
