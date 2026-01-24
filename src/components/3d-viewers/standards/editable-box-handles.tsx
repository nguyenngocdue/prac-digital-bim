"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface EditablePolygonHandlesProps {
  vertices: [number, number, number][];
  onVerticesChange: (vertices: [number, number, number][]) => void;
  topVertices?: [number, number, number][];
  onTopVerticesChange?: (vertices: [number, number, number][]) => void;
  linkTopToBottom?: boolean;
  height?: number;
  onHeightChange?: (nextHeight: number, nextCenterY: number) => void;
  centerY?: number;
  onTranslate?: (nextCenterY: number) => void;
  centerX?: number;
  centerZ?: number;
  onTranslateXZ?: (nextCenterX: number, nextCenterZ: number) => void;
  onTranslateXYZ?: (nextCenterX: number, nextCenterY: number, nextCenterZ: number) => void;
  color?: string;
  showFill?: boolean;
  showEdgeHandles?: boolean;
  liveUpdate?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

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
  color = "#3B82F6",
  showFill = false,
  showEdgeHandles = true,
  liveUpdate = true,
  onDragStart,
  onDragEnd,
}: EditablePolygonHandlesProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedEdgeIndex, setDraggedEdgeIndex] = useState<number | null>(null);
  const { camera, gl } = useThree();
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersection = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
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
  const dragIndexRef = useRef<number | null>(null);
  const dragEdgeRef = useRef<number | null>(null);
  const dragStartRef = useRef<THREE.Vector3 | null>(null);
  const dragStartVerticesRef = useRef<THREE.Vector3[] | null>(null);
  const dragStartTopVerticesRef = useRef<THREE.Vector3[] | null>(null);
  const dragModeRef = useRef<
    | "vertex-bottom"
    | "vertex-top"
    | "edge-bottom"
    | "edge-top"
    | "height"
    | "translate"
    | "translate-xz"
    | "translate-free"
    | null
  >(null);
  const rafRef = useRef<number | null>(null);
  const heightBaseRef = useRef<number | null>(null);
  const heightStartRef = useRef<number | null>(null);
  const heightTopRef = useRef<number | null>(null);
  const translateStartYRef = useRef<number | null>(null);
  const translateLastYRef = useRef<number | null>(null);
  const translateStartPointRef = useRef<THREE.Vector3 | null>(null);
  const translateStartXZRef = useRef<[number, number] | null>(null);
  const translateLastXZRef = useRef<[number, number] | null>(null);
  const translateStartXYZRef = useRef<[number, number, number] | null>(null);
  const translateLastXYZRef = useRef<[number, number, number] | null>(null);

  const handleGeometry = useMemo(() => new THREE.SphereGeometry(0.28, 16, 16), []);
  const hitGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 8, 8), []);
  const edgeGeometry = useMemo(() => new THREE.SphereGeometry(0.22, 12, 12), []);
  const edgeHitGeometry = useMemo(() => new THREE.SphereGeometry(0.45, 8, 8), []);
  const heightGeometry = useMemo(() => new THREE.SphereGeometry(0.24, 12, 12), []);
  const handleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#FFD700",
        emissiveIntensity: 0.8,
      }),
    []
  );
  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#60A5FA",
        emissive: "#60A5FA",
        emissiveIntensity: 0.6,
      }),
    []
  );
  const hitMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      handleGeometry.dispose();
      hitGeometry.dispose();
      edgeGeometry.dispose();
      edgeHitGeometry.dispose();
      heightGeometry.dispose();
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

  const syncVertices = (
    next: [number, number, number][],
    nextTop?: [number, number, number][]
  ) => {
    verticesRef.current = next.map((v) => new THREE.Vector3(v[0], v[1], v[2]));
    topVerticesRef.current = nextTop
      ? nextTop.map((v) => new THREE.Vector3(v[0], v[1], v[2]))
      : null;
    const points = verticesRef.current;

    if (handlesRef.current && hitRef.current) {
      const temp = new THREE.Matrix4();
      points.forEach((point, index) => {
        temp.makeTranslation(point.x, point.y, point.z);
        handlesRef.current.setMatrixAt(index, temp);
        hitRef.current?.setMatrixAt(index, temp);
      });
      handlesRef.current.instanceMatrix.needsUpdate = true;
      hitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (topVerticesRef.current && topHandlesRef.current && topHitRef.current) {
      const temp = new THREE.Matrix4();
      topVerticesRef.current.forEach((point, index) => {
        temp.makeTranslation(point.x, point.y, point.z);
        topHandlesRef.current.setMatrixAt(index, temp);
        topHitRef.current?.setMatrixAt(index, temp);
      });
      topHandlesRef.current.instanceMatrix.needsUpdate = true;
      topHitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (edgeHandlesRef.current && edgeHitRef.current) {
      const temp = new THREE.Matrix4();
      const count = points.length;
      for (let i = 0; i < count; i += 1) {
        const nextIndex = (i + 1) % count;
        const mid = new THREE.Vector3()
          .addVectors(points[i]!, points[nextIndex]!)
          .multiplyScalar(0.5);
        temp.makeTranslation(mid.x, mid.y, mid.z);
        edgeHandlesRef.current.setMatrixAt(i, temp);
        edgeHitRef.current.setMatrixAt(i, temp);
      }
      edgeHandlesRef.current.instanceMatrix.needsUpdate = true;
      edgeHitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (topVerticesRef.current && topEdgeHandlesRef.current && topEdgeHitRef.current) {
      const temp = new THREE.Matrix4();
      const count = topVerticesRef.current.length;
      for (let i = 0; i < count; i += 1) {
        const nextIndex = (i + 1) % count;
        const mid = new THREE.Vector3()
          .addVectors(topVerticesRef.current[i]!, topVerticesRef.current[nextIndex]!)
          .multiplyScalar(0.5);
        temp.makeTranslation(mid.x, mid.y, mid.z);
        topEdgeHandlesRef.current.setMatrixAt(i, temp);
        topEdgeHitRef.current.setMatrixAt(i, temp);
      }
      topEdgeHandlesRef.current.instanceMatrix.needsUpdate = true;
      topEdgeHitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (topVerticesRef.current && heightHandleRef.current && heightHitRef.current) {
      const center = topVerticesRef.current.reduce(
        (acc, point) => acc.add(point),
        new THREE.Vector3()
      );
      center.multiplyScalar(1 / topVerticesRef.current.length);
      heightHandleRef.current.position.copy(center);
      heightHitRef.current.position.copy(center);
    }
    if (bottomHeightHandleRef.current && bottomHeightHitRef.current) {
      const center = points.reduce((acc, point) => acc.add(point), new THREE.Vector3());
      center.multiplyScalar(1 / points.length);
      bottomHeightHandleRef.current.position.copy(center);
      bottomHeightHitRef.current.position.copy(center);
    }

    if (lineRef.current) {
      const geometry = lineRef.current.geometry as THREE.BufferGeometry;
      const position = geometry.getAttribute("position") as THREE.BufferAttribute;
      points.forEach((point, i) => {
        position.setXYZ(i, point.x, point.y, point.z);
      });
      position.needsUpdate = true;
      geometry.computeBoundingSphere();
    }

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

  const finalizeDrag = (pointerId?: number) => {
    if (
      dragIndexRef.current === null &&
      dragEdgeRef.current === null &&
      dragModeRef.current !== "translate" &&
      dragModeRef.current !== "translate-xz" &&
      dragModeRef.current !== "translate-free"
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
  };

  const handlePointerDown = (index: number, event: ThreeEvent<PointerEvent>) => {
    const vertex = vertices[index];
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
  };

  const handlePointerMoveDom = (event: PointerEvent) => {
    if (
      dragIndexRef.current === null &&
      dragEdgeRef.current === null &&
      dragModeRef.current !== "height" &&
      dragModeRef.current !== "translate" &&
      dragModeRef.current !== "height-bottom" &&
      dragModeRef.current !== "translate-xz" &&
      dragModeRef.current !== "translate-free"
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
      const nextHeight = Math.max(0.5, heightStartRef.current + deltaY);
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
      const nextHeight = Math.max(0.5, heightStartRef.current - deltaY);
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
        topVerticesRef.current[edgeIndex].copy(startTop[edgeIndex]!).add(delta);
        topVerticesRef.current[nextIndex].copy(startTop[nextIndex]!).add(delta);
      } else {
        const start = dragStartVerticesRef.current;
        verticesRef.current[edgeIndex].copy(start[edgeIndex]!).add(delta);
        verticesRef.current[nextIndex].copy(start[nextIndex]!).add(delta);
        if (linkTopToBottom && dragStartTopVerticesRef.current && topVerticesRef.current) {
          const startTop = dragStartTopVerticesRef.current;
          topVerticesRef.current[edgeIndex].copy(startTop[edgeIndex]!).add(delta);
          topVerticesRef.current[nextIndex].copy(startTop[nextIndex]!).add(delta);
        }
      }
    }

    const points = verticesRef.current;
    if (handlesRef.current && hitRef.current) {
      const temp = new THREE.Matrix4();
      points.forEach((p, i) => {
        temp.makeTranslation(p.x, p.y, p.z);
        handlesRef.current.setMatrixAt(i, temp);
        hitRef.current.setMatrixAt(i, temp);
      });
      handlesRef.current.instanceMatrix.needsUpdate = true;
      hitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (topVerticesRef.current && topHandlesRef.current && topHitRef.current) {
      const temp = new THREE.Matrix4();
      topVerticesRef.current?.forEach((p, i) => {
        temp.makeTranslation(p.x, p.y, p.z);
        topHandlesRef.current.setMatrixAt(i, temp);
        topHitRef.current.setMatrixAt(i, temp);
      });
      topHandlesRef.current.instanceMatrix.needsUpdate = true;
      topHitRef.current.instanceMatrix.needsUpdate = true;
    }

    if (topVerticesRef.current && topEdgeHandlesRef.current && topEdgeHitRef.current) {
      const temp = new THREE.Matrix4();
      const count = topVerticesRef.current.length;
      for (let i = 0; i < count; i += 1) {
        const nextIndex = (i + 1) % count;
        const mid = new THREE.Vector3()
          .addVectors(topVerticesRef.current[i]!, topVerticesRef.current[nextIndex]!)
          .multiplyScalar(0.5);
        temp.makeTranslation(mid.x, mid.y, mid.z);
        topEdgeHandlesRef.current.setMatrixAt(i, temp);
        topEdgeHitRef.current.setMatrixAt(i, temp);
      }
      topEdgeHandlesRef.current.instanceMatrix.needsUpdate = true;
      topEdgeHitRef.current.instanceMatrix.needsUpdate = true;
    }
    if (edgeHandlesRef.current && edgeHitRef.current) {
      const temp = new THREE.Matrix4();
      const count = points.length;
      for (let i = 0; i < count; i += 1) {
        const nextIndex = (i + 1) % count;
        const mid = new THREE.Vector3()
          .addVectors(points[i]!, points[nextIndex]!)
          .multiplyScalar(0.5);
        temp.makeTranslation(mid.x, mid.y, mid.z);
        edgeHandlesRef.current.setMatrixAt(i, temp);
        edgeHitRef.current.setMatrixAt(i, temp);
      }
      edgeHandlesRef.current.instanceMatrix.needsUpdate = true;
      edgeHitRef.current.instanceMatrix.needsUpdate = true;
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
  
  // Calculate distances between consecutive vertices
  const getDistance = (v1: [number, number, number], v2: [number, number, number]) => {
    const dx = v2[0] - v1[0];
    const dy = v2[1] - v1[1];
    const dz = v2[2] - v1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };
  
  // Calculate polygon area (2D projection on XZ plane)
  const calculateArea = () => {
    if (vertices.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i][0] * vertices[j][2];
      area -= vertices[j][0] * vertices[i][2];
    }
    return Math.abs(area / 2);
  };
  
  const isDragging = draggedIndex !== null || draggedEdgeIndex !== null;
  const hasTop = Boolean(topVertices && topVertices.length === vertices.length);
  const topFaceShape = useMemo(() => {
    if (!hasTop || !topVertices) return null;
    const shape = new THREE.Shape();
    shape.moveTo(topVertices[0]![0], topVertices[0]![2]);
    for (let i = 1; i < topVertices.length; i += 1) {
      shape.lineTo(topVertices[i]![0], topVertices[i]![2]);
    }
    shape.closePath();
    return shape;
  }, [hasTop, topVertices]);
  const topFaceY = useMemo(() => {
    if (!hasTop || !topVertices) return 0;
    return topVertices.reduce((sum, v) => sum + v[1], 0) / topVertices.length;
  }, [hasTop, topVertices]);
  const bottomFaceShape = useMemo(() => {
    if (vertices.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0]![0], vertices[0]![2]);
    for (let i = 1; i < vertices.length; i += 1) {
      shape.lineTo(vertices[i]![0], vertices[i]![2]);
    }
    shape.closePath();
    return shape;
  }, [vertices]);
  const bottomFaceY = useMemo(() => {
    if (vertices.length === 0) return 0;
    return vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;
  }, [vertices]);
  const bottomCentroid = useMemo(() => {
    if (vertices.length < 3) {
      return new THREE.Vector3(0, bottomFaceY, 0);
    }
    let centroidX = 0;
    let centroidZ = 0;
    let signedArea = 0;
    for (let i = 0; i < vertices.length; i += 1) {
      const j = (i + 1) % vertices.length;
      const x0 = vertices[i]![0];
      const z0 = vertices[i]![2];
      const x1 = vertices[j]![0];
      const z1 = vertices[j]![2];
      const cross = x0 * z1 - x1 * z0;
      signedArea += cross;
      centroidX += (x0 + x1) * cross;
      centroidZ += (z0 + z1) * cross;
    }
    signedArea *= 0.5;
    if (Math.abs(signedArea) > 1e-6) {
      centroidX /= 6 * signedArea;
      centroidZ /= 6 * signedArea;
    } else {
      centroidX = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length;
      centroidZ = vertices.reduce((sum, v) => sum + v[2], 0) / vertices.length;
    }
    return new THREE.Vector3(centroidX, bottomFaceY, centroidZ);
  }, [vertices, bottomFaceY]);

  const startTranslateFree = (event: ThreeEvent<PointerEvent>) => {
    if (centerX === undefined || centerY === undefined || centerZ === undefined) return;
    event.stopPropagation();
    dragModeRef.current = "translate-free";
    dragIndexRef.current = 0;
    setDraggedIndex(0);
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
    dragPlane.current.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).normalize(),
      new THREE.Vector3(centerX, centerY, centerZ)
    );
    if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
      translateStartPointRef.current = intersection.current.clone();
    }
    translateStartXYZRef.current = [centerX, centerY, centerZ];
    translateLastXYZRef.current = [centerX, centerY, centerZ];
    gl.domElement.style.cursor = "grabbing";
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
  };

  useEffect(() => {
    if (!isDragging) return;
    const target = gl.domElement;
    target.addEventListener("pointermove", handlePointerMoveDom);
    const handlePointerUpDom = () => finalizeDrag();
    target.addEventListener("pointerup", handlePointerUpDom);
    return () => {
      target.removeEventListener("pointermove", handlePointerMoveDom);
      target.removeEventListener("pointerup", handlePointerUpDom);
    };
  }, [gl.domElement, isDragging]);

  return (
    <group>
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
                count={vertices.length}
                array={new Float32Array(vertices.flat())}
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
          if (draggedIndex === null) {
            gl.domElement.style.cursor = "grab";
          }
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
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
              if (draggedIndex === null) {
                gl.domElement.style.cursor = "grab";
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
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
      {bottomFaceShape && (
        <mesh
          position={[0, bottomFaceY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={startTranslateFree}
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
        const area = calculateArea();
        let centerX = 0;
        let centerZ = 0;
        let signedArea = 0;
        for (let i = 0; i < vertices.length; i += 1) {
          const j = (i + 1) % vertices.length;
          const x0 = vertices[i]![0];
          const z0 = vertices[i]![2];
          const x1 = vertices[j]![0];
          const z1 = vertices[j]![2];
          const cross = x0 * z1 - x1 * z0;
          signedArea += cross;
          centerX += (x0 + x1) * cross;
          centerZ += (z0 + z1) * cross;
        }
        signedArea *= 0.5;
        if (Math.abs(signedArea) > 1e-6) {
          centerX /= 6 * signedArea;
          centerZ /= 6 * signedArea;
        } else {
          centerX = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length;
          centerZ = vertices.reduce((sum, v) => sum + v[2], 0) / vertices.length;
        }
        const centerY = vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;
        
        return (
          <Html position={[centerX, centerY, centerZ]} center distanceFactor={10}>
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
