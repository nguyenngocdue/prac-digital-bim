"use client";
import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Object3D } from "three";
import { useGltfModel } from "./gltf/use-gltf-model";
import { GltfModel } from "./gltf/gltf-model";
import { RoomLabelsLayer } from "./iot/room-labels-layer";
import { RoomConnections } from "./iot/room-connections";
import { RoomMarkersLayer } from "./iot/room-markers-layer";
import { CameraMarkersLayer } from "./cameras/camera-markers-layer";
import { mockRooms } from "@/data/mock-rooms";
import { CameraData } from "@/types/camera";
import { GooglePhotorealisticTiles } from "./gis/google-photorealistic-tiles";
import { useThree } from "@react-three/fiber";
import { useBoxContext } from "@/app/contexts/box-context";
import { BuildingMesh } from "./standards/building-mesh";

type Box = {
  id: string;
  position: [number, number, number];
  color?: string;
  size?: [number, number, number];
  type?: "box" | "building" | "room";
  rotationY?: number;
  footprint?: [number, number][];
  height?: number;
  thicknessRatio?: number;
  width?: number;
  depth?: number;
  showMeasurements?: boolean;
};

interface SceneProps {
  boxes: Box[];
  accent: string;
  onToggleCesium?: (show: boolean) => void;
  gltfUrl?: string | null;
  resourceMap?: Map<string, string>;
  showRoomLabels?: boolean;
  cameras?: CameraData[];
  showCameras?: boolean;
  onCameraClick?: (camera: CameraData) => void;
  selectedCameraId?: string | null;
  showGoogleTiles?: boolean;
}

