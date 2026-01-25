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
import { Vector3 } from "three";
import type { Group, Mesh, Object3D } from "three";
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
import { useBoxContext, type Box } from "@/app/contexts/box-context";
import { BuildingMesh } from "./standards/building-mesh";
import { EditableBoxHandles } from "./standards/editable-box-handles";
import { getFootprintPoints } from "./standards/building-shapes";
import { getWorldFaceNormal, getWorldFacePoint, type FaceArrowState } from "./standards/face-normal-arrow";
import {
  resetVertexColors,
  selectCoplanarFace,
  type FaceSelection,
} from "./standards/face-selection";
import { ProArrow } from "@/components/pro-arrow";
import { getSnappedPosition } from "./transform-modes/translate";
import { RotationAngleLabel } from "./transform-modes/rotate/rotation-angle-label";
import { applyScaleToBox } from "./transform-modes/scale";
import { BuildingHandles } from "./scene-handlers/building-handles";
import { getBoxBounds, getBoxHeight } from "./scene-utils/box-bounds";
import { rotateXZ } from "./scene-utils/rotate-xz";
import { handleRotateChange } from "./scene-handlers/rotate-change";
import { handleTransformEnd } from "./scene-handlers/transform-end";
import { handleGoOnTop } from "./scene-handlers/go-on-top";
import { zoomToFit } from "./scene-handlers/zoom-to-fit";

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
  showAxes?: boolean;
  showGrid?: boolean;
  allowMove?: boolean;
  geometryEditMode?: boolean;
  faceSelectMode?: boolean;
  onRequestGeometryEdit?: () => void;
}

export type SceneHandle = {
  resetView: () => void;
  zoomToFit: () => void;
  clearFaceSelection: () => void;
  goOnTop: () => void;
};

