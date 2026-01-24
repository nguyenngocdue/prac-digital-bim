import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  DRAG_SENSITIVITY,
  DRAG_SMOOTHING,
  DRAG_THRESHOLD,
  HEIGHT_DRAG_SENSITIVITY,
  MIN_HEIGHT,
} from "./constants";
import { updateAllHandles } from "./mesh-updaters";
import { updateLineLoop } from "./utils";
import type { DragMode, DragRefs } from "./types";

type DragHandlerParams = {
  dragRefs: DragRefs;
  gl: THREE.WebGLRenderer;
  camera: THREE.Camera;
  linkTopToBottom: boolean;
  liveUpdate: boolean;
  height?: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
  onVerticesChange: (vertices: [number, number, number][]) => void;
  onTopVerticesChange?: (vertices: [number, number, number][]) => void;
  onHeightChange?: (nextHeight: number, nextCenterY: number) => void;
  onTranslate?: (nextCenterY: number) => void;
  onTranslateXZ?: (nextCenterX: number, nextCenterZ: number) => void;
  onTranslateXYZ?: (nextCenterX: number, nextCenterY: number, nextCenterZ: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  setDraggedIndex: (value: number | null) => void;
  setDraggedEdgeIndex: (value: number | null) => void;
  setCursor: (cursor: string) => void;
  setRotationAngle?: (angle: number) => void;
  setIsRotating?: (value: boolean) => void;
};

export type DragHandlers = {
  handlePointerDown: (index: number, event: ThreeEvent<PointerEvent>) => void;
  handlePointerDownTop: (index: number, event: ThreeEvent<PointerEvent>) => void;
  handleEdgePointerDown: (index: number, event: ThreeEvent<PointerEvent>) => void;
  handleEdgePointerDownTop: (index: number, event: ThreeEvent<PointerEvent>) => void;
  handlePointerUp: (event: ThreeEvent<PointerEvent>) => void;
  startTranslateFree: (event: ThreeEvent<PointerEvent>) => void;
  handleHeightPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  handleBottomHeightPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  handleRotatePointerDown: (event: ThreeEvent<PointerEvent>) => void;
};

export const createDragHandlers = (params: DragHandlerParams): DragHandlers => {
  const smoothedIntersection = new THREE.Vector3();
  let hasSmoothIntersection = false;
  const {
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
    setRotationAngle,
    setIsRotating,
  } = params;

  const {
    dragPlane,
    intersection,
    raycaster,
    verticesRef,
    topVerticesRef,
    lineRef,
    handlesRef,
    hitRef,
    edgeHandlesRef,
    edgeHitRef,
    topHandlesRef,
    topHitRef,
    topEdgeHandlesRef,
    topEdgeHitRef,
    heightHandleRef,
    bottomHeightHandleRef,
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
    rotateCenterRef,
    rotateLockedCenterRef,
    dragMoveRafRef,
    pendingPointerRef,
    dragDisposersRef,
    pendingTranslateRef,
  } = dragRefs;

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
    heightStartClientYRef.current = null;
    translateStartYRef.current = null;
    translateStartPointRef.current = null;
    translateStartXZRef.current = null;
    translateLastXZRef.current = null;
    translateStartXYZRef.current = null;
    translateLastXYZRef.current = null;
    rotateStartAngleRef.current = null;
    rotateLockedCenterRef.current = null; // Clear locked center
    if (dragMoveRafRef.current !== null) {
      cancelAnimationFrame(dragMoveRafRef.current);
      dragMoveRafRef.current = null;
    }
    pendingPointerRef.current = null;
    hasSmoothIntersection = false;
    
    // Reset rotation angle display
    if (setRotationAngle) {
      setRotationAngle(0);
    }
    if (setIsRotating) {
      setIsRotating(false);
    }
    
    setCursor("auto");
    if (pointerId !== undefined) {
      gl.domElement.releasePointerCapture(pointerId);
    }
    onDragEnd?.();
    disposeDragListeners();
    if (lastMode !== "translate-xz" && lastMode !== "translate-free") {
      const nextVertices = verticesRef.current.map(
        (v) => [v.x, v.y, v.z] as [number, number, number]
      );
      onVerticesChange(nextVertices);
      if (topVerticesRef.current && onTopVerticesChange) {
        const nextTop = topVerticesRef.current.map(
          (v) => [v.x, v.y, v.z] as [number, number, number]
        );
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

  const startVertexDrag = (
    index: number,
    planeY: number,
    event: ThreeEvent<PointerEvent>,
    mode: Extract<DragMode, "vertex-bottom" | "vertex-top">
  ) => {
    event.stopPropagation();
    setDraggedIndex(index);
    dragIndexRef.current = index;
    dragModeRef.current = mode;

    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, planeY, 0)
    );

    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handlePointerDown = (index: number, event: ThreeEvent<PointerEvent>) => {
    const vertex = verticesRef.current[index];
    if (!vertex) return;
    startVertexDrag(index, vertex.y, event, "vertex-bottom");
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
    setCursor("grabbing");
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
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const getHeightDeltaFromScreen = (clientY: number) => {
    if (heightStartClientYRef.current === null) return 0;
    const targetPosition =
      dragModeRef.current === "height"
        ? heightHandleRef.current?.position
        : bottomHeightHandleRef.current?.position;
    const targetDistance = targetPosition
      ? targetPosition.distanceTo(camera.position)
      : camera.position.length();
    let worldPerPixel = 0.001;
    if ("isPerspectiveCamera" in camera && camera.isPerspectiveCamera) {
      const perspective = camera as THREE.PerspectiveCamera;
      const vFov = THREE.MathUtils.degToRad(perspective.fov);
      worldPerPixel = (2 * Math.tan(vFov / 2) * targetDistance) / gl.domElement.clientHeight;
    } else if ("isOrthographicCamera" in camera && camera.isOrthographicCamera) {
      const orthographic = camera as THREE.OrthographicCamera;
      worldPerPixel = (orthographic.top - orthographic.bottom) / gl.domElement.clientHeight;
    }
    const deltaPixels = heightStartClientYRef.current - clientY;
    return deltaPixels * worldPerPixel * HEIGHT_DRAG_SENSITIVITY;
  };

  const applyPointerMove = (clientX: number, clientY: number) => {
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
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const mouse = new THREE.Vector2(x * 2 - 1, -(y * 2) + 1);
    raycaster.current.setFromCamera(mouse, camera);
    
    // Luôn tính intersection với plane, không cần check face
    if (!raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
      if (dragModeRef.current !== "height" && dragModeRef.current !== "height-bottom") {
        return;
      }
    }
    if (!hasSmoothIntersection) {
      smoothedIntersection.copy(intersection.current);
      hasSmoothIntersection = true;
    } else {
      smoothedIntersection.lerp(intersection.current, DRAG_SMOOTHING);
    }
    intersection.current.copy(smoothedIntersection);
    
    if (pendingTranslateRef.current && dragModeRef.current !== "translate-free") {
      const dx = clientX - pendingTranslateRef.current.startClientX;
      const dy = clientY - pendingTranslateRef.current.startClientY;
      // Threshold thấp hơn để dễ drag
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      
      // Chuyển sang mode translate-free (legacy support nếu có pending)
      dragModeRef.current = "translate-free";
      dragIndexRef.current = 0;
      setDraggedIndex(0);
      const [centerXValue, centerYValue, centerZValue] = pendingTranslateRef.current.center;
      // Sử dụng plane song song với camera để drag mượt hơn
      const cameraDirection = camera.getWorldDirection(new THREE.Vector3()).normalize();
      dragPlane.current.setFromNormalAndCoplanarPoint(
        cameraDirection,
        new THREE.Vector3(centerXValue, centerYValue, centerZValue)
      );
      if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
        translateStartPointRef.current = intersection.current.clone();
      }
      translateStartXYZRef.current = [centerXValue, centerYValue, centerZValue];
      translateLastXYZRef.current = [centerXValue, centerYValue, centerZValue];
      pendingTranslateRef.current = null;
    }
    
    
    if (dragModeRef.current === "rotate") {
      if (
        rotateStartAngleRef.current === null ||
        !rotateLockedCenterRef.current ||
        !dragStartVerticesRef.current
      )
        return;
      
      // Lấy LOCKED center - không thay đổi trong quá trình rotate
      const center = rotateLockedCenterRef.current;
      
      // Tính góc hiện tại từ center đến vị trí chuột
      const current = new THREE.Vector2(
        intersection.current.x - center.x,
        intersection.current.z - center.z
      );
      const angle = Math.atan2(current.y, current.x);
      const delta = angle - rotateStartAngleRef.current;
      const angleDegrees = (delta * 180) / Math.PI;
      
      // Update rotation angle display
      if (setRotationAngle) {
        setRotationAngle(angleDegrees);
      }
      
      // Rotation matrix quanh tâm CỐ ĐỊNH
      const cos = Math.cos(delta);
      const sin = Math.sin(delta);
      
      // Xoay vertices quanh locked center
      verticesRef.current.forEach((point, index) => {
        const startPoint = dragStartVerticesRef.current?.[index];
        if (!startPoint) return;
        
        // Vector từ center đến điểm ban đầu
        const dx = startPoint.x - center.x;
        const dz = startPoint.z - center.z;
        
        // Áp dụng rotation matrix, giữ nguyên Y
        point.set(
          center.x + dx * cos - dz * sin,
          startPoint.y,
          center.z + dx * sin + dz * cos
        );
      });
      
      // Xoay top vertices nếu có
      if (topVerticesRef.current && dragStartTopVerticesRef.current) {
        topVerticesRef.current.forEach((point, index) => {
          const startPoint = dragStartTopVerticesRef.current?.[index];
          if (!startPoint) return;
          const dx = startPoint.x - center.x;
          const dz = startPoint.z - center.z;
          point.set(
            center.x + dx * cos - dz * sin,
            startPoint.y,
            center.z + dx * sin + dz * cos
          );
        });
      }
    } else if (dragModeRef.current === "translate-free") {
      if (!translateStartPointRef.current || !translateStartXYZRef.current) return;
      const delta = new THREE.Vector3()
        .subVectors(intersection.current, translateStartPointRef.current)
        .multiplyScalar(DRAG_SENSITIVITY);
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
      const deltaX = (intersection.current.x - translateStartPointRef.current.x) * DRAG_SENSITIVITY;
      const deltaZ = (intersection.current.z - translateStartPointRef.current.z) * DRAG_SENSITIVITY;
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
      const deltaY = (intersection.current.y - translateStartPointRef.current.y) * DRAG_SENSITIVITY;
      const nextCenterY = translateStartYRef.current + deltaY;
      translateLastYRef.current = nextCenterY;
    } else if (dragModeRef.current === "height") {
      if (!topVerticesRef.current || heightBaseRef.current === null || heightStartRef.current === null) {
        return;
      }
      const deltaY = getHeightDeltaFromScreen(clientY);
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
        heightBaseRef.current === null ||
        !dragStartVerticesRef.current
      ) {
        return;
      }
      const deltaY = getHeightDeltaFromScreen(clientY);
      const nextHeight = Math.max(MIN_HEIGHT, heightStartRef.current - deltaY);
      const nextBaseY = heightTopRef.current - nextHeight;
      translateLastYRef.current = nextBaseY;
      verticesRef.current.forEach((point, index) => {
        const start = dragStartVerticesRef.current?.[index];
        if (!start) return;
        point.set(start.x, nextBaseY, start.z);
      });
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
      updateLineLoop(lineRef.current, points);
    }

    if (liveUpdate && rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (dragModeRef.current !== "translate-xz" && dragModeRef.current !== "translate-free") {
          const nextVertices = verticesRef.current.map(
            (v) => [v.x, v.y, v.z] as [number, number, number]
          );
          onVerticesChange(nextVertices);
          if (topVerticesRef.current && onTopVerticesChange) {
            const nextTop = topVerticesRef.current.map(
              (v) => [v.x, v.y, v.z] as [number, number, number]
            );
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
          const baseY = translateLastYRef.current ?? heightTopRef.current;
          const nextHeight = heightTopRef.current - baseY;
          const nextCenterY = (heightTopRef.current + baseY) / 2;
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

  const handlePointerMoveDom = (event: PointerEvent) => {
    pendingPointerRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (dragMoveRafRef.current !== null) return;
    dragMoveRafRef.current = requestAnimationFrame(() => {
      dragMoveRafRef.current = null;
      const pending = pendingPointerRef.current;
      if (!pending) return;
      applyPointerMove(pending.clientX, pending.clientY);
    });
  };

  const startTranslateFree = (event: ThreeEvent<PointerEvent>) => {
    if (centerX === undefined || centerY === undefined || centerZ === undefined) return;
    
    event.stopPropagation();
    
    // Setup drag state ngay lập tức, không pending
    dragModeRef.current = "translate-free";
    dragIndexRef.current = 0;
    setDraggedIndex(0);
    
    // Lưu vị trí ban đầu
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
    
    // Thiết lập plane song song với camera view
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3()).normalize();
    const centerPoint = new THREE.Vector3(centerX, centerY, centerZ);
    dragPlane.current.setFromNormalAndCoplanarPoint(cameraDirection, centerPoint);
    
    // Tính điểm bắt đầu
    if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
      translateStartPointRef.current = intersection.current.clone();
    }
    
    translateStartXYZRef.current = [centerX, centerY, centerZ];
    translateLastXYZRef.current = [centerX, centerY, centerZ];
    
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    finalizeDrag(event.pointerId);
  };

  const handleHeightPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!topVerticesRef.current || height === undefined) return;
    dragModeRef.current = "height";
    dragIndexRef.current = 0;
    setDraggedIndex(0);
    heightStartClientYRef.current = event.clientY;
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
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handleBottomHeightPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (height === undefined) return;
    const topY = topVerticesRef.current?.[0]?.y;
    if (topY === undefined) return;
    dragModeRef.current = "height-bottom";
    dragIndexRef.current = 0;
    setDraggedIndex(0);
    heightStartClientYRef.current = event.clientY;
    dragStartRef.current = intersection.current.clone();
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
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
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  const handleRotatePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (verticesRef.current.length < 2) return;
    
    // Lấy center từ rotateCenterRef (từ bounding box) và LOCK nó lại
    if (!rotateCenterRef.current) {
      // Fallback: tính center từ vertices nếu chưa có
      const center = verticesRef.current
        .reduce((acc, point) => acc.add(point), new THREE.Vector3())
        .multiplyScalar(1 / verticesRef.current.length);
      rotateCenterRef.current = center;
    }
    
    // LOCK center - clone để không bị thay đổi bởi bounding box updates
    const lockedCenter = rotateCenterRef.current.clone();
    rotateLockedCenterRef.current = lockedCenter;
    
    dragModeRef.current = "rotate";
    if (setIsRotating) {
      setIsRotating(true);
    }
    dragIndexRef.current = 0;
    setDraggedIndex(0);
    dragStartVerticesRef.current = verticesRef.current.map((v) => v.clone());
    dragStartTopVerticesRef.current = topVerticesRef.current
      ? topVerticesRef.current.map((v) => v.clone())
      : null;
    
    // Plane ngang (Y-axis) đi qua locked center để xoay
    dragPlane.current.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), lockedCenter);
    
    if (event.ray.intersectPlane(dragPlane.current, intersection.current)) {
      const start = new THREE.Vector2(
        intersection.current.x - lockedCenter.x,
        intersection.current.z - lockedCenter.z
      );
      rotateStartAngleRef.current = Math.atan2(start.y, start.x);
    }
    
    setCursor("grabbing");
    gl.domElement.setPointerCapture(event.pointerId);
    onDragStart?.();
    attachDragListeners();
  };

  return {
    handlePointerDown,
    handlePointerDownTop,
    handleEdgePointerDown,
    handleEdgePointerDownTop,
    handlePointerUp,
    startTranslateFree,
    handleHeightPointerDown,
    handleBottomHeightPointerDown,
    handleRotatePointerDown,
  };
};
