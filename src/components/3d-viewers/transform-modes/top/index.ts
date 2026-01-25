import type { Box } from "@/app/contexts/box-context";
import type { GetBoxBounds } from "../types";
import type { Vector3 } from "three";

export type GoOnTopParams = {
  selectedId: string;
  selectedBox: Box;
  currentPosition: Vector3;
  rotationY: number;
  boxes: Box[];
  getBoxBounds: GetBoxBounds;
  getBoxHeight: (box: Box) => number;
};

export type GoOnTopResult = {
  nextY: number;
};

export const computeGoOnTop = ({
  selectedId,
  selectedBox,
  currentPosition,
  rotationY,
  boxes,
  getBoxBounds,
  getBoxHeight,
}: GoOnTopParams): GoOnTopResult => {
  const selectedBounds = getBoxBounds(
    selectedBox,
    currentPosition,
    rotationY
  );
  const selectedHeight = getBoxHeight(selectedBox);
  let targetTop = 0;
  boxes.forEach((box) => {
    if (box.id === selectedId) return;
    const bounds = getBoxBounds(box);
    const overlaps =
      selectedBounds.maxX >= bounds.minX &&
      selectedBounds.minX <= bounds.maxX &&
      selectedBounds.maxZ >= bounds.minZ &&
      selectedBounds.minZ <= bounds.maxZ;
    if (overlaps) {
      targetTop = Math.max(targetTop, bounds.maxY);
    }
  });
  return { nextY: targetTop + selectedHeight / 2 };
};