const Scene = memo(({ boxes, accent, gltfUrl, resourceMap, showRoomLabels = false, cameras = [], showCameras = false, onCameraClick, selectedCameraId, showGoogleTiles = false }: SceneProps) => {
  const controlsRef = useRef<any>(null);
  const objectRefs = useRef<Map<string, Object3D>>(new Map());
  const { boxes: contextBoxes, setBoxes, selectedId, setSelectedId, transformMode, setTransformMode, drawingPoints } = useBoxContext();
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedObjectOverride, setSelectedObjectOverride] = useState<Object3D | null>(null);
  const { camera } = useThree();

  // Import Three.js components
  const { GizmoHelper, GizmoViewcube, Grid, OrbitControls, Select, Stats, TransformControls, Line } = require("@react-three/drei");
  const { AxesWithLabels } = require("./standards/axes-with-labels");
  const { RaycastCatcher } = require("@/lib/raycast-catcher");
  const THREE = require("three");
  const { PlaceholderBox } = require("./standards/placeholder-box");
  const { RoomBox } = require("./standards/room-box");
  
  // Load GLTF model if URL is provided
  const { scene: gltfScene } = useGltfModel({ url: gltfUrl || null, resourceMap });

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enabled = !isTransforming;
  }, [isTransforming]);

  const selectedObject = selectedId ? objectRefs.current.get(selectedId) || null : null;

  useEffect(() => {
    if (selectedId && selectedObject) {
      setSelectedObjectOverride(selectedObject);
    }
    if (!selectedId) {
      setSelectedObjectOverride(null);
    }
  }, [selectedId, selectedObject]);

  useEffect(() => {
    if (!contextBoxes.length) return;
    const needsIds = contextBoxes.some((box) => !box.id);
    if (!needsIds) return;
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id) return box;
        const id =
          typeof crypto !== "undefined" && (crypto as any).randomUUID
            ? (crypto as any).randomUUID()
            : Math.random().toString(36).slice(2, 10);
        return { ...box, id };
      })
    );
  }, [contextBoxes, setBoxes]);

  const handleTransformEnd = () => {
    if (!selectedId || !selectedObject) return;
    const { position, rotation, scale } = selectedObject;
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== selectedId) return box;
        const next = {
          ...box,
          position: [position.x, position.y, position.z] as [number, number, number],
          rotationY: rotation.y,
        };

        if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
          if (box.footprint) {
            next.footprint = box.footprint.map(([x, z]) => [x * scale.x, z * scale.z]);
            next.height = (box.height || 1) * scale.y;
          } else if (box.size) {
            next.size = [box.size[0] * scale.x, box.size[1] * scale.y, box.size[2] * scale.z];
          }
          selectedObject.scale.set(1, 1, 1);
        }
        return next;
      })
    );
  };

  const drawingLinePoints = useMemo(() => {
    if (drawingPoints.length < 2) return null;
    const points = drawingPoints.map((p) => [p[0], p[1] + 0.05, p[2]]);
    return [...points, points[0]];
  }, [drawingPoints]);

  // Three.js scene
  const threeJsScene = (
    <>
      {showGoogleTiles && (
        <GooglePhotorealisticTiles
          lat={1.353285}
          lon={103.691559}
          altitude={0}
          heading={0}
        />
      )}
      <RaycastCatcher accent={accent} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <PlaceholderBox color={accent || "#06b6d4"} />
      <Select box multiple>
        {boxes.map((box, i) => (
          <group
            key={box.id || i}
            ref={(node) => {
              if (node) {
                objectRefs.current.set(box.id, node);
              } else {
                objectRefs.current.delete(box.id);
              }
            }}
            position={box.position}
            rotation={[0, box.rotationY || 0, 0]}
            onPointerDown={(event: any) => {
              event.stopPropagation();
              const target = event.eventObject || event.object;
              if (target) {
                setSelectedObjectOverride(target);
              }
              if (!box.id) {
                const id =
                  typeof crypto !== "undefined" && (crypto as any).randomUUID
                    ? (crypto as any).randomUUID()
                    : Math.random().toString(36).slice(2, 10);
                setBoxes((prev) => prev.map((item) => (item === box ? { ...item, id } : item)));
                setSelectedId(id);
              } else {
                setSelectedId(box.id);
              }
              setTransformMode("translate");
            }}
          >
            {box.type === "building" ? (
              <BuildingMesh
                color={box.color || accent}
                height={box.height || 8}
                footprint={box.footprint}
                width={box.size?.[0] || 10}
                depth={box.size?.[2] || 10}
                thicknessRatio={box.thicknessRatio || 0.3}
                shape="rect"
              />
            ) : box.type === "room" ? (
              <RoomBox
                width={box.width || 3.66}
                height={box.height || 3}
                depth={box.depth || 3.66}
                position={[0, 0, 0]}
                color={box.color || "#D4A574"}
                showMeasurements={box.showMeasurements !== false}
              />
            ) : (
              <PlaceholderBox
                color={box.color || accent}
                position={[0, 0, 0]}
                size={box.size}
                rotationY={0}
                onSelectEffect={(selected: boolean) => {
                  if (selected) {
                    console.log("Box selected at", box.position);
                  }
                }}
              />
            )}
          </group>
        ))}
      </Select>

      {(selectedObjectOverride || selectedObject) && (
        <TransformControls
          object={selectedObjectOverride || selectedObject}
          mode={transformMode}
          size={1.5}
          space="world"
          showX
          showY
          showZ
          translationSnap={0.1}
          rotationSnap={Math.PI / 18}
          scaleSnap={0.1}
          onMouseDown={() => setIsTransforming(true)}
          onMouseUp={() => {
            setIsTransforming(false);
            handleTransformEnd();
          }}
        />
      )}

      {drawingLinePoints && (
        <Line points={drawingLinePoints} color={accent} lineWidth={2} dashed={false} />
      )}

      {/* GLTF Model */}
      {gltfScene && (
        <Suspense fallback={null}>
          <GltfModel 
            scene={gltfScene} 
            position={[0, 0, 0]}
            autoRotate={false}
          />
        </Suspense>
      )}

      {/* IoT Room Labels */}
      <RoomLabelsLayer rooms={mockRooms} visible={showRoomLabels} />
      
      {/* IoT Connection Lines */}
      <RoomConnections rooms={mockRooms} visible={showRoomLabels} />
      
      {/* IoT Room Markers on Floor */}
      <RoomMarkersLayer rooms={mockRooms} visible={showRoomLabels} />

      {/* Camera Markers */}
      <CameraMarkersLayer 
        cameras={cameras} 
        visible={showCameras}
        onCameraClick={onCameraClick}
        selectedCameraId={selectedCameraId}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={showGoogleTiles ? 0.08 : 0.12}
        enablePan={true}
        enableRotate
        enableZoom
        panSpeed={showGoogleTiles ? 0.6 : 1}
        rotateSpeed={showGoogleTiles ? 0.4 : 0.8}
        zoomSpeed={showGoogleTiles ? 1.8 : 1.1}
        minDistance={showGoogleTiles ? 2 : 2}
        maxDistance={showGoogleTiles ? 1_000_000 : 2000}
      />
      <AxesWithLabels size={4} fontSize={0.3} labelOffset={4.2} billboard />
      <Grid
        infiniteGrid
        sectionColor="#444"
        cellColor="#666"
        fadeDistance={60}
        fadeStrength={1}
        sectionThickness={0.5}
        cellThickness={0.3}
      />
      <Stats />
      <GizmoHelper
        alignment="top-right"
        margin={[350, 90]}
        onUpdate={() => {}}
        onTarget={() => new THREE.Vector3(0, 0, 0)}
        renderPriority={1}
      >
        <GizmoViewcube
          color="#9eacb8"
          strokeColor="#1a1a1a"
          textColor="#141523"
          hoverColor="#90a4ae"
        />
      </GizmoHelper>
    </>
  );

  return threeJsScene;
});

Scene.displayName = "Scene";

export default Scene;
