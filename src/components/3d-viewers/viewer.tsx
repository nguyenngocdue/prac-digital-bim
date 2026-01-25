"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useBoxContext, type Box } from "../../app/contexts/box-context";
import Scene, { type SceneHandle } from "./scene";
import { GltfControls } from "./gltf/gltf-controls";
import { IotControls } from "./iot/iot-controls";
import { IotLegend } from "./iot/iot-legend";
import { TransformModePanel } from "./transform-mode-panel";
import { CameraListPanel, CameraViewerPanel } from "./cameras";
import { mockCameras } from "@/data/mock-cameras";
import { CameraData } from "@/types/camera";
import {
  Activity,
  ArrowUp,
  Camera,
  Grid3x3,
  Home,
  Map,
  Maximize2,
  Move3d,
  PenTool,
  PanelLeft,
  PanelRight,
  Scan,
  RotateCw,
  Upload,
  Axis3d,
} from "lucide-react";

interface ViewerProps {
  useCesium?: boolean;
  showCameraPanel?: boolean;
  showIotOverlay?: boolean;
  showGltfControls?: boolean;
  showGoogleTiles?: boolean;
  onToggleGoogleTiles?: () => void;
  onToggleCameraPanel?: () => void;
  onToggleIotOverlay?: () => void;
  onToggleGltfControls?: () => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  showLeftPanel?: boolean;
  showRightPanel?: boolean;
}

