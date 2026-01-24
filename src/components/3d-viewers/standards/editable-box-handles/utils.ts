"use client";
import type { ThreeEvent } from "@react-three/fiber";
import type { BufferAttribute, BufferGeometry, LineLoop } from "three";
import * as THREE from "three";

/**
 * Check if translate should be blocked due to handle interaction
 */
export const shouldBlockTranslate = (event: ThreeEvent<PointerEvent>): boolean => {
  return Boolean(event.intersections?.some((item) => item.object?.userData?.isHandle));
};

/**
 * Update translate hover state and cursor
 */
export const updateTranslateHover = (
  isActive: boolean,
  isDragging: boolean,
  setIsTranslateHover: (value: boolean) => void,
  setCursor: (cursor: string) => void
): void => {
  setIsTranslateHover(isActive);
  if (!isDragging) {
    setCursor(isActive ? "move" : "auto");
  }
};

/**
 * Update line loop geometry with new points
 */
export const updateLineLoop = (
  line: LineLoop,
  points: { x: number; y: number; z: number }[]
): void => {
  const geometry = line.geometry as BufferGeometry;
  const position = geometry.getAttribute("position") as BufferAttribute;
  points.forEach((point, i) => position.setXYZ(i, point.x, point.y, point.z));
  position.needsUpdate = true;
  geometry.computeBoundingSphere();
};

/**
 * Mark mesh objects as handles for raycasting identification
 */
export const markAsHandle = (...meshes: (THREE.Mesh | THREE.InstancedMesh | null)[]): void => {
  meshes.forEach((mesh) => {
    if (mesh) {
      mesh.userData.isHandle = true;
    }
  });
};
