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
import { Box3, Vector3 } from "three";
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
import { useBoxContext } from "@/app/contexts/box-context";
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
  showAxes?: boolean;
  showGrid?: boolean;
  allowMove?: boolean;
}

export type SceneHandle = {
  resetView: () => void;
  zoomToFit: () => void;
  clearFaceSelection: () => void;
  goOnTop: () => void;
};

const Scene = memo(forwardRef<SceneHandle, SceneProps>(({ boxes, accent, gltfUrl, resourceMap, showRoomLabels = false, cameras = [], showCameras = false, onCameraClick, selectedCameraId, showGoogleTiles = false, showAxes = true, showGrid = true, allowMove = true }, ref) => {
  const controlsRef = useRef<any>(null);
  const objectRefs = useRef<Map<string, Object3D>>(new Map());
  const { boxes: contextBoxes, setBoxes, selectedId, setSelectedId, transformMode, setTransformMode, drawingPoints, updateBoxVertices, buildingOptions } = useBoxContext();
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedObjectOverride, setSelectedObjectOverride] = useState<Object3D | null>(null);
  const [faceArrow, setFaceArrow] = useState<FaceArrowState | null>(null);
  const boxesGroupRef = useRef<Group | null>(null);
  const lastFaceRef = useRef<FaceSelection | null>(null);
  const transformRafRef = useRef<number | null>(null);
  const initialCameraRef = useRef<{
    position: Vector3;
    target: Vector3;
    up: Vector3;
  } | null>(null);
  const { camera, raycaster } = useThree();

  // Import Three.js components
  const { Grid, OrbitControls, Select, TransformControls, Line, GizmoHelper, GizmoViewcube, Html } =
    require("@react-three/drei");
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
  const getBoxHeight = (box: Box) => {
    if (box.type === "building" && box.height) return box.height;
    if (box.type === "room" && box.height) return box.height;
    if (box.size?.[1]) return box.size[1];
    if (box.height) return box.height;
    return 1;
  };
  const getBoxFootprint = (box: Box): [number, number][] => {
    if (box.footprint?.length) return box.footprint;
    if (box.vertices?.length) {
      return box.vertices.map(([x, , z]) => [x, z]);
    }
    const width = box.size?.[0] ?? box.width ?? 1;
    const depth = box.size?.[2] ?? box.depth ?? 1;
    return [
      [-width / 2, -depth / 2],
      [width / 2, -depth / 2],
      [width / 2, depth / 2],
      [-width / 2, depth / 2],
    ];
  };
  const getBoxBounds = (box: Box, positionOverride?: Vector3, rotationOverride?: number) => {
    const position = positionOverride ?? new Vector3(...box.position);
    const rotationY = rotationOverride ?? box.rotationY ?? 0;
    const points = getBoxFootprint(box);
    const height = getBoxHeight(box);
    if (!points.length) {
      return {
        minX: position.x,
        maxX: position.x,
        minZ: position.z,
        maxZ: position.z,
        minY: position.y - height / 2,
        maxY: position.y + height / 2,
      };
    }
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    points.forEach(([x, z]) => {
      const rx = x * cos - z * sin + position.x;
      const rz = x * sin + z * cos + position.z;
      minX = Math.min(minX, rx);
      maxX = Math.max(maxX, rx);
      minZ = Math.min(minZ, rz);
      maxZ = Math.max(maxZ, rz);
    });
    return {
      minX,
      maxX,
      minZ,
      maxZ,
      minY: position.y - height / 2,
      maxY: position.y + height / 2,
    };
  };
  const rotateXZ = (x: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos - z * sin, x * sin + z * cos] as [number, number];
  };
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
    if (!selectedId || !activeTransformObject) return;
    const { position, rotation, scale } = activeTransformObject;
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
          activeTransformObject.scale.set(1, 1, 1);
        }
        return next;
      })
    );
  };
  const handleTransformChange = useCallback(() => {
    if (!selectedBox || !activeTransformObject) return;
    if (transformMode === "rotate") {
      if (!selectedId) return;
      if (transformRafRef.current !== null) return;
      transformRafRef.current = requestAnimationFrame(() => {
        transformRafRef.current = null;
        const rotationY = activeTransformObject.rotation.y;
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedId ? { ...box, rotationY } : box
          )
        );
      });
      return;
    }
    if (transformMode !== "translate") return;
    let nextPosition = activeTransformObject.position.clone();
    if (buildingOptions.snapToGrid && buildingOptions.gridSize > 0) {
      const gridSize = buildingOptions.gridSize;
      nextPosition.x = Math.round(nextPosition.x / gridSize) * gridSize;
      nextPosition.z = Math.round(nextPosition.z / gridSize) * gridSize;
      if (buildingOptions.allowVertical) {
        nextPosition.y = Math.round(nextPosition.y / gridSize) * gridSize;
      }
    }
    if (buildingOptions.snapToObjects && buildingOptions.snapDistance > 0) {
      const selectedRotation = activeTransformObject.rotation.y;
      const selectedBounds = getBoxBounds(selectedBox, nextPosition, selectedRotation);
      const halfX = (selectedBounds.maxX - selectedBounds.minX) / 2;
      const halfZ = (selectedBounds.maxZ - selectedBounds.minZ) / 2;
      let snappedX = nextPosition.x;
      let snappedZ = nextPosition.z;
      let bestDeltaX = buildingOptions.snapDistance + 1;
      let bestDeltaZ = buildingOptions.snapDistance + 1;
      contextBoxes.forEach((box) => {
        if (box.id === selectedId) return;
        const bounds = getBoxBounds(box);
        const candidateXs = [bounds.minX, bounds.maxX, (bounds.minX + bounds.maxX) / 2];
        const candidateZs = [bounds.minZ, bounds.maxZ, (bounds.minZ + bounds.maxZ) / 2];
        candidateXs.forEach((candidate) => {
          const options = [candidate - halfX, candidate + halfX, candidate];
          options.forEach((option) => {
            const delta = Math.abs(nextPosition.x - option);
            if (delta <= buildingOptions.snapDistance && delta < bestDeltaX) {
              bestDeltaX = delta;
              snappedX = option;
            }
          });
        });
        candidateZs.forEach((candidate) => {
          const options = [candidate - halfZ, candidate + halfZ, candidate];
          options.forEach((option) => {
            const delta = Math.abs(nextPosition.z - option);
            if (delta <= buildingOptions.snapDistance && delta < bestDeltaZ) {
              bestDeltaZ = delta;
              snappedZ = option;
            }
          });
        });
      });
      nextPosition = new Vector3(snappedX, nextPosition.y, snappedZ);
    }
    activeTransformObject.position.copy(nextPosition);
  }, [
    activeTransformObject,
    buildingOptions.allowVertical,
    buildingOptions.gridSize,
    buildingOptions.snapDistance,
    buildingOptions.snapToGrid,
    buildingOptions.snapToObjects,
    contextBoxes,
    getBoxBounds,
    selectedBox,
    selectedId,
    setBoxes,
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
    if (!controlsRef.current || !boxesGroupRef.current) return;
    const box = new Box3().setFromObject(boxesGroupRef.current);
    if (box.isEmpty()) return;
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitOffset = 1.3;
    const fitHeightDistance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    const direction = camera.position.clone().sub(controlsRef.current.target).normalize();
    camera.position.copy(direction.multiplyScalar(distance).add(center));
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
    camera.updateProjectionMatrix();
  }, [camera]);

  const clearFaceSelection = useCallback(() => {
    if (lastFaceRef.current) {
      resetVertexColors(lastFaceRef.current.mesh, lastFaceRef.current.indices);
      lastFaceRef.current = null;
    }
    setFaceArrow(null);
  }, []);
  const handleGoOnTop = useCallback(() => {
    if (!selectedId || !selectedBox) return;
    const currentPosition = activeTransformObject
      ? activeTransformObject.position.clone()
      : new Vector3(...selectedBox.position);
    const selectedBounds = getBoxBounds(
      selectedBox,
      currentPosition,
      activeTransformObject?.rotation.y ?? selectedBox.rotationY ?? 0
    );
    const selectedHeight = getBoxHeight(selectedBox);
    let targetTop = 0;
    contextBoxes.forEach((box) => {
      if (box.id === selectedId) return;
      const bounds = getBoxBounds(box);
      const overlaps =
        selectedBounds.maxX >= bounds.minX &&
        selectedBounds.minX <= bounds.maxX &&
        selectedBounds.maxZ >= bounds.minZ &&
        selectedBounds.minZ <= bounds.maxZ;
      if (overlaps) {
        targetTop = Math.max(targetTop, bounds.maxY);
      }
    });
    const nextY = targetTop + selectedHeight / 2;
    if (activeTransformObject) {
      activeTransformObject.position.y = nextY;
    }
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === selectedId
          ? {
              ...box,
              position: [currentPosition.x, nextY, currentPosition.z],
            }
          : box
      )
    );
  }, [activeTransformObject, contextBoxes, getBoxBounds, getBoxHeight, selectedBox, selectedId, setBoxes]);

  useImperativeHandle(
    ref,
    () => ({
      resetView: handleResetView,
      zoomToFit: handleZoomToFit,
      clearFaceSelection,
      goOnTop: handleGoOnTop,
    }),
    [clearFaceSelection, handleGoOnTop, handleResetView, handleZoomToFit]
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
                event.stopPropagation();
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
        </Select>
      </group>

      {/* TransformControls - disabled for room type to use EditableBoxHandles instead */}
      {(selectedObjectOverride || selectedObject) && (() => {
        const isRoomType = selectedBox?.type === "room";
        const isBuildingType = selectedBox?.type === "building";
        const transformTarget = activeTransformObject;

        // Don't show TransformControls for shape-editable types
        if (isRoomType || isBuildingType || !transformTarget) return null;

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
              handleTransformEnd();
            }}
            onDraggingChanged={(dragging: boolean) => {
              setIsTransforming(dragging);
              if (!dragging ) {
                handleTransformEnd();
              }
            }}
            onObjectChange={handleTransformChange}
          />
        );
      })()}
      {transformMode === "rotate" && selectedBox && (
        <Html
          position={[
            selectedBox.position[0],
            selectedBox.position[1] + getBoxHeight(selectedBox) / 2 + 0.2,
            selectedBox.position[2],
          ]}
          occlude={false}
          zIndexRange={[1000, 0]}
          distanceFactor={8}
          center
        >
          <div className="pointer-events-none rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            {Math.round(
              (((activeTransformObject?.rotation.y ?? selectedBox.rotationY ?? 0) * 180) / Math.PI)
            )}
            °
          </div>
        </Html>
      )}

      {drawingLinePoints && (
        <Line points={drawingLinePoints} color={accent} lineWidth={2} dashed={false} />
      )}

      {selectedBox?.type === "building" && selectedFootprintVertices && (
        <EditableBoxHandles
          vertices={selectedFootprintVertices}
          topVertices={selectedTopVertices || undefined}
          showRotateHandles={transformMode === "rotate"}
          showBoundingBox={transformMode === "rotate"}
          onTopVerticesChange={(newVertices) => {
            const originX = selectedBox.position[0];
            const originZ = selectedBox.position[2];
            const topFootprint = newVertices.map((vertex) => [
              ...rotateXZ(vertex[0] - originX, vertex[2] - originZ, selectedRotationY),
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
              ...rotateXZ(vertex[0] - originX, vertex[2] - originZ, selectedRotationY),
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
          allowTranslate={allowMove}
          onDragStart={() => setIsTransforming(true)}
          onDragEnd={() => setIsTransforming(false)}
        />
      )}
      {selectedBox?.type === "room" && selectedRoomVerticesWorld && (
        <EditableBoxHandles
          vertices={selectedRoomVerticesWorld}
          showRotateHandles={transformMode === "rotate"}
          showBoundingBox={transformMode === "rotate"}
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
