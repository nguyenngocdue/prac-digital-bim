"use client";
import type { Dispatch, SetStateAction } from "react";
import type { Box } from "@/app/contexts/box-context";
import type { Object3D, Vector3 } from "three";
import { emitEvent } from "@/stores/event-manager";

type ApplyScale = (box: Box, scale: Vector3) => { box: Box; didScale: boolean };

export type TransformEndParams = {
  selectedId: string;
  activeTransformObject: Object3D;
  setBoxes: Dispatch<SetStateAction<Box[]>>;
  applyScaleToBox: ApplyScale;
};

export const handleTransformEnd = ({
  selectedId,
  activeTransformObject,
  setBoxes,
  applyScaleToBox,
}: TransformEndParams) => {
  const { position, rotation, scale } = activeTransformObject;
  const didScale = scale.x !== 1 || scale.y !== 1 || scale.z !== 1;
  emitEvent({
    type: "transform.end",
    source: "scene-handlers/transform-end",
    payload: {
      id: selectedId,
      position: [position.x, position.y, position.z],
      rotationY: rotation.y,
      didScale,
    },
  });
  setBoxes((prev) =>
    prev.map((box) => {
      if (box.id !== selectedId) return box;
      const next = {
        ...box,
        position: [position.x, position.y, position.z] as [number, number, number],
        rotationY: rotation.y,
      };
      const { box: scaledBox, didScale } = applyScaleToBox(next, scale);
      if (didScale) {
        activeTransformObject.scale.set(1, 1, 1);
      }
      return scaledBox;
    })
  );
};
