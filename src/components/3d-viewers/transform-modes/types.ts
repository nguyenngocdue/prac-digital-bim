import type { BuildingOptions, Box } from "@/app/contexts/box-context";
import type { Vector3 } from "three";

export type BoxBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
};

export type GetBoxBounds = (
  box: Box,
  positionOverride?: Vector3,
  rotationOverride?: number
) => BoxBounds;

export type TranslateSnapParams = {
  position: Vector3;
  selectedBox: Box;
  selectedRotationY: number;
  boxes: Box[];
  selectedId: string;
  buildingOptions: BuildingOptions;
  getBoxBounds: GetBoxBounds;
};
