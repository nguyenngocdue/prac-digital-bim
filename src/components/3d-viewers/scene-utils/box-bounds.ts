"use client";
import type { Box } from "@/app/contexts/box-context";
import { Vector3 } from "three";

export const getBoxHeight = (box: Box) => {
  if (box.type === "building" && box.height) return box.height;
  if (box.type === "room" && box.height) return box.height;
  if (box.size?.[1]) return box.size[1];
  if (box.height) return box.height;
  return 1;
};

export const getBoxFootprint = (box: Box): [number, number][] => {
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

export const getBoxBounds = (
  box: Box,
  positionOverride?: Vector3,
  rotationOverride?: number
) => {
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
