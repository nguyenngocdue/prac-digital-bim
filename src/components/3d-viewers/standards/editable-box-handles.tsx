"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  shouldBlockTranslate,
  updateTranslateHover,
  updateLineLoop,
  markAsHandle,
} from "./editable-box-handles/utils";
import type { EditablePolygonHandlesProps, DragMode, PendingTranslate } from "./editable-box-handles/types";
import {
  DEFAULT_POLYGON_COLOR,
  MIN_HEIGHT,
  DRAG_THRESHOLD,
} from "./editable-box-handles/constants";
import { createGeometries, disposeGeometries } from "./editable-box-handles/geometries";
import { createMaterials, disposeMaterials } from "./editable-box-handles/materials";
import {
  updateVertexHandles,
  updateEdgeHandles,
  updateHeightHandle,
  updateHandleHover,
  updateAllHandles,
} from "./editable-box-handles/mesh-updaters";
import {
  calculateArea,
  calculateCentroid,
  calculateAverageY,
  createShapeFromVertices,
} from "./editable-box-handles/calculations";

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

  const disposeDragListeners = () => {
    if (!dragDisposersRef.current.length) return;
    dragDisposersRef.current.forEach((dispose) => dispose());
    dragDisposersRef.current = [];
  };

  const finalizeDrag = (pointerId?: number) => {
    if (
      dragIndexRef.current === null &&
      dragEdgeRef.current === null &&
      dragModeRef.current !== "translate" &&
      dragModeRef.current !== "translate-xz" &&
      dragModeRef.current !== "translate-free" &&
      pendingTranslateRef.current === null
    )
      return;
    setDraggedIndex(null);
    setDraggedEdgeIndex(null);
    dragIndexRef.current = null;
    dragEdgeRef.current = null;
    const lastMode = dragModeRef.current;
    dragModeRef.current = null;
    dragStartRef.current = null;
    dragStartVerticesRef.current = null;
    dragStartTopVerticesRef.current = null;
    heightBaseRef.current = null;
    heightStartRef.current = null;
    heightTopRef.current = null;
    translateStartYRef.current = null;
    translateStartPointRef.current = null;
    translateStartXZRef.current = null;
    translateLastXZRef.current = null;
    translateStartXYZRef.current = null;
    translateLastXYZRef.current = null;
    gl.domElement.style.cursor = "auto";
    if (pointerId !== undefined) {
      gl.domElement.releasePointerCapture(pointerId);
    }
    onDragEnd?.();
    disposeDragListeners();
    if (lastMode !== "translate-xz" && lastMode !== "translate-free") {
      const nextVertices = verticesRef.current.map((v) => [v.x, v.y, v.z] as [number, number, number]);
      onVerticesChange(nextVertices);
      if (topVerticesRef.current && onTopVerticesChange) {
        const nextTop = topVerticesRef.current.map((v) => [v.x, v.y, v.z] as [number, number, number]);
        onTopVerticesChange(nextTop);
      }
    }
    if (lastMode === "translate" && onTranslate && translateLastYRef.current !== null) {
      onTranslate(translateLastYRef.current);
      translateLastYRef.current = null;
    }
    if (lastMode === "translate-xz" && onTranslateXZ && translateLastXZRef.current) {
      onTranslateXZ(translateLastXZRef.current[0], translateLastXZRef.current[1]);
      translateLastXZRef.current = null;
    }
    if (lastMode === "translate-free" && onTranslateXYZ && translateLastXYZRef.current) {
      onTranslateXYZ(
        translateLastXYZRef.current[0],
        translateLastXYZRef.current[1],
        translateLastXYZRef.current[2]
      );
      translateLastXYZRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingTranslateRef.current = null;
  };

  const startVertexDrag = (
    index: number,
    planeY: number,
    event: ThreeEvent<PointerEvent>,
    mode: "vertex-bottom" | "vertex-top"
  ) => {
    event.stopPropagation();
    setDraggedIndex(index);
    dragIndexRef.current = index;
    dragModeRef.current = mode;
    
    // Setup drag plane at vertex position
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, planeY, 0)
    );
    
    gl.domElement.style.cursor = "grabbing";
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handlePointerDown = (index: number, event: ThreeEvent<PointerEvent>) => {
    const vertex = vertices[index];
    if (!vertex) return;
    startVertexDrag(index, vertex[1], event, "vertex-bottom");
  };

  const handlePointerDownTop = (index: number, event: ThreeEvent<PointerEvent>) => {
    const vertex = topVerticesRef.current?.[index];
    if (!vertex) return;
    startVertexDrag(index, vertex.y, event, "vertex-top");
  };

  const handleEdgePointerDown = (index: number, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setDraggedEdgeIndex(index);
    dragEdgeRef.current = index;
    dragModeRef.current = "edge-bottom";
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
    const point = verticesRef.current[index];
    const planePoint = point ? point : new THREE.Vector3(0, 0, 0);
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      planePoint
    );
    if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
      dragStartRef.current = intersection.current.clone();
    }
    gl.domElement.style.cursor = "grabbing";
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handleEdgePointerDownTop = (index: number, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setDraggedEdgeIndex(index);
    dragEdgeRef.current = index;
    dragModeRef.current = "edge-top";
    if (!topVerticesRef.current) return;
    dragStartTopVerticesRef.current = topVerticesRef.current.map((v) => v.clone());
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    const point = topVerticesRef.current[index];
    const planePoint = point ? point : new THREE.Vector3(0, 0, 0);
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      planePoint
    );
    if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
      dragStartRef.current = intersection.current.clone();
    }
    gl.domElement.style.cursor = "grabbing";
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handlePointerMoveDom = (event: PointerEvent) => {
    if (
      dragIndexRef.current === null &&
      dragEdgeRef.current === null &&
      dragModeRef.current !== "height" &&
      dragModeRef.current !== "translate" &&
      dragModeRef.current !== "height-bottom" &&
      dragModeRef.current !== "translate-xz" &&
      dragModeRef.current !== "translate-free" &&
      pendingTranslateRef.current === null
    )
      return;
    const rect = gl.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const mouse = new THREE.Vector2(x * 2 - 1, -(y * 2) + 1);
    raycaster.current.setFromCamera(mouse, camera);
    if (!raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
      return;
    }
    if (pendingTranslateRef.current && dragModeRef.current !== "translate-free") {
      const dx = event.clientX - pendingTranslateRef.current.startClientX;
      const dy = event.clientY - pendingTranslateRef.current.startClientY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragModeRef.current = "translate-free";
      dragIndexRef.current = 0;
      setDraggedIndex(0);
      const [centerX, centerY, centerZ] = pendingTranslateRef.current.center;
      dragPlane.current.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()).normalize(),
        new THREE.Vector3(centerX, centerY, centerZ)
      );
      if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
        translateStartPointRef.current = intersection.current.clone();
      }
      translateStartXYZRef.current = [centerX, centerY, centerZ];
      translateLastXYZRef.current = [centerX, centerY, centerZ];
      pendingTranslateRef.current = null;
    }
    if (dragModeRef.current === "translate-free") {
      if (!translateStartPointRef.current || !translateStartXYZRef.current) return;
      const delta = new THREE.Vector3().subVectors(intersection.current, translateStartPointRef.current);
      const start = translateStartXYZRef.current;
      translateLastXYZRef.current = [start[0] + delta.x, start[1] + delta.y, start[2] + delta.z];
      verticesRef.current.forEach((point, index) => {
        const startPoint = dragStartVerticesRef.current?.[index];
        if (!startPoint) return;
        point.copy(startPoint).add(delta);
      });
      if (topVerticesRef.current && dragStartTopVerticesRef.current) {
        topVerticesRef.current.forEach((point, index) => {
          const startPoint = dragStartTopVerticesRef.current?.[index];
          if (!startPoint) return;
          point.copy(startPoint).add(delta);
        });
      }
    } else if (dragModeRef.current === "translate-xz") {
      if (!translateStartPointRef.current || !translateStartXZRef.current) return;
      const deltaX = intersection.current.x - translateStartPointRef.current.x;
      const deltaZ = intersection.current.z - translateStartPointRef.current.z;
      const start = translateStartXZRef.current;
      translateLastXZRef.current = [start[0] + deltaX, start[1] + deltaZ];
      const delta = new THREE.Vector3(deltaX, 0, deltaZ);
      verticesRef.current.forEach((point, index) => {
        const startPoint = dragStartVerticesRef.current?.[index];
        if (!startPoint) return;
        point.copy(startPoint).add(delta);
      });
      if (topVerticesRef.current && dragStartTopVerticesRef.current) {
        topVerticesRef.current.forEach((point, index) => {
          const startPoint = dragStartTopVerticesRef.current?.[index];
          if (!startPoint) return;
          point.copy(startPoint).add(delta);
        });
      }
    } else if (dragModeRef.current === "translate") {
      if (translateStartYRef.current === null || !translateStartPointRef.current) return;
      const deltaY = intersection.current.y - translateStartPointRef.current.y;
      const nextCenterY = translateStartYRef.current + deltaY;
      translateLastYRef.current = nextCenterY;
    } else if (dragModeRef.current === "height") {
      if (!topVerticesRef.current || heightBaseRef.current === null || heightStartRef.current === null) {
        return;
      }
      const deltaY = intersection.current.y - (dragStartRef.current?.y || 0);
      const nextHeight = Math.max(MIN_HEIGHT, heightStartRef.current + deltaY);
      const baseY = heightBaseRef.current;
      topVerticesRef.current.forEach((point, index) => {
        const start = dragStartTopVerticesRef.current?.[index];
        if (!start) return;
        point.set(start.x, baseY + nextHeight, start.z);
      });
    } else if (dragModeRef.current === "height-bottom") {
      if (
        heightStartRef.current === null ||
        heightTopRef.current === null ||
        heightBaseRef.current === null
      ) {
        return;
      }
      const deltaY = intersection.current.y - (dragStartRef.current?.y || 0);
      const nextHeight = Math.max(MIN_HEIGHT, heightStartRef.current - deltaY);
      const nextCenterY = heightTopRef.current - nextHeight / 2;
      translateLastYRef.current = nextCenterY;
    } else if (dragIndexRef.current !== null) {
      const index = dragIndexRef.current;
      const nextPoint = intersection.current;
      if (dragModeRef.current === "vertex-top" && topVerticesRef.current) {
        const topPoint = topVerticesRef.current[index];
        if (!topPoint) return;
        topPoint.set(nextPoint.x, topPoint.y, nextPoint.z);
      } else {
        const point = verticesRef.current[index];
        if (!point) return;
        const delta = new THREE.Vector3(nextPoint.x, point.y, nextPoint.z).sub(point);
        point.set(nextPoint.x, point.y, nextPoint.z);
        if (linkTopToBottom && topVerticesRef.current) {
          const topPoint = topVerticesRef.current[index];
          if (topPoint) {
            topPoint.add(delta);
          }
        }
      }
    } else if (dragEdgeRef.current !== null && dragStartRef.current && dragStartVerticesRef.current) {
      const edgeIndex = dragEdgeRef.current;
      const count = dragStartVerticesRef.current.length;
      const nextIndex = (edgeIndex + 1) % count;
      const delta = new THREE.Vector3().subVectors(intersection.current, dragStartRef.current);
      if (dragModeRef.current === "edge-top" && dragStartTopVerticesRef.current && topVerticesRef.current) {
        const startTop = dragStartTopVerticesRef.current;
        const topEdge = topVerticesRef.current[edgeIndex];
        const topNext = topVerticesRef.current[nextIndex];
        if (topEdge && startTop[edgeIndex]) topEdge.copy(startTop[edgeIndex]).add(delta);
        if (topNext && startTop[nextIndex]) topNext.copy(startTop[nextIndex]).add(delta);
      } else {
        const start = dragStartVerticesRef.current;
        const bottomEdge = verticesRef.current[edgeIndex];
        const bottomNext = verticesRef.current[nextIndex];
        if (bottomEdge && start[edgeIndex]) bottomEdge.copy(start[edgeIndex]).add(delta);
        if (bottomNext && start[nextIndex]) bottomNext.copy(start[nextIndex]).add(delta);
        if (linkTopToBottom && dragStartTopVerticesRef.current && topVerticesRef.current) {
          const startTop = dragStartTopVerticesRef.current;
          const topEdge = topVerticesRef.current[edgeIndex];
          const topNext = topVerticesRef.current[nextIndex];
          if (topEdge && startTop[edgeIndex]) topEdge.copy(startTop[edgeIndex]).add(delta);
          if (topNext && startTop[nextIndex]) topNext.copy(startTop[nextIndex]).add(delta);
        }
      }
    }

    const points = verticesRef.current;
    
    // Update all handles during drag
    updateAllHandles(handlesRef.current, hitRef.current, edgeHandlesRef.current, edgeHitRef.current, points);

    if (topVerticesRef.current) {
      updateAllHandles(
        topHandlesRef.current,
        topHitRef.current,
        topEdgeHandlesRef.current,
        topEdgeHitRef.current,
        topVerticesRef.current
      );
    }

    if (lineRef.current) {
      const geometry = lineRef.current.geometry as THREE.BufferGeometry;
      const position = geometry.getAttribute("position") as THREE.BufferAttribute;
      points.forEach((p, i) => position.setXYZ(i, p.x, p.y, p.z));
      position.needsUpdate = true;
      geometry.computeBoundingSphere();
    }

    if (liveUpdate && rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (dragModeRef.current !== "translate-xz" && dragModeRef.current !== "translate-free") {
          const nextVertices = verticesRef.current.map((v) => [v.x, v.y, v.z] as [number, number, number]);
          onVerticesChange(nextVertices);
          if (topVerticesRef.current && onTopVerticesChange) {
            const nextTop = topVerticesRef.current.map((v) => [v.x, v.y, v.z] as [number, number, number]);
            onTopVerticesChange(nextTop);
          }
        }
        if (dragModeRef.current === "height" && onHeightChange && heightBaseRef.current !== null) {
          const topY = topVerticesRef.current?.[0]?.y;
          if (topY !== undefined) {
            const nextHeight = topY - heightBaseRef.current;
            const nextCenterY = heightBaseRef.current + nextHeight / 2;
            onHeightChange(nextHeight, nextCenterY);
          }
        }
        if (dragModeRef.current === "height-bottom" && onHeightChange && heightTopRef.current !== null) {
          const nextHeight = heightTopRef.current - (translateLastYRef.current ?? heightTopRef.current);
          const nextCenterY = translateLastYRef.current ?? heightTopRef.current - nextHeight / 2;
          onHeightChange(nextHeight, nextCenterY);
        }
        if (dragModeRef.current === "translate" && onTranslate && translateLastYRef.current !== null) {
          onTranslate(translateLastYRef.current);
        }
        if (dragModeRef.current === "translate-xz" && onTranslateXZ && translateLastXZRef.current) {
          onTranslateXZ(translateLastXZRef.current[0], translateLastXZRef.current[1]);
        }
        if (dragModeRef.current === "translate-free" && onTranslateXYZ && translateLastXYZRef.current) {
          onTranslateXYZ(
            translateLastXYZRef.current[0],
            translateLastXYZRef.current[1],
            translateLastXYZRef.current[2]
          );
        }
      });
    }
  };
  
  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    finalizeDrag(event.pointerId);
  };
  
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

  const startTranslateFree = (event: ThreeEvent<PointerEvent>) => {
    if (centerX === undefined || centerY === undefined || centerZ === undefined) return;
    if (shouldBlockTranslate(event)) return;
    event.stopPropagation();
    pendingTranslateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      center: [centerX, centerY, centerZ],
    };
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const attachDragListeners = () => {
    if (dragDisposersRef.current.length) return;
    const target = gl.domElement;
    const handlePointerUpDom = () => finalizeDrag();
    const handleWindowBlur = () => finalizeDrag();
    target.addEventListener("pointermove", handlePointerMoveDom);
    target.addEventListener("pointerup", handlePointerUpDom);
    target.addEventListener("pointercancel", handlePointerUpDom);
    target.addEventListener("pointerleave", handlePointerUpDom);
    target.addEventListener("lostpointercapture", handlePointerUpDom);
    window.addEventListener("pointerup", handlePointerUpDom);
    window.addEventListener("pointercancel", handlePointerUpDom);
    window.addEventListener("blur", handleWindowBlur);
    dragDisposersRef.current = [
      () => target.removeEventListener("pointermove", handlePointerMoveDom),
      () => target.removeEventListener("pointerup", handlePointerUpDom),
      () => target.removeEventListener("pointercancel", handlePointerUpDom),
      () => target.removeEventListener("pointerleave", handlePointerUpDom),
      () => target.removeEventListener("lostpointercapture", handlePointerUpDom),
      () => window.removeEventListener("pointerup", handlePointerUpDom),
      () => window.removeEventListener("pointercancel", handlePointerUpDom),
      () => window.removeEventListener("blur", handleWindowBlur),
    ];
  };

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
          handlePointerDown(event.instanceId, event);
        }}
        onPointerUp={handlePointerUp}
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
              onPointerDown={startTranslateFree}
              onPointerUp={handlePointerUp}
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
              handlePointerDownTop(event.instanceId, event);
            }}
            onPointerUp={handlePointerUp}
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
                  if (!topVerticesRef.current) return;
                  dragModeRef.current = "height";
                  dragIndexRef.current = 0;
                  setDraggedIndex(0);
                  dragStartRef.current = intersection.current.clone();
                  dragStartTopVerticesRef.current = topVerticesRef.current.map((v) => v.clone());
                  const baseY = verticesRef.current[0]?.y ?? 0;
                  heightBaseRef.current = baseY;
                  heightStartRef.current = height;
                  dragPlane.current.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(new THREE.Vector3()).normalize(),
                    heightHandleRef.current?.position || new THREE.Vector3()
                  );
                  if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
                    dragStartRef.current = intersection.current.clone();
                  }
                  gl.domElement.style.cursor = "grabbing";
                  gl.domElement.setPointerCapture(event.pointerId);
                  onDragStart?.();
                  attachDragListeners();
                }}
                onPointerUp={handlePointerUp}
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
          onPointerDown={startTranslateFree}
          onPointerUp={handlePointerUp}
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
              handleEdgePointerDown(event.instanceId, event);
            }}
            onPointerUp={handlePointerUp}
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
                  handleEdgePointerDownTop(event.instanceId, event);
                }}
                onPointerUp={handlePointerUp}
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
                  if (height === undefined) return;
                  const topY = topVerticesRef.current?.[0]?.y;
                  if (topY === undefined) return;
                  dragModeRef.current = "height-bottom";
                  dragIndexRef.current = 0;
                  setDraggedIndex(0);
                  dragStartRef.current = intersection.current.clone();
                  heightStartRef.current = height;
                  heightTopRef.current = topY;
                  heightBaseRef.current = verticesRef.current[0]?.y ?? 0;
                  dragPlane.current.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(new THREE.Vector3()).normalize(),
                    bottomHeightHandleRef.current?.position || new THREE.Vector3()
                  );
                  if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
                    dragStartRef.current = intersection.current.clone();
                  }
                  gl.domElement.style.cursor = "grabbing";
                  gl.domElement.setPointerCapture(event.pointerId);
                  onDragStart?.();
                  attachDragListeners();
                }}
                onPointerUp={handlePointerUp}
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
