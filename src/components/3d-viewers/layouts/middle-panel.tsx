"use client";
import Viewer from "../viewer";

type MiddlePanelProps = {
  showCameraPanel: boolean;
  showIotOverlay: boolean;
  showGltfControls: boolean;
  showGoogleTiles: boolean;
  onToggleGoogleTiles: () => void;
  onToggleCameraPanel: () => void;
  onToggleIotOverlay: () => void;
  onToggleGltfControls: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  showLeftPanel: boolean;
  showRightPanel: boolean;
};

const MiddlePanel = ({
  showCameraPanel,
  showIotOverlay,
  showGltfControls,
  showGoogleTiles,
  onToggleGoogleTiles,
  onToggleCameraPanel,
  onToggleIotOverlay,
  onToggleGltfControls,
  onToggleLeftPanel,
  onToggleRightPanel,
  showLeftPanel,
  showRightPanel,
}: MiddlePanelProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 text-foreground">
        <Viewer
          showCameraPanel={showCameraPanel}
          showIotOverlay={showIotOverlay}
          showGltfControls={showGltfControls}
          showGoogleTiles={showGoogleTiles}
          onToggleGoogleTiles={onToggleGoogleTiles}
          onToggleCameraPanel={onToggleCameraPanel}
          onToggleIotOverlay={onToggleIotOverlay}
          onToggleGltfControls={onToggleGltfControls}
          onToggleLeftPanel={onToggleLeftPanel}
          onToggleRightPanel={onToggleRightPanel}
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
        />
    </div>
  );
}

export default MiddlePanel;