const Viewer = ({
  showCameraPanel = true,
  showIotOverlay = true,
  showGltfControls = true,
  showGoogleTiles = false,
  onToggleGoogleTiles,
  onToggleCameraPanel,
  onToggleIotOverlay,
  onToggleGltfControls,
  onToggleLeftPanel,
  onToggleRightPanel,
  showLeftPanel = true,
  showRightPanel = true,
}: ViewerProps) => {
  const [accent, setAccent] = useState<string>("#06b6d4");
  const [mounted, setMounted] = useState(false);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [allowMove, setAllowMove] = useState(true);
  const [geometryEditMode, setGeometryEditMode] = useState(false);
  const [faceSelectMode, setFaceSelectMode] = useState(false);
  const editSnapshotRef = useRef<{ id: string; box: Box } | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);
  const [gltfUrl, setGltfUrl] = useState<string | null>(null);
  const [resourceMap, setResourceMap] = useState<Map<string, string>>();
  const sceneRef = useRef<SceneHandle | null>(null);
  const {
    boxes,
    setBoxes,
    creationMode,
    setCreationMode,
    creationTool,
    buildingOptions,
    drawingPoints,
    setDrawingPoints,
    selectedId,
    setSelectedId,
    projectId,
    createRoom,
    transformMode,
    setTransformMode,
  } = useBoxContext();
  const [canvasKey] = useState(() => `canvas-${projectId || "default"}`);
  const cloneBox = (box: Box): Box => {
    if (typeof structuredClone === "function") {
      return structuredClone(box);
    }
    return JSON.parse(JSON.stringify(box)) as Box;
  };

  const startGeometryEdit = () => {
    if (!selectedId) return;
    const target = boxes.find((box) => box.id === selectedId);
    if (!target) return;
    editSnapshotRef.current = { id: selectedId, box: cloneBox(target) };
    setCreationMode(false);
    setGeometryEditMode(true);
  };

  const applyGeometryEdit = () => {
    editSnapshotRef.current = null;
    setGeometryEditMode(false);
  };

  const cancelGeometryEdit = () => {
    const snapshot = editSnapshotRef.current;
    if (snapshot) {
      setBoxes((prev) => prev.map((box) => (box.id === snapshot.id ? snapshot.box : box)));
    }
    editSnapshotRef.current = null;
    setGeometryEditMode(false);
  };

  const overlayActions = [
    {
      key: "move",
      label: "Move",
      active: allowMove,
      onClick: () => setAllowMove((prev) => !prev),
      icon: Move3d,
    },
    {
      key: "axes",
      label: "Axes",
      active: showAxes,
      onClick: () => setShowAxes((prev) => !prev),
      icon: Axis3d,
    },
    {
      key: "grid",
      label: "Grid",
      active: showGrid,
      onClick: () => setShowGrid((prev) => !prev),
      icon: Grid3x3,
    },
    {
      key: "edit-geometry",
      label: "Edit Geometry",
      active: geometryEditMode,
      onClick: () => {
        if (geometryEditMode) return;
        startGeometryEdit();
      },
      icon: PenTool,
    },
    {
      key: "face-select",
      label: "Select Face",
      active: faceSelectMode,
      onClick: () => {
        setFaceSelectMode((prev) => {
          const next = !prev;
          if (!next) {
            sceneRef.current?.clearFaceSelection();
          }
          return next;
        });
      },
      icon: Scan,
    },
    {
      key: "create-room",
      label: "Create Room",
      active: false,
      onClick: createRoom,
      icon: Home,
    },
    {
      key: "left-panel",
      label: "Left panel",
      active: showLeftPanel,
      onClick: onToggleLeftPanel,
      icon: PanelLeft,
    },
    {
      key: "right-panel",
      label: "Right panel",
      active: showRightPanel,
      onClick: onToggleRightPanel,
      icon: PanelRight,
    },
    {
      key: "google",
      label: "Google 3D Tiles",
      active: showGoogleTiles,
      onClick: onToggleGoogleTiles,
      icon: Map,
    },
    {
      key: "gltf",
      label: "Import GLTF",
      active: showGltfControls,
      onClick: onToggleGltfControls,
      icon: Upload,
    },
    {
      key: "iot",
      label: "IoT Sensors",
      active: showIotOverlay,
      onClick: onToggleIotOverlay,
      icon: Activity,
    },
    {
      key: "camera",
      label: "Cameras",
      active: showCameraPanel,
      onClick: onToggleCameraPanel,
      icon: Camera,
    },
  ]
    .map((action) => ({
      ...action,
      disabled: geometryEditMode && action.key !== "edit-geometry",
    }))
    .filter((action) => typeof action.onClick === "function");

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

  useEffect(() => {
    if (!geometryEditMode) return;
    if (faceSelectMode) {
      setFaceSelectMode(false);
      sceneRef.current?.clearFaceSelection();
    }
  }, [faceSelectMode, geometryEditMode]);

  // Debug: log boxes when they change
  useEffect(() => {
    console.log("Viewer - boxes updated:", boxes.length, boxes);
  }, [boxes]);

  useEffect(() => {
    const handleFinishDrawing = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!creationMode) return;
      if (creationTool !== "building") return;
      if (buildingOptions.shape !== "custom" || !buildingOptions.drawingMode) return;
      if (drawingPoints.length < 3) return;

      const centerX = drawingPoints.reduce((sum, p) => sum + p[0], 0) / drawingPoints.length;
      const centerZ = drawingPoints.reduce((sum, p) => sum + p[2], 0) / drawingPoints.length;
      const basePoint = drawingPoints[0];
      if (!basePoint) return;
      const baseY = basePoint[1];
      const footprint = drawingPoints.map((p) => [p[0] - centerX, p[2] - centerZ]) as [number, number][];
      const id =
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : Math.random().toString(36).slice(2, 10);

      setBoxes((prev) => [
        ...prev,
        {
          id,
          position: [centerX, baseY + buildingOptions.height / 2, centerZ],
          color: accent,
          type: "building",
          footprint,
          height: buildingOptions.height,
          rotationY: 0,
          thicknessRatio: buildingOptions.thicknessRatio,
        },
      ]);
      setDrawingPoints([]);
    };

    window.addEventListener("keydown", handleFinishDrawing);
    return () => window.removeEventListener("keydown", handleFinishDrawing);
  }, [
    accent,
    buildingOptions,
    creationMode,
    creationTool,
    drawingPoints,
    setBoxes,
    setDrawingPoints,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = getComputedStyle(document.documentElement);
    const val = cs.getPropertyValue("--accent").trim();
    if (val) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync accent with CSS variable
      setAccent(val);
    }

    // Listen for Escape key to exit creation mode and Delete to remove selection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (creationMode) {
          setCreationMode(false);
        }
        if (geometryEditMode) {
          cancelGeometryEdit();
          return;
        }
        if (selectedId) {
          setSelectedId(null);
        }
      }
      if (geometryEditMode) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setBoxes((prev) => prev.filter((box) => box.id !== selectedId));
        setSelectedId(null);
        sceneRef.current?.clearFaceSelection();
      }
      // Transform mode shortcuts when object is selected
      if (selectedId) {
        if (e.key === "g" || e.key === "G") {
          e.preventDefault();
          setTransformMode("translate");
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          setTransformMode("rotate");
        }
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          setTransformMode("scale");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    creationMode,
    geometryEditMode,
    faceSelectMode,
    selectedId,
    setBoxes,
    setCreationMode,
    cancelGeometryEdit,
    setSelectedId,
    setTransformMode,
  ]);

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
      {/* Creation Mode Indicator */}
      {creationMode && (
        <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2">
          <div className="viewer-panel viewer-panel-strong flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg backdrop-blur">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">
              {creationTool === "room" ? "Click to place Room" : 
               creationTool === "building" ? "Click to place Building" : 
               "Click to place Box"}
            </span>
            <span className="text-xs text-muted-foreground ml-2">(ESC to exit)</span>
          </div>
        </div>
      )}
      
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
          ref={sceneRef}
          boxes={boxes} 
          accent={accent} 
          gltfUrl={gltfUrl} 
          resourceMap={resourceMap}
          showRoomLabels={showIotOverlay && showRoomLabels}
          cameras={mockCameras}
          showCameras={showCameras}
          onCameraClick={(camera) => setSelectedCamera(camera)}
          selectedCameraId={selectedCamera?.id || null}
          showGoogleTiles={showGoogleTiles}
          showAxes={showAxes}
          showGrid={showGrid}
          allowMove={geometryEditMode ? false : allowMove}
          geometryEditMode={geometryEditMode}
          faceSelectMode={faceSelectMode}
          onRequestGeometryEdit={() => {
            if (geometryEditMode) return;
            startGeometryEdit();
          }}
        />
      </Canvas>
      {geometryEditMode && selectedId && (
        <div className="pointer-events-auto absolute left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/90 px-2.5 py-2 text-xs shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              Edit Mode
            </span>
            <button
              type="button"
              onClick={applyGeometryEdit}
              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={cancelGeometryEdit}
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {selectedId && !geometryEditMode && (
        <div className="pointer-events-auto absolute left-3 top-24 z-50 flex flex-col gap-2">
          <div className="viewer-panel viewer-panel-strong flex flex-col items-center gap-1 rounded-lg p-1 shadow-lg backdrop-blur">
            {[
              {
                key: "translate",
                label: "Move (G)",
                icon: Move3d,
                active: transformMode === "translate",
                onClick: () => setTransformMode("translate"),
              },
              {
                key: "rotate",
                label: "Rotate (R)",
                icon: RotateCw,
                active: transformMode === "rotate",
                onClick: () => setTransformMode("rotate"),
              },
              {
                key: "scale",
                label: "Scale (S)",
                icon: Maximize2,
                active: transformMode === "scale",
                onClick: () => setTransformMode("scale"),
              },
            ].map(({ key, label, icon: Icon, active, onClick }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                title={label}
                aria-pressed={active}
                className={`flex h-9 w-9 items-center justify-center rounded-md text-sm transition ${
                  active
                    ? "viewer-chip shadow-sm"
                    : "bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => sceneRef.current?.goOnTop()}
              title="Go on top"
              className="flex h-9 w-9 items-center justify-center rounded-md text-sm transition bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="pointer-events-auto absolute right-3 top-40 z-50 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => sceneRef.current?.resetView()}
          aria-label="Reset view"
          className="group relative viewer-chip flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
        >
          <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Reset view
          </span>
          <Home className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => sceneRef.current?.zoomToFit()}
          aria-label="Zoom to fit project"
          className="group relative viewer-chip flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
        >
          <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Zoom to fit project
          </span>
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      
      {/* GLTF Import Controls */}
      {showGltfControls && (
        <GltfControls onModelLoad={(url, map) => {
          setGltfUrl(url);
          setResourceMap(map);
        }} />
      )}

      {/* Transform Mode Panel */}
      {!geometryEditMode && (
        <TransformModePanel
          mode={transformMode}
          onModeChange={setTransformMode}
          selectedId={selectedId}
          onGoOnTop={() => sceneRef.current?.goOnTop()}
        />
      )}

      {overlayActions.length > 0 && (
        <div className="absolute bottom-2 left-1/2 z-40 -translate-x-1/2">
          <div className="viewer-panel viewer-panel-strong flex items-center gap-0.5 rounded-lg px-1 py-1 shadow-lg backdrop-blur">
            {overlayActions.map(({ key, label, active, onClick, icon: Icon, disabled }) => (
              <button
                key={key}
                type="button"
                onClick={disabled ? undefined : onClick}
                aria-pressed={active}
                title={label}
                disabled={disabled}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
                  active
                    ? "viewer-chip shadow-sm"
                    : "bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
      
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
