"use client";
import type { Dispatch, SetStateAction } from "react";
import type { Box } from "@/app/contexts/box-context";
import { EditableBoxHandles } from "../standards/editable-box-handles";

type BuildingHandlesProps = {
  selectedBox: Box | undefined;
  selectedFootprintVertices: [number, number, number][] | null;
  selectedTopVertices: [number, number, number][] | null;
  selectedRotationY: number;
  setBoxes: Dispatch<SetStateAction<Box[]>>;
  allowMove: boolean;
  transformMode: "translate" | "rotate" | "scale";
  showHandles: boolean;
  rotateXZ: (x: number, z: number, angle: number) => [number, number];
  onDragStart: () => void;
  onDragEnd: () => void;
};

export const BuildingHandles = ({
  selectedBox,
  selectedFootprintVertices,
  selectedTopVertices,
  selectedRotationY,
  setBoxes,
  allowMove,
  transformMode,
  showHandles,
  rotateXZ,
  onDragStart,
  onDragEnd,
}: BuildingHandlesProps) => {
  if (!selectedBox || selectedBox.type !== "building" || !selectedFootprintVertices) {
    return null;
  }

  return (
    <EditableBoxHandles
      vertices={selectedFootprintVertices}
      topVertices={selectedTopVertices || undefined}
      showRotateHandles={showHandles && transformMode === "rotate"}
      showBoundingBox={showHandles}
      onTopVerticesChange={(newVertices) => {
        const originX = selectedBox.position[0];
        const originZ = selectedBox.position[2];
        const topFootprint = newVertices.map((vertex) => [
          ...rotateXZ(vertex[0] - originX, vertex[2] - originZ, selectedRotationY),
        ]) as [number, number][];
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id ? { ...box, topFootprint } : box
          )
        );
      }}
      onVerticesChange={(newVertices) => {
        const originX = selectedBox.position[0];
        const originZ = selectedBox.position[2];
        const footprint = newVertices.map((vertex) => [
          ...rotateXZ(vertex[0] - originX, vertex[2] - originZ, selectedRotationY),
        ]) as [number, number][];
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id ? { ...box, footprint } : box
          )
        );
      }}
      color="#3B82F6"
      height={selectedBox.height || 0}
      onHeightChange={(nextHeight, nextCenterY) => {
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id
              ? { ...box, height: nextHeight, position: [box.position[0], nextCenterY, box.position[2]] }
              : box
          )
        );
      }}
      centerY={selectedBox.position[1]}
      onTranslate={(nextCenterY) => {
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id
              ? { ...box, position: [box.position[0], nextCenterY, box.position[2]] }
              : box
          )
        );
      }}
      centerX={selectedBox.position[0]}
      centerZ={selectedBox.position[2]}
      onTranslateXZ={(nextCenterX, nextCenterZ) => {
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id
              ? { ...box, position: [nextCenterX, box.position[1], nextCenterZ] }
              : box
          )
        );
      }}
      onTranslateXYZ={(nextCenterX, nextCenterY, nextCenterZ) => {
        setBoxes((prev) =>
          prev.map((box) =>
            box.id === selectedBox.id
              ? { ...box, position: [nextCenterX, nextCenterY, nextCenterZ] }
              : box
          )
        );
      }}
      allowTranslate={!showHandles && allowMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};