const Scene = memo(forwardRef<SceneHandle, SceneProps>(({ boxes, accent, gltfUrl, resourceMap, showRoomLabels = false, cameras = [], showCameras = false, onCameraClick, selectedCameraId, showGoogleTiles = false, showAxes = true, showGrid = true, allowMove = true, geometryEditMode = false, faceSelectMode = false, onRequestGeometryEdit }, ref) => {
  const controlsRef = useRef<any>(null);
  const objectRefs = useRef<Map<string, Object3D>>(new Map());
  const { boxes: contextBoxes, setBoxes, selectedId, setSelectedId, transformMode, setTransformMode, drawingPoints, updateBoxVertices, buildingOptions } = useBoxContext();
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedObjectOverride, setSelectedObjectOverride] = useState<Object3D | null>(null);
  const [hoveredObject, setHoveredObject] = useState<Object3D | null>(null);
  const [faceArrow, setFaceArrow] = useState<FaceArrowState | null>(null);
  const boxesGroupRef = useRef<Group | null>(null);
  const lastFaceRef = useRef<FaceSelection | null>(null);
  const transformRafRef = useRef<number | null>(null);
  const initialCameraRef = useRef<{
    position: Vector3;
    target: Vector3;
    up: Vector3;
  } | null>(null);
  const { camera, raycaster, scene: r3fScene } = useThree();

  // Import Three.js components
  const { Grid, OrbitControls, TransformControls, Line, GizmoHelper, GizmoViewcube, Html } =
    require("@react-three/drei");
  const { EffectComposer, Outline, N8AO } = require("@react-three/postprocessing");
  const { RaycastCatcher } = require("@/lib/raycast-catcher");
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

  useEffect(() => {
    if (!geometryEditMode && !faceSelectMode) return;
    setHoveredObject(null);
  }, [faceSelectMode, geometryEditMode]);

  useEffect(() => {
    const handlePointerEnd = () => {
      setIsTransforming(false);
    };
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("blur", handlePointerEnd);
    return () => {
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("blur", handlePointerEnd);
    };
  }, []);


  const selectedObject = selectedId ? objectRefs.current.get(selectedId) || null : null;
  const selectedBox = selectedId ? contextBoxes.find((box) => box.id === selectedId) : undefined;
  const activeTransformObject = selectedObjectOverride || selectedObject;
  const outlineSelection = useMemo(() => {
    const collectMeshes = (root: Object3D | null) => {
      const meshes: Object3D[] = [];
      if (!root) return meshes;
      root.traverse((child) => {
        if (child.type === "Mesh") {
          meshes.push(child);
        }
      });
      return meshes;
    };
    const items = [
      ...collectMeshes(activeTransformObject),
      ...collectMeshes(hoveredObject),
    ];
    return Array.from(new Set(items));
  }, [activeTransformObject, hoveredObject]);
  const selectedRotationY = selectedBox?.rotationY || 0;
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
        const [rx, rz] = rotateXZ(x, z, -selectedRotationY);
        return [
          rx + selectedBox.position[0],
          baseY,
          rz + selectedBox.position[2],
        ] as [number, number, number];
      })
      : null;
  const selectedRoomVertices: [number, number, number][] | null =
    selectedBox?.type === "room"
      ? selectedBox.vertices?.length
        ? selectedBox.vertices
        : [
          [-(selectedBox.width || 3.66) / 2, 0, (selectedBox.depth || 3.66) / 2],
          [(selectedBox.width || 3.66) / 2, 0, (selectedBox.depth || 3.66) / 2],
          [(selectedBox.width || 3.66) / 2, 0, -(selectedBox.depth || 3.66) / 2],
          [-(selectedBox.width || 3.66) / 2, 0, -(selectedBox.depth || 3.66) / 2],
        ]
      : null;
  const selectedRoomVerticesWorld: [number, number, number][] | null =
    selectedBox?.type === "room" && selectedRoomVertices
      ? selectedRoomVertices.map(([x, y, z]) => {
        const [rx, rz] = rotateXZ(x, z, -selectedRotationY);
        return [
          rx + selectedBox.position[0],
          y + selectedBox.position[1],
          rz + selectedBox.position[2],
        ] as [number, number, number];
      })
      : null;
  const selectedTopVertices: [number, number, number][] | null =
    selectedBox?.type === "building" && selectedTopFootprint
      ? selectedTopFootprint.map(([x, z]) => {
        const topY = selectedBox.position[1] + (selectedBox.height || 0) / 2;
        const [rx, rz] = rotateXZ(x, z, -selectedRotationY);
        return [
          rx + selectedBox.position[0],
          topY,
          rz + selectedBox.position[2],
        ] as [number, number, number];
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
    if (!activeTransformObject) return;
    let current: Object3D | null = activeTransformObject;
    let attached = false;
    while (current) {
      if (current === r3fScene) {
        attached = true;
        break;
      }
      current = current.parent;
    }
    if (!attached) {
      setSelectedObjectOverride(null);
    }
  }, [activeTransformObject, r3fScene]);

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

  const handleRotateChangeRef = useCallback(() => {
    if (!selectedId || !activeTransformObject) return;
    handleRotateChange({
      selectedId,
      activeTransformObject,
      setBoxes,
      rafRef: transformRafRef,
    });
  }, [activeTransformObject, selectedId, setBoxes]);

  const handleTranslateChange = useCallback(() => {
    if (!selectedBox || !activeTransformObject || !selectedId) return;
    const nextPosition = getSnappedPosition({
      position: activeTransformObject.position,
      selectedBox,
      selectedRotationY: activeTransformObject.rotation.y,
      boxes: contextBoxes,
      selectedId,
      buildingOptions,
      getBoxBounds,
    });
    activeTransformObject.position.copy(nextPosition);
  }, [
    activeTransformObject,
    buildingOptions,
    contextBoxes,
    getBoxBounds,
    selectedBox,
    selectedId,
  ]);

  const handleTransformChange = useCallback(() => {
    if (!selectedBox || !activeTransformObject) return;
    if (transformMode === "rotate") {
      handleRotateChangeRef();
      return;
    }
    if (transformMode === "translate") {
      handleTranslateChange();
    }
  }, [
    activeTransformObject,
    handleRotateChangeRef,
    handleTranslateChange,
    selectedBox,
    transformMode,
  ]);

  const drawingLinePoints = useMemo(() => {
    if (drawingPoints.length < 2) return null;
    const points = drawingPoints.map((p) => [p[0], p[1] + 0.05, p[2]]);
    return [...points, points[0]];
  }, [drawingPoints]);

  const handleResetView = useCallback(() => {
    if (!controlsRef.current || !initialCameraRef.current) return;
    const { position, target, up } = initialCameraRef.current;
    camera.position.copy(position);
    camera.up.copy(up);
    controlsRef.current.target.copy(target);
    controlsRef.current.update();
    camera.updateProjectionMatrix();
  }, [camera]);

  const handleZoomToFit = useCallback(() => {
    zoomToFit({
      controls: controlsRef.current,
      boxesGroup: boxesGroupRef.current,
      camera,
    });
  }, [camera]);

  const clearFaceSelection = useCallback(() => {
    if (lastFaceRef.current) {
      resetVertexColors(lastFaceRef.current.mesh, lastFaceRef.current.indices);
      lastFaceRef.current = null;
    }
    setFaceArrow(null);
  }, []);

  useEffect(() => {
    if (faceSelectMode) return;
    clearFaceSelection();
  }, [clearFaceSelection, faceSelectMode]);
  const handleGoOnTopRef = useCallback(() => {
    if (!selectedId || !selectedBox) return;
    const currentPosition = activeTransformObject
      ? activeTransformObject.position.clone()
      : new Vector3(...selectedBox.position);
    handleGoOnTop({
      selectedId,
      selectedBox,
      currentPosition,
      rotationY: activeTransformObject?.rotation.y ?? selectedBox.rotationY ?? 0,
      boxes: contextBoxes,
      getBoxBounds,
      getBoxHeight,
      activeTransformObject,
      setBoxes,
    });
  }, [activeTransformObject, contextBoxes, getBoxBounds, getBoxHeight, selectedBox, selectedId, setBoxes]);

  useImperativeHandle(
    ref,
    () => ({
      resetView: handleResetView,
      zoomToFit: handleZoomToFit,
      clearFaceSelection,
      goOnTop: handleGoOnTopRef,
    }),
    [clearFaceSelection, handleGoOnTopRef, handleResetView, handleZoomToFit]
  );

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
      {faceArrow && (
        <ProArrow
          origin={faceArrow.origin}
          direction={faceArrow.direction}
          length={1}
          headLength={0.25}
          headRadius={0.12}
          radius={0.04}
          color={0x22c55e}
        />
      )}
      <EffectComposer autoClear={false}>
        <N8AO
          halfRes
          aoRadius={0.45}
          intensity={0.8}
          distanceFalloff={1}
          denoiseSamples={4}
        />
        <Outline
          selection={outlineSelection}
          visibleEdgeColor="#f59e0b"
          hiddenEdgeColor="#f59e0b"
          edgeStrength={2.4}
          width={600}
          blur
        />
      </EffectComposer>
      <group ref={boxesGroupRef}>
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
              if (geometryEditMode) {
                event.stopPropagation();
                return;
              }
              if (faceSelectMode && boxesGroupRef.current) {
                const hits = raycaster.intersectObject(boxesGroupRef.current, true);
                const hit = hits.find((item) => item.face && item.object.type === "Mesh");
                if (hit) {
                  const normal = getWorldFaceNormal(hit);
                  if (normal) {
                    const origin = getWorldFacePoint(hit);
                    const toCamera = camera.position.clone().sub(origin);
                    if (normal.dot(toCamera) < 0) {
                      normal.negate();
                    }
                    origin.addScaledVector(normal, 0.01);
                    setFaceArrow({ origin, direction: normal });
                  }
                  if (hit.faceIndex !== undefined) {
                    const mesh = hit.object as Mesh;
                    if (lastFaceRef.current) {
                      resetVertexColors(
                        lastFaceRef.current.mesh,
                        lastFaceRef.current.indices
                      );
                    }
                    const selection = selectCoplanarFace(mesh, hit, "#f59e0b", 0.01, 0.02);
                    if (selection) {
                      lastFaceRef.current = selection;
                    }
                  }
                }
              }
              if (!faceSelectMode) {
                setFaceArrow(null);
                if (lastFaceRef.current) {
                  resetVertexColors(
                    lastFaceRef.current.mesh,
                    lastFaceRef.current.indices
                  );
                  lastFaceRef.current = null;
                }
              }
              event.stopPropagation();
              if (event.detail >= 2 && onRequestGeometryEdit) {
                onRequestGeometryEdit();
              }
              const target = objectRefs.current.get(box.id) || event.eventObject || event.object;
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
              if (allowMove) {
                setTransformMode("translate");
              }
            }}
            onPointerOver={(event: any) => {
              if (geometryEditMode || faceSelectMode) return;
              const target = objectRefs.current.get(box.id) || event.eventObject || event.object;
              if (!target) return;
              if (box.id === selectedId) {
                setHoveredObject(null);
              } else {
                setHoveredObject(target);
              }
            }}
            onPointerOut={(event: any) => {
              if (geometryEditMode || faceSelectMode) return;
              const target = objectRefs.current.get(box.id) || event.eventObject || event.object;
              if (hoveredObject && target === hoveredObject) {
                setHoveredObject(null);
              }
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
                enableRaycast={!geometryEditMode}
              />
            ) : box.type === "room" ? (
              <RoomBox
                width={box.width || 3.66}
                height={box.height || 3}
                depth={box.depth || 3.66}
                position={[0, 0, 0]}
                color={box.color || "#D4A574"}
                showMeasurements={box.showMeasurements !== false}
                showHandles={false}
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
      </group>

      {/* TransformControls - disabled for room type to use EditableBoxHandles instead */}
      {(selectedObjectOverride || selectedObject) && (() => {
        const isRoomType = selectedBox?.type === "room";
        const isBuildingType = selectedBox?.type === "building";
        const transformTarget = activeTransformObject;

        // Don't show TransformControls for shape-editable types or geometry edit mode
        if (isRoomType || isBuildingType || geometryEditMode || !transformTarget) return null;

        return (
          <TransformControls
            object={transformTarget}
            mode={transformMode}
            size={1.5}
            space="world"
            showX
            showY
            showZ
            translationSnap={
              buildingOptions.snapToGrid ? Math.max(0.1, buildingOptions.gridSize) : undefined
            }
            rotationSnap={buildingOptions.snapToGrid ? Math.PI / 18 : undefined}
            scaleSnap={buildingOptions.snapToGrid ? 0.1 : undefined}
            enabled={allowMove || transformMode !== "translate"}
            onMouseDown={() => setIsTransforming(true)}
            onMouseUp={() => {
              setIsTransforming(false);
              if (!selectedId) return;
              handleTransformEnd({
                selectedId,
                activeTransformObject: transformTarget,
                setBoxes,
                applyScaleToBox,
              });
            }}
            onDraggingChanged={(dragging: boolean) => {
              setIsTransforming(dragging);
              if (!dragging ) {
                if (!selectedId) return;
                handleTransformEnd({
                  selectedId,
                  activeTransformObject: transformTarget,
                  setBoxes,
                  applyScaleToBox,
                });
              }
            }}
            onObjectChange={handleTransformChange}
          />
        );
      })()}
      <RotationAngleLabel
        transformMode={transformMode}
        selectedBox={selectedBox}
        rotationY={activeTransformObject?.rotation.y ?? selectedBox?.rotationY ?? 0}
        height={selectedBox ? getBoxHeight(selectedBox) : 0}
      />

      {drawingLinePoints && (
        <Line points={drawingLinePoints} color={accent} lineWidth={2} dashed={false} />
      )}

      <BuildingHandles
        selectedBox={selectedBox}
        selectedFootprintVertices={selectedFootprintVertices}
        selectedTopVertices={selectedTopVertices}
        selectedRotationY={selectedRotationY}
        setBoxes={setBoxes}
        allowMove={allowMove}
        transformMode={transformMode}
        showHandles={geometryEditMode}
        rotateXZ={rotateXZ}
        onDragStart={() => setIsTransforming(true)}
        onDragEnd={() => setIsTransforming(false)}
      />
      {geometryEditMode && selectedBox?.type === "room" && selectedRoomVerticesWorld && (
        <EditableBoxHandles
          vertices={selectedRoomVerticesWorld}
          showRotateHandles={transformMode === "rotate"}
          showBoundingBox
          allowTranslate={false}
          onVerticesChange={(newVertices) => {
            const originX = selectedBox.position[0];
            const originZ = selectedBox.position[2];
            const localVertices = newVertices.map((vertex) => {
              const localX = vertex[0] - originX;
              const localZ = vertex[2] - originZ;
              const [rx, rz] = rotateXZ(localX, localZ, selectedRotationY);
              return [rx, vertex[1] - selectedBox.position[1], rz] as [number, number, number];
            });
            updateBoxVertices(selectedBox.id, localVertices);
          }}
          color="#3B82F6"
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
      {showAxes && (
        <group>
          <ProArrow
            origin={[0, 0, 0]}
            direction={[1, 0, 0]}
            length={3.5}
            headLength={0.6}
            headRadius={0.18}
            radius={0.05}
            color={0xef4444}
          />
          <ProArrow
            origin={[0, 0, 0]}
            direction={[0, 1, 0]}
            length={3.5}
            headLength={0.6}
            headRadius={0.18}
            radius={0.05}
            color={0x22c55e}
          />
          <ProArrow
            origin={[0, 0, 0]}
            direction={[0, 0, 1]}
            length={3.5}
            headLength={0.6}
            headRadius={0.18}
            radius={0.05}
            color={0x3b82f6}
          />
        </group>
      )}
      {showGrid && (
        <Grid
          infiniteGrid
          sectionColor="#444"
          cellColor="#666"
          cellSize={0.25}
          sectionSize={2.5}
          fadeDistance={100000}
          fadeStrength={0}
          sectionThickness={0.5}
          cellThickness={0.3}
        />
      )}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewcube
          faces={["right", "left", "top", "bottom", "front", "back"]}
          opacity={0.96}
          color="#9ca3af" // (slate-400)
          strokeColor="#1f2937" // frame color (slate-800)
          textColor="#020617" // text color (slate-900)
          hoverColor="#6b7280" // hover color (slate-500)
        />
      </GizmoHelper>
    </>
  );

  return threeJsScene;
}));

Scene.displayName = "Scene";

export default Scene;
