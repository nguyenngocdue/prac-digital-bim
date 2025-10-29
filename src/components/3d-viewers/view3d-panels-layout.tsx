"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LeftPanel from "../left-panel";
import MiddlePanel from "../middle-panel";
import RightPanel from "../right-panel";


const View3dPanelsLayout = () => {
  return (
    <div className="h-[600px] w-full rounded-lg border bg-card overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={10}>
          <div className="h-full border-r border"><LeftPanel /></div>
        </Panel>
        <PanelResizeHandle className="w-2 h-full cursor-col-resize bg-transparent hover:bg-accent/10" />

        <Panel defaultSize={60} minSize={30}>
          <div className="h-full"><MiddlePanel /></div>
        </Panel>
        <PanelResizeHandle className="w-2 h-full cursor-col-resize bg-transparent hover:bg-accent/10" />

        <Panel defaultSize={20} minSize={10}>
          <div className="h-full border-l border"><RightPanel /></div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default View3dPanelsLayout;
