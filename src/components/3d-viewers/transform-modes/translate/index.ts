import { Vector3 } from "three";
import type { TranslateSnapParams } from "../types";

export const getSnappedPosition = ({
  position,
  selectedBox,
  selectedRotationY,
  boxes,
  selectedId,
  buildingOptions,
  getBoxBounds,
}: TranslateSnapParams) => {
  let nextPosition = position.clone();
  if (buildingOptions.snapToGrid && buildingOptions.gridSize > 0) {
    const gridSize = buildingOptions.gridSize;
    nextPosition.x = Math.round(nextPosition.x / gridSize) * gridSize;
    nextPosition.z = Math.round(nextPosition.z / gridSize) * gridSize;
    if (buildingOptions.allowVertical) {
      nextPosition.y = Math.round(nextPosition.y / gridSize) * gridSize;
    }
  }
  if (buildingOptions.snapToObjects && buildingOptions.snapDistance > 0) {
    const selectedBounds = getBoxBounds(selectedBox, nextPosition, selectedRotationY);
    const halfX = (selectedBounds.maxX - selectedBounds.minX) / 2;
    const halfZ = (selectedBounds.maxZ - selectedBounds.minZ) / 2;
    let snappedX = nextPosition.x;
    let snappedZ = nextPosition.z;
    let bestDeltaX = buildingOptions.snapDistance + 1;
    let bestDeltaZ = buildingOptions.snapDistance + 1;
    boxes.forEach((box) => {
      if (box.id === selectedId) return;
      const bounds = getBoxBounds(box);
      const candidateXs = [bounds.minX, bounds.maxX, (bounds.minX + bounds.maxX) / 2];
      const candidateZs = [bounds.minZ, bounds.maxZ, (bounds.minZ + bounds.maxZ) / 2];
      candidateXs.forEach((candidate) => {
        const options = [candidate - halfX, candidate + halfX, candidate];
        options.forEach((option) => {
          const delta = Math.abs(nextPosition.x - option);
          if (delta <= buildingOptions.snapDistance && delta < bestDeltaX) {
            bestDeltaX = delta;
            snappedX = option;
          }
        });
      });
      candidateZs.forEach((candidate) => {
        const options = [candidate - halfZ, candidate + halfZ, candidate];
        options.forEach((option) => {
          const delta = Math.abs(nextPosition.z - option);
          if (delta <= buildingOptions.snapDistance && delta < bestDeltaZ) {
            bestDeltaZ = delta;
            snappedZ = option;
          }
        });
      });
    });
    nextPosition = new Vector3(snappedX, nextPosition.y, snappedZ);
  }
  return nextPosition;
};
