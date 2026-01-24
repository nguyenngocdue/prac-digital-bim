"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
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
import {
  calculateArea,
  calculateCentroid,
  calculateAverageY,
  createShapeFromVertices,
} from "./editable-box-handles/calculations";
import { createDragHandlers } from "./editable-box-handles/drag-handlers";

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
  const [isTranslateHover, setIsTranslateHover] = useState(false);
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
  
  const bottomCentroid = useMemo(
    () => calculateCentroid(vertices, bottomFaceY),
    [vertices, bottomFaceY]
  );

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
  });

  return (
    <group
      onPointerMove={(event) => {
        if (isDragging) return;
        const isOverHandle = event.intersections?.some(
          (hit) => hit.object?.userData?.isHandle
        );
        const isOverFace = event.intersections?.some(
          (hit) => hit.object?.userData?.isTranslateFace
        );
        if (!isOverHandle && isOverFace) {
          updateTranslateHoverState(true);
        } else if (translateHoverRef.current) {
          updateTranslateHoverState(false);
        }
      }}
      onPointerOut={() => {
        if (isDragging) return;
        updateTranslateHoverState(false);
      }}
    >
      {/* Polygon shape */}
      {vertices.length >= 2 && (
        <>
          {/* Fill */}
          {!isDragging && showFill && vertices.length >= 3 && (
            <mesh ref={fillRef}>
              <shapeGeometry
                args={[new THREE.Shape(vertices.map((v) => new THREE.Vector2(v[0], v[2])))]}
              />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          
          {/* Edges */}
          <lineLoop ref={lineRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(vertices.flat()), 3]}
                count={vertices.length}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} />
          </lineLoop>
        </>
      )}
      
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
              position={[0, topFaceY, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              userData={{ isTranslateFace: true }}
              onPointerDown={dragHandlers.startTranslateFree}
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
                onPointerDown={dragHandlers.handleHeightPointerDown}
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
          position={[0, bottomFaceY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ isTranslateFace: true }}
          onPointerDown={dragHandlers.startTranslateFree}
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
      {bottomFaceShape && isTranslateHover && (
        <Html position={[bottomCentroid.x, bottomCentroid.y, bottomCentroid.z]} center>
          <div className="pointer-events-none flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-md">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v18M3 12h18" strokeLinecap="round" />
              <path d="M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2" strokeLinecap="round" />
            </svg>
          </div>
        </Html>
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
                onPointerDown={dragHandlers.handleBottomHeightPointerDown}
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
      
      {/* Area label in center */}
      {vertices.length >= 3 && !isDragging && (() => {
        const area = calculateArea(vertices);
        const centroid = calculateCentroid(vertices, bottomFaceY);
        
        return (
          <Html position={[centroid.x, centroid.y, centroid.z]} center distanceFactor={10}>
            <div className="rounded bg-blue-500 px-3 py-2 text-sm font-bold text-white pointer-events-none shadow-lg">
              {area.toFixed(1)} m²
            </div>
          </Html>
        );
      })()}
    </group>
  );
};
// Export với cả 2 tên để tương thích
export const EditableBoxHandles = EditablePolygonHandles;
