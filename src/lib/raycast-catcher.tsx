"use client";
import * as THREE from "three";
import { useBoxContext } from "../app/contexts/box-context";
import { useThree } from "@react-three/fiber";
import { getFootprintPoints } from "@/components/3d-viewers/standards/building-shapes";
import { useRef } from "react";

export function RaycastCatcher({ accent }: { accent: string }) {
  const {
    boxes,
    setBoxes,
    creationMode,
    creationTool,
    buildingOptions,
    setDrawingPoints,
    drawingPoints,
    setSelectedId,
  } = useBoxContext();
  const { camera, scene, gl } = useThree();
  
  // Track mouse movement to distinguish click from drag
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const raycast = creationMode ? undefined : () => null;

  const snapPoint = (point: THREE.Vector3) => {
    const snapped = point.clone();
    if (buildingOptions.snapToGrid && buildingOptions.gridSize > 0) {
      snapped.x = Math.round(snapped.x / buildingOptions.gridSize) * buildingOptions.gridSize;
      snapped.z = Math.round(snapped.z / buildingOptions.gridSize) * buildingOptions.gridSize;
    }

    if (buildingOptions.snapToObjects && buildingOptions.snapDistance > 0 && boxes.length > 0) {
      const candidatesX: number[] = [];
      const candidatesZ: number[] = [];
      boxes.forEach((box) => {
        const rotation = box.rotationY || 0;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const points =
          box.footprint && box.footprint.length
            ? box.footprint
            : box.size
              ? [
                  [-box.size[0] / 2, -box.size[2] / 2],
                  [box.size[0] / 2, -box.size[2] / 2],
                  [box.size[0] / 2, box.size[2] / 2],
                  [-box.size[0] / 2, box.size[2] / 2],
                ]
              : [];

        points.forEach((point) => {
          if (point.length < 2) return;
          const x = point[0];
          const z = point[1];
          if (typeof x !== "number" || typeof z !== "number") return;
          const rx = x * cos - z * sin + box.position[0];
          const rz = x * sin + z * cos + box.position[2];
          candidatesX.push(rx);
          candidatesZ.push(rz);
        });
      });

      const snapDistance = buildingOptions.snapDistance;
      for (const candidate of candidatesX) {
        if (Math.abs(snapped.x - candidate) <= snapDistance) {
          snapped.x = candidate;
          break;
        }
      }
      for (const candidate of candidatesZ) {
        if (Math.abs(snapped.z - candidate) <= snapDistance) {
          snapped.z = candidate;
          break;
        }
      }
    }

    return snapped;
  };

  const getPlacementPoint = (event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (!intersects.length) return null;

    const hit = intersects[0];
    if (!hit) return null;
    const normal = hit.face
      ? hit.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
      : null;

    return {
      point: snapPoint(hit.point),
      normal,
    };
  };

  const buildId = () =>
    typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
      raycast={raycast}
      onPointerDown={(e: any) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
        isDragging.current = false;
      }}
      onPointerMove={(e: any) => {
        if (mouseDownPos.current) {
          const dx = e.clientX - mouseDownPos.current.x;
          const dy = e.clientY - mouseDownPos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // If mouse moved more than 5 pixels, consider it a drag
          if (distance > 5) {
            isDragging.current = true;
          }
        }
      }}
      onPointerUp={(e: any) => {
        // Only place object if it was a click, not a drag
        if (isDragging.current) {
          mouseDownPos.current = null;
          isDragging.current = false;
          return;
        }
        
        if (!creationMode) {
          mouseDownPos.current = null;
          return;
        }
        
        const placement = getPlacementPoint(e);
        if (!placement) {
          mouseDownPos.current = null;
          return;
        }
        const { point, normal } = placement;

        if (creationTool === "building" && buildingOptions.shape === "custom" && buildingOptions.drawingMode) {
          const nextPoints = [...drawingPoints, [point.x, point.y, point.z] as [number, number, number]];
          setDrawingPoints(nextPoints);
          if (e.detail >= 2 && nextPoints.length >= 3) {
            const centerX = nextPoints.reduce((sum, p) => sum + p[0], 0) / nextPoints.length;
            const centerZ = nextPoints.reduce((sum, p) => sum + p[2], 0) / nextPoints.length;
            const basePoint = nextPoints[0];
            if (!basePoint) return;
            const baseY = basePoint[1];
            const footprint = nextPoints.map((p) => [p[0] - centerX, p[2] - centerZ]) as [number, number][];
            setDrawingPoints([]);
            setBoxes((prev) => [
              ...prev,
              {
                id: buildId(),
                position: [centerX, baseY + buildingOptions.height / 2, centerZ],
                color: accent,
                type: "building",
                footprint,
                height: buildingOptions.height,
                rotationY: 0,
                thicknessRatio: buildingOptions.thicknessRatio,
              },
            ]);
            setSelectedId(null);
          }
          mouseDownPos.current = null;
          return;
        }

        if (creationTool === "building") {
          const footprint = getFootprintPoints(
            buildingOptions.shape,
            buildingOptions.width,
            buildingOptions.depth,
            buildingOptions.thicknessRatio
          );
          const height = buildingOptions.height;
          const isVerticalCandidate = !!normal && Math.abs(normal.y) < 0.35;
          if (isVerticalCandidate && !buildingOptions.allowVertical) return;
          const isVertical = isVerticalCandidate && buildingOptions.allowVertical;
          const rotationY = isVertical ? Math.atan2(normal!.x, normal!.z) + Math.PI : 0;
          const offset = isVertical ? buildingOptions.depth / 2 : 0;
          const posX = point.x + (isVertical ? normal!.x * offset : 0);
          const posZ = point.z + (isVertical ? normal!.z * offset : 0);
          const posY = isVertical ? point.y : point.y + height / 2;

          setBoxes((prev) => [
            ...prev,
            {
              id: buildId(),
              position: [posX, posY, posZ],
              color: accent,
              type: "building",
              footprint,
              height,
              rotationY,
              thicknessRatio: buildingOptions.thicknessRatio,
            },
          ]);
          setSelectedId(null);
          mouseDownPos.current = null;
          return;
        }

        if (creationTool === "room") {
          const roomHeight = 3;
          setBoxes((prev) => [
            ...prev,
            {
              id: buildId(),
              position: [point.x, point.y + roomHeight / 2, point.z],
              color: "#D4A574",
              type: "room",
              width: 3.66,
              height: roomHeight,
              depth: 3.66,
              showMeasurements: true,
              rotationY: 0,
            },
          ]);
          setSelectedId(null);
          mouseDownPos.current = null;
          return;
        }

        const toolSize = [1.5, 1.5, 1.5] as const;
        const yOffset = toolSize[1] / 2;
        setBoxes((prev) => [
          ...prev,
          {
            id: buildId(),
            position: [point.x, point.y + yOffset, point.z],
            color: accent,
            size: [...toolSize],
            type: creationTool,
          },
        ]);
        setSelectedId(null);
        mouseDownPos.current = null;
      }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
