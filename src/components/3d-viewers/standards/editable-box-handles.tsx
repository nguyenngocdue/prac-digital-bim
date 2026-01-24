"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { updateTranslateHover, updateLineLoop, markAsHandle } from "./editable-box-handles/utils";
import type {
  EditablePolygonHandlesProps,
  DragMode,
  PendingTranslate,
  DragRefs,
} from "./editable-box-handles/types";
import { DEFAULT_POLYGON_COLOR } from "./editable-box-handles/constants";
import { createGeometries, disposeGeometries } from "./editable-box-handles/geometries";
import { createMaterials, disposeMaterials } from "./editable-box-handles/materials";
import {
  updateVertexHandles,
  updateEdgeHandles,
  updateHeightHandle,
  updateHandleHover,
} from "./editable-box-handles/mesh-updaters";
import { createShapeFromVertices, calculateAverageY } from "./editable-box-handles/calculations";
import { createDragHandlers } from "./editable-box-handles/drag-handlers";
import { BoundingBox, BoundingBoxInfo, useBoundingBox } from './editable-box-handles/bounding-box';
import { RotationHandles } from "./editable-box-handles/rotation-handles";
import { PolygonDisplay, AreaLabel } from './editable-box-handles/polygon-display';

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
  liveUpdate = true,
  onDragStart,
  onDragEnd,
}: EditablePolygonHandlesProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedEdgeIndex, setDraggedEdgeIndex] = useState<number | null>(null);
  const [, setIsTranslateHover] = useState(false);
  const [showRotateHandles, setShowRotateHandles] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
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
  const dragMoveRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const rotationAngleRef = useRef(0);
  
  // UI state refs
  const dragDisposersRef = useRef<(() => void)[]>([]);
  const hoverHandleRef = useRef<number | null>(null);
  const hoverTopHandleRef = useRef<number | null>(null);
  const translateHoverRef = useRef(false);
  const pendingTranslateRef = useRef<PendingTranslate | null>(null);

  const setCursor = (cursor: string) => {
    gl.domElement.style.cursor = cursor;
  };

  const updateTranslateHoverState = (isActive: boolean) => {
    translateHoverRef.current = isActive;
    updateTranslateHover(isActive, isDragging, setIsTranslateHover, setCursor);
  };

  const activateSelection = () => {
    setShowBoundingBox(true);
    setShowRotateHandles(true);
  };

  const handleFacePointerDown = (event: ThreeEvent<PointerEvent>) => {
    activateSelection();
    dragHandlers.startTranslateFree(event);
  };

  // Create geometries and materials using helper functions
  const { handleGeometry, hitGeometry, edgeGeometry, edgeHitGeometry, heightGeometry } = useMemo(
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
      disposeGeometries(handleGeometry, hitGeometry, edgeGeometry, edgeHitGeometry, heightGeometry);
      disposeMaterials(handleMaterial, edgeMaterial, hitMaterial);
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
  }, []);

  const syncVertices = (
    next: [number, number, number][],
    nextTop?: [number, number, number][]
  ) => {
    verticesRef.current = next.map((v) => new THREE.Vector3(v[0], v[1], v[2]));
    topVerticesRef.current = nextTop
      ? nextTop.map((v) => new THREE.Vector3(v[0], v[1], v[2]))
      : null;
    const points = verticesRef.current;

    // Update bottom handles
    updateVertexHandles(handlesRef.current, hitRef.current, points);

    // Update top handles
    if (topVerticesRef.current) {
      updateVertexHandles(topHandlesRef.current, topHitRef.current, topVerticesRef.current);
    }

    // Update edge handles
    updateEdgeHandles(edgeHandlesRef.current, edgeHitRef.current, points);

    // Update top edge handles
    if (topVerticesRef.current) {
      updateEdgeHandles(topEdgeHandlesRef.current, topEdgeHitRef.current, topVerticesRef.current);
    }

    // Update height handles
    if (topVerticesRef.current) {
      updateHeightHandle(heightHandleRef.current, heightHitRef.current, topVerticesRef.current);
    }
    updateHeightHandle(bottomHeightHandleRef.current, bottomHeightHitRef.current, points);

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

  useEffect(() => {
    if (!vertices.length) return;
    syncVertices(vertices, topVertices);
  }, [vertices, topVertices]);

  const isDragging = draggedIndex !== null || draggedEdgeIndex !== null;
  const hasTop = Boolean(topVertices && topVertices.length === vertices.length);
  
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
    translateStartYRef,
    translateLastYRef,
    translateStartPointRef,
    translateStartXZRef,
    translateLastXZRef,
    translateStartXYZRef,
    translateLastXYZRef,
    rotateStartAngleRef,
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
      onPointerDown={(event) => {
        if (isDragging) return;
        
        const isOverHandle = event.intersections?.some(
          (hit) => hit.object?.userData?.isHandle
        );
        
        // Nếu KHÔNG phải handle (point, edge, rotation) → cho phép drag
        if (!isOverHandle) {
          activateSelection();
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
      
      {/* Vertex handles */}
      <instancedMesh
        ref={handlesRef}
        args={[handleGeometry, handleMaterial, vertices.length]}
      />
      <instancedMesh
        ref={hitRef}
        args={[hitGeometry, hitMaterial, vertices.length]}
        onPointerDown={(event) => {
          if (event.instanceId == null) return;
          activateSelection();
          dragHandlers.handlePointerDown(event.instanceId, event);
        }}
        onPointerUp={dragHandlers.handlePointerUp}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (event.instanceId != null) {
            updateHandleHover(handlesRef.current, hoverHandleRef, event.instanceId);
          }
          if (draggedIndex === null) {
            gl.domElement.style.cursor = "pointer";
          }
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          updateHandleHover(handlesRef.current, hoverHandleRef, null);
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
            args={[handleGeometry, handleMaterial, vertices.length]}
          />
          <instancedMesh
            ref={topHitRef}
            args={[hitGeometry, hitMaterial, vertices.length]}
            onPointerDown={(event) => {
              if (event.instanceId == null) return;
              activateSelection();
              dragHandlers.handlePointerDownTop(event.instanceId, event);
            }}
            onPointerUp={dragHandlers.handlePointerUp}
            onPointerOver={(event) => {
              event.stopPropagation();
              if (event.instanceId != null) {
                updateHandleHover(topHandlesRef.current, hoverTopHandleRef, event.instanceId);
              }
              if (draggedIndex === null) {
                gl.domElement.style.cursor = "pointer";
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              updateHandleHover(topHandlesRef.current, hoverTopHandleRef, null);
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
              />
              <mesh
                ref={heightHitRef}
                geometry={hitGeometry}
                material={hitMaterial}
                onPointerDown={(event) => {
                  activateSelection();
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
            args={[edgeGeometry, edgeMaterial, vertices.length]}
          />
          <instancedMesh
            ref={edgeHitRef}
            args={[edgeHitGeometry, hitMaterial, vertices.length]}
            onPointerDown={(event) => {
              if (event.instanceId == null) return;
              activateSelection();
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
                args={[edgeGeometry, edgeMaterial, vertices.length]}
              />
              <instancedMesh
                ref={topEdgeHitRef}
                args={[edgeHitGeometry, hitMaterial, vertices.length]}
                onPointerDown={(event) => {
                  if (event.instanceId == null) return;
                  activateSelection();
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
              />
              <mesh
                ref={bottomHeightHitRef}
                geometry={hitGeometry}
                material={hitMaterial}
                onPointerDown={(event) => {
                  activateSelection();
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
            </>
          )}
        </>
      )}

      <RotationHandles
        boundingBox={boundingBox}
        show={showRotateHandles}
        isDragging={isDragging}
        rotationAngle={rotationAngle}
        onPointerDown={(event) => {
          activateSelection();
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
