"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LeftPanel from "./left-panel";
import MiddlePanel from "./middle-panel";
import RightPanel from "./right-panel";
import { BoxProvider } from "../../../app/contexts/box-context";

type Props = {
  projectId?: string;
};

const View3dPanelsLayout = ({ projectId }: Props) => {
  return (
    <BoxProvider projectId={projectId}>
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
    </BoxProvider>
  );
}

export default View3dPanelsLayout;
