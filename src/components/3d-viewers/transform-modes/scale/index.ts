import type { Box } from "@/app/contexts/box-context";
import type { Vector3 } from "three";

export type ApplyScaleResult = {
  box: Box;
  didScale: boolean;
};

export const applyScaleToBox = (box: Box, scale: Vector3): ApplyScaleResult => {
  if (scale.x === 1 && scale.y === 1 && scale.z === 1) {
    return { box, didScale: false };
  }
  const next: Box = { ...box };
  if (box.footprint) {
    next.footprint = box.footprint.map(([x, z]) => [x * scale.x, z * scale.z]);
    next.height = (box.height || 1) * scale.y;
  } else if (box.size) {
    next.size = [box.size[0] * scale.x, box.size[1] * scale.y, box.size[2] * scale.z];
  }
  return { box: next, didScale: true };
};
