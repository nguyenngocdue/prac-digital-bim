"use client";
import {
  forwardRef,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Object3D, Vector3 } from "three";
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
import { EditableBoxHandles } from "./standards/editable-box-handles";
import { getFootprintPoints } from "./standards/building-shapes";
import { getWorldFaceNormal, getWorldFacePoint, type FaceArrowState } from "./standards/face-normal-arrow";

type Box = {
  id: string;
  position: [number, number, number];
  color?: string;
  size?: [number, number, number];
  type?: "box" | "building" | "room";
  rotationY?: number;
  footprint?: [number, number][];
  vertices?: [number, number, number][];
  height?: number;
  thicknessRatio?: number;
  width?: number;
  depth?: number;
  showMeasurements?: boolean;
  topFootprint?: [number, number][];
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

export type SceneHandle = {
  resetView: () => void;
};

const Scene = memo(forwardRef<SceneHandle, SceneProps>(({ boxes, accent, gltfUrl, resourceMap, showRoomLabels = false, cameras = [], showCameras = false, onCameraClick, selectedCameraId, showGoogleTiles = false }, ref) => {
  const controlsRef = useRef<any>(null);
  const objectRefs = useRef<Map<string, Object3D>>(new Map());
  const { boxes: contextBoxes, setBoxes, selectedId, setSelectedId, transformMode, setTransformMode, drawingPoints, updateBoxVertices } = useBoxContext();
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedObjectOverride, setSelectedObjectOverride] = useState<Object3D | null>(null);
  const [faceArrow, setFaceArrow] = useState<FaceArrowState | null>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);
  const initialCameraRef = useRef<{
    position: Vector3;
    target: Vector3;
    up: Vector3;
  } | null>(null);
  const { camera, raycaster } = useThree();

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
    if (!initialCameraRef.current) {
      initialCameraRef.current = {
        position: camera.position.clone(),
        target: controlsRef.current.target.clone(),
        up: camera.up.clone(),
      };
    }
  }, [camera]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enabled = !isTransforming;
  }, [isTransforming]);

  const selectedObject = selectedId ? objectRefs.current.get(selectedId) || null : null;
  const selectedBox = selectedId ? contextBoxes.find((box) => box.id === selectedId) : undefined;
  const selectedFootprint =
    selectedBox?.type === "building"
      ? selectedBox.footprint ||
        getFootprintPoints(
          "rect",
          selectedBox.width || 10,
          selectedBox.depth || 10,
          selectedBox.thicknessRatio || 0.3
        )
      : null;
  const selectedTopFootprint =
    selectedBox?.type === "building"
      ? selectedBox.topFootprint || selectedFootprint
      : null;
  const selectedFootprintVertices: [number, number, number][] | null =
    selectedBox?.type === "building" && selectedFootprint
      ? selectedFootprint.map(([x, z]) => {
          const baseY = selectedBox.position[1] - (selectedBox.height || 0) / 2;
          return [x + selectedBox.position[0], baseY, z + selectedBox.position[2]] as [
            number,
            number,
            number
          ];
        })
      : null;
  const selectedTopVertices: [number, number, number][] | null =
    selectedBox?.type === "building" && selectedTopFootprint
      ? selectedTopFootprint.map(([x, z]) => {
          const topY = selectedBox.position[1] + (selectedBox.height || 0) / 2;
          return [x + selectedBox.position[0], topY, z + selectedBox.position[2]] as [
            number,
            number,
            number
          ];
        })
      : null;

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

  const faceArrowHelper = useMemo(
    () =>
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        1,
        0x22c55e
      ),
    []
  );

  useEffect(() => {
    if (!faceArrow) return;
    faceArrowHelper.position.copy(faceArrow.origin);
    faceArrowHelper.setDirection(faceArrow.direction);
    faceArrowHelper.setLength(1, 0.25, 0.15);
  }, [faceArrow, faceArrowHelper]);

  const handleResetView = useCallback(() => {
    if (!controlsRef.current || !initialCameraRef.current) return;
    const { position, target, up } = initialCameraRef.current;
    camera.position.copy(position);
    camera.up.copy(up);
    controlsRef.current.target.copy(target);
    controlsRef.current.update();
    camera.updateProjectionMatrix();
  }, [camera]);

  useImperativeHandle(ref, () => ({ resetView: handleResetView }), [handleResetView]);

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
      {faceArrow && <primitive object={faceArrowHelper} />}
      <group ref={boxesGroupRef}>
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
                if (boxesGroupRef.current) {
                  const hits = raycaster.intersectObject(boxesGroupRef.current, true);
                  const hit = hits.find((item) => item.face && item.object.type === "Mesh");
                  if (hit) {
                    const normal = getWorldFaceNormal(hit);
                    if (normal) {
                      const origin = getWorldFacePoint(hit);
                      origin.addScaledVector(normal, 0.01);
                      setFaceArrow({ origin, direction: normal });
                    }
                  }
                }
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
                  topFootprint={box.topFootprint}
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
                  vertices={box.vertices}
                  onVerticesChange={(newVertices: [number, number, number][]) => {
                    updateBoxVertices(box.id, newVertices);
                  }}
                  onHandleDragChange={(isDragging: boolean) => setIsTransforming(isDragging)}
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
      </group>

      {/* TransformControls - disabled for room type to use EditableBoxHandles instead */}
      {(selectedObjectOverride || selectedObject) && (() => {
        const isRoomType = selectedBox?.type === "room";
        const isBuildingType = selectedBox?.type === "building";
        
        // Don't show TransformControls for shape-editable types
        if (isRoomType || isBuildingType) return null;
        
        return (
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
        );
      })()}

      {drawingLinePoints && (
        <Line points={drawingLinePoints} color={accent} lineWidth={2} dashed={false} />
      )}

      {selectedBox?.type === "building" && selectedFootprintVertices && (
        <EditableBoxHandles
          vertices={selectedFootprintVertices}
          topVertices={selectedTopVertices || undefined}
          onTopVerticesChange={(newVertices) => {
            const originX = selectedBox.position[0];
            const originZ = selectedBox.position[2];
            const topFootprint = newVertices.map((vertex) => [
              vertex[0] - originX,
              vertex[2] - originZ,
            ]) as [number, number][];
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id ? { ...box, topFootprint } : box
              )
            );
          }}
          onVerticesChange={(newVertices) => {
            const originX = selectedBox.position[0];
            const originZ = selectedBox.position[2];
            const footprint = newVertices.map((vertex) => [
              vertex[0] - originX,
              vertex[2] - originZ,
            ]) as [number, number][];
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id ? { ...box, footprint } : box
              )
            );
          }}
          color="#3B82F6"
          height={selectedBox.height || 0}
          onHeightChange={(nextHeight, nextCenterY) => {
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id
                  ? { ...box, height: nextHeight, position: [box.position[0], nextCenterY, box.position[2]] }
                  : box
              )
            );
          }}
          centerY={selectedBox.position[1]}
          onTranslate={(nextCenterY) => {
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id
                  ? { ...box, position: [box.position[0], nextCenterY, box.position[2]] }
                  : box
              )
            );
          }}
          centerX={selectedBox.position[0]}
          centerZ={selectedBox.position[2]}
          onTranslateXZ={(nextCenterX, nextCenterZ) => {
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id
                  ? { ...box, position: [nextCenterX, box.position[1], nextCenterZ] }
                  : box
              )
            );
          }}
          onTranslateXYZ={(nextCenterX, nextCenterY, nextCenterZ) => {
            setBoxes((prev) =>
              prev.map((box) =>
                box.id === selectedBox.id
                  ? { ...box, position: [nextCenterX, nextCenterY, nextCenterZ] }
                  : box
              )
            );
          }}
          onDragStart={() => setIsTransforming(true)}
          onDragEnd={() => setIsTransforming(false)}
        />
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
        makeDefault
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
        margin={[50, 90]}
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
}));

Scene.displayName = "Scene";

export default Scene;
