"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { updateTranslateHover, updateLineLoop, markAsHandle } from "./editable-box-handles/utils";
import type {
  EditablePolygonHandlesProps,
  DragMode,
  PendingTranslate,
  DragRefs,
} from "./editable-box-handles/types";
import {
  DEFAULT_POLYGON_COLOR,
  HEIGHT_CLICK_STEP,
  MIN_HEIGHT,
} from "./editable-box-handles/constants";
import { createGeometries, disposeGeometries } from "./editable-box-handles/geometries";
import { createMaterials, disposeMaterials } from "./editable-box-handles/materials";
import {
  updateVertexHandles,
  updateEdgeHandles,
  updateHeightHandle,
  updateHandleHover,
  updateHandleActive,
} from "./editable-box-handles/mesh-updaters";
import { createShapeFromVertices, calculateAverageY } from "./editable-box-handles/calculations";
import { createDragHandlers } from "./editable-box-handles/drag-handlers";
import { BoundingBox, BoundingBoxInfo, useBoundingBox } from './editable-box-handles/bounding-box';
import { RotationHandles } from "./editable-box-handles/rotation-handles";
import { PolygonDisplay, AreaLabel } from './editable-box-handles/polygon-display';
import { ProArrow } from "@/components/pro-arrow";
import { PointLabel } from "./editable-box-handles/point-label";

