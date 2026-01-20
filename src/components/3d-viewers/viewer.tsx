"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useBoxContext } from "../../app/contexts/box-context";
import Scene from "./scene";
import { CesiumViewer } from "./cesium/cesium-viewer";
import { CesiumControls } from "./cesium/cesium-controls";
import { GltfControls } from "./gltf/gltf-controls";
import { IotControls } from "./iot/iot-controls";
import { IotLegend } from "./iot/iot-legend";
import { CameraListPanel, CameraViewerPanel } from "./cameras";
import { mockCameras } from "@/data/mock-cameras";
import { CameraData } from "@/types/camera";

interface ViewerProps {
  useCesium?: boolean;
  showCameraPanel?: boolean;
  showIotOverlay?: boolean;
  showGltfControls?: boolean;
}

const Viewer = ({
  showCameraPanel = true,
  showIotOverlay = true,
  showGltfControls = true,
}: ViewerProps) => {
  const [accent, setAccent] = useState<string>("#06b6d4");
  const [mounted, setMounted] = useState(false);
  const [showCesium, setShowCesium] = useState(false);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);
  const [gltfUrl, setGltfUrl] = useState<string | null>(null);
  const [resourceMap, setResourceMap] = useState<Map<string, string>>();
  const { boxes, creationMode, setCreationMode, projectId } = useBoxContext();
  const [canvasKey] = useState(() => `canvas-${projectId || "default"}`);

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log("🟢 Viewer MOUNTED");
    return () => {
      console.log("🔴 Viewer UNMOUNTED - This causes Context Lost!");
    };
  }, []);

  // Ensure client-side only rendering
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for client-only canvas
    setMounted(true);
  }, []);

  // Debug: log boxes when they change
  useEffect(() => {
    console.log("Viewer - boxes updated:", boxes.length, boxes);
  }, [boxes]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync accent with CSS variable
      setAccent(val);
    }

    // Listen for Escape key to exit creation mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && creationMode) {
        setCreationMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [creationMode, setCreationMode]);

  // Don't render canvas on server or before mounting
  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="viewer-muted text-sm">Loading 3D viewer...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Canvas 
        key={canvasKey}
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <Scene 
          boxes={boxes} 
          accent={accent} 
          gltfUrl={gltfUrl} 
          resourceMap={resourceMap}
          showRoomLabels={showIotOverlay && showRoomLabels}
          cameras={mockCameras}
          showCameras={showCameras}
          onCameraClick={(camera) => setSelectedCamera(camera)}
          selectedCameraId={selectedCamera?.id || null}
        />
      </Canvas>
      
      {/* GLTF Import Controls */}
      {showGltfControls && (
        <GltfControls onModelLoad={(url, map) => {
          setGltfUrl(url);
          setResourceMap(map);
        }} />
      )}
      
      {showCesium && (
        <div className="absolute inset-0 z-10">
          <CesiumViewer className="w-full h-full" />
        </div>
      )}
      <CesiumControls 
        showCesium={showCesium}
        onToggle={() => setShowCesium(!showCesium)}
      />
      
      {/* IoT Room Labels Controls */}
      {showIotOverlay && (
        <IotControls
          showLabels={showRoomLabels}
          onToggleLabels={() => setShowRoomLabels(!showRoomLabels)}
        />
      )}
      
      {/* IoT Legend */}
      {showIotOverlay && showRoomLabels && <IotLegend />}
      
      {/* Camera List Panel */}
      {showCameraPanel && (
        <CameraListPanel
          cameras={mockCameras}
          selectedCameraId={selectedCamera?.id || null}
          onCameraSelect={(camera) => setSelectedCamera(camera)}
          showCameras={showCameras}
          onToggleCameras={() => setShowCameras(!showCameras)}
        />
      )}
      
      {/* Camera Viewer Panel */}
      <CameraViewerPanel
        camera={selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />
    </div>
  );
}

export default Viewer;