export const EditablePolygonHandles = ({
  vertices,
  onVerticesChange,
  topVertices,
  onTopVerticesChange,
  linkTopToBottom = true,
  height,
  onHeightChange,
  centerY,
  onTranslate,
  centerX,
  centerZ,
  onTranslateXZ,
  onTranslateXYZ,
  color = DEFAULT_POLYGON_COLOR,
  showFill = false,
  showEdgeHandles = true,
  showRotateHandles: showRotateHandlesProp,
  showBoundingBox: showBoundingBoxProp,
  liveUpdate = true,
  allowTranslate = true,
  onDragStart,
  onDragEnd,
}: EditablePolygonHandlesProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedEdgeIndex, setDraggedEdgeIndex] = useState<number | null>(null);
  const [selectedHandleIndex, setSelectedHandleIndex] = useState<number | null>(null);
  const [selectedTopHandleIndex, setSelectedTopHandleIndex] = useState<number | null>(null);
  const [hoveredHandleIndex, setHoveredHandleIndex] = useState<number | null>(null);
  const [hoveredTopHandleIndex, setHoveredTopHandleIndex] = useState<number | null>(null);
  const [, setIsTranslateHover] = useState(false);
  const [showRotateHandles, setShowRotateHandles] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [heightCenters, setHeightCenters] = useState<{
    top?: [number, number, number];
    bottom?: [number, number, number];
  }>({});
  const { camera, gl } = useThree();
  
  // Drag state refs
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersection = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  
  // Mesh refs
  const verticesRef = useRef<THREE.Vector3[]>([]);
  const topVerticesRef = useRef<THREE.Vector3[] | null>(null);
  const lineRef = useRef<THREE.LineLoop>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const handlesRef = useRef<THREE.InstancedMesh>(null);
  const hitRef = useRef<THREE.InstancedMesh>(null);
  const edgeHandlesRef = useRef<THREE.InstancedMesh>(null);
  const edgeHitRef = useRef<THREE.InstancedMesh>(null);
  const topHandlesRef = useRef<THREE.InstancedMesh>(null);
  const topHitRef = useRef<THREE.InstancedMesh>(null);
  const topEdgeHandlesRef = useRef<THREE.InstancedMesh>(null);
  const topEdgeHitRef = useRef<THREE.InstancedMesh>(null);
  const heightHandleRef = useRef<THREE.Mesh>(null);
  const heightHitRef = useRef<THREE.Mesh>(null);
  const bottomHeightHandleRef = useRef<THREE.Mesh>(null);
  const bottomHeightHitRef = useRef<THREE.Mesh>(null);
  const topFaceRef = useRef<THREE.Mesh>(null);
  const bottomFaceRef = useRef<THREE.Mesh>(null);
  
  // Drag operation refs
  const dragIndexRef = useRef<number | null>(null);
  const dragEdgeRef = useRef<number | null>(null);
  const dragStartRef = useRef<THREE.Vector3 | null>(null);
  const dragStartVerticesRef = useRef<THREE.Vector3[] | null>(null);
  const dragStartTopVerticesRef = useRef<THREE.Vector3[] | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const rafRef = useRef<number | null>(null);
  
  // Height drag refs
  const heightBaseRef = useRef<number | null>(null);
  const heightStartRef = useRef<number | null>(null);
  const heightTopRef = useRef<number | null>(null);
  const heightStartClientYRef = useRef<number | null>(null);
  
  // Translate refs
  const translateStartYRef = useRef<number | null>(null);
  const translateLastYRef = useRef<number | null>(null);
  const translateStartPointRef = useRef<THREE.Vector3 | null>(null);
  const translateStartXZRef = useRef<[number, number] | null>(null);
  const translateLastXZRef = useRef<[number, number] | null>(null);
  const translateStartXYZRef = useRef<[number, number, number] | null>(null);
  const translateLastXYZRef = useRef<[number, number, number] | null>(null);
  const rotateStartAngleRef = useRef<number | null>(null);
  const rotateCenterRef = useRef<THREE.Vector3 | null>(null);
  const rotateLockedCenterRef = useRef<THREE.Vector3 | null>(null);
  const rotateLastAngleRef = useRef<number | null>(null);
  const rotateAccumulatedRef = useRef(0);
  const dragMoveRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const rotationAngleRef = useRef(0);
  
  // UI state refs
  const dragDisposersRef = useRef<(() => void)[]>([]);
  const hoverHandleRef = useRef<number | null>(null);
  const hoverTopHandleRef = useRef<number | null>(null);
  const activeHandleRef = useRef<number | null>(null);
  const activeTopHandleRef = useRef<number | null>(null);
  const translateHoverRef = useRef(false);
  const pendingTranslateRef = useRef<PendingTranslate | null>(null);
  const handleScaleRef = useRef(1);
  const lastHandleScaleRef = useRef(1);

  const setCursor = (cursor: string) => {
    gl.domElement.style.cursor = cursor;
  };

  const updateTranslateHoverState = (isActive: boolean) => {
    translateHoverRef.current = isActive;
    updateTranslateHover(isActive, isDragging, setIsTranslateHover, setCursor);
  };

  const setSelectionVisible = (isVisible: boolean) => {
    setShowBoundingBox(isVisible);
    setShowRotateHandles(isVisible);
  };
  const isSelectionControlled = typeof showBoundingBoxProp === "boolean";

  useEffect(() => {
    if (typeof showRotateHandlesProp === "boolean") {
      setShowRotateHandles(showRotateHandlesProp);
    }
  }, [showRotateHandlesProp]);

  useEffect(() => {
    if (typeof showBoundingBoxProp === "boolean") {
      setShowBoundingBox(showBoundingBoxProp);
    }
  }, [showBoundingBoxProp]);

  const handleFacePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!allowTranslate) return;
    dragHandlers.startTranslateFree(event);
  };

  // Create geometries and materials using helper functions
  const { handleGeometry, hitGeometry, edgeGeometry, edgeHitGeometry, heightGeometry, heightHitGeometry } = useMemo(
    () => createGeometries(),
    []
  );
  
  const { handleMaterial, edgeMaterial, hitMaterial } = useMemo(
    () => createMaterials(),
    []
  );

  useEffect(() => {
    return () => {
      if (dragDisposersRef.current.length) {
        dragDisposersRef.current.forEach((dispose) => dispose());
        dragDisposersRef.current = [];
      }
      disposeGeometries(handleGeometry, hitGeometry, edgeGeometry, edgeHitGeometry, heightGeometry, heightHitGeometry);
      handleMaterial.dispose();
      edgeMaterial.dispose();
      hitMaterial.dispose();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    handleGeometry,
    handleMaterial,
    hitGeometry,
    hitMaterial,
    edgeGeometry,
    edgeHitGeometry,
    heightGeometry,
    edgeMaterial,
  ]);

  const isDragging = draggedIndex !== null || draggedEdgeIndex !== null;
  const hasTop = Boolean(topVertices && topVertices.length === vertices.length);

  useEffect(() => {
    markAsHandle(
      handlesRef.current,
      hitRef.current,
      edgeHandlesRef.current,
      edgeHitRef.current,
      topHandlesRef.current,
      topHitRef.current,
      topEdgeHandlesRef.current,
      topEdgeHitRef.current,
      heightHitRef.current,
      bottomHeightHitRef.current
    );
  }, [showBoundingBox, showRotateHandles, vertices.length, hasTop, height]);
  useEffect(() => {
    updateHandleActive(handlesRef.current, activeHandleRef, selectedHandleIndex);
    if (hasTop) {
      updateHandleActive(topHandlesRef.current, activeTopHandleRef, selectedTopHandleIndex);
    }
  }, [hasTop, selectedHandleIndex, selectedTopHandleIndex]);
  useEffect(() => {
    if (showBoundingBox) return;
    setSelectedHandleIndex(null);
    setSelectedTopHandleIndex(null);
  }, [showBoundingBox]);

  const getCenterPoint = (points: THREE.Vector3[]) => {
    if (!points.length) return null;
    const center = points.reduce((acc, point) => acc.add(point), new THREE.Vector3());
    center.multiplyScalar(1 / points.length);
    return [center.x, center.y, center.z] as [number, number, number];
  };

  const syncVertices = (
    next: [number, number, number][],
    nextTop?: [number, number, number][]
  ) => {
    verticesRef.current = next.map((v) => new THREE.Vector3(v[0], v[1], v[2]));
    topVerticesRef.current = nextTop
      ? nextTop.map((v) => new THREE.Vector3(v[0], v[1], v[2]))
      : null;
    const points = verticesRef.current;
    const handleScale = handleScaleRef.current;

    // Update bottom handles
    updateVertexHandles(handlesRef.current, hitRef.current, points, handleScale);

    // Update top handles
    if (topVerticesRef.current) {
      updateVertexHandles(
        topHandlesRef.current,
        topHitRef.current,
        topVerticesRef.current,
        handleScale
      );
    }

    // Update edge handles
    updateEdgeHandles(edgeHandlesRef.current, edgeHitRef.current, points, handleScale);

    // Update top edge handles
    if (topVerticesRef.current) {
      updateEdgeHandles(
        topEdgeHandlesRef.current,
        topEdgeHitRef.current,
        topVerticesRef.current,
        handleScale
      );
    }

    // Update height handles
    if (topVerticesRef.current) {
      updateHeightHandle(heightHandleRef.current, heightHitRef.current, topVerticesRef.current);
    }
    updateHeightHandle(bottomHeightHandleRef.current, bottomHeightHitRef.current, points);
    setHeightCenters({
      top: topVerticesRef.current ? getCenterPoint(topVerticesRef.current) ?? undefined : undefined,
      bottom: getCenterPoint(points) ?? undefined,
    });

    // Update line
    if (lineRef.current) {
      updateLineLoop(lineRef.current, points);
    }

    // Update fill
    if (fillRef.current) {
      const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, p.z)));
      const nextGeometry = new THREE.ShapeGeometry(shape);
      fillRef.current.geometry.dispose();
      fillRef.current.geometry = nextGeometry;
    }
  };

  const getHeightParams = () => {
    const baseY = verticesRef.current.length
      ? Math.min(...verticesRef.current.map((v) => v.y))
      : 0;
    const topY = topVerticesRef.current?.length
      ? Math.max(...topVerticesRef.current.map((v) => v.y))
      : baseY + (height ?? 0);
    return { baseY, topY };
  };

  const nudgeHeight = (direction: "up" | "down") => {
    if (!onHeightChange) return;
    const { baseY, topY } = getHeightParams();
    const currentHeight = Math.max(MIN_HEIGHT, topY - baseY);
    const nextHeight = Math.max(
      MIN_HEIGHT,
      currentHeight + (direction === "up" ? HEIGHT_CLICK_STEP : -HEIGHT_CLICK_STEP)
    );
    const nextCenterY =
      direction === "up"
        ? baseY + nextHeight / 2
        : topY - nextHeight / 2;
    onHeightChange(nextHeight, nextCenterY);
  };


  useEffect(() => {
    if (!vertices.length) return;
    syncVertices(vertices, topVertices);
  }, [showBoundingBox, vertices, topVertices]);
  useEffect(() => {
    if (!showBoundingBox) return;
    const raf = requestAnimationFrame(() => {
      syncVertices(vertices, topVertices);
    });
    return () => cancelAnimationFrame(raf);
  }, [showBoundingBox, vertices, topVertices]);
  useEffect(() => {
    if (!showBoundingBox) return;
    updateHandleActive(handlesRef.current, activeHandleRef, selectedHandleIndex);
    if (hasTop) {
      updateHandleActive(topHandlesRef.current, activeTopHandleRef, selectedTopHandleIndex);
    }
  }, [hasTop, selectedHandleIndex, selectedTopHandleIndex, showBoundingBox]);
  useEffect(() => {
    if (showBoundingBox) return;
    setHoveredHandleIndex(null);
    setHoveredTopHandleIndex(null);
  }, [showBoundingBox]);

  
  // Calculate face shapes and positions
  const topFaceShape = useMemo(
    () => hasTop && topVertices ? createShapeFromVertices(topVertices) : null,
    [hasTop, topVertices]
  );
  
  const topFaceY = useMemo(
    () => hasTop && topVertices ? calculateAverageY(topVertices) : 0,
    [hasTop, topVertices]
  );
  
  const bottomFaceShape = useMemo(
    () => createShapeFromVertices(vertices),
    [vertices]
  );
  
  const bottomFaceY = useMemo(
    () => calculateAverageY(vertices),
    [vertices]
  );
  

  // Use custom hooks for bounding box
  const boundingBox = useBoundingBox(vertices, topVertices, height);

  // CHỈ update rotation center khi KHÔNG đang rotate
  // Nếu đang rotate, giữ nguyên center cũ để geometry xoay quanh điểm cố định
  if (boundingBox && dragModeRef.current !== "rotate") {
    rotateCenterRef.current = boundingBox.center.clone();
  }

  const dragRefs: DragRefs = {
    dragPlane,
    intersection,
    raycaster,
    verticesRef,
    topVerticesRef,
    lineRef,
    fillRef,
    handlesRef,
    hitRef,
    edgeHandlesRef,
    edgeHitRef,
    topHandlesRef,
    topHitRef,
    topEdgeHandlesRef,
    topEdgeHitRef,
    heightHandleRef,
    heightHitRef,
    bottomHeightHandleRef,
    bottomHeightHitRef,
    topFaceRef,
    bottomFaceRef,
    dragIndexRef,
    dragEdgeRef,
    dragStartRef,
    dragStartVerticesRef,
    dragStartTopVerticesRef,
    dragModeRef,
    rafRef,
    heightBaseRef,
    heightStartRef,
    heightTopRef,
    heightStartClientYRef,
    translateStartYRef,
    translateLastYRef,
    translateStartPointRef,
    translateStartXZRef,
    translateLastXZRef,
    translateStartXYZRef,
    translateLastXYZRef,
    rotateStartAngleRef,
    rotateLastAngleRef,
    rotateAccumulatedRef,
    rotateCenterRef,
    rotateLockedCenterRef,
    dragMoveRafRef,
    pendingPointerRef,
    dragDisposersRef,
    hoverHandleRef,
    hoverTopHandleRef,
    translateHoverRef,
    pendingTranslateRef,
  };

  const dragHandlers = createDragHandlers({
    dragRefs,
    gl,
    camera,
    linkTopToBottom,
    liveUpdate,
    height,
    centerX,
    centerY,
    centerZ,
    onVerticesChange,
    onTopVerticesChange,
    onHeightChange,
    onTranslate,
    onTranslateXZ,
    onTranslateXYZ,
    onDragStart,
    onDragEnd,
    setDraggedIndex,
    setDraggedEdgeIndex,
    setCursor,
    handleScaleRef,
    setRotationAngle: (angle) => {
      if (angle === 0 || Math.abs(angle - rotationAngleRef.current) >= 0.1) {
        rotationAngleRef.current = angle;
        setRotationAngle(angle);
      }
    },
    setIsRotating,
  });

  const rotateAxis = useMemo(() => {
    if (!isRotating || !boundingBox) return null;
    const center = rotateLockedCenterRef.current ?? boundingBox.center;
    const minY = boundingBox.box.min.y;
    const maxY = boundingBox.box.max.y;
    const margin = 0.2;
    return new Float32Array([
      center.x, minY - margin, center.z,
      center.x, maxY + margin, center.z,
    ]);
  }, [boundingBox, isRotating]);
  const rotationLabelCenter = useMemo(() => {
    if (!vertices.length) return null;
    const center = vertices.reduce(
      (acc, point) => {
        acc[0] += point[0];
        acc[1] += point[1];
        acc[2] += point[2];
        return acc;
      },
      [0, 0, 0] as [number, number, number]
    );
    const count = vertices.length;
    return [center[0] / count, center[1] / count, center[2] / count] as [number, number, number];
  }, [vertices]);
  const rotationLabelPosition = useMemo(() => {
    if (!boundingBox) return rotationLabelCenter;
    const size = boundingBox.size ?? boundingBox.box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const offset = maxSize * 0.6 + 0.35;
    const dir = new THREE.Vector3()
      .subVectors(camera.position, boundingBox.center)
      .normalize();
    const pos = boundingBox.center.clone().add(dir.multiplyScalar(offset));
    return [pos.x, pos.y, pos.z] as [number, number, number];
  }, [boundingBox, camera.position, rotationLabelCenter]);

  useFrame(() => {
    if (!showBoundingBox) return;
    const center = boundingBox?.center ?? new THREE.Vector3();
    const distance = camera.position.distanceTo(center);
    const scale = Math.min(3, Math.max(0.6, distance / 8));
    if (Math.abs(scale - lastHandleScaleRef.current) < 0.01) return;
    handleScaleRef.current = scale;
    lastHandleScaleRef.current = scale;
    const points = verticesRef.current;
    updateVertexHandles(handlesRef.current, hitRef.current, points, scale);
    updateEdgeHandles(edgeHandlesRef.current, edgeHitRef.current, points, scale);
    if (topVerticesRef.current) {
      updateVertexHandles(topHandlesRef.current, topHitRef.current, topVerticesRef.current, scale);
      updateEdgeHandles(
        topEdgeHandlesRef.current,
        topEdgeHitRef.current,
        topVerticesRef.current,
        scale
      );
    }
  });

  return (
    <group
      onPointerMove={(event) => {
        if (isDragging) return;
        const isOverHandle = event.intersections?.some(
          (hit) => hit.object?.userData?.isHandle
        );
        // Nếu KHÔNG phải handle, cho phép drag
        if (!isOverHandle) {
          updateTranslateHoverState(true);
        } else if (translateHoverRef.current) {
          updateTranslateHoverState(false);
        }
      }}
      onPointerOut={() => {
        if (isDragging) return;
        updateTranslateHoverState(false);
      }}
      onDoubleClick={() => {
        if (isSelectionControlled) return;
        setSelectionVisible(!showBoundingBox);
      }}
      onPointerDown={(event) => {
        if (isDragging) return;
        
        const isOverHandle = event.intersections?.some(
          (hit) => hit.object?.userData?.isHandle
        );
        
        // Nếu KHÔNG phải handle (point, edge, rotation) → cho phép drag
        if (!isOverHandle && allowTranslate) {
          dragHandlers.startTranslateFree(event);
        }
      }}
    >
      {/* Polygon Display */}
      <PolygonDisplay
        vertices={vertices}
        color={color}
        showFill={showFill}
        isDragging={isDragging}
      />

      {/* Bounding Box */}
      <BoundingBox
        vertices={vertices}
        topVertices={topVertices}
        height={height}
        show={showBoundingBox}
        rotationAngle={rotationAngle}
      />
      
      {showBoundingBox && (
      <>
      {/* Vertex handles */}
      <instancedMesh
        ref={handlesRef}
        raycast={() => null}
        onUpdate={() =>
          updateVertexHandles(
            handlesRef.current,
            hitRef.current,
            verticesRef.current,
            handleScaleRef.current
          )
        }
        args={[handleGeometry, handleMaterial, vertices.length]}
      />
      <instancedMesh
        ref={hitRef}
        args={[hitGeometry, hitMaterial, vertices.length]}
        onPointerDown={(event) => {
          if (event.instanceId == null) return;
          setSelectedHandleIndex(event.instanceId);
          setSelectedTopHandleIndex(null);
          updateHandleActive(handlesRef.current, activeHandleRef, event.instanceId);
          dragHandlers.handlePointerDown(event.instanceId, event);
        }}
        onPointerUp={dragHandlers.handlePointerUp}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (event.instanceId != null) {
            updateHandleHover(handlesRef.current, hoverHandleRef, event.instanceId);
            setHoveredHandleIndex(event.instanceId);
          }
          if (draggedIndex === null) {
            gl.domElement.style.cursor = "pointer";
          }
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          updateHandleHover(handlesRef.current, hoverHandleRef, null);
          setHoveredHandleIndex(null);
          if (draggedIndex === null) {
            gl.domElement.style.cursor = "auto";
          }
        }}
      />
      {hasTop && (
        <>
          {topFaceShape && (
            <mesh
              ref={topFaceRef}
              position={[0, topFaceY, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              userData={{ isTranslateFace: true }}
              onPointerDown={handleFacePointerDown}
              onPointerUp={dragHandlers.handlePointerUp}
            >
              <shapeGeometry args={[topFaceShape]} />
              <meshBasicMaterial
                transparent
                opacity={0}
                colorWrite={false}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          <instancedMesh
            ref={topHandlesRef}
            raycast={() => null}
            onUpdate={() => {
              if (topVerticesRef.current) {
                updateVertexHandles(
                  topHandlesRef.current,
                  topHitRef.current,
                  topVerticesRef.current,
                  handleScaleRef.current
                );
              }
            }}
            args={[handleGeometry, handleMaterial, vertices.length]}
          />
          <instancedMesh
            ref={topHitRef}
            args={[hitGeometry, hitMaterial, vertices.length]}
            onPointerDown={(event) => {
              if (event.instanceId == null) return;
              setSelectedTopHandleIndex(event.instanceId);
              setSelectedHandleIndex(null);
              updateHandleActive(topHandlesRef.current, activeTopHandleRef, event.instanceId);
              dragHandlers.handlePointerDownTop(event.instanceId, event);
            }}
            onPointerUp={dragHandlers.handlePointerUp}
            onPointerOver={(event) => {
              event.stopPropagation();
              if (event.instanceId != null) {
                updateHandleHover(topHandlesRef.current, hoverTopHandleRef, event.instanceId);
                setHoveredTopHandleIndex(event.instanceId);
              }
              if (draggedIndex === null) {
                gl.domElement.style.cursor = "pointer";
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              updateHandleHover(topHandlesRef.current, hoverTopHandleRef, null);
              setHoveredTopHandleIndex(null);
              if (draggedIndex === null) {
                gl.domElement.style.cursor = "auto";
              }
            }}
          />
          {typeof height === "number" && (
            <>
              <mesh
                ref={heightHandleRef}
                geometry={heightGeometry}
                material={handleMaterial}
                visible={false}
              />
              <mesh
                ref={heightHitRef}
                geometry={heightHitGeometry}
                material={hitMaterial}
                onPointerDown={(event) => {
                  dragHandlers.handleHeightPointerDown(event);
                }}
                onPointerUp={dragHandlers.handlePointerUp}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "grab";
                  }
                }}
                onPointerOut={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "auto";
                  }
                }}
          />
              {heightCenters.top && (
                <ProArrow
                  origin={heightCenters.top}
                  direction={[0, 1, 0]}
                  length={0.7}
                  headLength={0.25}
                  headRadius={0.08}
                  radius={0.03}
                  color={0x38bdf8}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    dragHandlers.handleHeightPointerDown(event);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    nudgeHeight("up");
                  }}
                  onPointerOver={() => {
                    if (!isDragging) {
                      gl.domElement.style.cursor = "pointer";
                    }
                  }}
                  onPointerOut={() => {
                    if (!isDragging) {
                      gl.domElement.style.cursor = "auto";
                    }
                  }}
                />
              )}
        </>
      )}
      {bottomFaceShape && (
        <mesh
          ref={bottomFaceRef}
          position={[0, bottomFaceY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ isTranslateFace: true }}
          onPointerDown={handleFacePointerDown}
          onPointerUp={dragHandlers.handlePointerUp}
        >
          <shapeGeometry args={[bottomFaceShape]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            colorWrite={false}
            depthTest={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
        </>
      )}
      {showEdgeHandles && vertices.length >= 2 && (
        <>
          <instancedMesh
            ref={edgeHandlesRef}
            raycast={() => null}
            onUpdate={() =>
              updateEdgeHandles(
                edgeHandlesRef.current,
                edgeHitRef.current,
                verticesRef.current,
                handleScaleRef.current
              )
            }
            args={[edgeGeometry, edgeMaterial, vertices.length]}
          />
          <instancedMesh
            ref={edgeHitRef}
            args={[edgeHitGeometry, hitMaterial, vertices.length]}
            onPointerDown={(event) => {
              if (event.instanceId == null) return;
              dragHandlers.handleEdgePointerDown(event.instanceId, event);
            }}
            onPointerUp={dragHandlers.handlePointerUp}
            onPointerOver={(event) => {
              event.stopPropagation();
              if (!isDragging) {
                gl.domElement.style.cursor = "grab";
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              if (!isDragging) {
                gl.domElement.style.cursor = "auto";
              }
            }}
          />
          {hasTop && (
            <>
              <instancedMesh
                ref={topEdgeHandlesRef}
                raycast={() => null}
                onUpdate={() => {
                  if (topVerticesRef.current) {
                    updateEdgeHandles(
                      topEdgeHandlesRef.current,
                      topEdgeHitRef.current,
                      topVerticesRef.current,
                      handleScaleRef.current
                    );
                  }
                }}
                args={[edgeGeometry, edgeMaterial, vertices.length]}
              />
              <instancedMesh
                ref={topEdgeHitRef}
                args={[edgeHitGeometry, hitMaterial, vertices.length]}
                onPointerDown={(event) => {
                  if (event.instanceId == null) return;
                  dragHandlers.handleEdgePointerDownTop(event.instanceId, event);
                }}
                onPointerUp={dragHandlers.handlePointerUp}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "grab";
                  }
                }}
                onPointerOut={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "auto";
                  }
                }}
              />
              <mesh
                ref={bottomHeightHandleRef}
                geometry={heightGeometry}
                material={handleMaterial}
                visible={false}
              />
              <mesh
                ref={bottomHeightHitRef}
                geometry={heightHitGeometry}
                material={hitMaterial}
                onPointerDown={(event) => {
                  dragHandlers.handleBottomHeightPointerDown(event);
                }}
                onPointerUp={dragHandlers.handlePointerUp}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "grab";
                  }
                }}
                onPointerOut={(event) => {
                  event.stopPropagation();
                  if (!isDragging) {
                    gl.domElement.style.cursor = "auto";
                  }
                }}
              />
              {heightCenters.bottom && (
                <group>
                  <mesh
                    position={[
                      heightCenters.bottom[0],
                      heightCenters.bottom[1] - 0.6,
                      heightCenters.bottom[2],
                    ]}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      dragHandlers.handleBottomHeightPointerDown(event);
                    }}
                    onPointerOver={() => {
                      if (!isDragging) {
                        gl.domElement.style.cursor = "pointer";
                      }
                    }}
                    onPointerOut={() => {
                      if (!isDragging) {
                        gl.domElement.style.cursor = "auto";
                      }
                    }}
                  >
                    <boxGeometry args={[0.6, 1.4, 0.6]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                  <ProArrow
                    origin={heightCenters.bottom}
                    direction={[0, -1, 0]}
                    length={0.9}
                    headLength={0.3}
                    headRadius={0.1}
                    radius={0.04}
                    color={0xf97316}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      dragHandlers.handleBottomHeightPointerDown(event);
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      nudgeHeight("down");
                    }}
                    onPointerOver={() => {
                      if (!isDragging) {
                        gl.domElement.style.cursor = "pointer";
                      }
                    }}
                    onPointerOut={() => {
                      if (!isDragging) {
                        gl.domElement.style.cursor = "auto";
                      }
                    }}
                  />
                </group>
              )}
            </>
          )}
        </>
      )}
      </>
      )}

      <RotationHandles
        boundingBox={boundingBox}
        labelPosition={rotationLabelPosition || undefined}
        show={showRotateHandles}
        isDragging={isDragging}
        rotationAngle={rotationAngle}
        onPointerDown={(event) => {
          dragHandlers.handleRotatePointerDown(event);
        }}
        onPointerUp={dragHandlers.handlePointerUp}
        setCursor={setCursor}
      />
      {rotateAxis && (
        <lineSegments frustumCulled={false} renderOrder={11}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rotateAxis, 3]}
              count={rotateAxis.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.9}
            depthTest={false}
            depthWrite={false}
            linewidth={2}
          />
        </lineSegments>
      )}
      <PointLabel
        show={showBoundingBox}
        point={
          (hoveredHandleIndex ?? selectedHandleIndex) != null
            ? verticesRef.current[hoveredHandleIndex ?? selectedHandleIndex!]
            : (hoveredTopHandleIndex ?? selectedTopHandleIndex) != null
              ? topVerticesRef.current?.[hoveredTopHandleIndex ?? selectedTopHandleIndex!]
              : null
        }
        typeLabel={(hoveredHandleIndex ?? selectedHandleIndex) != null ? "vertex" : "top"}
      />
      {showBoundingBox && boundingBox && isRotating && (
        <BoundingBoxInfo
          center={boundingBox.center}
          size={boundingBox.size}
          maxY={boundingBox.box.max.y}
          rotationAngle={rotationAngle}
        />
      )}
      {!isDragging && <AreaLabel vertices={vertices} />}
    </group>
  );
};
// Export với cả 2 tên để tương thích
export const EditableBoxHandles = EditablePolygonHandles;
